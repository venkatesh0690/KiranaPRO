import { FEATURED_CHECKOUT_OFFERS, VALID_COUPONS, MIN_PROMO_SUBTOTAL, isCouponForOrder, nextOrderNumber } from '../data/checkoutOffers.js';
import { getStoresForArea, isLocalFreshStore } from '../data/deliveryAreas.js';
import { getAreaFeaturedPicks } from './areaFeaturedPicks.js';
import { getDisplayProducts } from './storeMerchandising.js';

// Single first-position banner rail for all valid checkout offers, store
// promotions and area catalog picks. Never list unonboarded sample merchants.
export function buildHomepageBanners(stores, catalog, area, orderCount=0) {
  const available = getStoresForArea(stores,area)
    .filter(store => !store.isSample && store.isOpen !== false);
  if (!available.length) return [];

  const localFresh = available.find(isLocalFreshStore);
  const otherStores = available.filter(store => store !== localFresh);
  const slides = [];
  const storeSlide = (store, category, key, headline, tag) => {
    const items = category
      ? (catalog?.[category] || []).filter(p => p.inStock !== false && Number(p.price) > 0).slice(0,3)
      : getDisplayProducts(store,catalog,3);
    return {
      id:`store-${store.id}-${key}`, kind:'store', store, category,
      title:headline || store.name, tag, tone:'sage',
      subtitle:isLocalFreshStore(store)
        ? `${store.name} · Delivery fee shown at checkout`
        : `${store.name} · Free delivery on carts above ₹300`,
      cta:'Explore store', items, minCart:isLocalFreshStore(store)?null:MIN_PROMO_SUBTOTAL
    };
  };

  if (localFresh) {
    slides.push(storeSlide(localFresh,'Vegetables','mandi','Fresh from the mandi','LOCALFRESH · STORE SPECIAL'));
  }

  // Checkout offers: no coupon applies or is advertised for a cart <= ₹300.
  if (otherStores.length) {
    slides.push({
      ...FEATURED_CHECKOUT_OFFERS[0], kind:'global',
      tag:'NEIGHBORHOOD STORES · FREE DELIVERY',
      items:getDisplayProducts(otherStores[0],catalog,3),
      store:otherStores[0],cta:'Shop now',minCart:MIN_PROMO_SUBTOTAL
    });
  }

  if (localFresh && Array.isArray(localFresh.categories)) {
    const next = localFresh.categories.includes('Fruits') ? 'Fruits'
      : localFresh.categories.includes('Flowers') ? 'Flowers' : localFresh.categories[1];
    if (next) slides.push(storeSlide(localFresh,next,'fresh',
      next === 'Fruits' ? 'Fresh fruit favourites' : 'Fresh picks for today',
      'LOCALFRESH · STORE SPECIAL'));
  }

  for (const store of otherStores.slice(0,4)) {
    slides.push(storeSlide(store,store.categories?.[0], 'offer',
      `${store.name} essentials`,`${store.name.toUpperCase()} · STORE OFFER`));
  }

  // Automatic basket discount is available above ₹500 on all stores.
  const automatic = FEATURED_CHECKOUT_OFFERS.find(offer=>offer.kind==='automatic');
  if(automatic) slides.push({
    ...automatic,
    items:localFresh ? getDisplayProducts(localFresh,catalog,3):getDisplayProducts(available[0],catalog,3),
    cta:'Shop & save',minCart:501
  });

  // Order milestones refer to the customer's NEXT order, never sample order data.
  for(const offer of FEATURED_CHECKOUT_OFFERS.filter(item=>item.code)) {
    const rule=VALID_COUPONS[offer.code];
    if(!rule)continue;
    const eligible=isCouponForOrder(offer.code,nextOrderNumber(orderCount));
    slides.push({
      ...offer,kind:'coupon',
      tag:eligible ? offer.kicker : 'ORDER MILESTONE · UPCOMING',
      rewardEligible:eligible,
      subtitle:eligible ? offer.subtitle : `${offer.subtitle} · Not eligible on order #${nextOrderNumber(orderCount)}`,
      cta:eligible?'Shop & redeem':'View the reward',
      minCart:rule.min,
      items:localFresh ? getDisplayProducts(localFresh,catalog,3):getDisplayProducts(available[0],catalog,3)
    });
  }

  const picks = getAreaFeaturedPicks(stores,catalog,area,6);
  for (let i=0;i<picks.length;i+=3) {
    const group=picks.slice(i,i+3);
    const first=group[0];
    if(!first) continue;
    slides.push({
      id:`area-picks-${i}`,kind:'picks',
      tag:'GROCERIES NEAR YOU',tone:i===0?'sage':'sand',
      title:i===0 ? `Popular picks in ${area}` : 'More grocery favourites',
      subtitle:'Suggested from available catalog · not verified sales trends',
      cta:'Explore product',
      items:group.map(p=>p.product),productTarget:first,
      minCart:null
    });
  }

  return slides;
}
