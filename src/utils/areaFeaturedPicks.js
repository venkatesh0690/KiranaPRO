import { getStoresForArea } from '../data/deliveryAreas.js';

// Catalog-based picks from shops serving this delivery area.
// They are NOT verified real-time trending rankings or live order volumes.
export function getAreaFeaturedPicks(stores, productsByCategory, area, limit = 9) {
  const nearby = getStoresForArea(stores,area)
    .filter(store => !store.isSample && store.isOpen !== false);

  if (!nearby.length || !productsByCategory || limit <= 0) return [];

  const candidateProducts = [];
  const seenProducts = new Set();

  for (const store of nearby) {
    for (const category of store.categories || []) {
      for (const product of productsByCategory[category] || []) {
        if (!product?.id || product.inStock === false || !(Number(product.price) > 0)) continue;
        const id = String(product.id);
        if (seenProducts.has(id)) continue;
        seenProducts.add(id);
        candidateProducts.push({
          id, product, category, storeId:store.id, storeName:store.name,
          rating:Number(product.rating)||0,
          reviews:Math.max(0,Number(product.reviewsCount)||0)
        });
      }
    }
  }

  // Prefer reviewed products, spread across categories to avoid a repetitive
  // strip of identical groceries. Existing reviews are catalog metadata only.
  candidateProducts.sort((a,b) =>
    b.reviews-a.reviews || b.rating-a.rating || a.product.name.localeCompare(b.product.name)
  );

  const picked = [];
  const categoryTotals = new Map();
  for (const item of candidateProducts) {
    if ((categoryTotals.get(item.category)||0) >= 2) continue;
    picked.push(item);
    categoryTotals.set(item.category,(categoryTotals.get(item.category)||0)+1);
    if (picked.length >= limit) break;
  }
  if (picked.length < limit) {
    const selectedIds = new Set(picked.map(item=>item.id));
    for (const item of candidateProducts) {
      if (selectedIds.has(item.id)) continue;
      picked.push(item);
      if (picked.length >= limit) break;
    }
  }
  return picked;
}
