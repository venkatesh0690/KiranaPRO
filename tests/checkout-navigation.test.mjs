import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {FULFILMENT_MODES,validateFulfilment,getFulfilmentDates,getFulfilmentSlots} from '../src/utils/fulfilment.js';

const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const app=read('src/App.jsx');
const cart=read('src/pages/CartPage.jsx');
const cartBar=read('src/components/CartBar.jsx');

test('the existing order service screen is reachable through /checkout',()=>{
  assert.match(app,/path="\/checkout"[\s\S]*?<CartPage userLocation=\{userLocation\} checkoutMode="fulfilment"/);
  assert.match(app,/path="\/cart"[\s\S]*?<CartPage userLocation=\{userLocation\} checkoutMode="review"/);
  assert.match(cart,/navigate\('\/checkout', \{state:/);
  assert.match(cart,/checkoutMode === 'fulfilment'/);
  assert.match(cart,/<FulfilmentPicker/);
  assert.match(cart,/navigate\('\/cart', \{state:/);
});
test('cart review can open checkout even for sample listings but cannot place a sample order',()=>{
  assert.match(cart,/disabled=\{orderPlaced \|\| !storeServesArea \|\|\s*\(checkoutStep==='fulfilment' && \(Boolean\(store\?\.isSample\)/);
  assert.match(cart,/checkoutStep==='review' \? 'Continue to order service' :/);
  assert.match(cart,/store\?\.isSample \? 'Sample store — checkout unavailable'/);
  assert.match(cart,/placingRef\.current \|\| orderPlaced \|\| !storeServesArea \|\| store\?\.isSample/);
});
test('customer basket and checkout selections survive navigation',()=>{
  assert.match(cart,/checkoutPreferences:\{appliedCoupon,parivaarPassActive,isParentOrder,rainTip\}/);
  assert.match(cart,/useState\(checkoutPreferences\.appliedCoupon \|\| null\)/);
  assert.match(cart,/useState\(Boolean\(checkoutPreferences\.parivaarPassActive\)\)/);
  assert.match(cart,/useState\(Boolean\(checkoutPreferences\.isParentOrder\)\)/);
  assert.match(cart,/getOrderSavings\(totalPrice,nextOrderNumber,appliedCoupon\)/);
  assert.match(app,/<CartProvider>/);
});
test('order now and scheduled requests preserve the existing server validation',()=>{
  assert.equal(FULFILMENT_MODES.find(x=>x.id==='standard')?.title,'Order now');
  assert.equal(FULFILMENT_MODES.find(x=>x.id==='scheduled')?.title,'Schedule delivery');
  assert.equal(validateFulfilment({mode:'standard',date:'',slot:''}).valid,true);
  assert.equal(validateFulfilment({mode:'scheduled',date:'',slot:''}).valid,false);
  const day=getFulfilmentDates(new Date('2026-11-02T02:00:00Z'))[1].value;
  const slots=getFulfilmentSlots('scheduled',day,new Date('2026-11-02T02:00:00Z'));
  assert.ok(slots.length>0);
  assert.equal(validateFulfilment({mode:'scheduled',date:day,slot:slots[0].value},new Date('2026-11-02T02:00:00Z')).valid,true);
});
test('checkout CTA remains unobstructed by global cart bar and bottom navigation',()=>{
  assert.match(cartBar,/location\.pathname === '\/checkout'/);
  assert.match(app,/const isCheckoutRoute = location\.pathname === '\/checkout'/);
  assert.match(app,/!isCheckoutRoute && <BottomNav \/>/);
});

test('5% KiranaCoins promotion is explicitly limited to Store Pickup',()=>{
  const picker=read('src/components/FulfilmentPicker.jsx');
  const css=read('src/styles/fulfilment-checkout.css');
  const cartPage=read('src/pages/CartPage.jsx');
  assert.match(picker,/mode\.id==='pickup' && <span className="kp-pickup-coins-badge">/);
  assert.match(picker,/5% KiranaCoins · Pickup only/);
  assert.match(picker,/value\.mode==='pickup' && \([\s\S]*kp-pickup-coins-details/);
  assert.match(picker,/Earn 5% KiranaCoins — Store Pickup orders only/);
  assert.match(picker,/Order now and scheduled delivery do not qualify/);
  assert.match(picker,/This demo checkout does not automatically credit coins/);
  assert.match(css,/\.kp-pickup-coins-badge/);
  assert.match(css,/\.kp-pickup-coins-details/);
  assert.doesNotMatch(cartPage,/Earn 5% KiranaCoins \(Pay via COD\)/);
  assert.match(cartPage,/5% KiranaCoins applies only to Store Pickup orders/);
});
