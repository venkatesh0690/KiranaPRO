import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { getEditorialBannerStyle,getEditorialBannerHeadline,getEditorialBannerPhoto,POSTER_PALETTES } from '../src/utils/editorialBanners.js';
import { buildHomepageBanners } from '../src/utils/homepageBanners.js';
import { stores,productsByCategory } from '../src/data/stores.js';
import { DELIVERY_AREAS,getStoresForArea } from '../src/data/deliveryAreas.js';

const carousel=readFileSync(new URL('../src/components/StoreOffersCarousel.jsx',import.meta.url),'utf8');
const homepage=readFileSync(new URL('../src/pages/HomePage.jsx',import.meta.url),'utf8');
const storePage=readFileSync(new URL('../src/pages/StorePage.jsx',import.meta.url),'utf8');
const stylesheet=readFileSync(new URL('../src/styles/editorial-banners.css',import.meta.url),'utf8');
const app=readFileSync(new URL('../src/App.jsx',import.meta.url),'utf8');

test('all visible promotional banners are photo-led, not plain color posters',()=>{
  assert.ok(Object.keys(POSTER_PALETTES).length>=5);
  for(const area of DELIVERY_AREAS){
    const banners=buildHomepageBanners(getStoresForArea(stores,area),productsByCategory,area,0);
    assert.ok(banners.length>=4);
    for(const [index,slide] of banners.entries()){
      const theme=getEditorialBannerStyle(slide,index);
      assert.ok(POSTER_PALETTES[theme.name],slide.id);
      assert.ok(getEditorialBannerHeadline(slide).length>5,slide.id);
      const photo=getEditorialBannerPhoto(slide);
      assert.match(photo.src,/^https:\/\/images\.unsplash\.com\/photo-/);
      assert.match(photo.src,/w=900/);
      assert.match(photo.src,/fm=webp/);
      assert.match(photo.backup,/^https:/);
      assert.match(photo.alt,/Representative/);
      assert.ok(['coupon','global','automatic'].includes(slide.kind));
      assert.doesNotMatch(getEditorialBannerHeadline(slide),/LocalFresh|Provisions|Mart|Stores|Shop/i);
    }
  }
});
test('offer swiper retains real imagery and useful controls',()=>{
  assert.match(carousel,/autoAdvance editorial/);
  assert.match(carousel,/getEditorialBannerStyle/);
  assert.match(carousel,/function EditorialPoster/);
  assert.match(carousel,/onClick=\{\(\)=>onAction\(slide\)\}/);
  assert.match(carousel,/kp-ed-backdrop/);
  assert.match(carousel,/kp-ed-photo-scrim/);
  assert.match(carousel,/getEditorialBannerPhoto\(slide\)/);
  assert.match(carousel,/kp-ed-price-art/);
  assert.match(carousel,/kp-ed-coupon/);
  assert.match(carousel,/kp-promo-dots/);
  assert.match(homepage,/<HomeOffersCarousel/);
  assert.match(homepage,/Delivery savings, cart rewards & coupons/);
  assert.match(app,/import '\.\/styles\/editorial-banners\.css'/);
  assert.match(stylesheet,/kp-ed-backdrop img/);
  assert.match(stylesheet,/object-fit:cover/);
  assert.match(stylesheet,/linear-gradient/);
  assert.match(stylesheet,/kp-ed-photographic/);
});
test('store listings retain photographs but the product pages remain distraction-free',()=>{
  assert.doesNotMatch(storePage,/StoreOffersCarousel|StorePhotoCarousel/);
  assert.match(stylesheet,/\.kp-concept-feature \.kp-editorial-rail/);
  assert.match(stylesheet,/@media\(max-width:720px\)/);
  assert.match(stylesheet,/prefers-reduced-motion:reduce/);
});
