import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { getEditorialBannerStyle,getEditorialBannerHeadline,POSTER_PALETTES } from '../src/utils/editorialBanners.js';
import { buildHomepageBanners } from '../src/utils/homepageBanners.js';
import { stores,productsByCategory } from '../src/data/stores.js';
import { DELIVERY_AREAS,getStoresForArea } from '../src/data/deliveryAreas.js';

const carousel=readFileSync(new URL('../src/components/StoreOffersCarousel.jsx',import.meta.url),'utf8');
const homepage=readFileSync(new URL('../src/pages/HomePage.jsx',import.meta.url),'utf8');
const storePage=readFileSync(new URL('../src/pages/StorePage.jsx',import.meta.url),'utf8');
const stylesheet=readFileSync(new URL('../src/styles/editorial-banners.css',import.meta.url),'utf8');
const app=readFileSync(new URL('../src/App.jsx',import.meta.url),'utf8');

test('editorial palette contains five distinct high-contrast brand-guide posters',()=>{
  assert.ok(Object.keys(POSTER_PALETTES).length>=5);
  for(const color of Object.values(POSTER_PALETTES)){
    for(const key of ['bg','ink','muted','accent','panel'])assert.match(color[key],/^#[0-9A-F]{6}$/i);
  }
});
test('all area-specific banners remain in first rail and receive a valid palette and headline',()=>{
  for(const area of DELIVERY_AREAS){
    const areaStores=getStoresForArea(stores,area);
    const banners=buildHomepageBanners(areaStores,productsByCategory,area,0);
    assert.ok(banners.length>=8);
    for(const [index,slide] of banners.entries()){
      const theme=getEditorialBannerStyle(slide,index);
      assert.ok(POSTER_PALETTES[theme.name],slide.id);
      assert.ok(getEditorialBannerHeadline(slide).length>5,slide.id);
      if(slide.isSample){
        assert.match(getEditorialBannerHeadline(slide),/^[A-Z0-9 ,&'-]+$/);
        assert.match(slide.subtitle,/Not accepting orders/i);
        assert.ok(slide.bannerPhoto?.startsWith('https://'));
      }
      if(slide.kind==='global')assert.notEqual(String(slide.store?.id),'localfresh');
      if(slide.kind==='coupon' && slide.rewardEligible===false)assert.match(slide.subtitle,/Not eligible/);
    }
  }
});
test('UI uses the same working swipe carousel, new poster markup and navigable calls to action',()=>{
  assert.match(carousel,/autoAdvance editorial/);
  assert.match(carousel,/getEditorialBannerStyle/);
  assert.match(carousel,/function EditorialPoster/);
  assert.match(carousel,/onClick=\{\(\)=>onAction\(slide\)\}/);
  assert.match(carousel,/kp-ed-photo-frame/);
  assert.match(carousel,/kp-ed-price-art/);
  assert.match(carousel,/kp-ed-coupon/);
  assert.match(carousel,/kp-promo-dots/);
  assert.match(homepage,/<HomeOffersCarousel/);
  assert.match(app,/import '\.\/styles\/editorial-banners\.css'/);
});
test('banner restyling remains homepage-only; store product pages do not regain photo rails',()=>{
  assert.doesNotMatch(storePage,/StoreOffersCarousel|StorePhotoCarousel/);
  assert.match(stylesheet,/\.kp-concept-feature \.kp-editorial-rail/);
  assert.match(stylesheet,/@media\(max-width:720px\)/);
  assert.match(stylesheet, /prefers-reduced-motion:reduce/);
});
