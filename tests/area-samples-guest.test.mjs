import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {sampleAreaStores} from '../src/data/sampleAreaStores.js';
import {getStoresForArea,DELIVERY_AREAS} from '../src/data/deliveryAreas.js';
import {stores} from '../src/data/stores.js';
import {getStoreGallery} from '../src/data/storeGallery.js';
import {SAMPLE_CREDENTIALS} from '../src/utils/security.js';
test('all fictional storefronts have three lightweight, representative swipe images',()=>{
  assert.equal(sampleAreaStores.length,19);
  for(const store of sampleAreaStores){
    const gallery=getStoreGallery(store);
    assert.equal(gallery.length,3,store.name);
    assert.equal(new Set(gallery.map(image=>image.src)).size,3,store.name);
    assert.ok(gallery.every(image=>image.alt.includes(store.name)),store.name);
    assert.ok(gallery.every(image=>image.src.includes('w=600')),store.name);
    assert.equal(store.posterImage,gallery[0].src);
    assert.equal(store.isSample,true);
  }
  for(const area of DELIVERY_AREAS){
    assert.equal(getStoresForArea(stores,area).length,5);
  }
});
test('example customer is Laxman',()=>{
  assert.equal(SAMPLE_CREDENTIALS.user.name,'Laxman');
});
test('temporary guest session is not a verified customer or an admin',()=>{
  const security=readFileSync(new URL('../src/context/SecurityContext.jsx',import.meta.url),'utf8');
  const guestCode=security.slice(security.indexOf('const loginTemporaryCustomer'),
    security.indexOf('// Customer Login with Rate Limiting'));
  assert.match(guestCode,/role:'customer'/);
  assert.match(guestCode,/isTemporary:true/);
  assert.match(guestCode,/userPhone:null/);
  assert.match(guestCode,/userName:'Laxman'/);
  assert.match(guestCode,/30\*60\*1000/);
  assert.doesNotMatch(guestCode,/localStorage|signupSeller|loginAdmin/);
  const history=readFileSync(new URL('../src/context/OrderHistoryContext.jsx',import.meta.url),'utf8');
  assert.match(history,/session\.isTemporary\) return null/);
  const cart=readFileSync(new URL('../src/pages/CartPage.jsx',import.meta.url),'utf8');
  assert.match(cart,/if\(authSession\.isTemporary\)/);
  assert.match(cart,/Sign in to save order/);
  const location=readFileSync(new URL('../src/pages/LocationPage.jsx',import.meta.url),'utf8');
  assert.match(location,/loginTemporaryCustomer\(\)/);
});

test('homepage shows only offers, while store discovery cards keep photo galleries',()=>{
  const banners=readFileSync(new URL('../src/utils/homepageBanners.js',import.meta.url),'utf8');
  assert.doesNotMatch(banners,/kind:'store'|kind:'picks'|SAMPLE STORE · PREVIEW/);
  const carousel=readFileSync(new URL('../src/components/StoreOffersCarousel.jsx',import.meta.url),'utf8');
  assert.match(carousel,/kp-ed-backdrop/);
  const cards=readFileSync(new URL('../src/components/StoreCard.jsx',import.meta.url),'utf8');
  assert.match(cards,/StorePhotoCarousel/);
});
test('demo customer profile never shows fabricated phone or unselected neighborhood',()=>{
  const profile=readFileSync(new URL('../src/pages/ProfilePage.jsx',import.meta.url),'utf8');
  assert.match(profile,/e\.g\. Laxman/);
  assert.doesNotMatch(profile,/Venkatesh Rao|98480 22334|Maddilapalem, Vizag • Active 2km Radius/);
  assert.match(profile,/Guest preview · no phone linked/);
  assert.match(profile,/userLocation \|\| 'Delivery area not selected'/);
});

test('store product-list screen opens directly on categories without swipe photo rails',()=>{
  const page=readFileSync(new URL('../src/pages/StorePage.jsx',import.meta.url),'utf8');
  assert.doesNotMatch(page,/StorePhotoCarousel|StoreOffersCarousel/);
  assert.doesNotMatch(page,/kp-store-detail-slideshow/);
  const itemsStart=page.indexOf('<main className="sp-scrollable-products"');
  const categoryStart=page.indexOf('{visibleCategories.length === 0 ?',itemsStart);
  assert.ok(itemsStart>=0 && categoryStart>itemsStart,'Store product grid is missing');
  const beforeItems=page.slice(itemsStart,categoryStart);
  assert.doesNotMatch(beforeItems,/kp-promo-track|kp-store-slideshow|SwipeBanners/);
  assert.match(beforeItems,/store\.isSample/,'Keep sample store disclosure');
  const home=readFileSync(new URL('../src/pages/HomePage.jsx',import.meta.url),'utf8');
  const card=readFileSync(new URL('../src/components/StoreCard.jsx',import.meta.url),'utf8');
  assert.match(home,/HomeOffersCarousel/,'Homepage promotional banners should remain');
  assert.match(card,/StorePhotoCarousel/,'Store discovery cards should retain photo previews');
});
