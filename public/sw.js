// KiranaPRO PWA: cache only public app-shell files and hashed build assets.
// Authenticated API responses, orders and account data are NEVER cached.
const VERSION='kiranapro-fast-v4';
const SHELL_CACHE=VERSION+'-shell';
const ASSET_CACHE=VERSION+'-assets';
const APP_SHELL='/';

self.addEventListener('install', event=>{
  event.waitUntil(
    caches.open(SHELL_CACHE).then(async cache=>{
      const response=await fetch(APP_SHELL,{cache:'reload'});
      if(response.ok)await cache.put(APP_SHELL,response);
    }).catch(()=>undefined)
  );
  self.skipWaiting();
});

self.addEventListener('activate', event=>{
  event.waitUntil(
    caches.keys().then(keys=>Promise.all(
      keys.filter(name=>name.startsWith('kiranapro-') && !name.startsWith(VERSION))
        .map(name=>caches.delete(name))
    )).then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch', event=>{
  const request=event.request;
  if(request.method!=='GET')return;
  const url=new URL(request.url);
  if(url.origin!==self.location.origin)return;
  // Fail closed for account-specific data, session state and commerce operations.
  if(url.pathname.startsWith('/api/'))return;

  // Hashed JS/CSS assets are immutable. Serving from CacheStorage removes
  // repeated network latency on navigations and slower Android connections.
  if(url.pathname.startsWith('/assets/')){
    event.respondWith(caches.open(ASSET_CACHE).then(async cache=>{
      const cached=await cache.match(request);
      if(cached)return cached;
      const response=await fetch(request);
      if(response.ok && response.type==='basic') {
        event.waitUntil(cache.put(request,response.clone()));
      }
      return response;
    }));
    return;
  }

  // Always prefer up-to-date HTML; only use the shell when offline.
  if(request.mode==='navigate'){
    event.respondWith(fetch(request).then(response=>{
      if(response.ok && response.type==='basic'){
        event.waitUntil(caches.open(SHELL_CACHE)
          .then(cache=>cache.put(APP_SHELL,response.clone())));
      }
      return response;
    }).catch(async()=>{
      return (await caches.match(APP_SHELL)) ||
        Response.error();
    }));
  }
});
