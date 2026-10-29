import { getPhotoQueries, scoreCommonsPhoto } from '../src/utils/productPhotoSearch.js';

/**
 * Vercel serverless photo discovery. Only public Commons image search is used;
 * no hotlinked search-engine images, fabricated product packaging or AI imagery.
 * The frontend loads this endpoint only for cards near the viewport.
 */
const TIMEOUT_MS=6200;
const NO_IMAGE={photo:null,sourceUrl:null,source:'',match:'unavailable'};
function clamp(value,max=120){return String(value||'').trim().slice(0,max)}
async function commonsSearch(phrase){
  const url=new URL('https://commons.wikimedia.org/w/api.php');
  const params={
    action:'query',generator:'search',gsrsearch:phrase,gsrnamespace:'6',
    gsrlimit:'16',prop:'imageinfo',iiprop:'url|size|mime',iiurlwidth:'240',
    format:'json',formatversion:'2'
  };
  for(const [key,val] of Object.entries(params))url.searchParams.set(key,val);
  const signal=AbortSignal.timeout(TIMEOUT_MS);
  const response=await fetch(url.toString(),{
    method:'GET',signal,headers:{
      Accept:'application/json',
      'User-Agent':'KiranaPRO-PhotoSearch/1.0 (https://github.com/venkatesh0690/KiranaPRO; catalog imagery)',
    }
  });
  if(!response.ok)throw new Error('Commons unavailable');
  const data=await response.json();
  const pages=Array.isArray(data?.query?.pages)?data.query.pages:[];
  return pages;
}
export async function resolvePhoto(product,search=commonsSearch) {
  const q=getPhotoQueries(product);
  // Avoid search-engine mismatches: only title-matched real photographic files.
  for(const query of [...new Set([q.primary,q.fallback])]){
    try{
      const entries=await search(query);
      const results=entries.map(page=>({page,score:scoreCommonsPhoto(page,query)}))
        .filter(({score})=>score>=4).sort((a,b)=>b.score-a.score);
      if(!results.length)continue;
      const best=results[0].page, info=best.imageinfo[0];
      const sourceUrl='https://commons.wikimedia.org/wiki/'+encodeURIComponent(best.title.replace(/^File:/i,'File:')).replace(/%3A/g,':');
      return {
        photo:info.thumburl,sourceUrl,source:'Wikimedia Commons',
        match:'representative',title:best.title.replace(/^File:/i,'').slice(0,150)
      };
    }catch{
      // Wikimedia can fail or be slow; try the shorter subject once.
    }
  }
  return NO_IMAGE;
}
export default async function handler(req,res) {
  res.setHeader('Content-Type','application/json; charset=utf-8');
  res.setHeader('X-Content-Type-Options','nosniff');
  if(req.method!=='GET'){res.setHeader('Allow','GET');return res.status(405).json({error:'Method not allowed'});}
  const name=clamp(req.query?.name);
  const category=clamp(req.query?.category,60);
  if(name.length<2)return res.status(400).json({error:'Product name required'});
  const result=await resolvePhoto({name,category});
  res.setHeader('Cache-Control',result.photo
    ? 'public, max-age=86400, s-maxage=2592000, stale-while-revalidate=604800'
    : 'public, max-age=300, s-maxage=3600');
  return res.status(200).json(result);
}
