import test from 'node:test';
import assert from 'node:assert/strict';
import { stores, productsByCategory } from '../src/data/stores.js';
import { DELIVERY_AREAS, FREE_DELIVERY_THRESHOLD, getStoresForArea } from '../src/data/deliveryAreas.js';
import { VALID_COUPONS, FEATURED_CHECKOUT_OFFERS } from '../src/data/checkoutOffers.js';
import { getAreaFeaturedPicks } from '../src/utils/areaFeaturedPicks.js';

test('Featured offers exactly match implemented checkout coupons', () => {
  assert.equal(FREE_DELIVERY_THRESHOLD, 300);
  assert.equal(FEATURED_CHECKOUT_OFFERS.length, 4);
  assert.equal(FEATURED_CHECKOUT_OFFERS[0].id, 'free-delivery');
  for (const offer of FEATURED_CHECKOUT_OFFERS) {
    if (!offer.code) continue;
    assert.ok(VALID_COUPONS[offer.code], `Unimplemented coupon ${offer.code}`);
    assert.ok(offer.subtitle.includes(String(VALID_COUPONS[offer.code].min)));
    assert.ok(offer.subtitle.includes(offer.code));
  }
  assert.equal(VALID_COUPONS.TASTY12.value,30);
  assert.equal(VALID_COUPONS.KIRANA50.value,50);
  assert.equal(VALID_COUPONS.WELCOME.percent,15);
});

for (const area of DELIVERY_AREAS) {
  test(`Catalog picks for ${area} belong to orderable stores in that area`, () => {
    const nearby = getStoresForArea(stores, area);
    const available = new Set(nearby.filter(s=>!s.isSample && s.isOpen!==false).map(s=>String(s.id)));
    const items = getAreaFeaturedPicks(stores, productsByCategory, area, 9);
    assert.equal(items.length, 9, `Insufficient real catalog products in ${area}`);
    assert.equal(new Set(items.map(p=>String(p.id))).size,items.length);
    for (const entry of items) {
      assert.ok(available.has(String(entry.storeId)), `Unavailable seller in ${area}`);
      assert.ok(Number(entry.product.price)>0);
      assert.notEqual(entry.product.inStock,false);
      assert.ok(nearby.some(s=>String(s.id)===String(entry.storeId) && s.categories.includes(entry.category)));
    }
  });
}

test('Unknown neighborhoods cannot populate highlights', () => {
  assert.deepEqual(getAreaFeaturedPicks(stores, productsByCategory, 'Maddilapalem'), []);
});
