import { createContext, useContext, useEffect, useState } from 'react';
import { useSecurity } from './SecurityContext';
import { stores as initialStores, productsByCategory as initialProducts } from '../data/stores';
import { sanitizeInput } from '../utils/security';

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const {authSession}=useSecurity();
  const [stores, setStores] = useState(initialStores);
  const [products, setProducts] = useState(initialProducts);
  const [activeRole, setActiveRole] = useState('user'); // 'user' | 'seller' | 'admin'
  const [sellerStoreId, setSellerStoreId] = useState(1); // Sharma General Store by default

  // Only records fetched with the server's verified seller/admin session are displayed.
  const [orders,setOrders]=useState([]);
  useEffect(()=>{
    let active=true;
    if(!authSession.isAuthenticated || !['seller','admin'].includes(authSession.role)){
      setOrders([]);
      return ()=>{active=false};
    }
    fetch('/api/orders',{credentials:'same-origin',cache:'no-store'})
      .then(r=>r.ok?r.json():Promise.reject(new Error('Order access denied')))
      .then(data=>{if(active)setOrders(data.orders||[]);})
      .catch(()=>{if(active)setOrders([]);});
    return ()=>{active=false};
  },[authSession.isAuthenticated,authSession.role,authSession.storeId]);

  useEffect(()=>{
    if(authSession.role==='seller' && authSession.storeId) setSellerStoreId(authSession.storeId);
  },[authSession.role,authSession.storeId]);

  async function securedWrite(path,method,payload){
    const response=await fetch(path,{method,credentials:'same-origin',
      headers:{'Content-Type':'application/json','X-Kirana-Client':'web'},
      body:JSON.stringify(payload)});
    if(!response.ok)throw new Error('The server rejected this change. Please check permissions.');
    return response.json();
  }

  // Seller/Admin Action: Toggle In/Out of Stock
  const toggleStock = async (productId) => {
    const matched=Object.values(products).flat().find(p=>String(p.id)===String(productId));
    await securedWrite('/api/catalog','PATCH',{storeId:authSession.role==='seller'?authSession.storeId:'localfresh',productId:String(productId),inStock:!matched?.inStock});
    setProducts((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((cat) => {
        next[cat] = next[cat].map((p) =>
          String(p.id) === String(productId) ? { ...p, inStock: !p.inStock } : p
        );
      });
      return next;
    });
  };

  // Seller/Admin Action: Update Price & MRP with Anti-Tampering Sanity Check
  const updatePrice = async (productId, newPrice, newMrp) => {
    await securedWrite('/api/catalog','PATCH',{storeId:authSession.role==='seller'?authSession.storeId:'localfresh',productId:String(productId),price:Number(newPrice)});
    const safePrice = Math.max(1, Number(newPrice) || 1);
    const safeMrp = Math.max(safePrice, Number(newMrp || safePrice) || safePrice);

    setProducts((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((cat) => {
        next[cat] = next[cat].map((p) =>
          String(p.id) === String(productId) ? { ...p, price: safePrice, mrp: safeMrp } : p
        );
      });
      return next;
    });
  };

  // Seller Action: Add New Product to Store Catalog with Input Sanitization
  const addProduct = async (category, productData) => {
    const saved=await securedWrite('/api/catalog','POST',{storeId:authSession.role==='seller'?authSession.storeId:'localfresh',category,name:productData.name,price:Number(productData.price),unit:productData.unit||'1 pc'});
    const newId = saved.product.id;
    const safePrice = Math.max(1, Number(productData.price) || 1);
    const safeMrp = Math.max(safePrice, Number(productData.mrp || safePrice) || safePrice);

    const newProduct = {
      id: newId,
      name: sanitizeInput(productData.name || 'New Product'),
      price: safePrice,
      mrp: safeMrp,
      unit: sanitizeInput(productData.unit || '1 pc'),
      image: productData.image || '📦',
      inStock: true,
      rating: 5.0,
      reviewsCount: 1,
      brand: sanitizeInput(productData.brand || 'Local Brand'),
      badge: 'New Arrival',
      description: sanitizeInput(productData.description || 'Freshly stocked item in our local Kirana store.'),
      specs: {
        Stock: 'Fresh Lot',
        Origin: 'Vizag Local Mandi',
        Delivery: 'Within 20–30 mins'
      }
    };

    setProducts((prev) => {
      const currentList = prev[category] || [];
      return {
        ...prev,
        [category]: [newProduct, ...currentList]
      };
    });
    return newProduct;
  };

  // Seller/Admin Action: Update Order Status
  const updateOrderStatus = async (orderId, newStatus) => {
    await securedWrite('/api/orders','PATCH',{orderId,status:newStatus});
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, status: newStatus } : ord))
    );
  };

  // Admin Action: Toggle Store Open/Closed
  const toggleStoreStatus = async (storeId) => {
    const match=stores.find(s=>String(s.id)===String(storeId));
    await securedWrite('/api/catalog','PATCH',{action:'store-status',storeId:String(storeId),isActive:!match?.isOpen});
    setStores((prev) =>
      prev.map((s) => (s.id === storeId ? { ...s, isOpen: !s.isOpen } : s))
    );
  };

  const currentSellerStore = stores.find(s=>String(s.id)===String(sellerStoreId)) ||
    {id:authSession.storeId,name:authSession.userName||'Registered store',owner:'Verified partner',
     image:'🏬',address:'Registered store',isOpen:true};

  return (
    <StoreContext.Provider
      value={{
        stores,
        products,
        orders,
        activeRole,
        setActiveRole,
        sellerStoreId,
        setSellerStoreId,
        currentSellerStore,
        toggleStock,
        updatePrice,
        addProduct,
        updateOrderStatus,
        toggleStoreStatus
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within StoreProvider');
  }
  return context;
}
