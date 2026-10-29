import { createContext, useContext, useState } from 'react';
import { stores as initialStores, productsByCategory as initialProducts } from '../data/stores';
import { sanitizeInput } from '../utils/security';

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [stores, setStores] = useState(initialStores);
  const [products, setProducts] = useState(initialProducts);
  const [activeRole, setActiveRole] = useState('user'); // 'user' | 'seller' | 'admin'
  const [sellerStoreId, setSellerStoreId] = useState(1); // Sharma General Store by default

  // Live Orders managed across User, Seller and Admin
  const [orders, setOrders] = useState([
    {
      id: 'KP-94821',
      customerName: 'Laxman',
      customerPhone: '+91 98480 22334',
      customerAddress: 'Flat 302, Sai Residency, Maddilapalem, Vizag (0.4 km)',
      storeId: 1,
      storeName: 'Sharma General Store',
      items: [
        { id: 101, name: 'Amul Taaza Toned Milk', qty: 2, price: 54, unit: '1 Litre' },
        { id: 201, name: 'Hybrid Juicy Red Tomatoes', qty: 1, price: 36, unit: '1 kg' },
        { id: 401, name: "Haldiram's Aloo Bhujia", qty: 1, price: 52, unit: '200 g' }
      ],
      totalAmount: 196,
      paymentMethod: 'UPI (Paid)',
      status: 'Preparing', // 'Received' | 'Preparing' | 'Out for Delivery' | 'Delivered'
      orderTime: '5:42 PM',
      eta: '11 mins',
      riderName: 'Suresh M. (TVS Jupiter - AP39 AB 1234)'
    },
    {
      id: 'KP-94820',
      customerName: 'Ananya S.',
      customerPhone: '+91 98765 11223',
      customerAddress: 'Plot 45, Sector 4, MVP Colony, Vizag (0.3 km)',
      storeId: 2,
      storeName: 'Sri Lakshmi Provisions',
      items: [
        { id: 102, name: 'Fresh Farm Eggs', qty: 2, price: 75, unit: '6 pcs' },
        { id: 501, name: 'Tata Sampann Toor Dal', qty: 1, price: 142, unit: '1 kg' }
      ],
      totalAmount: 292,
      paymentMethod: 'Cash on Delivery',
      status: 'Delivered',
      orderTime: '4:15 PM',
      eta: 'Delivered in 12 mins',
      riderName: 'Kishore K.'
    }
  ]);

  // Seller/Admin Action: Toggle In/Out of Stock
  const toggleStock = (productId) => {
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
  const updatePrice = (productId, newPrice, newMrp) => {
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
  const addProduct = (category, productData) => {
    const newId = Date.now();
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
  const updateOrderStatus = (orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, status: newStatus } : ord))
    );
  };

  // Admin Action: Toggle Store Open/Closed
  const toggleStoreStatus = (storeId) => {
    setStores((prev) =>
      prev.map((s) => (s.id === storeId ? { ...s, isOpen: !s.isOpen } : s))
    );
  };

  const currentSellerStore = stores.find((s) => s.id === sellerStoreId) || stores[0];

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
