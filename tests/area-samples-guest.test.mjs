import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {sampleAreaStores} from '../src/data/sampleAreaStores.js';
import {getStoresForArea,DELIVERY_AREAS} from '../src/data/deliveryAreas.js';
import {stores} from '../src/data/stores.js';
import {getStoreGallery} from '../src/data/storeGallery.js';
import { getEditorialBannerPhoto, NEIGHBORHOOD_BANNER_PHOTO_IDS } from '../src/utils/editorialBanners.js';
import { NEIGHBORHOOD_PHOTO_GROUPS } from '../src/data/sampleStoreImages.js';
import { getStoreImageFallback } from '../src/data/storeGallery.js';
import {buildHomepageBanners} from '../src/utils/homepageBanners.js';
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
test('example customer name is only used for temporary browsing, not authentication',()=>{
 const security=readFileSync(new URL('../src/context/SecurityContext.jsx',import.meta.url),'utf8');
 assert.match(security,/userName:'Laxman'/);
 assert.doesNotMatch(readFileSync(new URL('../src/utils/security.js',import.meta.url),'utf8'),/SAMPLE_CREDENTIALS|admin123|supersecret/);
});
test('temporary guest session is not a verified customer or an admin',()=>{
  const security=readFileSync(new URL('../src/context/SecurityContext.jsx',import.meta.url),'utf8');
  const guestCode=security.slice(security.indexOf('const loginTemporaryCustomer'),
    security.indexOf('// All non-guest identities'));
  assert.match(guestCode,/role:'customer'/);
  assert.match(guestCode,/isTemporary:true/);
  assert.match(guestCode,/userPhone:null/);
  assert.match(guestCode,/userName:'Laxman'/);
  assert.match(guestCode,/30\*60\*1000/);
  assert.doesNotMatch(guestCode,/localStorage|signupSeller|loginAdmin/);
  const history=readFileSync(new URL('../src/context/OrderHistoryContext.jsx',import.meta.url),'utf8');
  assert.match(history,/!session.isTemporary/);
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

test('only LocalFresh can show fruits, vegetables or leafy greens in storefront photography',()=>{
  const prohibited=['photo-1542838132-92c53300491e','photo-1590779033100-9f60a05a013d',
    'photo-2h1O8DtRu3g','photo-mBMl2OkGgAg','photo-sCSBLCaybds',
    '2h1O8DtRu3g','mBMl2OkGgAg','sCSBLCaybds'];
  const allStores=stores.filter(s=>String(s.id).toLowerCase()!=='localfresh');
  assert.ok(allStores.length>=20);
  for(const store of allStores) {
    const gallery=getStoreGallery(store);
    assert.ok(gallery.length>=3,'Expected 3 neighborhood photos for '+store.name);
    for(const image of gallery) {
      assert.ok(image.src.startsWith('https://'),store.name);
      assert.ok(!prohibited.some(id=>image.src.includes(id)),
        'Produce-market image found in non-LocalFresh store: '+store.name);
      assert.doesNotMatch(image.alt,/fruit|vegetable|fresh produce|leafy greens|produce display/i,store.name);
    }
    if(store.posterImage){
      assert.ok(!prohibited.some(id=>store.posterImage.includes(id)),store.name);
    }
    const fallback=getStoreImageFallback(store);
    if(fallback)assert.ok(!prohibited.some(id=>fallback.includes(id)),store.name);
  }
  const localfresh=stores.find(s=>String(s.id).toLowerCase()==='localfresh');
  assert.ok(localfresh);
  const localVisuals=getStoreGallery(localfresh);
  assert.ok(localVisuals.some(i=>/vegetable|produce/i.test(i.alt)),'LocalFresh must retain fresh imagery');
  const localPoster=getEditorialBannerPhoto({kind:'store',store:localfresh});
  assert.match(localPoster.alt,/LocalFresh fresh vegetable market/);
});
test('all fictional shop gallery photo groups exclude green produce and use packaged-goods photos',()=>{
  for(const [type,photos] of Object.entries(NEIGHBORHOOD_PHOTO_GROUPS)){
    assert.ok(photos.length>=3,type);
    for(const [id,description] of photos){
      assert.match(description,/packaged|pantry|shelves|products|grocer|drinks|detergent|dairy|beverages|rice|pulses|chips|snacks/i);
      assert.doesNotMatch(description,/fruit|vegetables|leafy|greens|produce/i);
      assert.ok(id.length>=9);
    }
  }
});
test('offer banners use packaged grocery imagery, not LocalFresh produce scenes',()=>{
  assert.equal(NEIGHBORHOOD_BANNER_PHOTO_IDS.length,5);
  const forbidden=['photo-1542838132-92c53300491e','photo-1590779033100-9f60a05a013d',
    'wguVC8oG3qw','9KTwGdcwbp4','Jo0usTWfuSQ'];
  for(const area of DELIVERY_AREAS){
    const banners=buildHomepageBanners(stores,null,area,0);
    for(const offer of banners){
      const image=getEditorialBannerPhoto(offer);
      assert.ok(NEIGHBORHOOD_BANNER_PHOTO_IDS.some(id=>image.src.includes(id)),offer.id);
      assert.ok(!forbidden.some(id=>image.src.includes(id)),offer.id);
      assert.doesNotMatch(image.alt,/fruit|vegetable|produce|leafy greens/i);
      assert.doesNotMatch(offer.title,/LocalFresh|Provisions|Mart|Stores|Shop/i);
    }
  }
});
