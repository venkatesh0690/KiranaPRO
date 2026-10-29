import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useSecurity } from './SecurityContext';

// Prototype-only client-side order ledger: scoped to the signed-in phone.
// Requires verified accounts and server-side persistence/transactional checks
// before enabling real payments and production coupon redemption.
const KEY_PREFIX='kp_customer_history_v1:';
const OrderHistoryContext=createContext(null);

export function getCustomerKey(session) {
  if(!session?.isAuthenticated || session.role!=='customer' || session.isTemporary) return null;
  const phone=String(session.userPhone||'').replace(/\D/g,'');
  return phone.length>=10 ? phone.slice(-10) : null;
}

export function readCustomerOrders(key) {
  if(!key) return [];
  try {
    const value=JSON.parse(localStorage.getItem(KEY_PREFIX+key)||'[]');
    return Array.isArray(value) ? value.filter(entry => entry && entry.id && entry.placedAt) : [];
  } catch {return [];}
}

export function OrderHistoryProvider({children}) {
  const {authSession}=useSecurity();
  const accountKey=getCustomerKey(authSession);
  const [history,setHistory]=useState(() => ({key:accountKey,orders:readCustomerOrders(accountKey)}));

  // Do not leak previous account orders during account switching or logout.
  const orders=history.key===accountKey ? history.orders : readCustomerOrders(accountKey);

  useEffect(()=>{
    setHistory({key:accountKey,orders:readCustomerOrders(accountKey)});
  },[accountKey]);

  useEffect(()=>{
    const refresh=event=>{
      if(!accountKey || (event.key!==null && event.key!==KEY_PREFIX+accountKey)) return;
      setHistory({key:accountKey,orders:readCustomerOrders(accountKey)});
    };
    window.addEventListener('storage',refresh);
    return ()=>window.removeEventListener('storage',refresh);
  },[accountKey]);

  const recordOrder=(data)=>{
    if(!accountKey) return {success:false,error:'Log in as a customer before placing an order.'};
    if(!data?.storeId || !Array.isArray(data.items) || !data.items.length) {
      return {success:false,error:'Cannot place an empty order.'};
    }
    const previous=readCustomerOrders(accountKey);
    const number=previous.length+1;
    const order={
      ...data,
      id:typeof crypto!=='undefined' && crypto.randomUUID ? `KP-${crypto.randomUUID()}` : `KP-${Date.now()}-${Math.random().toString(36).slice(2,9)}`,
      orderNumber:number,placedAt:new Date().toISOString(),status:'Placed (demo)'
    };
    try {
      localStorage.setItem(KEY_PREFIX+accountKey,JSON.stringify([...previous,order]));
      setHistory({key:accountKey,orders:[...previous,order]});
      return {success:true,order};
    } catch {
      return {success:false,error:'Unable to save your order history on this device. Order not placed.'};
    }
  };

  const count=orders.length;
  const value=useMemo(()=>({orders,orderCount:count,nextOrderNumber:count+1,recordOrder}),
    [orders,count,recordOrder]);
  return <OrderHistoryContext.Provider value={value}>{children}</OrderHistoryContext.Provider>;
}

export function useCustomerOrders() {
  const context=useContext(OrderHistoryContext);
  if(!context)throw new Error('useCustomerOrders requires OrderHistoryProvider');
  return context;
}
