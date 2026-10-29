import { getCatalogVisual } from './catalogVisual';
/* Store-specific items, selected only from categories this store sells.
   Purchase history is used only if present; no artificial order-count data. */
export function getDisplayProducts(store, catalog, limit = 5) {
  if (!store || !catalog) return [];
  const seen = new Set();
  const result = [];
  const candidates = (store.categories || []).map(category =>
    (catalog[category] || []).filter(p => p && p.inStock !== false)
  );
  // Round robin: variety across categories rather than the first category only.
  const maxLength = Math.max(0,...candidates.map(items => items.length));
  for (let index = 0; index < maxLength && result.length < limit; index++) {
    for (const items of candidates) {
      const p = items[index];
      if (!p || seen.has(String(p.id))) continue;
      seen.add(String(p.id));
      result.push(p);
      if (result.length >= limit) break;
    }
  }
  return result;
}
export function getOrderHighlights(store, catalog, orders, limit = 3) {
  const candidates = getDisplayProducts(store,catalog,1000);
  const counts = new Map();
  (Array.isArray(orders) ? orders : []).filter(o => String(o.storeId) === String(store.id))
    .forEach(o => (o.items || []).forEach(item => {
      const id=String(item.id);
      counts.set(id,(counts.get(id)||0)+Math.max(0,Number(item.qty ?? item.quantity ?? 1)));
    }));
  const purchased = candidates.filter(p => counts.has(String(p.id)))
    .sort((a,b) => (counts.get(String(b.id))||0)-(counts.get(String(a.id))||0));
  if (purchased.length) return {label:'Most ordered',items:purchased.slice(0,limit),basedOnOrders:true};
  const popular = candidates
    .sort((a,b)=>Number(b.reviewsCount||0)-Number(a.reviewsCount||0)||Number(b.rating||0)-Number(a.rating||0));
  return {label:'Popular picks',items:popular.slice(0,limit),basedOnOrders:false};
}
export function getProductImage(product) {
  return getCatalogVisual(product).photo;
}
