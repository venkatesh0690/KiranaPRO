import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = name => readFileSync(new URL('../'+name,import.meta.url),'utf8');

test('initial shell uses lazy routes for bulky customer and back-office screens',()=>{
  const app=read('src/App.jsx');
  assert.match(app,/import \{ Suspense, lazy, useState \} from 'react'/);
  assert.match(app,/<Suspense fallback=\{<RouteLoading \/>\}>/);
  for (const page of ['HomePage','StorePage','CartPage','SearchPage','OrdersPage',
    'ProfilePage','SellerLoginPage','SellerDashboard','AdminLoginPage','AdminDashboard']){
    assert.match(app,new RegExp('const '+page+' = lazy\\(\\(\\) => import\\('));
    assert.doesNotMatch(app,new RegExp('import '+page+' from'));
  }
  assert.match(read('src/pages/LocationPage.jsx'),/const AuthModal = lazy\(/);
});

test('home image carousels only fetch images that are visible or selected',()=>{
  const stores=read('src/components/StorePhotoCarousel.jsx');
  assert.match(stores,/index === active \|\| loaded\.has\(index\)/);
  assert.match(stores,/loading="lazy"/);
  assert.match(stores,/w=600/);
  const banners=read('src/components/StoreOffersCarousel.jsx');
  assert.match(banners,/shouldLoadPhoto/);
  assert.match(banners,/fetchPriority=\{index===0\?'high':'low'\}/);
});
test('PWA caching never persists authenticated API responses',()=>{
  const sw=read('public/sw.js');
  assert.match(sw,/url\.pathname\.startsWith\('\/api\/'\)\)return/);
  assert.match(sw,/url\.pathname\.startsWith\('\/assets\/'\)/);
  assert.match(sw,/request\.mode==='navigate'/);
  assert.doesNotMatch(sw,/caches\.open\(.*'\/api\/orders'/);
});
test('product visual avoids repeat work on parent state changes',()=>{
  const visual=read('src/components/CatalogProductVisual.jsx');
  assert.match(visual,/useMemo\(\(\) => getCatalogVisual\(product\), \[product\]\)/);
  assert.match(visual,/export default memo\(CatalogProductVisual\)/);
});
