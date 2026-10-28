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
  Store,
  LogIn,
  LogOut,
  User
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
  const { totalItems, totalPrice } = useCart();
  const { authSession, logout } = useSecurity();
  const [authModalMode, setAuthModalMode] = useState(null);

  const [activeStoreFilter, setActiveStoreFilter] = useState('all');
  const [storeViewMode, setStoreViewMode] = useState('grid'); // 'grid' | 'compact'
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);

  const storeFilters = [
    { id: 'all', label: 'All Stores' },
    { id: 'fast', label: '⚡ Fastest (Within 30m)' },
    { id: 'rated', label: '⭐ Top Rated (4.7+)' },
    { id: 'free', label: '🚚 Free Delivery' }
  ];

  const filteredStores = stores.filter((s) => {
    if (activeStoreFilter === 'fast') return s.deliveryTime.toLowerCase().includes('30') || s.deliveryTime.toLowerCase().includes('15');
    if (activeStoreFilter === 'rated') return s.rating >= 4.7;
    if (activeStoreFilter === 'free') return s.deliveryFee === 0;
    return true;
  });

  return (
    <div className="home-container">
      {/* ── Top App Bar (Inspired by Image 2, 3, 4) ── */}
      <header className="home-top-bar">
        <div className="top-user-greeting">
          <div className="greeting-text">
            {/* Clickable Location Chip */}
            <div className="home-loc-chip" onClick={() => navigate('/')}>
              <MapPin size={13} color="var(--brand)" />
              <span className="loc-text">Maddilapalem, Vizag • <strong>Within 2 km</strong></span>
              <ChevronRight size={13} color="var(--n400)" />
            </div>
            <h1 className="greeting-name">
              {authSession.isAuthenticated && authSession.userName
                ? `Good Day, ${authSession.userName} 👋`
                : 'Welcome to KiranaPRO 👋'}
            </h1>

            {/* User & Seller Sign Up Actions */}
            {!authSession.isAuthenticated ? (
              <div className="home-auth-strip">
                <button
                  type="button"
                  className="home-auth-pill user"
                  onClick={() => setAuthModalMode('user-signup')}
                  title="Create Customer Account"
                >
                  <UserPlus size={12} />
                  <span>User Sign Up</span>
                </button>
                <button
                  type="button"
                  className="home-auth-pill seller"
                  onClick={() => setAuthModalMode('seller-signup')}
                  title="Register your store as a partner"
                >
                  <Store size={12} />
                  <span>Seller Sign Up</span>
                </button>
                <button
                  type="button"
                  className="home-auth-pill login"
                  onClick={() => setAuthModalMode('user-login')}
                  title="Log in to your account"
                >
                  <LogIn size={12} />
                  <span>Login</span>
                </button>
              </div>
            ) : (
              <div className="home-auth-strip logged-in">
                <span className="home-logged-tag">
                  <User size={12} />
                  <span>{authSession.userName}</span>
                </span>
                <button
                  type="button"
                  className="home-auth-pill logout"
                  onClick={logout}
                  title="Sign Out"
                >
                  <LogOut size={12} />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>

          <div className="top-actions">
            {/* Notification Bell */}
            <button
              type="button"
              className="notif-bell-btn"
              onClick={() => alert('Nearby stores deliver in 20 mins, other stores within 30 mins, and LocalFresh Mandi within 2 hours!')}
              aria-label="Notifications"
            >
              <Bell size={20} />
              <span className="notif-dot" />
            </button>

            {/* Top-Right Shopping Cart Button with Real-time Count Badge (Requested) */}
            <button
              type="button"
              className="top-cart-btn"
              onClick={() => navigate('/cart')}
              aria-label={`Cart with ${totalItems} items`}
              title="Open Shopping Cart"
            >
              <div className="top-cart-icon-wrap">
                <ShoppingBag size={20} />
                {totalItems > 0 && (
                  <span className="top-cart-badge">{totalItems}</span>
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Search bar with filter icon (matching Image 1, 2, 4) */}
        <div className="home-search-bar" onClick={() => navigate('/search')}>
          <Search size={18} color="var(--n400)" />
          <span className="search-placeholder">Search "onion, milk, bread, mosambi, dal..."</span>
          <button
            type="button"
            className="search-filter-icon"
            onClick={(e) => {
              e.stopPropagation();
              navigate('/search');
            }}
          >
            <SlidersHorizontal size={16} />
          </button>
        </div>
      </header>

      {/* ── Hero Banner (Curved Card matching Image 2 & 4) ── */}
      <section className="home-hero-banner">
        <div className="banner-content">
          <span className="banner-tag">⚡ 20–30 Mins Delivery • Mandi in 2 Hrs</span>
          <h2 className="banner-title">25% Off First Order</h2>
          <p className="banner-code-text">Use coupon <strong>KIRANA25</strong> at checkout</p>
          <button
            type="button"
            className="banner-cta-btn"
            onClick={() => navigate('/store/localfresh')}
          >
            Shop Mandi & Kiranas
          </button>
        </div>
        <div className="banner-visual">
          <span className="banner-visual-emoji">🛵</span>
          <div className="banner-floating-badge">
            <Sparkles size={12} color="#FFAB00" />
            <span>Under 2km</span>
          </div>
        </div>
      </section>

      {/* ── Circular Categories Section (matching Image 1, 3, 4) ── */}
      <section className="home-section">
        <div className="section-header-row">
          <h3 className="section-heading">Browse Categories</h3>
          <button
            type="button"
            className="see-all-btn"
            onClick={() => setIsCatModalOpen(true)}
          >
            See All
          </button>
        </div>

        {/* Circular Avatar List */}
        <div className="circle-cats-scroll">
          {allCategories.map((cat) => (
            <div
              key={cat.id}
              className="circle-cat-item"
              onClick={() => {
                if (['vegetables', 'fruits', 'leafy', 'flowers', 'pickles', 'groceries'].includes(cat.id)) {
                  navigate('/store/localfresh');
                } else {
                  navigate('/store/1');
                }
              }}
            >
              <div className="circle-cat-avatar" style={{ background: cat.bg }}>
                <span>{cat.icon}</span>
              </div>
              <span className="circle-cat-label">{cat.name.split(' ')[0]}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Neighborhood Stores (LocalFresh Included as FIRST Store) ── */}
      <section className="home-section">
        <div className="section-header-row store-header-with-toggle">
          <div>
            <h3 className="section-heading">Stores in Your Locality</h3>
            <p className="section-subheading">Nearby stores deliver in 20 mins • Direct Mandi within 2 hrs</p>
          </div>

          {/* 2-Kind View Switcher: Grid View vs Compact View (Requested) */}
          <div className="store-view-toggle-pill">
            <button
              type="button"
              className={`store-vt-btn ${storeViewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setStoreViewMode('grid')}
              title="Grid View (Cards)"
              aria-label="Switch to Grid View"
            >
              <LayoutGrid size={15} />
              <span>Grid</span>
            </button>
            <button
              type="button"
              className={`store-vt-btn ${storeViewMode === 'compact' ? 'active' : ''}`}
              onClick={() => setStoreViewMode('compact')}
              title="Compact View (Dense Rows)"
              aria-label="Switch to Compact View"
            >
              <Rows3 size={15} />
              <span>Compact</span>
            </button>
          </div>
        </div>

        {/* Store Filter Tabs */}
        <div className="trending-filter-tabs">
          {storeFilters.map((flt) => (
            <button
              key={flt.id}
              type="button"
              className={`t-filter-pill ${activeStoreFilter === flt.id ? 'active' : ''}`}
              onClick={() => setActiveStoreFilter(flt.id)}
            >
              {flt.label}
            </button>
          ))}
        </div>

        {/* Stores List with View Mode */}
        <div className={`stores-list-container view-${storeViewMode}`}>
          {filteredStores.map((store) => (
            <StoreCard key={store.id} store={store} layout={storeViewMode} />
          ))}
        </div>
      </section>

      {/* Categories Full Modal */}
      <CategoriesModal
        isOpen={isCatModalOpen}
        onClose={() => setIsCatModalOpen(false)}
        onSelectCategory={(catName) => {
          if (['Vegetables', 'Fruits', 'Leafy Green', 'Flowers', 'Pickles', 'Groceries'].includes(catName)) {
            navigate('/store/localfresh');
          } else {
            navigate('/store/1');
          }
        }}
      />

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          storeId={1}
          storeName="Sharma General Store"
          onClose={() => setSelectedProduct(null)}
        />
      )}

      {/* Auth Modal for User & Seller Sign Up */}
      <AuthModal
        isOpen={Boolean(authModalMode)}
        initialMode={authModalMode || 'user-signup'}
        onClose={() => setAuthModalMode(null)}
        onSuccess={(type) => {
          setAuthModalMode(null);
          if (type === 'seller') navigate('/seller/dashboard');
        }}
      />
    </div>
  );
}
