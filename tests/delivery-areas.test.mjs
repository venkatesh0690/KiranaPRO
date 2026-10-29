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

test('delivery threshold remains ₹300 for every store', () => {
  const items=[{id:'lf-1004',name:'Potols',unit:'per kg',quantity:2}];
  for(const store of stores){
    if(store.isSample || store.id===2 || String(store.id)==='localfresh'){
      const fee=getDeliveryFee(store,300,null,items);
      assert.ok(fee>0, `Missing charge below threshold for ${store.name}`);
      if (String(store.id)==='localfresh') {
        for(const subtotal of [299,300,301,500,501,1200]) {
          assert.equal(getDeliveryFee(store,subtotal,null,items),10,
            `LocalFresh delivery unexpectedly waived at ₹${subtotal}`);
        }
      } else {
        assert.equal(fee,store.deliveryFee);
        assert.equal(getDeliveryFee(store,301,null,items),0);
        assert.equal(getDeliveryFee(store,420,null,items),0);
      }
    }
  }
  assert.equal(FREE_DELIVERY_THRESHOLD,300);
});

test('coupons do not waive LocalFresh delivery below threshold', () => {
  const localFresh=stores.find(s=>s.id==='localfresh');
  const items=[{id:'lf-1004',name:'Potols',unit:'per kg',quantity:1}];
  assert.equal(getDeliveryFee(localFresh,90,{type:'freedel'},items),5);
  assert.equal(getDeliveryFee(localFresh,300,{type:'freedel'},items),5);
  assert.equal(getDeliveryFee(localFresh,301,{type:'freedel'},items),5);
  assert.equal(getDeliveryFee(localFresh,600,{type:'freedel'},items),5);
});

test('the non-LocalFresh free-delivery rule is not confused with pickup', async () => {
  const { qualifiesForFreeDelivery, isLocalFreshStore } = await import('../src/data/deliveryAreas.js');
  const localFresh=stores.find(s=>String(s.id)==='localfresh');
  const otherStore=stores.find(s=>String(s.id)==='2');
  assert.ok(isLocalFreshStore(localFresh));
  assert.equal(qualifiesForFreeDelivery(localFresh,999),false);
  assert.equal(qualifiesForFreeDelivery(otherStore,300),false);
  assert.equal(qualifiesForFreeDelivery(otherStore,301),true);
});
