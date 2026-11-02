import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {hasStoreConflict,normalizeStoreId} from '../src/utils/singleStoreCart.js';

const read=file=>readFileSync(new URL('../'+file,import.meta.url),'utf8');
const cart=(storeId,items=[{id:'x',storeId,quantity:1}])=>({storeId,items});

test('empty cart accepts any valid shop; rejects missing shop IDs',()=>{
  for(const storeId of ['localfresh','sample-siri-1','7']) {
    assert.equal(hasStoreConflict({storeId:null,items:[]},storeId),false);
  }
  assert.equal(hasStoreConflict({storeId:null,items:[]},null),true);
  assert.equal(hasStoreConflict({storeId:null,items:[]},''),true);
});

test('LocalFresh and neighborhood kirana are completely separate carts',()=>{
  assert.equal(hasStoreConflict(cart('localfresh'),'localfresh'),false);
  assert.equal(hasStoreConflict(cart('localfresh'),'sample-siri-1'),true);
  assert.equal(hasStoreConflict(cart('sample-siri-1'),'localfresh'),true);
  assert.equal(hasStoreConflict(cart('sample-siri-1'),'sample-siri-2'),true);
  assert.equal(hasStoreConflict(cart('sample-siri-1'),'SAMPLE-SIRI-1'),false);
  assert.equal(normalizeStoreId(5),'5');
  assert.equal(hasStoreConflict(cart(5),'5'),false);
  assert.equal(hasStoreConflict(cart(5),6),true);
});

test('different store items already in cart prevent further invalid additions',()=>{
  const mixed={storeId:'localfresh',items:[{id:'a',storeId:'localfresh'},{
    id:'b',storeId:'sample-siri-1'}]};
  assert.equal(hasStoreConflict(mixed,'localfresh'),true);
  assert.equal(hasStoreConflict(mixed,'sample-siri-1'),true);
});

test('cart reducer enforces same-store rule and keeps existing cart on rejection',()=>{
  const source=read('src/context/CartContext.jsx');
  assert.match(source,/case 'ADD_ITEM': \{[\s\S]*hasStoreConflict\(state,storeId\)\) return state/);
  assert.match(source,/if\(hasStoreConflict\(current,storeId\)\)/);
  assert.match(source,/setBlockedStore\(/);
  assert.match(source,/cartRef\.current=cartReducer\(current,action\)/);
  assert.match(source,/role="alertdialog"/);
  assert.match(source,/Items from the same store should be added to the cart/);
  assert.match(source,/Your existing cart has not been changed/);
  assert.doesNotMatch(source,/SWITCH_STORE_ITEMS|isMultiStoreCompatible/);
});

test('shopping pages cannot reassign a basket to another merchant',()=>{
  const cartPage=read('src/pages/CartPage.jsx');
  const card=read('src/components/ProductCard.jsx');
  const spotlight=read('src/components/CommandSpotlight.jsx');
  assert.doesNotMatch(cartPage,/switchStoreItems|Compare Prices Across Local Kiranas/);
  assert.match(card,/String\(i\.storeId\)\.toLowerCase\(\) === String\(storeId\)\.toLowerCase\(\)/);
  assert.match(spotlight,/if\(added\)navigate\('\/cart'\)/);
});
