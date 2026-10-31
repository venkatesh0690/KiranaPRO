// StoreContext supplies {category: Product[]}, while search components
// also support callers that pass Product[] directly. Never assume .slice()
// or .filter() exists on the raw catalog during application startup.
export function toCatalogSearchItems(catalog) {
  const lists = Array.isArray(catalog)
    ? [catalog]
    : catalog && typeof catalog === 'object'
      ? Object.values(catalog).filter(Array.isArray)
      : [];
  return lists.flatMap(items=>items.filter(item=>item && typeof item==='object'
    && typeof item.name==='string' && item.name.trim().length>0));
}
