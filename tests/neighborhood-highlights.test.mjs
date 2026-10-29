import test from 'node:test';
import assert from 'node:assert/strict';
import {stores, productsByCategory} from '../src/data/stores.js';
import { DELIVERY_AREAS, FREE_DELIVERY_THRESHOLD, getStoresForArea } from '../src/data/deliveryAreas.js';
import {
  VALID_COUPONS, FEATURED_CHECKOUT_OFFERS, MIN_PROMO_SUBTOTAL,
  getAutomaticBasketDiscount, isCouponForOrder, nextOrderNumber,
  evaluateCoupon, getOrderSavings
} from '../src/data/checkoutOffers.js';
import { buildHomepageBanners } from '../src/utils/homepageBanners.js';
import { getAreaFeaturedPicks } from '../src/utils/areaFeaturedPicks.js';

test('free delivery threshold and basic offer configuration',()=>{
  assert.equal(FREE_DELIVERY_THRESHOLD,300);
  assert.equal(MIN_PROMO_SUBTOTAL,301);
  assert.deepEqual(Object.keys(VALID_COUPONS),['WELCOME','REPEAT','ADDICTED']);
  assert.equal(FEATURED_CHECKOUT_OFFERS.length,5);
  assert.equal(VALID_COUPONS.WELCOME.value,30);
  assert.equal(VALID_COUPONS.REPEAT.value,20);
  assert.equal(VALID_COUPONS.ADDICTED.value,50);
});
test('automatic basket offer is 5% capped at ₹30 and only above ₹500',()=>{
  assert.equal(getAutomaticBasketDiscount(300),0);
  assert.equal(getAutomaticBasketDiscount(301),0);
  assert.equal(getAutomaticBasketDiscount(500),0);
  assert.equal(getAutomaticBasketDiscount(501),25);
  assert.equal(getAutomaticBasketDiscount(600),30);
  assert.equal(getAutomaticBasketDiscount(990),30);
});
test('WELCOME applies only to 1st order; no coupons below ₹301',()=>{
  for (const subtotal of [0,299,300]) assert.equal(evaluateCoupon('WELCOME',subtotal,1).eligible,false);
  assert.equal(evaluateCoupon('WELCOME',301,1).discount,30);
  assert.equal(evaluateCoupon('WELCOME',1200,2).eligible,false);
});
test('REPEAT only on 3rd, 5th, 7th; ADDICTED only on 10th',()=>{
  for(let n=1;n<=12;n++) {
    assert.equal(isCouponForOrder('REPEAT',n),[3,5,7].includes(n));
    assert.equal(isCouponForOrder('ADDICTED',n),n===10);
  }
  assert.equal(evaluateCoupon('REPEAT',301,3).discount,20);
  assert.equal(evaluateCoupon('REPEAT',301,5).discount,20);
  assert.equal(evaluateCoupon('REPEAT',301,7).discount,20);
  assert.equal(evaluateCoupon('ADDICTED',301,10).discount,50);
  assert.equal(evaluateCoupon('ADDICTED',301,9).discount,0);
});
test('order ordinal is customer-order-count plus one',()=>{
  assert.equal(nextOrderNumber(0),1);
  assert.equal(nextOrderNumber(2),3);
  assert.equal(nextOrderNumber(6),7);
  assert.equal(nextOrderNumber(9),10);
});
test('automatic and account coupon discounts do not stack',()=>{
  assert.equal(getOrderSavings(600,1,null).discount,30);
  assert.equal(getOrderSavings(600,1,'WELCOME').discount,30);
  assert.equal(getOrderSavings(600,3,'REPEAT').discount,20);
  assert.equal(getOrderSavings(600,10,'ADDICTED').discount,50);
  assert.equal(getOrderSavings(600,2,'WELCOME').eligible,false);
  assert.equal(getOrderSavings(600,2,'WELCOME').discount,0);
});
for(const area of DELIVERY_AREAS){
  test(`Suggested products and banners only from orderable shops in ${area}`,()=>{
    const nearby=getStoresForArea(stores,area);
    const orderable=new Set(nearby.filter(s=>!s.isSample && s.isOpen!==false).map(s=>String(s.id)));
    const picks=getAreaFeaturedPicks(stores,productsByCategory,area,9);
    assert.equal(picks.length,9);
    assert.equal(new Set(picks.map(p=>String(p.id))).size,9);
    for(const pick of picks){
      assert.ok(orderable.has(String(pick.storeId)));
      assert.ok(Number(pick.product.price)>0);
      assert.notEqual(pick.product.inStock,false);
    }
    const slide=buildHomepageBanners(stores,productsByCategory,area,0);
    assert.ok(slide.length>=8);
    assert.equal(new Set(slide.map(s=>s.id)).size,slide.length);
    const otherShops=nearby.filter(s=>!s.isSample && s.isOpen!==false && String(s.id)!=='localfresh');
    const generic=slide.filter(s=>s.kind==='global');
    assert.equal(generic.length,otherShops.length?1:0);
    if(generic.length){
      assert.notEqual(String(generic[0].store.id),'localfresh');
      assert.match(generic[0].subtitle,/Excludes LocalFresh/);
    }
    assert.ok(slide.some(s=>s.kind==='automatic' && s.minCart===501));
    assert.equal(slide.filter(s=>s.kind==='coupon').length,3);
    for (const item of slide){
      if(item.kind==='store'){
        assert.ok(orderable.has(String(item.store.id)));
        if(String(item.store.id)==='localfresh'){
          assert.doesNotMatch(item.subtitle,/Free delivery/i);
          assert.equal(item.minCart,null);
        }
      }
      if(item.kind==='coupon')assert.ok(VALID_COUPONS[item.code]);
      if(item.minCart!==null)assert.ok(item.minCart>=301);
    }
    assert.ok(slide.find(s=>s.code==='WELCOME').rewardEligible);
    assert.equal(slide.find(s=>s.code==='REPEAT').rewardEligible,false);
    assert.equal(slide.find(s=>s.code==='ADDICTED').rewardEligible,false);
    const third=buildHomepageBanners(stores,productsByCategory,area,2);
    assert.equal(third.find(s=>s.code==='WELCOME').rewardEligible,false);
    assert.equal(third.find(s=>s.code==='REPEAT').rewardEligible,true);
    const tenth=buildHomepageBanners(stores,productsByCategory,area,9);
    assert.equal(tenth.find(s=>s.code==='ADDICTED').rewardEligible,true);
  });
}
test('unknown area has neither picks nor promotional banners',()=>{
  assert.deepEqual(getAreaFeaturedPicks(stores,productsByCategory,'Unknown'),[]);
  assert.deepEqual(buildHomepageBanners(stores,productsByCategory,'Unknown'),[]);
});
