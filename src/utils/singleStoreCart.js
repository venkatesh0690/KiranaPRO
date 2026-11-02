// One order, one merchant. Compare canonical IDs rather than product IDs,
// because multiple stores can sell the same SKU or use overlapping numeric IDs.
export function normalizeStoreId(storeId) {
  return typeof storeId === 'string' || typeof storeId === 'number'
    ? String(storeId).trim().toLowerCase()
    : '';
}

// Returning true means the addition MUST be rejected, without changing the
// existing cart. LocalFresh is a store, not a multi-store checkout exception.
export function hasStoreConflict(cart, incomingStoreId) {
  const incoming = normalizeStoreId(incomingStoreId);
  if (!incoming) return true;
  const items = Array.isArray(cart?.items) ? cart.items : [];
  if (!items.length) return false;
  const owner = normalizeStoreId(cart?.storeId) || normalizeStoreId(items[0]?.storeId);
  if (!owner || owner !== incoming) return true;
  return items.some(item => normalizeStoreId(item.storeId) &&
    normalizeStoreId(item.storeId) !== owner);
}
