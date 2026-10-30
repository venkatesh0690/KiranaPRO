// Temporary, operator-signed one-product bootstrap for initial catalog seeding.
// GET is used only by Vercel's authenticated read-only deployment inspection tool;
// all requests require a 60-second HMAC signature over the exact product ID.
// REMOVE this handler after seeding. No public or admin UI invokes it.
import {createHmac,timingSafeEqual} from 'node:crypto';
import {serviceQuery,currentQuery} from './_security.js';
import {aiImageEligible,AI_IMAGE_PROMPT_VERSION} from '../src/utils/aiImagePolicy.js';
import {getCatalogVisual} from '../src/utils/catalogVisual.js';
import {generateCatalogImage,imageKey,registeredImage,isPublicBlobUrl} from './catalog-ai.js';

export const config={maxDuration:120};
export default async function handler(req,res) {
  res.setHeader('Cache-Control','no-store');
  res.setHeader('X-Content-Type-Options','nosniff');
  if(req.method!=='GET')return res.status(405).json({error:'Method not allowed'});
  const id=String(req.query?.productId||'');
  const exp=Number(req.query?.exp);
  const sig=String(req.query?.sig||'');
  const secret=process.env.AI_JOB_OPERATOR_SECRET;
  const end=Date.parse(process.env.AI_JOB_OPERATOR_EXPIRES_AT||'');
  if(!secret || secret.length<64 || !Number.isSafeInteger(exp) ||
     !Number.isFinite(end) || Date.now()>end ||
     Date.now()>exp*1000 || exp*1000>Date.now()+120000 ||
     !/^lf-[a-z0-9-]{1,64}$/.test(id) || !/^[a-f0-9]{64}$/.test(sig))
    return res.status(403).json({error:'Operator session expired or unavailable'});
  const signed=createHmac('sha256',secret).update('localfresh|'+id+'|'+exp).digest();
  if(!timingSafeEqual(signed,Buffer.from(sig,'hex')))
    return res.status(403).json({error:'Invalid operator signature'});
  if(!process.env.OPENAI_API_KEY||!process.env.BLOB_READ_WRITE_TOKEN)
    return res.status(503).json({error:'Image provider not configured'});
  try{
    const products=await currentQuery({role:'admin'},sql=>[sql`
      SELECT name,category,image_url FROM kiranapro.products
      WHERE id=${id} AND store_id='localfresh' LIMIT 1
    `]);
    const item=products[0];
    if(!item)return res.status(404).json({error:'Product not found'});
    const checks={
      eligible:aiImageEligible(item.name,item.category),
      curated:Boolean(getCatalogVisual(item).photo),
      sellerPhoto:typeof item.image_url==='string' && /^https:\/\//.test(item.image_url)
    };
    if(String(req.query?.debug||'')==='1')
      return res.status(200).json({id,name:item.name,category:item.category,...checks});
    if(!checks.eligible||checks.curated||checks.sellerPhoto)
      return res.status(409).json({error:'Requires a verified real photo or already has a curated photo'});
    const key=imageKey(item.name,item.category);
    const existing=await registeredImage(item.name,item.category);
    if(existing?.status==='ready' && isPublicBlobUrl(existing.image_url))
      return res.status(200).json({generated:false,photo:existing.image_url});
    const spent=await serviceQuery(sql=>[sql`
      SELECT count(*)::int AS used FROM kiranapro.catalog_ai_images
      WHERE created_at >= DATE_TRUNC('day',NOW())
    `]);
    if(Number(spent[0]?.used||0)>=36)
      return res.status(429).json({error:'Daily budget reached'});
    const claimed=await serviceQuery(sql=>[sql`
      INSERT INTO kiranapro.catalog_ai_images
        (image_key,product_name,category,status,prompt_version,updated_at)
      VALUES(${key},${item.name},${item.category},'pending',${AI_IMAGE_PROMPT_VERSION},NOW())
      ON CONFLICT(image_key) DO UPDATE SET status='pending',updated_at=NOW(),retry_after=NULL
      WHERE kiranapro.catalog_ai_images.status='failed'
        AND (kiranapro.catalog_ai_images.retry_after IS NULL
          OR kiranapro.catalog_ai_images.retry_after<=NOW())
      RETURNING image_key
    `]);
    if(!claimed.length)return res.status(409).json({error:'Already being generated or in cooldown'});
    try{
      const photo=await generateCatalogImage(item.name,item.category,key);
      await serviceQuery(sql=>[sql`
        UPDATE kiranapro.catalog_ai_images SET
        image_url=${photo},status='ready',model='gpt-image-1-mini',
        updated_at=NOW(),retry_after=NULL WHERE image_key=${key}
      `]);
      return res.status(201).json({generated:true,id,name:item.name,photo});
    }catch{
      await serviceQuery(sql=>[sql`
        UPDATE kiranapro.catalog_ai_images SET status='failed',
          updated_at=NOW(),retry_after=NOW()+INTERVAL '1 hour'
        WHERE image_key=${key} AND status='pending'
      `]);
      return res.status(502).json({error:'Image generation or upload failed'});
    }
  }catch{
    return res.status(503).json({error:'Image operator currently unavailable'});
  }
}
