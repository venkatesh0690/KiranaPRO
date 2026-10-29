/**
 * Explicit delivery service areas.
 * Customers may select only one of these five predefined Vizag zones.
 * Do not infer coverage from a free-form address.
 */
export const DELIVERY_AREAS = Object.freeze([
  'NAD Kotha Road',
  'Dabagardens',
  'Siripuram',
  'MVP Colony',
  'Gajuwaka'
]);

import { calculateLocalFreshDeliveryFee } from '../utils/localfreshDelivery.js';
export const FREE_DELIVERY_THRESHOLD = 300;
export function isLocalFreshStore(store) {
  return String(store?.id ?? '').toLowerCase() === 'localfresh';
}
export function qualifiesForFreeDelivery(store, itemSubtotal) {
  return !isLocalFreshStore(store) && Number(itemSubtotal) > FREE_DELIVERY_THRESHOLD;
}

export function isDeliveryArea(area) {
  return DELIVERY_AREAS.includes(area);
}

export function isStoreAvailableInArea(store, area) {
  if (!isDeliveryArea(area) || !store) return false;
  if (isLocalFreshStore(store)) return true;
  return Array.isArray(store.serviceAreas) && store.serviceAreas.includes(area);
}

export function getStoresForArea(stores, area) {
  if (!Array.isArray(stores) || !isDeliveryArea(area)) return [];
  return stores.filter(store => isStoreAvailableInArea(store, area));
}

export function getDeliveryFee(store, itemSubtotal, coupon, cartItems=[]) {
  if (isLocalFreshStore(store)) return calculateLocalFreshDeliveryFee(cartItems);
  if (qualifiesForFreeDelivery(store, itemSubtotal)) return 0;
  return Math.max(0, Number(store?.deliveryFee) || 0);
}
