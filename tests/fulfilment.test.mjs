import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getFulfilmentDates, getFulfilmentSlots, validateFulfilment,
  quoteFulfilment, formatSlotClock, getSlotTimestamp
} from '../src/utils/fulfilment.js';

const now=new Date('2026-10-29T07:00:00Z'); // 12:30 PM IST
const date='2026-10-29';
const tomorrow='2026-10-30';
const store={deliveryFee:20,name:'LocalFresh'};

test('dates use Indian timezone and include seven calendar dates',()=>{
  const days=getFulfilmentDates(now);
  assert.equal(days.length,7);
  assert.equal(days[0].value,date);
  assert.equal(days[0].label,'Today');
  assert.equal(days[1].value,tomorrow);
  assert.equal(days[1].label,'Tomorrow');
});
test('two-hour scheduled windows include 2–4 PM and 3–5 PM',()=>{
  const values=getFulfilmentSlots('scheduled',date,now);
  assert.ok(values.some(s=>s.startMinutes===14*60 && s.label==='2:00 PM – 4:00 PM'));
  assert.ok(values.some(s=>s.startMinutes===15*60 && s.label==='3:00 PM – 5:00 PM'));
  assert.ok(values.every(s=>s.startMinutes>=14*60)); // requires >=60 minute notice
  assert.equal(getSlotTimestamp(date,14*60),Date.parse('2026-10-29T08:30:00Z'));
});
test('pickup requests are exact 30-minute time choices',()=>{
  const slots=getFulfilmentSlots('pickup',date,now);
  assert.ok(slots.some(s=>s.label==='2:00 PM' && s.value==='840'));
  assert.ok(slots.some(s=>s.label==='2:30 PM'));
  assert.equal(formatSlotClock(20*60),'8:00 PM');
  assert.equal(validateFulfilment({mode:'pickup',date,slot:'840'},now).valid,true);
});
test('rejects missing, expired, out-of-range and malformed dates',()=>{
  assert.equal(validateFulfilment({mode:'pickup',date,slot:''},now).valid,false);
  assert.equal(validateFulfilment({mode:'scheduled',date,slot:'660'},now).valid,false);
  assert.equal(validateFulfilment({mode:'pickup',date:'2026-10-28',slot:'840'},now).valid,false);
  assert.equal(validateFulfilment({mode:'pickup',date:'2027-01-01',slot:'840'},now).valid,false);
  assert.equal(validateFulfilment({mode:'scheduled',date:'bad',slot:'840'},now).valid,false);
  assert.equal(validateFulfilment({mode:'standard',date:'',slot:''},now).valid,true);
});
test('pickup is always ₹0 delivery even with subtotal below ₹300',()=>{
  for(const subtotal of [99,299,300,301,900]){
    const q=quoteFulfilment({store,subtotal,mode:'pickup'});
    assert.equal(q.deliveryFee,0);
    assert.equal(q.handlingFee,5);
    assert.equal(q.tax,Math.round(subtotal*0.05));
    assert.equal(q.total,subtotal+q.handlingFee+q.tax);
  }
});
test('standard and scheduled delivery follow same threshold',()=>{
  for(const mode of ['standard','scheduled']){
    assert.equal(quoteFulfilment({store,subtotal:100,mode}).deliveryFee,20);
    assert.equal(quoteFulfilment({store,subtotal:300,mode}).deliveryFee,20);
    assert.equal(quoteFulfilment({store,subtotal:301,mode}).deliveryFee,0);
  }
});
test('pickup total has only item subtotal, handling and estimated GST minus discounts',()=>{
  const result=quoteFulfilment({store,subtotal:600,discount:30,mode:'pickup'});
  assert.deepEqual(result,{subtotal:600,discount:30,deliveryFee:0,handlingFee:5,tax:29,total:604});
});
