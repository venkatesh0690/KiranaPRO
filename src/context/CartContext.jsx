import React, { createContext, useCallback, useContext, useEffect, useReducer, useRef, useState } from 'react';
import { sanitizeInput } from '../utils/security';
import { useStore } from './StoreContext';
import { hasStoreConflict, normalizeStoreId } from '../utils/singleStoreCart';
import '../styles/single-store-cart.css';

const CartContext = createContext(null);
const MAX_QTY_PER_ITEM = 20;
const EMPTY_CART = {storeId:null, items:[]};

// Keep the invariant in the reducer too: no caller can bypass the same-store
// rule by dispatching an ADD_ITEM action directly.
export const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { storeId, item } = action.payload;
      if (!item || !item.id || hasStoreConflict(state,storeId)) return state;
      const normalizedStore=normalizeStoreId(storeId);
      const safePrice=Math.max(0,Number(item.price)||0);
      const safeMrp=Math.max(safePrice,Number(item.mrp)||safePrice);
      const sanitizedItem={
        ...item,
        name:sanitizeInput(item.name||'Grocery Item'),
        price:safePrice,
        mrp:safeMrp,
        isSecurityVerified:true
      };

      const existing=state.items.find(i=>String(i.id)===String(item.id));
      const activeStore=state.items.length ? state.storeId : storeId;
      if(existing){
        const newQty=Math.min(MAX_QTY_PER_ITEM,existing.quantity+1);
        return {...state,storeId:activeStore,items:state.items.map(i=>
          String(i.id)===String(item.id)?{...i,quantity:newQty}:i)};
      }
      return {
        storeId:activeStore,
        items:[...state.items,{...sanitizedItem,storeId:normalizedStore,quantity:1}]
      };
    }
    case 'REMOVE_ITEM': {
      const existing=state.items.find(i=>String(i.id)===String(action.payload.id));
      if(existing && existing.quantity>1){
        return {...state,items:state.items.map(i=>String(i.id)===String(action.payload.id)
          ? {...i,quantity:i.quantity-1}:i)};
      }
      const items=state.items.filter(i=>String(i.id)!==String(action.payload.id));
      return {...state,items,storeId:items.length?state.storeId:null};
    }
    case 'CLEAR_CART':
      return EMPTY_CART;
    default:
      return state;
  }
};

export const CartProvider=({children})=>{
  const [cart,dispatch]=useReducer(cartReducer,EMPTY_CART);
  // The ref reflects additions immediately, including multiple addItem calls
  // within the same event before React has rendered the new cart state.
  const cartRef=useRef(cart);
  useEffect(()=>{cartRef.current=cart;},[cart]);

  const {stores}=useStore();
  const [blockedStore,setBlockedStore]=useState(null);
  const dismissButton=useRef(null);

  const addItem=useCallback((storeId,item)=>{
    if(!item?.id || !normalizeStoreId(storeId))return false;
    const current=cartRef.current;
    if(hasStoreConflict(current,storeId)){
      setBlockedStore({existing:current.storeId || current.items[0]?.storeId,
        incoming:storeId});
      return false;
    }
    const action={type:'ADD_ITEM',payload:{storeId,item}};
    cartRef.current=cartReducer(current,action);
    dispatch(action);
    return true;
  },[]);

  const removeItem=useCallback(id=>{
    const action={type:'REMOVE_ITEM',payload:{id}};
    cartRef.current=cartReducer(cartRef.current,action);
    dispatch(action);
  },[]);
  const clearCart=useCallback(()=>{
    cartRef.current=EMPTY_CART;
    setBlockedStore(null);
    dispatch({type:'CLEAR_CART'});
  },[]);

  useEffect(()=>{
    if(!blockedStore)return undefined;
    dismissButton.current?.focus();
    const close=event=>{
      if(event.key==='Escape')setBlockedStore(null);
    };
    window.addEventListener('keydown',close);
    return ()=>window.removeEventListener('keydown',close);
  },[blockedStore]);

  const storeName=id=>stores.find(s=>normalizeStoreId(s.id)===normalizeStoreId(id))?.name||
    'another store';
  const totalItems=cart.items.reduce((sum,i)=>sum+i.quantity,0);
  const totalPrice=cart.items.reduce((sum,i)=>sum+i.price*i.quantity,0);

  return (
    <CartContext.Provider value={{cart,addItem,removeItem,clearCart,totalItems,totalPrice}}>
      {children}
      {blockedStore && (
        <div className="kp-store-cart-backdrop" role="presentation"
          onMouseDown={event=>{
            if(event.target===event.currentTarget)setBlockedStore(null);
          }}>
          <section role="alertdialog" aria-modal="true"
            aria-labelledby="kp-store-cart-title"
            aria-describedby="kp-store-cart-desc"
            className="kp-store-cart-dialog">
            <div className="kp-store-cart-symbol" aria-hidden="true">🛒</div>
            <h2 id="kp-store-cart-title">One store per cart</h2>
            <p id="kp-store-cart-desc">
              Items from the same store should be added to the cart.
              Your cart already has items from <strong>{storeName(blockedStore.existing)}</strong>.
              To shop from <strong>{storeName(blockedStore.incoming)}</strong>,
              complete your current order or clear the cart first.
            </p>
            <p className="kp-store-cart-note">Your existing cart has not been changed.</p>
            <button ref={dismissButton} type="button" className="kp-store-cart-dismiss"
              onClick={()=>setBlockedStore(null)}>
              Got it
            </button>
          </section>
        </div>
      )}
    </CartContext.Provider>
  );
};

export const useCart=()=>useContext(CartContext);
