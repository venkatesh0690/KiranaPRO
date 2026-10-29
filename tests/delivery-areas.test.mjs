import test from 'node:test';
import assert from 'node:assert/strict';
import { stores } from '../src/data/stores.js';
import {
  DELIVERY_AREAS, getStoresForArea, isDeliveryArea,
  getDeliveryFee, FREE_DELIVERY_THRESHOLD
} from '../src/data/deliveryAreas.js';

test('exactly five supported Vizag delivery areas', () => {
  assert.deepEqual(DELIVERY_AREAS, ['NAD Kotha Road','Dabagardens','Siripuram','MVP Colony','Gajuwaka']);
  assert.equal(isDeliveryArea('Maddilapalem'),false);
  assert.equal(isDeliveryArea('Gajuwaka'),true);
  assert.deepEqual(getStoresForArea(stores,'Unknown'),[]);
});

for(const area of DELIVERY_AREAS) {
  test(`${area}: exactly four neighborhood stores and one LocalFresh`, () => {
    const visible=getStoresForArea(stores,area);
    assert.equal(visible.length,5,`Wrong number of stores in ${area}`);
    assert.equal(visible.filter(s=>String(s.id)==='localfresh').length,1);
    assert.equal(visible.filter(s=>String(s.id)!=='localfresh').length,4);
    assert.equal(visible.filter(s=>s.isSample||s.id===2).length,4);
    assert.equal(new Set(visible.map(s=>String(s.id))).size,5);
  });
}

test('every configured store charges for a cart of ₹300 or less', () => {
  for(const store of stores){
    if(store.isSample || store.id===2 || String(store.id)==='localfresh'){
      assert.ok(store.deliveryFee>0, `Missing fee at ${store.name}`);
      assert.equal(getDeliveryFee(store,300),store.deliveryFee);
      assert.equal(getDeliveryFee(store,301),0);
      assert.equal(getDeliveryFee(store,420),0);
    }
  }
  assert.equal(FREE_DELIVERY_THRESHOLD,300);
});

test('no coupon can waive the delivery fee at or below ₹300', () => {
 const localFresh=stores.find(s=>s.id==='localfresh');
 assert.equal(getDeliveryFee(localFresh,90,{type:'freedel'}),localFresh.deliveryFee);
 assert.equal(getDeliveryFee(localFresh,300,{type:'freedel'}),localFresh.deliveryFee);
 assert.equal(getDeliveryFee(localFresh,301),0);
});
