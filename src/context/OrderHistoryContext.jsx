import {createContext,useContext,useEffect,useMemo,useState,useCallback} from 'react';
import {useSecurity} from './SecurityContext';

const OrderHistoryContext=createContext(null);
// Server-issued account ID is the only key; browser phone numbers never authorize records.
export const getCustomerKey=session =>
  session?.isAuthenticated && session.role==='customer' && !session.isTemporary ? session.userId : null;
// Legacy read intentionally disabled. Never restore localStorage-based "private" orders.
export const readCustomerOrders=()=>[];

export function OrderHistoryProvider({children}){
  const {authSession}=useSecurity();
  const accountKey=getCustomerKey(authSession);
  const [history,setHistory]=useState({key:null,orders:[]});
  const orders=history.key===accountKey?history.orders:[];

  useEffect(()=>{
    let live=true;
    setHistory({key:accountKey,orders:[]});
    if(!accountKey)return ()=>{live=false};
    fetch('/api/orders',{credentials:'same-origin',cache:'no-store'})
      .then(r=>r.ok?r.json():Promise.reject(new Error('Could not load orders')))
      .then(data=>{if(live)setHistory({key:accountKey,orders:data.orders||[]});})
      .catch(()=>{if(live)setHistory({key:accountKey,orders:[]});});
    return ()=>{live=false};
  },[accountKey]);

  const recordOrder=useCallback(async data=>{
    if(!accountKey)return {success:false,error:'Please sign in before ordering.'};
    if(!data?.storeId || !Array.isArray(data.items) || !data.items.length) {
      return {success:false,error:'Cannot place an empty order.'};
    }
    try{
      const response=await fetch('/api/orders',{
        method:'POST',credentials:'same-origin',
        headers:{'Content-Type':'application/json','X-Kirana-Client':'web'},
        body:JSON.stringify({
          storeId:String(data.storeId),
          items:data.items.map(i=>({id:String(i.id),qty:i.qty||i.quantity})),
          deliveryAddress:data.deliveryAddress
        })
      });
      const result=await response.json();
      if(!response.ok)return {success:false,error:result.error||'Unable to record order'};
      const order=result.order;
      setHistory(previous=>({key:accountKey,orders:
        [...(previous.key===accountKey?previous.orders:[]),order]}));
      return {success:true,order};
    }catch{return {success:false,error:'Order service is unavailable. No order was saved.'};}
  },[accountKey]);

  const count=orders.length;
  const value=useMemo(()=>({orders,orderCount:count,nextOrderNumber:count+1,recordOrder}),
    [orders,count,recordOrder]);
  return <OrderHistoryContext.Provider value={value}>{children}</OrderHistoryContext.Provider>;
}
export function useCustomerOrders(){
  const ctx=useContext(OrderHistoryContext);
  if(!ctx)throw new Error('useCustomerOrders requires OrderHistoryProvider');
  return ctx;
}
