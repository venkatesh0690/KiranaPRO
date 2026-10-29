import { calculateLocalFreshDeliveryFee, getLineWeightKg, getCartWeightKg } from '../src/utils/localfreshDelivery.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getFulfilmentDates, getFulfilmentSlots, validateFulfilment,
  quoteFulfilment, formatSlotClock, getSlotTimestamp
} from '../src/utils/fulfilment.js';

const now=new Date('2026-10-29T07:00:00Z'); // 12:30 PM IST
const date='2026-10-29';
const tomorrow='2026-10-30';
const store={id:'localfresh',deliveryFee:20,name:'LocalFresh'};
const otherStore={id:2,deliveryFee:20,name:'Sri Lakshmi Provisions'};

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
    const q=quoteFulfilment({store,subtotal,mode:'pickup',items:[{id:'lf-1004',unit:'per kg',quantity:2}]});
    assert.equal(q.deliveryFee,0);
    assert.equal(q.handlingFee,5);
    assert.equal(q.tax,Math.round(subtotal*0.05));
    assert.equal(q.total,subtotal+q.handlingFee+q.tax);
  }
});
test('standard and scheduled delivery use calculated LocalFresh fee and preserve other stores',()=>{
  const items=[{id:'lf-1004',unit:'per kg',quantity:2}];
  for(const mode of ['standard','scheduled']){
    assert.equal(quoteFulfilment({store,subtotal:100,mode,items}).deliveryFee,10);
    assert.equal(quoteFulfilment({store,subtotal:300,mode,items}).deliveryFee,10);
    assert.equal(quoteFulfilment({store,subtotal:301,mode,items}).deliveryFee,10);
    assert.equal(quoteFulfilment({store,subtotal:900,mode,items}).deliveryFee,10);
    assert.equal(quoteFulfilment({store:otherStore,subtotal:100,mode,items}).deliveryFee,20);
    assert.equal(quoteFulfilment({store:otherStore,subtotal:301,mode,items}).deliveryFee,0);
  }
});
test('pickup total has only item subtotal, handling and estimated GST minus discounts',()=>{
  const result=quoteFulfilment({store,subtotal:600,discount:30,mode:'pickup'});
  assert.deepEqual(result,{subtotal:600,discount:30,deliveryFee:0,handlingFee:5,tax:29,total:604});
});

test('LocalFresh uses weights and cart quantities, with rupee paise precision',()=>{
  const items=[
    {id:'lf-1004',name:'Potols',unit:'per kg',quantity:2},
    {id:'lf-1005',name:'Baby Corn Pack 200gms',unit:'per piece',quantity:2},
    {id:'lf-1006',name:'Banana',unit:'per dozen',quantity:1}
  ];
  assert.equal(getLineWeightKg(items[0]),1);
  assert.equal(getLineWeightKg(items[1]),0.2);
  assert.equal(getLineWeightKg(items[2]),1.2);
  assert.equal(getCartWeightKg(items),3.6);
  assert.equal(calculateLocalFreshDeliveryFee(items),18);
  assert.equal(calculateLocalFreshDeliveryFee([{id:'lf-fl-06',unit:'250 g box',quantity:1}]),1.25);
});
test('no negative quantities or invalid cart weights are applied',()=>{
  const items=[{id:'lf-1004',unit:'per kg',quantity:-4},{id:'lf-1004',unit:'per kg',quantity:2}];
  assert.equal(calculateLocalFreshDeliveryFee(items),10);
  assert.equal(calculateLocalFreshDeliveryFee([]),0);
});

test('LocalFresh remains chargeable above ₹300 even with coupon discounts; pickup remains free',()=>{
  const items=[
    {id:'lf-1004',name:'Potols',unit:'per kg',quantity:3},
    {id:'lf-1005',name:'Baby Corn Pack 200gms',unit:'per piece',quantity:1}
  ];
  const standard=quoteFulfilment({store,subtotal:620,discount:30,items,mode:'standard'});
  const scheduled=quoteFulfilment({store,subtotal:620,discount:30,items,mode:'scheduled'});
  const pickup=quoteFulfilment({store,subtotal:620,discount:30,items,mode:'pickup'});
  assert.equal(standard.deliveryFee,16);
  assert.equal(scheduled.deliveryFee,16);
  assert.equal(pickup.deliveryFee,0);
  assert.equal(standard.total-pickup.total,16);
});
