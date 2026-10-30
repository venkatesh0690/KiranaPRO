import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  clearCatalogPhotoCache, pruneLegacyCatalogPhotoCache, photoCacheKey,
  CATALOG_PHOTO_REFRESH_EVENT
} from '../src/utils/catalogPhotoClient.js';

const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');

function memoryStorage(initial={}) {
  const data=new Map(Object.entries(initial));
  return {
    get length(){return data.size},
    key(index){return [...data.keys()][index]??null},
    getItem(key){return data.get(key)??null},
    setItem(key,value){data.set(key,String(value))},
    removeItem(key){data.delete(key)},
    has(key){return data.has(key)}
  };
}

test('app update discards old product photo caches without clearing accounts/carts',()=>{
  const store=memoryStorage({
    'kp_photo_v3:tomato:vegetables':'stale',
    'kp_photo_v4:onion:vegetables':'stale',
    'kp_photo_v5:rice:groceries':'fresh',
    'kp_cart_snapshot':'preserve',
    'kp_location_preference':'preserve',
    'kp_sec_auth_session':'preserve'
  });
  globalThis.localStorage=store;
  assert.equal(pruneLegacyCatalogPhotoCache(),2);
  assert.ok(!store.has('kp_photo_v3:tomato:vegetables'));
  assert.ok(!store.has('kp_photo_v4:onion:vegetables'));
  assert.ok(store.has('kp_photo_v5:rice:groceries'));
  assert.equal(store.getItem('kp_cart_snapshot'),'preserve');
  assert.equal(store.getItem('kp_sec_auth_session'),'preserve');
  delete globalThis.localStorage;
});

test('manual image refresh clears only photo entries and signals visible cards',()=>{
  const store=memoryStorage({
    'kp_photo_v5:tomato:vegetables':'cached',
    'kp_photo_v4:rice:groceries':'old',
    'kp_user_settings':'preserve',
    'checkout_draft':'preserve'
  });
  const window=new EventTarget();
  let notifications=0;
  window.addEventListener(CATALOG_PHOTO_REFRESH_EVENT,()=>notifications++);
  globalThis.localStorage=store;
  globalThis.window=window;
  assert.equal(clearCatalogPhotoCache(),2);
  assert.equal(notifications,1);
  assert.equal(store.getItem('checkout_draft'),'preserve');
  assert.equal(store.getItem('kp_user_settings'),'preserve');
  assert.ok(store.has('kp_catalog_photo_cache_refresh'));
  assert.ok(photoCacheKey({name:'Tomato',category:'Vegetables'}).startsWith('kp_photo_v5:'));
  delete globalThis.window;
  delete globalThis.localStorage;
});

test('new PWA version invalidates stale app caches but never caches private APIs',()=>{
  const sw=read('public/sw.js');
  assert.match(sw,/const VERSION='kiranapro-fast-v4'/);
  assert.match(sw,/name.startsWith\('kiranapro-'\) && !name.startsWith\(VERSION\)/);
  assert.match(sw,/url.pathname.startsWith\('\/api\/'\)\)return/);
  const html=read('index.html');
  assert.match(html,/updateViaCache:'none'/);
  const vercel=JSON.parse(read('vercel.json'));
  assert.ok(vercel.headers.some(h=>h.source==='/sw.js' &&
    h.headers.some(v=>v.key==='Cache-Control' && /no-store/.test(v.value))));
});

test('missing images do not stick in CDN or browser HTTP cache',()=>{
  const search=read('api/catalog-photo.js');
  const client=read('src/utils/catalogPhotoClient.js');
  assert.match(search,/: 'no-store'\);/);
  assert.match(client,/cache:'no-store'/);
  assert.match(client,/const MISSING_TTL=1000\*60\*2/);
  assert.match(client,/cacheEpoch\+\+/);
});

test('admin refresh and image publication invalidate only catalog thumbnails',()=>{
  const admin=read('src/pages/AdminDashboard.jsx');
  const visual=read('src/components/CatalogProductVisual.jsx');
  assert.match(admin,/Clear image cache & refresh photos/);
  assert.match(admin,/if\(generated>0\)clearCatalogPhotoCache\(\)/);
  assert.match(admin,/clearCatalogPhotoCache\(\);\s*await refreshAiInventory/);
  assert.match(visual,/CATALOG_PHOTO_REFRESH_EVENT/);
  assert.match(visual,/setRefreshTick\(t=>t\+1\)/);
});
