/* Public catalog-photo lookup. No customer/session/order state is cached.
 * Invalidate stale lookup results on deploy and immediately after an admin
 * publishes a new illustration. This does not call the paid image model.
 */
const CACHE_PREFIX='kp_photo_v5:';
const OLD_CACHE_PREFIX=/^kp_photo_v\d+:/;
export const CATALOG_PHOTO_REFRESH_EVENT='kiranapro:catalog-images-refresh';
const CROSS_TAB_REFRESH_KEY='kp_catalog_photo_cache_refresh';
const CACHE_TTL=1000*60*60*24*7;
const MISSING_TTL=1000*60*2;
const inflight=new Map();
const queue=[];
let active=0;
let cacheEpoch=0;
const MAX_ACTIVE=2;

function removePhotoEntries(includeCurrent=true) {
  if(typeof localStorage==='undefined')return 0;
  let removed=0;
  try {
    const keys=[];
    for(let i=0;i<localStorage.length;i++) {
      const key=localStorage.key(i);
      if(key && OLD_CACHE_PREFIX.test(key) &&
         (includeCurrent || !key.startsWith(CACHE_PREFIX))) keys.push(key);
    }
    for(const key of keys) {localStorage.removeItem(key);removed++;}
  }catch{/* The app also works when localStorage is blocked. */}
  return removed;
}
// Clear photo results from prior app versions without touching cart, addresses,
// sessions, stored preferences or any other unrelated browser data.
export function pruneLegacyCatalogPhotoCache() {
  return removePhotoEntries(false);
}
export function clearCatalogPhotoCache() {
  cacheEpoch++;
  inflight.clear();
  const cleared=removePhotoEntries(true);
  if(typeof window!=='undefined') {
    window.dispatchEvent(new Event(CATALOG_PHOTO_REFRESH_EVENT));
    try{localStorage.setItem(CROSS_TAB_REFRESH_KEY,String(Date.now()));}
    catch{/* Cross-tab signal is optional. */}
  }
  return cleared;
}
export function photoCacheKey(product) {
  return CACHE_PREFIX+String(product?.name||'').trim().toLowerCase()+':'+
    String(product?.category||'').trim().toLowerCase();
}
export function invalidateProductPhoto(product) {
  const key=photoCacheKey(product);
  inflight.delete(key);
  try{localStorage.removeItem(key);}catch{/* best effort */}
}
function cacheRead(key) {
  try{
    const data=JSON.parse(localStorage.getItem(key)||'null');
    if(data && data.expires>Date.now())return data.value;
    if(data)localStorage.removeItem(key);
  }catch{/* no cache or private browsing */}
  return null;
}
function cacheWrite(key,value,epoch) {
  if(epoch!==cacheEpoch)return;
  try {
    const expires=Date.now()+(value?.photo?CACHE_TTL:MISSING_TTL);
    localStorage.setItem(key,JSON.stringify({expires,value}));
  }catch{/* Private browsing, quota, storage disabled */}
}
function schedule(task) {
  return new Promise((resolve,reject)=>{
    queue.push({task,resolve,reject});
    pump();
  });
}
function pump() {
  while(active<MAX_ACTIVE && queue.length) {
    const job=queue.shift();
    active++;
    Promise.resolve().then(job.task).then(job.resolve,job.reject)
      .finally(()=>{active--;pump()});
  }
}
export async function discoverProductPhoto(product) {
  const key=photoCacheKey(product);
  const cached=cacheRead(key);
  if(cached)return cached;
  if(inflight.has(key))return inflight.get(key);
  const epoch=cacheEpoch;
  const promise=schedule(async()=>{
    const args=new URLSearchParams({
      name:String(product?.name||'').slice(0,120),
      category:String(product?.category||'').slice(0,60)
    });
    // Avoid reusing stale HTTP-layer negative photo responses.
    const response=await fetch('/api/catalog-photo?'+args.toString(),{
      signal:AbortSignal.timeout(17000),
      cache:'no-store',
      headers:{Accept:'application/json'}
    });
    if(!response.ok)throw new Error('Photo service unavailable');
    const result=await response.json();
    const photo=result?.photo;
    let valid=false;
    try {
      const url=new URL(photo);
      valid=url.protocol==='https:' && (
        ['upload.wikimedia.org','commons.wikimedia.org'].includes(url.hostname) ||
        (result.match==='illustrative' &&
          url.hostname.endsWith('.public.blob.vercel-storage.com'))
      );
    }catch{/* No valid URL */}
    const value=valid
      ? {photo,sourceUrl:result.sourceUrl||null,
         photoSource:result.match==='illustrative'
           ? 'AI-generated representative image'
           : 'Wikimedia Commons · representative',
         match:result.match==='illustrative'?'illustrative':'representative'}
      : {photo:null,sourceUrl:null};
    cacheWrite(key,value,epoch);
    return value;
  }).catch(()=>({photo:null,sourceUrl:null}))
    .finally(()=>{if(inflight.get(key)===promise)inflight.delete(key)});
  inflight.set(key,promise);
  return promise;
}
if(typeof window!=='undefined'){
  pruneLegacyCatalogPhotoCache();
  window.addEventListener('storage',event=>{
    if(event.key!==CROSS_TAB_REFRESH_KEY)return;
    cacheEpoch++;
    inflight.clear();
    removePhotoEntries(true);
    window.dispatchEvent(new Event(CATALOG_PHOTO_REFRESH_EVENT));
  });
}
