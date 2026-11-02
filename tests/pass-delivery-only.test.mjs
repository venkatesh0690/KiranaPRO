import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {quoteFulfilment} from '../src/utils/fulfilment.js';
import {applyKiranaPROPass,KIRANAPRO_PASS_PREVIEW_FEE} from '../src/utils/kiranaproPass.js';

const localfresh={id:'localfresh',name:'LocalFresh',deliveryFee:20};
const kirana={id:'kirana',name:'Neighborhood Kirana',deliveryFee:20};
const items=[{id:'lf-1004',unit:'per kg',quantity:2}];

test('Pass waives the LocalFresh delivery fee but retains handling and estimated GST',()=>{
  const quote=quoteFulfilment({store:localfresh,subtotal:500,items,mode:'standard'});
  const result=applyKiranaPROPass(quote,true);
  assert.equal(quote.deliveryFee,20);
  assert.equal(result.deliveryFee,0);
  assert.equal(result.handlingFee,5);
  assert.equal(result.tax,25);
  assert.equal(result.passFee,99);
  assert.equal(result.total,500+5+25+99);
});

test('Pass applies delivery-only waiver for scheduled orders and larger weight-based charges',()=>{
  const heavyItems=[{id:'lf-1004',unit:'per kg',quantity:8}];
  const quote=quoteFulfilment({store:localfresh,subtotal:700,items:heavyItems,mode:'scheduled'});
  assert.equal(quote.deliveryFee,40);
  const result=applyKiranaPROPass(quote,true);
  assert.equal(result.deliveryFee,0);
  assert.equal(result.handlingFee,quote.handlingFee);
  assert.equal(result.total,quote.total-40+KIRANAPRO_PASS_PREVIEW_FEE);
});

test('Pass does not waive Kirana handling charges or add extra pickup savings',()=>{
  const quote=quoteFulfilment({store:kirana,subtotal:250,mode:'standard'});
  assert.equal(quote.deliveryFee,20);
  const result=applyKiranaPROPass(quote,true);
  assert.equal(result.deliveryFee,0);
  assert.equal(result.handlingFee,5);
  const pickup=quoteFulfilment({store:localfresh,subtotal:500,items,mode:'pickup'});
  assert.equal(pickup.deliveryFee,0);
  const pickupPass=applyKiranaPROPass(pickup,true);
  assert.equal(pickupPass.deliveryFee,0);
  assert.equal(pickupPass.handlingFee,5);
  assert.equal(pickupPass.total,pickup.total+KIRANAPRO_PASS_PREVIEW_FEE);
});

test('Without Pass selected, checkout fees remain unchanged',()=>{
  const quote=quoteFulfilment({store:localfresh,subtotal:250,items,mode:'standard'});
  const withoutPass=applyKiranaPROPass(quote,false);
  assert.equal(withoutPass.deliveryFee,quote.deliveryFee);
  assert.equal(withoutPass.handlingFee,quote.handlingFee);
  assert.equal(withoutPass.passFee,0);
  assert.equal(withoutPass.total,quote.total);
});

test('Cart display and order preview both use the same delivery-only Pass calculation',()=>{
  const cart=readFileSync(new URL('../src/pages/CartPage.jsx',import.meta.url),'utf8');
  assert.match(cart,/applyKiranaPROPass\(currentQuote,parivaarPassActive\)/);
  assert.match(cart,/applyKiranaPROPass\(finalQuote,parivaarPassActive\)/);
  assert.match(cart,/Handling and estimated GST still apply/);
  assert.match(cart,/₹\{handlingFee\}/);
  assert.doesNotMatch(cart,/parivaarPassActive\s*\?\s*0\s*:\s*finalQuote\.handlingFee/);
  assert.doesNotMatch(cart,/Save on delivery &amp; packing/);
});
