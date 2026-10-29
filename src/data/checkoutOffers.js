import { FREE_DELIVERY_THRESHOLD } from './deliveryAreas.js';

// Promotions are only valid above ₹300, matching the marketplace minimum.
// Rules are consumed by both checkout and the top-of-homepage banner carousel.
export const MIN_PROMO_SUBTOTAL = FREE_DELIVERY_THRESHOLD + 1;

export const VALID_COUPONS = Object.freeze({
  TASTY12: { type:'flat', value:30, min:MIN_PROMO_SUBTOTAL, desc:'₹30 off on carts above ₹300' },
  KIRANA50: { type:'flat', value:50, min:MIN_PROMO_SUBTOTAL, desc:'₹50 off on carts above ₹300' },
  WELCOME: { type:'percent', percent:15, max:60, min:MIN_PROMO_SUBTOTAL, desc:'15% off up to ₹60 on carts above ₹300' }
});

export const FEATURED_CHECKOUT_OFFERS = Object.freeze([
  { id:'free-delivery', kicker:'DELIVERY SAVINGS', title:'Delivery on us',
    highlight:'₹0 delivery', subtitle:'On carts above ₹300 · All stores', code:null, icon:'🛵', tone:'sage' },
  { id:'tasty12', kicker:'KIRANAPRO OFFER', title:'₹30 off your basket',
    highlight:'Save ₹30', subtitle:'TASTY12 · Cart above ₹300', code:'TASTY12', icon:'🛍️', tone:'sand' },
  { id:'kirana50', kicker:'KIRANAPRO OFFER', title:'₹50 off your basket',
    highlight:'Save ₹50', subtitle:'KIRANA50 · Cart above ₹300', code:'KIRANA50', icon:'🥬', tone:'lilac' },
  { id:'welcome', kicker:'KIRANAPRO OFFER', title:'Extra 15% off',
    highlight:'Up to ₹60', subtitle:'WELCOME · Cart above ₹300', code:'WELCOME', icon:'🍎', tone:'sage' }
]);
