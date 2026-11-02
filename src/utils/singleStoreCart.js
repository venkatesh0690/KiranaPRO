import { sanitizeInput } from './security.js';

// Only one seller may own a cart at a time, including LocalFresh.
// Keep this logic separate from React so the same invariant is testable.
export const MAX_QTY_PER_ITEM = 20;
export const EMPTY_CART = { storeId: null, items: [] };
export const normalizeStoreId = value =>
  value === null || value === undefined ? '' : String(value).trim().toLowerCase();

export function canAddFromStore(cart, storeId) {
  const incoming = normalizeStoreId(storeId);
  if (!incoming) return false;
  if (!cart?.items?.length) return true;
  return normalizeStoreId(cart.storeId) === incoming
    && cart.items.every(item => normalizeStoreId(item.storeId) === incoming);
}

export function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const {storeId, item} = action.payload || {};
      if (!item || item.id === null || item.id === undefined ||
          !canAddFromStore(state,storeId)) return state;
      const incoming = normalizeStoreId(storeId);
      const safePrice = Math.max(0, Number(item.price) || 0);
      const safeMrp = Math.max(safePrice, Number(item.mrp) || safePrice);
      const existing = state.items.find(row => String(row.id) === String(item.id));
      if (existing) {
        const quantity=Math.min(MAX_QTY_PER_ITEM,existing.quantity+1);
        if(quantity===existing.quantity)return state;
        return {...state,items:state.items.map(row=>
          String(row.id)===String(item.id) ? {...row,quantity} : row
        )};
      }
      return {
        storeId:state.items.length>0?state.storeId:incoming,
        items:[...state.items,{
          ...item,
          name:sanitizeInput(item.name || 'Grocery Item'),
          price:safePrice,
          mrp:safeMrp,
          isSecurityVerified:true,
          storeId:incoming,
          quantity:1
        }]
      };
    }
    case 'REMOVE_ITEM': {
      const id=action.payload?.id;
      const existing=state.items.find(row=>String(row.id)===String(id));
      if(!existing)return state;
      if(existing.quantity>1)return {...state,items:state.items.map(row=>
        String(row.id)===String(id)?{...row,quantity:row.quantity-1}:row
      )};
      const items=state.items.filter(row=>String(row.id)!==String(id));
      return {...state,items,storeId:items.length?state.storeId:null};
    }
    case 'CLEAR_CART':
      return EMPTY_CART;
    default:
      // Deliberately no SWITCH_STORE_ITEMS or multi-store case.
      return state;
  }
}
