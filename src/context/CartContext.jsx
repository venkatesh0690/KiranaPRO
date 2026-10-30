import React, { createContext, useContext, useReducer } from 'react';
import { sanitizeInput } from '../utils/security';

const CartContext = createContext(null);

const MAX_QTY_PER_ITEM = 20;

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { storeId, item } = action.payload;
      if (!item || !item.id) return state;

      // Sanitize item properties against injection or NaN prices
      const safePrice = Math.max(0, Number(item.price) || 0);
      const safeMrp = Math.max(safePrice, Number(item.mrp) || safePrice);
      const sanitizedItem = {
        ...item,
        name: sanitizeInput(item.name || 'Grocery Item'),
        price: safePrice,
        mrp: safeMrp,
        isSecurityVerified: true
      };

      // Allow combining LocalFresh (Mandi Hub) and a Neighborhood Kirana in one unified basket
      const currentStoreId = state.storeId ? String(state.storeId).toLowerCase() : null;
      const incomingStoreId = storeId ? String(storeId).toLowerCase() : 'localfresh';

      const isMultiStoreCompatible = !currentStoreId || currentStoreId === incomingStoreId ||
        currentStoreId === 'localfresh' || incomingStoreId === 'localfresh';

      if (!isMultiStoreCompatible) {
        return {
          storeId,
          items: [{ ...sanitizedItem, storeId: incomingStoreId, quantity: 1 }],
        };
      }

      // If we already have items, preserve the non-localfresh storeId or adopt the incoming storeId
      const activePrimaryStore = (currentStoreId && currentStoreId !== 'localfresh')
        ? state.storeId
        : (incomingStoreId !== 'localfresh' ? storeId : 'localfresh');

      const existing = state.items.find(i => String(i.id) === String(item.id));
      if (existing) {
        const newQty = Math.min(MAX_QTY_PER_ITEM, existing.quantity + 1);
        return {
          ...state,
          storeId: activePrimaryStore,
          items: state.items.map(i =>
            String(i.id) === String(item.id) ? { ...i, quantity: newQty } : i
          ),
        };
      }
      return {
        ...state,
        storeId: activePrimaryStore,
        items: [...state.items, { ...sanitizedItem, storeId: incomingStoreId, quantity: 1 }]
      };
    }
    case 'REMOVE_ITEM': {
      const existing = state.items.find(i => String(i.id) === String(action.payload.id));
      if (existing && existing.quantity > 1) {
        return {
          ...state,
          items: state.items.map(i =>
            String(i.id) === String(action.payload.id) ? { ...i, quantity: i.quantity - 1 } : i
          )
        };
      }
      const items = state.items.filter(i => String(i.id) !== String(action.payload.id));
      return { ...state, items, storeId: items.length === 0 ? null : state.storeId };
    }
    case 'SWITCH_STORE_ITEMS': {
      const { fromStoreId, toStoreId } = action.payload;
      return {
        ...state,
        storeId: toStoreId,
        items: state.items.map(it => {
          if (!it.storeId || String(it.storeId).toLowerCase() === String(fromStoreId).toLowerCase()) {
            return { ...it, storeId: toStoreId };
          }
          return it;
        })
      };
    }
    case 'CLEAR_CART':
      return { storeId: null, items: [] };
    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [cart, dispatch] = useReducer(cartReducer, { storeId: null, items: [] });

  const addItem = (storeId, item) => dispatch({ type: 'ADD_ITEM', payload: { storeId, item } });
  const removeItem = (id) => dispatch({ type: 'REMOVE_ITEM', payload: { id } });
  const switchStoreItems = (fromStoreId, toStoreId) =>
    dispatch({ type: 'SWITCH_STORE_ITEMS', payload: { fromStoreId, toStoreId } });
  const clearCart = () => dispatch({ type: 'CLEAR_CART' });

  const totalItems = cart.items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addItem, removeItem, switchStoreItems, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
