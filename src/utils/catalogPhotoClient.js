/* Browser-side request queue and cache for Commons photo discovery.
 * Visible product tiles trigger requests only as they enter the viewport.
 */
const CACHE_PREFIX='kp_photo_v4:';
const CACHE_TTL=1000*60*60*24*21;
const MISSING_TTL=1000*60*3;
const inflight=new Map();
const queue=[];
let active=0;
const MAX_ACTIVE=2;

function schedule(task) {
  return new Promise((resolve,reject)=>{
    queue.push({task,resolve,reject});
    pump();
  });
}
function pump() {
  while(active<MAX_ACTIVE && queue.length) {
    const job=queue.shift();
    active+=1;
    Promise.resolve().then(job.task).then(job.resolve,job.reject)
      .finally(()=>{active-=1;pump()});
  }
}
export function photoCacheKey(product) {
  return CACHE_PREFIX+String(product?.name||'').trim().toLowerCase()+':'+
    String(product?.category||'').trim().toLowerCase();
}
function cacheRead(key) {
  try{
    const data=JSON.parse(localStorage.getItem(key)||'null');
    return data&&Date.now()<data.expires ? data.value : null;
  }catch{return null;}
}
function cacheWrite(key,value) {
  try {
    const expires=Date.now()+(value?.photo?CACHE_TTL:MISSING_TTL);
    localStorage.setItem(key,JSON.stringify({expires,value}));
  }catch{/* private browsing or storage quota; in-flight dedupe still works */}
}
export async function discoverProductPhoto(product) {
  const key=photoCacheKey(product);
  const cached=cacheRead(key);
  if(cached)return cached;
  if(inflight.has(key))return inflight.get(key);
  const promise=schedule(async()=>{
    const args=new URLSearchParams({
      name:String(product?.name||'').slice(0,120),
      category:String(product?.category||'').slice(0,60)
    });
    const response=await fetch('/api/catalog-photo?'+args.toString(),{
      signal:AbortSignal.timeout(17000),
      headers:{Accept:'application/json'}
    });
    if(!response.ok)throw new Error('Photo service unavailable');
    const result=await response.json();
    const photo=result?.photo;
    let valid=false;
    try{
      const url=new URL(photo);
      valid=url.protocol==='https:' && (
        ['upload.wikimedia.org','commons.wikimedia.org'].includes(url.hostname) ||
        (result.match==='illustrative' &&
          url.hostname.endsWith('.public.blob.vercel-storage.com'))
      );
    }catch{/* unavailable image */}
    const value=valid
      ? {photo,sourceUrl:result.sourceUrl||null,
         photoSource:result.match==='illustrative'
           ? 'AI-generated representative image'
           : 'Wikimedia Commons · representative',
         match:result.match==='illustrative'?'illustrative':'representative'}
      : {photo:null,sourceUrl:null};
    cacheWrite(key,value);
    return value;
  }).catch(()=>({photo:null,sourceUrl:null}))
    .finally(()=>{inflight.delete(key)});
  inflight.set(key,promise);
  return promise;
}
