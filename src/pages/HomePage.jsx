import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Search,
  SlidersHorizontal,
  ChevronRight,
  Zap,
  Star,
  Clock,
  Bike,
  Sparkles,
  MapPin,
  ShoppingBag,
  ArrowRight,
  LayoutGrid,
  Rows3,
  UserPlus,
  LogIn,
  LogOut,
  User,
  ShieldCheck
} from 'lucide-react';
import { allCategories } from '../data/stores';
import { useStore } from '../context/StoreContext';
import { useCart } from '../context/CartContext';
import { useSecurity } from '../context/SecurityContext';
import StoreCard from '../components/StoreCard';
import ProductDetailModal from '../components/ProductDetailModal';
import CategoriesModal from '../components/CategoriesModal';
import AuthModal from '../components/AuthModal';

export default function HomePage() {
  const navigate = useNavigate();
  const { stores } = useStore();
  const { totalItems } = useCart();
  const { authSession, logout } = useSecurity();

  const [authModalMode, setAuthModalMode] = useState(null);
  const [activeCategory, setActiveCategory] = useState('vegetables');
  const [activeStoreFilter, setActiveStoreFilter] = useState('all');
  const [storeViewMode, setStoreViewMode] = useState('grid'); // 'grid' | 'compact'
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);

  const storeFilters = [
    { id: 'all', label: 'All Stores' },
    { id: 'fast', label: '⚡ 20–30 Mins' },
    { id: 'rated', label: '⭐ Top Rated (4.7+)' },
    { id: 'free', label: '🚚 Free Delivery' }
  ];

  const filteredStores = stores.filter((s) => {
    if (activeStoreFilter === 'fast') return s.deliveryTime.toLowerCase().includes('30') || s.deliveryTime.toLowerCase().includes('20') || s.deliveryTime.toLowerCase().includes('15');
    if (activeStoreFilter === 'rated') return s.rating >= 4.7;
    if (activeStoreFilter === 'free') return s.deliveryFee === 0;
    return true;
  });

  return (
    <div className="home-container">
      {/* ── Deep Forest Green Brand Header (Matching Groceasy Design in Image 1 & 2) ── */}
      <header className="minimal-header">
        <div className="minimal-top-row">
          {/* Left: Brand & Delivery Location */}
          <div className="minimal-left-group">
            <div className="minimal-brand" onClick={() => navigate('/home')}>
              <span className="mb-bolt">⚡</span>
              <span className="mb-text">Kirana<strong>PRO</strong></span>
            </div>

            <div className="minimal-loc-pill" onClick={() => navigate('/')}>
              <MapPin size={12} color="#16A34A" />
              <span className="minimal-loc-txt">Maddilapalem, Vizag • 2 km</span>
              <ChevronRight size={11} color="#94A3B8" />
            </div>

            {authSession.isAuthenticated && (
              <span className="minimal-user-badge">
                <User size={11} color="#16A34A" />
                <span>Hi, {authSession.userName.split(' ')[0]}</span>
              </span>
            )}
          </div>

          {/* Top Right Corner: Logout, Cart and Notification Icons */}
          <div className="minimal-top-right-corner">
            {/* Notification Bell */}
            <button
              type="button"
              className="minimal-circle-btn notif"
              onClick={() => alert('Nearby stores deliver within 20–30 mins! Mandi orders delivered in 2 hours.')}
              aria-label="Notifications"
              title="Notifications"
            >
              <Bell size={16} color="#334155" />
              <span className="minimal-notif-dot" />
            </button>

            {/* Shopping Cart */}
            <button
              type="button"
              className="minimal-circle-btn cart"
              onClick={() => navigate('/cart')}
              aria-label={`Cart with ${totalItems} items`}
              title="Cart"
            >
              <ShoppingBag size={16} color="#334155" />
              {totalItems > 0 && (
                <span className="minimal-cart-badge">{totalItems}</span>
              )}
            </button>

            {/* Logout / Login in Top Right Corner */}
            {authSession.isAuthenticated ? (
              <button
                type="button"
                className="minimal-circle-btn logout"
                onClick={logout}
                title="Log Out"
                aria-label="Log Out"
              >
                <LogOut size={16} color="#EF4444" />
              </button>
            ) : (
              <div className="minimal-auth-btns">
                <button
                  type="button"
                  className="minimal-auth-btn signup"
                  onClick={() => setAuthModalMode('signup')}
                >
                  <UserPlus size={12} />
                  <span>Sign Up</span>
                </button>
                <button
                  type="button"
                  className="minimal-auth-btn login"
                  onClick={() => setAuthModalMode('login')}
                >
                  <LogIn size={12} />
                  <span>Log In</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Minimalist Search Bar */}
        <div className="minimal-search-bar" onClick={() => navigate('/search')}>
          <Search size={16} color="#94A3B8" />
          <span className="minimal-search-ph">Search farm vegetables, fresh fruits, groceries, dairy...</span>
          <button
            type="button"
            className="minimal-search-btn"
            onClick={(e) => {
              e.stopPropagation();
              navigate('/search');
            }}
            aria-label="Filter"
          >
            <SlidersHorizontal size={14} />
          </button>
        </div>
      </header>

      {/* ── Selected by Category Section (Matching Image 1 Middle Screen) ── */}
      <section className="home-section groceasy-cat-section">
        <div className="section-header-row">
          <div>
            <h3 className="groceasy-sec-title">Selected by Category</h3>
          </div>
          <button
            type="button"
            className="groceasy-see-all-link"
            onClick={() => setIsCatModalOpen(true)}
          >
            See All
          </button>
        </div>

        {/* Circular Avatar List: 1st is dark green filled circle with white icon */}
        <div className="groceasy-cats-row">
          {allCategories.slice(0, 8).map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                className={`groceasy-cat-btn ${isActive ? 'is-active' : ''}`}
                onClick={() => {
                  setActiveCategory(cat.id);
                  const catName = cat.name;
                  const mandiCats = ['Vegetables', 'Fruits', 'Leafy Green', 'Groceries', 'Flowers', 'Pickles'];
                  if (mandiCats.includes(catName)) {
                    navigate('/store/localfresh', { state: { category: catName } });
                  } else {
                    navigate('/store/1', { state: { category: catName } });
                  }
                }}
              >
                <div className={`groceasy-cat-circle ${isActive ? 'filled-green' : 'soft-tint'}`}>
                  <span className="groceasy-cat-emoji">{cat.icon}</span>
                </div>
                <span className="groceasy-cat-title">{cat.name.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </section>

      

      {/* ── Featured Stores Catalog with AI Seller Posters ── */}
      <section className="home-section">
        <div className="section-header-row store-header-with-toggle">
          <div>
            <h3 className="groceasy-sec-title">Stores in Your Locality</h3>
            <p className="groceasy-sec-sub">Nearby stores deliver in 20–30 mins • Direct Mandi in 2 hrs</p>
          </div>

          {/* 2-Kind View Switcher: Grid View vs Compact View */}
          <div className="store-view-toggle-pill">
            <button
              type="button"
              className={`store-vt-btn ${storeViewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setStoreViewMode('grid')}
              title="Grid View (Poster Cards)"
            >
              <LayoutGrid size={15} />
              <span>Grid</span>
            </button>
            <button
              type="button"
              className={`store-vt-btn ${storeViewMode === 'compact' ? 'active' : ''}`}
              onClick={() => setStoreViewMode('compact')}
              title="Compact View (Dense List)"
            >
              <Rows3 size={15} />
              <span>Compact</span>
            </button>
          </div>
        </div>

        {/* Store Filters */}
        <div className="store-filter-pills">
          {storeFilters.map((flt) => (
            <button
              key={flt.id}
              type="button"
              className={`store-filter-pill ${activeStoreFilter === flt.id ? 'active' : ''}`}
              onClick={() => setActiveStoreFilter(flt.id)}
            >
              {flt.label}
            </button>
          ))}
        </div>

        {/* Stores List with AI Posters */}
        <div className={`stores-list-container view-${storeViewMode}`}>
          {filteredStores.map((store) => (
            <StoreCard
              key={store.id}
              store={store}
              layout={storeViewMode}
            />
          ))}
        </div>
      </section>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          storeId={selectedProduct.storeId}
          storeName={selectedProduct.storeName}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      {/* Categories Modal */}
      <CategoriesModal
        isOpen={isCatModalOpen}
        onClose={() => setIsCatModalOpen(false)}
        onSelectCategory={(catName) => {
          setIsCatModalOpen(false);
          const mandiCats = ['Vegetables', 'Fruits', 'Leafy Green', 'Groceries', 'Flowers', 'Pickles'];
          if (mandiCats.includes(catName)) {
            navigate('/store/localfresh', { state: { category: catName } });
          } else {
            navigate('/store/1', { state: { category: catName } });
          }
        }}
      />

      {/* Auth Modal with Clean Sign Up / Log In */}
      <AuthModal
        isOpen={Boolean(authModalMode)}
        initialMode={authModalMode || 'signup'}
        onClose={() => setAuthModalMode(null)}
      />
    </div>
  );
}
