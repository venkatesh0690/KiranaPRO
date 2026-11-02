import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {FULFILMENT_MODES} from '../src/utils/fulfilment.js';

const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');

test('Store pickup is the only checkout option advertising 5% KiranaCoins',()=>{
  const source=read('src/components/FulfilmentPicker.jsx');
  assert.match(source,/mode\.id==='pickup' && \([\s\S]*?kp-pickup-coins-offer[\s\S]*?Earn 5% KiranaCoins · Store pickup only/);
  assert.match(source,/value\.mode==='pickup' && \([\s\S]*?kp-pickup-coins-detail[\s\S]*?Earn 5% KiranaCoins on Store pickup orders only/);
  assert.match(source,/Coin crediting is not yet available in this demo/);
  assert.equal(FULFILMENT_MODES.find(mode=>mode.id==='pickup')?.title,'Store pickup');
  assert.equal(FULFILMENT_MODES.filter(mode=>mode.id!=='pickup').length,2);
});

test('cart summary shows pickup-only benefit; membership does not advertise coins for COD delivery',()=>{
  const source=read('src/pages/CartPage.jsx');
  assert.match(source,/\{isPickup && \([\s\S]*?kp-checkout-pickup-coins[\s\S]*?5% KiranaCoins benefit · Store pickup only/);
  assert.doesNotMatch(source,/Earn 5% KiranaCoins \(Pay via COD\)/);
  assert.match(source,/20 days validity · Save on delivery/);
  assert.match(source,/Coins are not credited automatically in the demo/);
});

test('existing schedule and pickup controls remain unchanged',()=>{
  const picker=read('src/components/FulfilmentPicker.jsx');
  assert.match(picker,/getFulfilmentDates\(now\)/);
  assert.match(picker,/getFulfilmentSlots\(value\.mode,value\.date,now\)/);
  assert.match(picker,/onClick=\{\(\)=>onChange\(\{\.\.\.value,slot:slot\.value\}\)\}/);
  assert.match(picker,/requested times for a demo order, not confirmed bookings/i);
});
