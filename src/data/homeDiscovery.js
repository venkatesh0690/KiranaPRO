/**
 * Homepage editorial product category photography. These are small, real
 * Unsplash representative category photos, not exact product/SKU photography.
 */
const image=id=>`https://unsplash.com/photos/${id}/download?force=true&w=480&h=300&q=55&fm=webp`;
export const FEATURED_CATEGORY_IMAGES=Object.freeze({
  'Cleaning & Pooja':image('x8O6wBxAbDk'),
  'Household Staples':image('PDBnKupmi7E'),
  'Personal Care':image('Ye9W3IVL87M'),
  'Snacks & Munchies':image('ONQ86GlHs3c')
});
const PRIORITY=Object.keys(FEATURED_CATEGORY_IMAGES);
export const QUICK_CATEGORY_ORDER=Object.freeze([
  'Cleaning & Pooja','Household Staples','Personal Care','Snacks & Munchies',
  'Dairy & Breakfast','Vegetables','Fruits','Groceries','Flowers',
  'Pulses & Grains','Cold Drinks & Juices'
]);
export function getQuickCategories(areaStores=[],allCategories=[]) {
  const areaCats=new Set(areaStores.flatMap(store=>store.categories||[]));
  const byName=new Map(allCategories.map(category=>[category.name,category]));
  return [...new Set([...QUICK_CATEGORY_ORDER,...allCategories.map(category=>category.name)])]
    .filter(name=>areaCats.has(name) && byName.has(name))
    .slice(0,8).map(name=>byName.get(name));
}
export function getFeaturedCategories(areaStores=[],catalog={}) {
  const names=new Set(areaStores.flatMap(store=>store.categories||[]));
  return PRIORITY.filter(name=>names.has(name)).map(name=>({
    id:name,name,image:FEATURED_CATEGORY_IMAGES[name],
    count:(catalog?.[name]||[]).filter(item=>item.inStock!==false).length,
    isSampleOnly:!areaStores.some(store=>store.categories?.includes(name)&&!store.isSample)
  }));
}
