import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { getEditorialBannerStyle,getEditorialBannerHeadline,getEditorialBannerPhoto,POSTER_PALETTES, NEON_PHOTO_IDS } from '../src/utils/editorialBanners.js';
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
      assert.match(photo.src,/^https:\/\/unsplash\.com\/photos\/[A-Za-z0-9_-]+\/download\?/);
      assert.match(photo.src,/w=900/);
      assert.match(photo.src,/fm=webp/);
      assert.match(photo.backup,/^https:/);
      assert.ok(Object.values(NEON_PHOTO_IDS).some(id=>photo.src.includes('/'+id+'/download')),slide.id);
      assert.doesNotMatch(photo.alt,/fruit|vegetable|leafy|greens|produce|store|shop/i);
      assert.match(photo.alt,/neon|bokeh|light trails/i);
      assert.ok(photo.backup.includes('/'+NEON_PHOTO_IDS.violet+'/download'));
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
  assert.match(homepage,/Current delivery and basket offers/);
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

test('compact photo-backed offers keep the original slide width and exactly half-height mobile cards',()=>{
  const bannerCss=stylesheet;
  assert.match(bannerCss,/height:clamp\(133px,18vw,163px\)/);
  assert.match(bannerCss,/height:139px/);
  assert.match(bannerCss,/kp-ed-photo-scrim/);
  assert.match(bannerCss,/\.kp-ed-photographic \.kp-ed-head/);
  assert.match(bannerCss,/\.kp-ed-photographic \.kp-ed-footer/);
  assert.match(bannerCss,/grid-template-columns:minmax\(0,73%\) minmax\(0,27%\)/);
  assert.doesNotMatch(bannerCss.split('Compact, half-height offer photography cards')[1],/flex:\s*0\s+0\s+93%/);
  for(const area of DELIVERY_AREAS){
    const slides=buildHomepageBanners(stores,productsByCategory,area,0);
    assert.equal(new Set(slides.map(s=>getEditorialBannerPhoto(s).src)).size,slides.length,'Every offer should have a distinct neon image');
    assert.ok(slides.every(s=>['global','automatic','coupon'].includes(s.kind)));
    assert.ok(slides.every(s=>!s.isSample && !s.bannerPhoto && s.id.startsWith('offer-')));
    for(const slide of slides){
      assert.ok(slide.subtitle.length<120);
      assert.ok(getEditorialBannerHeadline(slide).length>5);
      assert.match(getEditorialBannerPhoto(slide).src,/h=250/);
    }
  }
});

test('category tiles appear directly after search, before the offer carousel',()=>{
  const search=homepage.indexOf('kp-concept-search-line');
  const category=homepage.indexOf('kp-concept-categories kp-concept-compact-categories');
  const feature=homepage.indexOf('kp-concept-feature');
  const stores=homepage.indexOf('kp-concept-stores');
  assert.ok(search>=0 && search<category && category<feature && feature<stores);
  assert.doesNotMatch(homepage.slice(search,category),/HomeOffersCarousel/);
  const offerMarkup=homepage.slice(feature,stores);
  assert.match(offerMarkup,/HomeOffersCarousel/);
  assert.doesNotMatch(offerMarkup,/Offers worth opening|Delivery savings, cart rewards & coupons|kp-concept-section-heading/);
  assert.doesNotMatch(homepage,/Fresh finds from your neighborhood/);
  assert.match(homepage,/01 \/ EXPLORE/);
  assert.match(homepage,/Featured categories/);
  assert.match(homepage,/Stores near you/);
  assert.match(homepage,/kp-nearby-stores/);
  assert.match(carousel,/editorial \? 'Offers' : 'Offers & rewards'/);
});

test('neon banner backgrounds match user references, without merchant or produce photography',()=>{
  assert.ok(Object.keys(NEON_PHOTO_IDS).length>=5);
  assert.match(stylesheet,/Neon-after-dark edition/);
  assert.match(stylesheet,/rgba\(6,7,30,\.95\)/);
  assert.match(stylesheet,/#FF80BD/i);
  assert.match(stylesheet,/full-bleed photographic/i);
  for(const area of DELIVERY_AREAS){
    const slides=buildHomepageBanners(stores,productsByCategory,area,0);
    assert.ok(slides.length>=4);
    assert.ok(slides.every(s=>!s.isSample && ['global','coupon','automatic'].includes(s.kind)));
    for(const slide of slides){
      const photo=getEditorialBannerPhoto(slide);
      assert.match(photo.src,/download\?force=true&w=900&h=250&q=56&fm=webp/);
      assert.doesNotMatch(photo.alt,/store|fruit|vegetables|shop|food/i);
      assert.match(photo.alt,/Abstract.*neon/i);
    }
  }
});
