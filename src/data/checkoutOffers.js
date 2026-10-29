import { FREE_DELIVERY_THRESHOLD } from './deliveryAreas.js';

// Single source of truth for checkout and homepage offers.
// Do not present store marketing copy as a discount unless checkout implements it.
export const VALID_COUPONS = Object.freeze({
  TASTY12: { type:'flat', value:30, min:99, desc:'Flat ₹30 off on orders ₹99+' },
  KIRANA50: { type:'flat', value:50, min:199, desc:'Flat ₹50 off on orders ₹199+' },
  WELCOME: { type:'percent', percent:15, max:60, min:120, desc:'15% off up to ₹60 on orders ₹120+' },
  FREEDEL: { type:'freedel', min:0, desc:'Free delivery on current order' }
});

export const FEATURED_CHECKOUT_OFFERS = Object.freeze([
  { id:'free-delivery', kicker:'DELIVERY SAVINGS', title:'Delivery on us', highlight:'₹0 delivery', subtitle:`On baskets above ₹${FREE_DELIVERY_THRESHOLD}`, code:null, icon:'🛵', tone:'leaf' },
  { id:'tasty12', kicker:'EVERYDAY SAVINGS', title:'₹30 off', highlight:'Save ₹30', subtitle:`Use TASTY12 on orders ₹${VALID_COUPONS.TASTY12.min}+`, code:'TASTY12', icon:'🛍️', tone:'peach' },
  { id:'kirana50', kicker:'MORE IN YOUR BASKET', title:'₹50 off', highlight:'Save ₹50', subtitle:`Use KIRANA50 on orders ₹${VALID_COUPONS.KIRANA50.min}+`, code:'KIRANA50', icon:'🥬', tone:'blue' },
  { id:'welcome', kicker:'EXTRA SAVINGS', title:'15% off', highlight:'Up to ₹60', subtitle:`Use WELCOME on orders ₹${VALID_COUPONS.WELCOME.min}+`, code:'WELCOME', icon:'🍎', tone:'cream' }
]);
