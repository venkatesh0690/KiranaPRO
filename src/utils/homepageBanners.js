import {
  FEATURED_CHECKOUT_OFFERS, VALID_COUPONS, MIN_PROMO_SUBTOTAL,
  isCouponForOrder, nextOrderNumber
} from '../data/checkoutOffers.js';
import { getStoresForArea, isLocalFreshStore } from '../data/deliveryAreas.js';

/**
 * Landing-page banner rail: offers ONLY.
 * Store-specific previews, catalog picks and names belong in the
 * store discovery section, not in the promotional banner rail.
 *
 * All terms come from the same discount configuration used by checkout.
 * Images are chosen by the editorial photo resolver at render time.
 */
export function buildHomepageBanners(stores, _catalog, area, orderCount=0) {
  const available = getStoresForArea(stores,area)
    .filter(store=>!store.isSample && store.isOpen!==false);
  if(!available.length)return [];

  const participatingDeliveryStores=available.filter(store=>!isLocalFreshStore(store));
  const slides=[];

  // Free delivery is not advertised if the area has only LocalFresh.
  if(participatingDeliveryStores.length){
    slides.push({
      ...FEATURED_CHECKOUT_OFFERS[0],kind:'global',
      id:'offer-free-delivery',tag:'FREE DELIVERY · SELECTED STORES',
      title:'Free delivery above ₹300',
      subtitle:'₹0 delivery on carts above ₹300 at participating neighborhood stores.',
      store:participatingDeliveryStores[0],
      cta:'Explore eligible stores',minCart:MIN_PROMO_SUBTOTAL
    });
  }

  const basket=FEATURED_CHECKOUT_OFFERS.find(offer=>offer.kind==='automatic');
  if(basket)slides.push({
    ...basket,id:'offer-basket-savings',
    title:'Save up to ₹30',tag:'AUTOMATIC BASKET REWARD',
    subtitle:'5% off, capped at ₹30, automatically on carts above ₹500.',
    cta:'Shop & save',minCart:501
  });

  for(const offer of FEATURED_CHECKOUT_OFFERS.filter(item=>item.code)){
    const rule=VALID_COUPONS[offer.code];
    if(!rule)continue;
    const eligible=isCouponForOrder(offer.code,nextOrderNumber(orderCount));
    const description=rule.desc;
    slides.push({
      ...offer,id:`offer-${offer.code.toLowerCase()}`,kind:'coupon',
      title:offer.title,
      tag:eligible?'COUPON REWARD':'UPCOMING ORDER REWARD',
      subtitle:eligible
        ? description
        : `${description} · Available only on your eligible order, not order #${nextOrderNumber(orderCount)}.`,
      rewardEligible:eligible,
      cta:eligible?'Shop & redeem':'See reward details',
      minCart:rule.min
    });
  }
  return slides;
}
