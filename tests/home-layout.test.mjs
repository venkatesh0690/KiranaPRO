import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {stores,allCategories,productsByCategory} from '../src/data/stores.js';
import {DELIVERY_AREAS,getStoresForArea} from '../src/data/deliveryAreas.js';
import {getFeaturedCategories,getQuickCategories,FEATURED_CATEGORY_IMAGES} from '../src/data/homeDiscovery.js';
import {buildHomepageBanners} from '../src/utils/homepageBanners.js';

const page=readFileSync(new URL('../src/pages/HomePage.jsx',import.meta.url),'utf8');
const css=readFileSync(new URL('../src/styles/home-reference-layout.css',import.meta.url),'utf8');
const app=readFileSync(new URL('../src/App.jsx',import.meta.url),'utf8');
const storePage=readFileSync(new URL('../src/pages/StorePage.jsx',import.meta.url),'utf8');

test('all five delivery areas show accurate four photo-led category cards',()=>{
  assert.equal(DELIVERY_AREAS.length,5);
  for(const area of DELIVERY_AREAS){
    const nearby=getStoresForArea(stores,area);
    const featured=getFeaturedCategories(nearby,productsByCategory);
    assert.deepEqual(featured.map(item=>item.name),[
      'Cleaning & Pooja','Household Staples','Personal Care','Snacks & Munchies'
    ]);
    assert.equal(new Set(featured.map(item=>item.image)).size,4);
    for(const category of featured){
      assert.equal(category.count,
        (productsByCategory[category.name]||[]).filter(item=>item.inStock!==false).length);
      assert.ok(category.count>0);
      assert.match(category.image,/^https:\/\/unsplash\.com\/photos\/[^/]+\/download\?/);
      assert.match(category.image,/w=480&h=300&q=55&fm=webp/);
      assert.ok(nearby.some(store=>store.categories?.includes(category.name)));
    }
    const quick=getQuickCategories(nearby,allCategories);
    assert.equal(quick.length,8);
    assert.deepEqual(quick.slice(0,4).map(category=>category.name),featured.map(x=>x.name));
    const offers=buildHomepageBanners(nearby,productsByCategory,area,0);
    assert.ok(offers.every(s=>['global','automatic','coupon'].includes(s.kind)));
  }
});
test('homepage order: search, compact category shortcuts, neon offers, photo tiles, nearby stores',()=>{
  const positions=[
    page.indexOf('kp-concept-search-line'),
    page.indexOf('kp-concept-categories kp-concept-compact-categories'),
    page.indexOf('kp-concept-feature'),
    page.indexOf('kp-home-featured-categories'),
    page.indexOf('kp-concept-stores kp-nearby-stores')
  ];
  assert.ok(positions.every(p=>p>=0),positions.join(' / '));
  assert.deepEqual(positions,[...positions].sort((a,b)=>a-b));
  assert.match(page,/getQuickCategories/);
  assert.match(page,/getFeaturedCategories/);
  assert.match(page,/kp-category-more/);
  assert.match(page,/kp-featured-category-rail/);
  assert.match(page,/kp-featured-category-photo/);
  assert.match(page,/kp-home-see-all/);
  assert.match(page,/showAllStores/);
  assert.match(page,/kp-nearby-stores/);
});
test('reference styling uses white search, small photos and responsive swipe rails',()=>{
  assert.match(css,/\.kp-concept \.kp-concept-search\s*\{/);
  assert.match(css,/background:#fff;color:#718096/);
  assert.match(css,/kp-featured-category-rail/);
  assert.match(css,/kp-nearby-stores:not\(\.is-expanded\)/);
  assert.match(css,/grid-auto-flow:column/);
  assert.match(css,/scroll-snap-type:x proximity/);
  assert.match(css,/height:139px/);
  assert.match(css,/prefers-reduced-motion:reduce/);
  assert.match(app,/import '\.\/styles\/home-reference-layout\.css'/);
});
test('product detail aisles remain free of unnecessary image sliders',()=>{
  assert.doesNotMatch(storePage,/StorePhotoCarousel|StoreOffersCarousel/);
  assert.equal(Object.keys(FEATURED_CATEGORY_IMAGES).length,4);
});
