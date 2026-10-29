import { FREE_DELIVERY_THRESHOLD } from './deliveryAreas.js';

// All discounts are exclusive: the automatic basket discount and account
// coupon cannot stack. The user can select one account coupon instead.
export const MIN_PROMO_SUBTOTAL = FREE_DELIVERY_THRESHOLD + 1;
export const BASKET_DISCOUNT_THRESHOLD = 500;

export const VALID_COUPONS = Object.freeze({
  WELCOME: Object.freeze({
    code:'WELCOME', type:'flat', value:30, min:MIN_PROMO_SUBTOTAL,
    label:'First-order reward', desc:'₹30 off your first order above ₹300'
  }),
  REPEAT: Object.freeze({
    code:'REPEAT', type:'flat', value:20, min:MIN_PROMO_SUBTOTAL,
    label:'Repeat shopper reward', desc:'₹20 off your 3rd, 5th or 7th order above ₹300'
  }),
  ADDICTED: Object.freeze({
    code:'ADDICTED', type:'flat', value:50, min:MIN_PROMO_SUBTOTAL,
    label:'10th-order reward', desc:'₹50 off your 10th order above ₹300'
  })
});

export function nextOrderNumber(previousOrders) {
  return Math.max(0,Math.floor(Number(previousOrders)||0))+1;
}

export function isCouponForOrder(code, orderNumber) {
  const number=Math.floor(Number(orderNumber));
  switch(String(code).toUpperCase()) {
    case 'WELCOME': return number===1;
    case 'REPEAT': return [3,5,7].includes(number);
    case 'ADDICTED': return number===10;
    default: return false;
  }
}

export function getAutomaticBasketDiscount(subtotal) {
  const sum=Number(subtotal);
  if(!Number.isFinite(sum) || sum<=BASKET_DISCOUNT_THRESHOLD) return 0;
  // "Up to ₹30": 5% of item subtotal, capped at ₹30.
  return Math.min(30,Math.round(sum*0.05));
}

export function evaluateCoupon(code,subtotal,orderNumber) {
  const normalized=String(code||'').trim().toUpperCase();
  const rule=VALID_COUPONS[normalized];
  if(!rule) return {eligible:false,discount:0,code:normalized,reason:'Invalid coupon. Choose WELCOME, REPEAT or ADDICTED.'};
  if(!Number.isFinite(Number(subtotal)) || Number(subtotal)<MIN_PROMO_SUBTOTAL) {
    return {eligible:false,discount:0,code:normalized,reason:'Coupon discounts require a cart value above ₹300.'};
  }
  if(!isCouponForOrder(normalized,orderNumber)) {
    return {eligible:false,discount:0,code:normalized,
      reason:normalized==='WELCOME' ? 'WELCOME is valid only on your first order.'
      :normalized==='REPEAT' ? 'REPEAT is valid only on your 3rd, 5th or 7th order.'
      :'ADDICTED is valid only on your 10th order.'};
  }
  return {eligible:true,discount:rule.value,code:normalized,reason:null};
}

export function getOrderSavings(subtotal,orderNumber,selectedCoupon=null) {
  const automatic=getAutomaticBasketDiscount(subtotal);
  if(!selectedCoupon) {
    return {discount:automatic,code:automatic>0?'BASKET30':null,eligible:true,
      isAutomatic:automatic>0,reason:null};
  }
  const quote=evaluateCoupon(selectedCoupon,subtotal,orderNumber);
  return quote.eligible ?
    {...quote,isAutomatic:false} :
    {...quote,isAutomatic:false}; // checkout suppresses invalid coupon savings
}

export const FEATURED_CHECKOUT_OFFERS = Object.freeze([
  {id:'free-delivery',kicker:'EVERY STORE',title:'Free delivery',highlight:'₹0 fee',
   subtitle:'On orders above ₹300',code:null,icon:'🛵',tone:'sage',kind:'global'},
  {id:'basket30',kicker:'BASKET BONUS',title:'Save up to ₹30',highlight:'5% up to ₹30',
   subtitle:'Automatic discount on carts above ₹500',code:null,icon:'🛍️',tone:'sand',kind:'automatic'},
  {id:'welcome',kicker:'FIRST ORDER ONLY',title:'₹30 welcome gift',highlight:'₹30 off',
   subtitle:'WELCOME · Only your 1st order · Cart above ₹300',code:'WELCOME',icon:'🎁',tone:'lilac',kind:'coupon'},
  {id:'repeat',kicker:'LOYALTY REWARD',title:'₹20 repeat reward',highlight:'₹20 off',
   subtitle:'REPEAT · Only your 3rd, 5th or 7th order · Cart above ₹300',code:'REPEAT',icon:'🛒',tone:'sage',kind:'coupon'},
  {id:'addicted',kicker:'MILESTONE REWARD',title:'₹50 tenth-order gift',highlight:'₹50 off',
   subtitle:'ADDICTED · Only your 10th order · Cart above ₹300',code:'ADDICTED',icon:'🎉',tone:'sand',kind:'coupon'}
]);
