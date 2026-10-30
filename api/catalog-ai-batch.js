import {requireUser,currentQuery,safeMethod,failClosed} from './_security.js';
import {aiImageEligible} from '../src/utils/aiImagePolicy.js';
import {getCatalogVisual} from '../src/utils/catalogVisual.js';
import {imageKey,isPublicBlobUrl} from './catalog-ai.js';

export default async function handler(req,res){
  if(!safeMethod(req,res,['GET']))return;
  try{
    const session=await requireUser(req,res,['admin']);
    if(!session)return;
    const storeId=String(req.query?.storeId||'localfresh');
    if(!/^[a-zA-Z0-9-]{1,64}$/.test(storeId))return res.status(400).json({error:'Invalid store'});
    const products=await currentQuery(session,sql=>[sql`
      SELECT id,name,category,image_url FROM kiranapro.products
      WHERE store_id=${storeId} ORDER BY category,name LIMIT 500
    `]);
    const generated=await currentQuery(session,sql=>[sql`
      SELECT image_key,status,image_url,retry_after FROM kiranapro.catalog_ai_images
      ORDER BY updated_at DESC LIMIT 1000
    `]);
    const byKey=new Map(generated.map(row=>[row.image_key,row]));
    const items=products.map(p=>{
      const hasSellerImage=typeof p.image_url==='string' && /^https:\/\//.test(p.image_url);
      const hasCuratedPhoto=Boolean(getCatalogVisual(p).photo);
      const eligible=aiImageEligible(p.name,p.category) && !hasSellerImage && !hasCuratedPhoto;
      const entry=byKey.get(imageKey(p.name,p.category));
      const published=entry?.status==='ready' && isPublicBlobUrl(entry.image_url);
      return {productId:p.id,name:p.name,category:p.category,
        eligible,hasRealPhoto:hasSellerImage||hasCuratedPhoto,
        status:published?'ready':entry?.status||'missing',
        photo:published?entry.image_url:null,
        retryAfter:entry?.retry_after||null};
    });
    return res.status(200).json({storeId,items,
      counts:{
        total:items.length,
        eligible:items.filter(x=>x.eligible).length,
        ready:items.filter(x=>x.status==='ready').length,
        missing:items.filter(x=>x.eligible && x.status==='missing').length,
        failed:items.filter(x=>x.eligible && x.status==='failed').length,
        pending:items.filter(x=>x.eligible && x.status==='pending').length,
        photoOrPlaceholder:items.filter(x=>!x.eligible).length
      },
      dailyMaximum:36});
  }catch(error){return failClosed(res,error);}
}
