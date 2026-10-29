import test from 'node:test';
import assert from 'node:assert/strict';
import { stores, productsByCategory } from '../src/data/stores.js';
import { DELIVERY_AREAS, FREE_DELIVERY_THRESHOLD, getStoresForArea } from '../src/data/deliveryAreas.js';
import {
  VALID_COUPONS, FEATURED_CHECKOUT_OFFERS, MIN_PROMO_SUBTOTAL,
  getAutomaticBasketDiscount, isCouponForOrder, nextOrderNumber,
  evaluateCoupon, getOrderSavings
} from '../src/data/checkoutOffers.js';
import { buildHomepageBanners } from '../src/utils/homepageBanners.js';
import { getAreaFeaturedPicks } from '../src/utils/areaFeaturedPicks.js';

test('cart offer rules remain unchanged',()=>{
  assert.equal(FREE_DELIVERY_THRESHOLD,300);
  assert.equal(MIN_PROMO_SUBTOTAL,301);
  assert.deepEqual(Object.keys(VALID_COUPONS),['WELCOME','REPEAT','ADDICTED']);
  assert.equal(FEATURED_CHECKOUT_OFFERS.length,5);
  assert.equal(VALID_COUPONS.WELCOME.value,30);
  assert.equal(VALID_COUPONS.REPEAT.value,20);
  assert.equal(VALID_COUPONS.ADDICTED.value,50);
  assert.equal(getAutomaticBasketDiscount(300),0);
  assert.equal(getAutomaticBasketDiscount(500),0);
  assert.equal(getAutomaticBasketDiscount(501),25);
  assert.equal(getAutomaticBasketDiscount(600),30);
  assert.equal(evaluateCoupon('WELCOME',300,1).eligible,false);
  assert.equal(evaluateCoupon('WELCOME',301,1).discount,30);
  assert.equal(evaluateCoupon('WELCOME',1200,2).eligible,false);
  for(let n=1;n<=12;n++){
    assert.equal(isCouponForOrder('REPEAT',n),[3,5,7].includes(n));
    assert.equal(isCouponForOrder('ADDICTED',n),n===10);
  }
  assert.equal(evaluateCoupon('REPEAT',301,3).discount,20);
  assert.equal(evaluateCoupon('REPEAT',301,5).discount,20);
  assert.equal(evaluateCoupon('REPEAT',301,7).discount,20);
  assert.equal(evaluateCoupon('ADDICTED',301,10).discount,50);
  assert.equal(nextOrderNumber(0),1);
  assert.equal(nextOrderNumber(2),3);
  assert.equal(nextOrderNumber(6),7);
  assert.equal(nextOrderNumber(9),10);
  assert.equal(getOrderSavings(600,1,null).discount,30);
  assert.equal(getOrderSavings(600,3,'REPEAT').discount,20);
  assert.equal(getOrderSavings(600,10,'ADDICTED').discount,50);
});

for(const area of DELIVERY_AREAS){
  test(`Homepage ${area} has only real, correctly scoped checkout offers`,()=>{
    const nearby=getStoresForArea(stores,area);
    const available=nearby.filter(s=>!s.isSample && s.isOpen!==false);
    const otherStores=available.filter(s=>String(s.id)!=='localfresh');
    const slides=buildHomepageBanners(stores,productsByCategory,area,0);
    assert.equal(slides.length,otherStores.length?5:4);
    assert.equal(new Set(slides.map(s=>s.id)).size,slides.length);
    assert.ok(slides.every(s=>['global','automatic','coupon'].includes(s.kind)));
    assert.ok(slides.every(s=>s.id.startsWith('offer-')));
    assert.ok(slides.every(s=>s.minCart>=301));
    assert.ok(!slides.some(s=>s.isSample || s.kind==='store' || s.kind==='picks'));
    const names=nearby.map(s=>s.name.toLowerCase());
    for(const slide of slides){
      assert.ok(!names.some(name=>slide.title.toLowerCase().includes(name)),slide.title);
      assert.ok(!names.some(name=>slide.subtitle.toLowerCase().includes(name)),slide.subtitle);
      assert.ok(!names.some(name=>String(slide.tag||'').toLowerCase().includes(name)),slide.tag);
    }
    if(otherStores.length){
      const free=slides.find(s=>s.kind==='global');
      assert.ok(free);
      assert.ok(otherStores.some(s=>String(s.id)===String(free.store.id)));
      assert.match(free.subtitle,/above ₹300/);
      assert.doesNotMatch(free.subtitle,/LocalFresh/i);
    }else assert.ok(!slides.some(s=>s.kind==='global'));
    const automatic=slides.find(s=>s.kind==='automatic');
    assert.equal(automatic.minCart,501);
    assert.match(automatic.subtitle,/5%/);
    assert.equal(slides.filter(s=>s.kind==='coupon').length,3);
    assert.ok(slides.find(s=>s.code==='WELCOME').rewardEligible);
    assert.equal(slides.find(s=>s.code==='REPEAT').rewardEligible,false);
    assert.equal(slides.find(s=>s.code==='ADDICTED').rewardEligible,false);
    const third=buildHomepageBanners(stores,productsByCategory,area,2);
    assert.equal(third.find(s=>s.code==='REPEAT').rewardEligible,true);
    const tenth=buildHomepageBanners(stores,productsByCategory,area,9);
    assert.equal(tenth.find(s=>s.code==='ADDICTED').rewardEligible,true);
    // Product recommendations still exist on other screens, but not in the hero rail.
    const picks=getAreaFeaturedPicks(stores,productsByCategory,area,9);
    assert.equal(picks.length,9);
  });
}
test('unknown areas never show shopping offers',()=>{
  assert.deepEqual(buildHomepageBanners(stores,productsByCategory,'Unknown'),[]);
});
