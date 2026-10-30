import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Store,
  Plus,
  Search,
  Package,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  Edit2,
  Check,
  X,
  PhoneCall,
  ArrowLeft,
  SlidersHorizontal,
  Layers,
  Sparkles,
  LogOut,
  Bike
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useSecurity } from '../context/SecurityContext';
import { maskPhone } from '../utils/security';
import { allCategories } from '../data/stores';
import CatalogProductVisual from '../components/CatalogProductVisual';

export default function SellerDashboard() {
  const navigate = useNavigate();
  const {
    currentSellerStore,
    products,
    orders,
    toggleStock,
    updatePrice,
    addProduct,
    updateOrderStatus,
    toggleStoreStatus,
    setActiveRole
  } = useStore();

  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' | 'orders' | 'analytics'
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPriceId, setEditingPriceId] = useState(null);
  const [tempPrice, setTempPrice] = useState('');
  const [tempMrp, setTempMrp] = useState('');
  const [revealedPhones, setRevealedPhones] = useState({});

  const { logSecurityEvent } = useSecurity();

  const toggleRevealPhone = (orderId) => {
    setRevealedPhones((prev) => {
      const next = { ...prev, [orderId]: !prev[orderId] };
      if (!prev[orderId]) {
        logSecurityEvent('CUSTOMER_PII_ACCESSED', `Phone unmasked for Order #${orderId} by Seller`, 'info');
      }
      return next;
    });
  };

  // New product form state
  const [newProdName, setNewProdName] = useState('');
  const [newProdCat, setNewProdCat] = useState('Dairy & Breakfast');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdMrp, setNewProdMrp] = useState('');

  const [stockCounts, setStockCounts] = useState({});
  const adjustProductStock = (id, delta) => {
    setStockCounts(prev => {
      const current = prev[id] !== undefined ? prev[id] : 25;
      const next = Math.max(0, current + delta);
      if (next === 0 && current > 0) toggleStock(id);
      if (next > 0 && current === 0) toggleStock(id);
      return { ...prev, [id]: next };
    });
  };
  const setDirectStock = (id, val) => {
    const next = Math.max(0, isNaN(val) ? 0 : val);
    setStockCounts(prev => ({ ...prev, [id]: next }));
  };
  const zeroOutStock = (id) => {
    setStockCounts(prev => ({ ...prev, [id]: 0 }));
    const p = allStoreProducts.find(item => item.id === id);
    if (p && p.inStock) toggleStock(id);
  };

  const [newProdUnit, setNewProdUnit] = useState('1 kg');
  const [newProdEmoji, setNewProdEmoji] = useState('📦');
  const [newProdBrand, setNewProdBrand] = useState(currentSellerStore?.name || 'Local Store');
  const [newProdDesc, setNewProdDesc] = useState('');

  // Collect all products for display
  const allProductsFlat = [];
  Object.entries(products).forEach(([cat, list]) => {
    list.forEach((p) => {
      allProductsFlat.push({ ...p, category: cat });
    });
  });

  const filteredProducts = allProductsFlat.filter((p) => {
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const storeOrders = orders.filter((o) => o.storeId === currentSellerStore?.id);

  const handleSavePrice = (productId) => {
    if (tempPrice) {
      updatePrice(productId, tempPrice, tempMrp || tempPrice);
    }
    setEditingPriceId(null);
  };

  const handleCreateProduct = (e) => {
    e.preventDefault();
    if (!newProdName || !newProdPrice) return;

    addProduct(newProdCat, {
      name: newProdName,
      price: newProdPrice,
      mrp: newProdMrp || newProdPrice,
      unit: newProdUnit,
      image: newProdEmoji,
      brand: newProdBrand,
      description: newProdDesc
    });

    // Reset & close
    setNewProdName('');
    setNewProdPrice('');
    setNewProdMrp('');
    setNewProdDesc('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="seller-dashboard-page">
      {/* ── Top Portal Bar ── */}
      <header className="sd-header">
        <div className="sd-header-left">
          <button
            type="button"
            className="sd-nav-home-btn"
            onClick={() => {
              setActiveRole('user');
              navigate('/home');
            }}
            title="Switch to Customer Storefront"
          >
            <ArrowLeft size={16} />
            <span>Customer View</span>
          </button>
          <div className="sd-store-title-wrap">
            <span className="sd-store-emoji">{currentSellerStore?.image}</span>
            <div>
              <h1 className="sd-store-name">{currentSellerStore?.name}</h1>
              <p className="sd-store-owner">Partner: {currentSellerStore?.owner} • {currentSellerStore?.address}</p>
            </div>
          </div>
        </div>

        <div className="sd-header-right">
          {/* Live Store Toggle */}
          <button
            type="button"
            className={`sd-status-toggle ${currentSellerStore?.isOpen ? 'online' : 'offline'}`}
            onClick={() => toggleStoreStatus(currentSellerStore?.id)}
          >
            <span className="sd-status-dot" />
            <span>{currentSellerStore?.isOpen ? 'Store OPEN (Within 30m Dispatch)' : 'Store CLOSED'}</span>
          </button>

          <button
            type="button"
            className="sd-logout-btn"
            onClick={() => {
              setActiveRole('user');
              navigate('/');
            }}
            title="Log out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* ── KPI Metric Cards ── */}
      <section className="sd-metrics-row">
        <div className="sd-metric-card">
          <div className="sdm-icon sdm-orange"><Package size={20} /></div>
          <div>
            <span className="sdm-label">Active Stock SKUs</span>
            <span className="sdm-val">{allProductsFlat.length} Items</span>
          </div>
        </div>

        <div className="sd-metric-card">
          <div className="sdm-icon sdm-green"><TrendingUp size={20} /></div>
          <div>
            <span className="sdm-label">Today's Store Sales</span>
            <span className="sdm-val">₹4,280</span>
          </div>
        </div>

        <div className="sd-metric-card">
          <div className="sdm-icon sdm-blue"><Clock size={20} /></div>
          <div>
            <span className="sdm-label">Avg Packing Time</span>
            <span className="sdm-val">3.4 Mins</span>
          </div>
        </div>

        <div className="sd-metric-card">
          <div className="sdm-icon sdm-purple"><Bike size={20} /></div>
          <div>
            <span className="sdm-label">2km Rider Dispatches</span>
            <span className="sdm-val">{storeOrders.length} Orders</span>
          </div>
        </div>
      </section>

      {/* ── Tabbed View Switcher ── */}
      <div className="sd-tabs-bar">
        <button
          type="button"
          className={`sd-tab-btn ${activeTab === 'inventory' ? 'active' : ''}`}
          onClick={() => setActiveTab('inventory')}
        >
          <Layers size={16} />
          <span>Stock & Inventory ({allProductsFlat.length})</span>
        </button>
        <button
          type="button"
          className={`sd-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          <Clock size={16} />
          <span>Incoming Orders ({storeOrders.length})</span>
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════════════
         TAB 1: STOCK & INVENTORY MANAGER
         ══════════════════════════════════════════════════════════════ */}
      {activeTab === 'inventory' && (
        <div className="sd-inventory-section">
          {/* Action Toolbar */}
          <div className="sd-toolbar">
            <div className="sd-search-box">
              <Search size={16} color="var(--n400)" />
              <input
                type="text"
                placeholder="Search products in your store inventory..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <button
              type="button"
              className="sd-add-product-btn"
              onClick={() => setIsAddModalOpen(true)}
            >
              <Plus size={18} />
              <span>Add New Stock Item</span>
            </button>
          </div>

          {/* Category Filter Pills */}
          <div className="sd-cat-pills-row">
            <button
              type="button"
              className={`sd-cat-pill ${selectedCategory === 'All' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('All')}
            >
              All Categories
            </button>
            {allCategories.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`sd-cat-pill ${selectedCategory === c.name ? 'active' : ''}`}
                onClick={() => setSelectedCategory(c.name)}
              >
                <span>{c.icon}</span>
                <span>{c.name}</span>
              </button>
            ))}
          </div>

          {/* Stock Table / Cards Grid */}
          <div className="sd-stock-grid">
            {filteredProducts.map((p) => {
              const isEditing = editingPriceId === p.id;
              return (
                <div key={p.id} className={`sd-stock-item-card ${!p.inStock ? 'out-of-stock' : ''}`}>
                  <div className="ssi-left">
                    <span className="ssi-emoji"><CatalogProductVisual product={p} /></span>
                    <div className="ssi-details">
                      <div className="ssi-name-row">
                        <h4 className="ssi-name">{p.name}</h4>
                        <span className="ssi-cat-badge">{p.category}</span>
                      </div>
                      <span className="ssi-unit">{p.unit} • {p.brand}</span>

                      {/* Pricing with inline editor */}
                      <div className="ssi-price-edit-row">
                        {isEditing ? (
                          <div className="ssi-inline-form">
                            <input
                              type="number"
                              className="ssi-price-input"
                              placeholder="₹ Selling"
                              value={tempPrice}
                              onChange={(e) => setTempPrice(e.target.value)}
                            />
                            <input
                              type="number"
                              className="ssi-price-input mrp"
                              placeholder="₹ MRP"
                              value={tempMrp}
                              onChange={(e) => setTempMrp(e.target.value)}
                            />
                            <button
                              type="button"
                              className="ssi-save-btn"
                              onClick={() => handleSavePrice(p.id)}
                            >
                              <Check size={14} />
                            </button>
                            <button
                              type="button"
                              className="ssi-cancel-btn"
                              onClick={() => setEditingPriceId(null)}
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <div className="ssi-price-display">
                            <span className="ssi-price">₹{p.price}</span>
                            {p.mrp > p.price && <span className="ssi-mrp">₹{p.mrp}</span>}
                            <button
                              type="button"
                              className="ssi-edit-trigger"
                              onClick={() => {
                                setEditingPriceId(p.id);
                                setTempPrice(p.price);
                                setTempMrp(p.mrp);
                              }}
                              title="Edit price"
                            >
                              <Edit2 size={12} />
                              <span>Edit Price</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Stock Availability Toggle */}
                  <div className="ssi-right-actions">

                    {/* Quick Stock Controls (Prompt 5.1) */}
                    <div className="ssi-stock-stepper-row" style={{display:'flex',alignItems:'center',gap:4,marginTop:6}}>
                      <button type="button" className="ssi-step-btn" onClick={() => adjustProductStock(p.id, -10)} style={{padding:'3px 6px',fontSize:10,fontWeight:700,background:'#F1F5F9',border:'1px solid #CBD5E1',borderRadius:4,cursor:'pointer'}}>-10</button>
                      <button type="button" className="ssi-step-btn" onClick={() => adjustProductStock(p.id, -1)} style={{padding:'3px 6px',fontSize:10,fontWeight:700,background:'#F1F5F9',border:'1px solid #CBD5E1',borderRadius:4,cursor:'pointer'}}>-1</button>
                      <input
                        type="number"
                        className="ssi-stock-input"
                        value={stockCounts[p.id] !== undefined ? stockCounts[p.id] : (p.inStock ? 25 : 0)}
                        onChange={(e) => setDirectStock(p.id, Number(e.target.value))}
                        style={{width:44,padding:'3px 4px',fontSize:11,fontWeight:750,textAlign:'center',border:'1px solid #CBD5E1',borderRadius:4}}
                      />
                      <button type="button" className="ssi-step-btn" onClick={() => adjustProductStock(p.id, +1)} style={{padding:'3px 6px',fontSize:10,fontWeight:700,background:'#F1F5F9',border:'1px solid #CBD5E1',borderRadius:4,cursor:'pointer'}}>+1</button>
                      <button type="button" className="ssi-step-btn" onClick={() => adjustProductStock(p.id, +10)} style={{padding:'3px 6px',fontSize:10,fontWeight:700,background:'#F1F5F9',border:'1px solid #CBD5E1',borderRadius:4,cursor:'pointer'}}>+10</button>
                      <button type="button" className="ssi-zero-btn" onClick={() => zeroOutStock(p.id)} style={{padding:'3px 6px',fontSize:10,fontWeight:750,background:'#FEE2E2',color:'#991B1B',border:'1px solid #FCA5A5',borderRadius:4,cursor:'pointer'}}>Zero Out</button>
                    </div>

                    <button
                      type="button"
                      className={`ssi-stock-toggle-btn ${p.inStock ? 'in' : 'out'}`}
                      onClick={() => toggleStock(p.id)}
                    >
                      {p.inStock ? (
                        <>
                          <CheckCircle2 size={16} />
                          <span>In Stock</span>
                        </>
                      ) : (
                        <>
                          <XCircle size={16} />
                          <span>Out of Stock</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
         TAB 2: INCOMING LIVE ORDERS DISPATCH
         ══════════════════════════════════════════════════════════════ */}
      {activeTab === 'orders' && (
        <div className="sd-orders-section">
          <div className="sd-orders-list">
            {storeOrders.length === 0 ? (
              <div className="sd-empty-box">
                <span>📦</span>
                <h3>No pending orders</h3>
                <p>New customer orders within 2 km will show up here with alert audio.</p>
              </div>
            ) : (
              storeOrders.map((ord) => (
                <div key={ord.id} className="sd-order-card">
                  <div className="sdoc-header">
                    <div>
                      <span className="sdoc-id">Order {ord.id}</span>
                      <span className="sdoc-time">{ord.orderTime} • {ord.paymentMethod}</span>
                    </div>
                    <span className={`sdoc-status-pill ${ord.status.toLowerCase().replace(/\s+/g, '-')}`}>
                      {ord.status}
                    </span>
                  </div>

                  <div className="sdoc-customer">
                    <strong>Customer: {ord.customerName}</strong>
                    <span>📍 {ord.customerAddress}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      📞 {revealedPhones[ord.id] ? ord.customerPhone : maskPhone(ord.customerPhone)}
                      <button
                        type="button"
                        onClick={() => toggleRevealPhone(ord.id)}
                        style={{
                          background: '#F1F5F9',
                          border: '1px solid #CBD5E1',
                          borderRadius: 4,
                          padding: '1px 6px',
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          color: '#334155'
                        }}
                      >
                        {revealedPhones[ord.id] ? 'Hide' : 'Show Full (Audited)'}
                      </button>
                    </span>
                  </div>

                  <div className="sdoc-items-table">
                    {ord.items.map((it) => (
                      <div key={it.name} className="sdoc-item-row">
                        <span>{it.qty}x {it.name} ({it.unit})</span>
                        <strong>₹{it.price * it.qty}</strong>
                      </div>
                    ))}
                    <div className="sdoc-total-row">
                      <span>Store Payout</span>
                      <strong>₹{ord.totalAmount}</strong>
                    </div>
                  </div>

                  {/* Action Controls */}
                  <div className="sdoc-actions">
                    {ord.status === 'Preparing' && (
                      <button
                        type="button"
                        className="sdoc-act-btn ready"
                        onClick={() => updateOrderStatus(ord.id, 'Out for Delivery')}
                      >
                        <Check size={16} />
                        <span>Packed & Ready for Rider ({ord.riderName.split(' ')[0]})</span>
                      </button>
                    )}
                    {ord.status === 'Out for Delivery' && (
                      <button
                        type="button"
                        className="sdoc-act-btn complete"
                        onClick={() => updateOrderStatus(ord.id, 'Delivered')}
                      >
                        <CheckCircle2 size={16} />
                        <span>Mark Order Delivered</span>
                      </button>
                    )}
                    {ord.status === 'Delivered' && (
                      <span className="sdoc-delivered-note">✓ Order Completed in Within 30m SLA</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
         MODAL: ADD NEW PRODUCT TO STOCK
         ══════════════════════════════════════════════════════════════ */}
      {isAddModalOpen && (
        <div className="pdm-backdrop" onClick={() => setIsAddModalOpen(false)}>
          <div className="sd-add-modal" onClick={(e) => e.stopPropagation()}>
            <div className="sam-header">
              <div>
                <h2>Add Stock Item to {currentSellerStore?.name}</h2>
                <p>New items will instantly be visible to customers within 2 km.</p>
              </div>
              <button
                type="button"
                className="sam-close-btn"
                onClick={() => setIsAddModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="sam-form">
              <div className="sam-field">
                <label>Product Name & Variety:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sona Masoori Rice (Brand / Grade)"
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                />
              </div>

              <div className="sam-grid-2">
                <div className="sam-field">
                  <label>Category:</label>
                  <select
                    value={newProdCat}
                    onChange={(e) => setNewProdCat(e.target.value)}
                  >
                    {allCategories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.icon} {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sam-field">
                  <label>Package Size / Unit:</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 1 kg, 500 ml, 6 pcs"
                    value={newProdUnit}
                    onChange={(e) => setNewProdUnit(e.target.value)}
                  />
                </div>
              </div>

              <div className="sam-grid-2">
                <div className="sam-field">
                  <label>Selling Price (₹):</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 52"
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(e.target.value)}
                  />
                </div>

                <div className="sam-field">
                  <label>Printed MRP (₹):</label>
                  <input
                    type="number"
                    placeholder="e.g. 60"
                    value={newProdMrp}
                    onChange={(e) => setNewProdMrp(e.target.value)}
                  />
                </div>
              </div>

              <div className="sam-grid-2">
                <div className="sam-field">
                  <label>Product Emoji / Icon:</label>
                  <input
                    type="text"
                    placeholder="e.g. 🌾, 🍅, 🥛"
                    value={newProdEmoji}
                    onChange={(e) => setNewProdEmoji(e.target.value)}
                  />
                </div>

                <div className="sam-field">
                  <label>Brand / Supplier:</label>
                  <input
                    type="text"
                    placeholder="e.g. Mandi / Amul / Local"
                    value={newProdBrand}
                    onChange={(e) => setNewProdBrand(e.target.value)}
                  />
                </div>
              </div>

              <div className="sam-field">
                <label>Item Description (Optional):</label>
                <textarea
                  rows={2}
                  placeholder="Fresh quality lot details for shoppers..."
                  value={newProdDesc}
                  onChange={(e) => setNewProdDesc(e.target.value)}
                />
              </div>

              <div className="sam-actions">
                <button
                  type="button"
                  className="sam-btn-cancel"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="sam-btn-submit">
                  <Plus size={16} />
                  <span>Publish to Kirana Storefront</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
