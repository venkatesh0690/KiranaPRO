import React, {
  createContext, useCallback, useContext, useEffect, useReducer, useRef, useState
} from 'react';
import {
  EMPTY_CART, cartReducer, canAddFromStore
} from '../utils/singleStoreCart';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, dispatch] = useReducer(cartReducer, EMPTY_CART);
  const cartRef = useRef(cart);
  const [storeConflict,setStoreConflict] = useState(false);
  const dismissButtonRef=useRef(null);
  cartRef.current=cart;

  // Ref advances synchronously. This prevents rapid consecutive addItem calls
  // (e.g. recipe bundles) from mixing sellers before React's next render.
  const applyCartAction=useCallback(action=>{
    const next=cartReducer(cartRef.current,action);
    cartRef.current=next;
    dispatch(action);
    return next;
  },[]);

  const addItem=useCallback((storeId,item)=>{
    if(!item || item.id === undefined || item.id === null)return false;
    if(!canAddFromStore(cartRef.current,storeId)){
      setStoreConflict(true);
      return false;
    }
    applyCartAction({type:'ADD_ITEM',payload:{storeId,item}});
    return true;
  },[applyCartAction]);

  const removeItem=useCallback(id=>{
    applyCartAction({type:'REMOVE_ITEM',payload:{id}});
  },[applyCartAction]);

  const clearCart=useCallback(()=>{
    applyCartAction({type:'CLEAR_CART'});
    setStoreConflict(false);
  },[applyCartAction]);

  useEffect(()=>{
    if(!storeConflict)return undefined;
    dismissButtonRef.current?.focus();
    const handleEscape=event=>{
      if(event.key==='Escape')setStoreConflict(false);
    };
    window.addEventListener('keydown',handleEscape);
    return ()=>window.removeEventListener('keydown',handleEscape);
  },[storeConflict]);

  const totalItems=cart.items.reduce((sum,i)=>sum+i.quantity,0);
  const totalPrice=cart.items.reduce((sum,i)=>sum+i.price*i.quantity,0);

  return (
    <CartContext.Provider value={{
      cart,addItem,removeItem,clearCart,totalItems,totalPrice
    }}>
      {children}
      {storeConflict && (
        <div className="kp-store-cart-overlay"
          onMouseDown={event=>{
            if(event.target===event.currentTarget)setStoreConflict(false);
          }}>
          <section role="alertdialog" aria-modal="true"
            aria-labelledby="kp-store-cart-title"
            aria-describedby="kp-store-cart-message"
            className="kp-store-cart-dialog">
            <div className="kp-store-cart-icon" aria-hidden="true">🛒</div>
            <h2 id="kp-store-cart-title">One store per cart</h2>
            <p id="kp-store-cart-message">
              Items from the same store should be added to your cart.
              Your current cart has products from another store.
              Please complete or clear that cart before shopping from a different store.
            </p>
            <p className="kp-store-cart-preserved" role="status">
              Your existing cart items have not been changed.
            </p>
            <button type="button" ref={dismissButtonRef}
              onClick={()=>setStoreConflict(false)}>
              OK, keep my cart
            </button>
          </section>
        </div>
      )}
    </CartContext.Provider>
  );
};

export const useCart=()=>useContext(CartContext);
