/**
 * Suggested cart add-ons must come from the SAME store catalog that is shown
 * on the chosen store's product page, never a fabricated cross-store list.
 * Neighborhood demo stores share a category catalog; LocalFresh is restricted
 * to its own lf- product IDs, while registered seller products carry storeId.
 */
export function getStoreUnder100AddOns(store, byCategory, cartItems=[], limit=20) {
  if(!store || !Array.isArray(store.categories) || !byCategory) return [];
  const storeId=String(store.id??'').toLowerCase();
  const isLocalFresh=storeId==='localfresh' || Boolean(store.isAdminManaged);
  const alreadyInCart=new Set(cartItems.map(item=>String(item?.id)));
  const seen=new Set();
  const eligible=[];
  for(const category of store.categories){
    const categoryProducts=byCategory[category];
    if(!Array.isArray(categoryProducts))continue;
    for(const product of categoryProducts){
      if(!product || product.id===null || product.id===undefined)continue;
      const id=String(product.id);
      if(alreadyInCart.has(id) || seen.has(id))continue;
      const price=Number(product.price);
      if(!Number.isFinite(price) || price<=0 || price>=100 || product.inStock===false ||
         product.stock_count===0)continue;
      const ownedBy=String(product.storeId??product.store_id??'').toLowerCase();
      if(ownedBy && ownedBy!==storeId)continue;
      const localFreshId=id.toLowerCase().startsWith('lf-');
      // A Kirana store may display category-level demo products, but must never
      // silently recommend LocalFresh stock (or another seller's stock).
      if(isLocalFresh ? !localFreshId && ownedBy!=='localfresh' : localFreshId)continue;
      seen.add(id);
      eligible.push({...product,category});
    }
  }
  return eligible.sort((a,b)=>Number(a.price)-Number(b.price)).slice(0,Math.max(0,limit));
}
