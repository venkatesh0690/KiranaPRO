import { digest, currentQuery, serviceQuery, requireUser, safeMethod, bodyOf, failClosed } from './_security.js';
import { normalizeItem, aiImageEligible, aiImagePrompt, AI_IMAGE_PROMPT_VERSION } from '../src/utils/aiImagePolicy.js';

export function imageKey(name,category) {
  return digest('ai-v1:'+normalizeItem(name)+':'+normalizeItem(category));
}
export async function publishedAiImage(name,category) {
  if(!aiImageEligible(name,category))return null;
  const key=imageKey(name,category);
  const rows=await currentQuery({role:''},sql=>[sql`
    SELECT image_url FROM kiranapro.catalog_ai_images
    WHERE image_key=${key} AND status='ready' LIMIT 1
  `]);
  return rows[0]?.image_url||null;
}
export async function registeredImage(name,category) {
  const key=imageKey(name,category);
  const rows=await serviceQuery(sql=>[sql`
    SELECT status,image_url,retry_after FROM kiranapro.catalog_ai_images
    WHERE image_key=${key} LIMIT 1
  `]);
  return rows[0]||null;
}
export function isPublicBlobUrl(value) {
  try {
    const url=new URL(value);
    return url.protocol==='https:' && url.hostname.endsWith('.public.blob.vercel-storage.com')
      && url.pathname.length>8;
  } catch {return false;}
}
export async function generateCatalogImage(name,category,key) {
  const prompt=aiImagePrompt(name,category);
  if(!prompt)throw Error('Ineligible item');
  const response=await fetch('https://api.openai.com/v1/images/generations',{
    method:'POST',
    signal:AbortSignal.timeout(85000),
    headers:{Authorization:'Bearer '+process.env.OPENAI_API_KEY,
      'Content-Type':'application/json'},
    body:JSON.stringify({
      model:'gpt-image-1-mini',
      prompt,
      n:1,
      size:'1024x1024',
      quality:'low',
      output_format:'webp',
      output_compression:76,
      background:'opaque'
    })
  });
  if(!response.ok)throw Error('Image model rejected the request');
  const result=await response.json();
  const encoded=result?.data?.[0]?.b64_json;
  if(typeof encoded!=='string'||encoded.length<1000)throw Error('Image generation returned no photo');
  const bytes=Buffer.from(encoded,'base64');
  if(bytes.length<1024||bytes.length>7_000_000)throw Error('Generated image outside allowed bounds');
  // Static import is deliberately server-only; no image SDK or credentials enter Vite.
  const {put}=await import('@vercel/blob');
  const uploaded=await put('catalog/ai-v1/'+key+'.webp',bytes,{
    access:'public',contentType:'image/webp',
    addRandomSuffix:true,cacheControlMaxAge:31536000
  });
  if(!isPublicBlobUrl(uploaded?.url))throw Error('Invalid image storage location');
  return uploaded.url;
}

export const config={maxDuration:120};
export default async function handler(req,res) {
  if(!safeMethod(req,res,['GET','POST']))return;
  try{
    if(req.method==='GET'){
      if(req.query?.action==='capabilities'){
        const s=await requireUser(req,res,['admin']);
        if(!s)return;
        return res.status(200).json({
          configured:Boolean(process.env.OPENAI_API_KEY && process.env.BLOB_READ_WRITE_TOKEN),
          enabled:true, model:'gpt-image-1-mini'
        });
      }
      const name=String(req.query?.name||'');
      const category=String(req.query?.category||'');
      if(!aiImageEligible(name,category))return res.status(200).json({photo:null,eligible:false});
      const photo=await publishedAiImage(name,category);
      res.setHeader('Cache-Control',photo?'public, max-age=300, s-maxage=3600':'public, max-age=30, s-maxage=120');
      return res.status(200).json({photo,eligible:true,photoSource:photo?'AI-generated representative image':null});
    }

    const admin=await requireUser(req,res,['admin']);
    if(!admin)return;
    if(!process.env.OPENAI_API_KEY||!process.env.BLOB_READ_WRITE_TOKEN)
      return res.status(503).json({error:'Configure image generation API and image storage first.'});
    const data=bodyOf(req);
    // Never accept arbitrary anonymous prompts or image URLs. Look up one real DB product.
    const storeId=String(data.storeId||'');
    const productId=String(data.productId||'');
    if(!/^[a-zA-Z0-9-]{1,64}$/.test(storeId) ||
       !/^[a-zA-Z0-9-]{1,64}$/.test(productId))
      return res.status(400).json({error:'Invalid product identity'});
    const products=await currentQuery(admin,sql=>[sql`
      SELECT name,category FROM kiranapro.products WHERE store_id=${storeId} AND id=${productId} LIMIT 1
    `]);
    const item=products[0];
    if(!item)return res.status(404).json({error:'Catalog product not found'});
    if(!aiImageEligible(item.name,item.category))
      return res.status(422).json({error:'This item needs a verified real product photo instead.'});
    const key=imageKey(item.name,item.category);
    const registered=await registeredImage(item.name,item.category);
    if(registered?.status==='ready' && isPublicBlobUrl(registered.image_url))
      return res.status(200).json({photo:registered.image_url,generated:false});

    // One claimed job per normalized item, and one-hour cooldown after errors.
    // Never charge a new generation for every visitor or duplicate click.
    const claimed=await serviceQuery(sql=>[sql`
      INSERT INTO kiranapro.catalog_ai_images
        (image_key,product_name,category,status,prompt_version,updated_at)
      VALUES(${key},${item.name},${item.category},'pending',${AI_IMAGE_PROMPT_VERSION},NOW())
      ON CONFLICT(image_key) DO UPDATE SET
        status='pending',updated_at=NOW(),retry_after=NULL
      WHERE (kiranapro.catalog_ai_images.status='failed'
             AND (kiranapro.catalog_ai_images.retry_after IS NULL
                 OR kiranapro.catalog_ai_images.retry_after<=NOW()))
         OR (kiranapro.catalog_ai_images.status='pending'
             AND kiranapro.catalog_ai_images.updated_at < NOW()-INTERVAL '5 minutes')
      RETURNING image_key
    `]);
    if(!claimed.length)return res.status(409).json({
      error:'An image already exists, is being prepared, or is in its retry cooldown.'
    });
    try{
      const url=await generateCatalogImage(item.name,item.category,key);
      await serviceQuery(sql=>[sql`
        UPDATE kiranapro.catalog_ai_images
        SET image_url=${url},status='ready',model='gpt-image-1-mini',
            retry_after=NULL,updated_at=NOW()
        WHERE image_key=${key}
      `]);
      return res.status(201).json({photo:url,generated:true,
        photoSource:'AI-generated representative image'});
    }catch(error){
      await serviceQuery(sql=>[sql`
        UPDATE kiranapro.catalog_ai_images
        SET status='failed',retry_after=NOW()+INTERVAL '1 hour',updated_at=NOW()
        WHERE image_key=${key} AND status='pending'
      `]);
      return res.status(502).json({error:'Image generation unavailable. You can retry later.'});
    }
  }catch(error){return failClosed(res,error);}
}
