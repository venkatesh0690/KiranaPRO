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

  const [activeStoreFilter, setActiveStoreFilter] = useState('all');
  const [storeViewMode, setStoreViewMode] = useState('grid'); // 'grid' | 'compact'
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);

  const storeFilters = [
    { id: 'all', label: 'All Stores' },
    { id: 'fast', label: '⚡ Fastest (20–30m)' },
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
      {/* ── Top App Bar (Curated from Uploaded Design Images 1, 2, 3) ── */}
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

            {/* Requirement: Just Show Sign up and log in button (No clutter) */}
            {!authSession.isAuthenticated ? (
              <div className="home-auth-clean-strip">
                <button
                  type="button"
                  className="home-clean-btn signup"
                  onClick={() => setAuthModalMode('signup')}
                  title="Create an account"
                >
                  <UserPlus size={13} />
                  <span>Sign Up</span>
                </button>
                <button
                  type="button"
                  className="home-clean-btn login"
                  onClick={() => setAuthModalMode('login')}
                  title="Sign in to your account"
                >
                  <LogIn size={13} />
                  <span>Log In</span>
                </button>
              </div>
            ) : (
              <div className="home-auth-clean-strip logged-in">
                <span className="home-logged-tag">
                  <User size={12} />
                  <span>{authSession.userName}</span>
                </span>
                <button
                  type="button"
                  className="home-clean-btn logout"
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
              onClick={() => alert('Nearby stores deliver in 20–30 mins! Mandi orders delivered in 2 hours.')}
              aria-label="Notifications"
            >
              <Bell size={20} />
              <span className="notif-dot" />
            </button>

            {/* Shopping Cart Button with Real-time Count Badge */}
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

        {/* Search bar with filter icon */}
        <div className="home-search-bar" onClick={() => navigate('/search')}>
          <Search size={18} color="var(--n400)" />
          <span className="search-placeholder">Search "onion, milk, bread, spices, ghee, dal..."</span>
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

      {/* ── AI Hero Poster (Requirement: Just mention, 20-30 mins delivery in the poster) ── */}
      <section className="home-ai-hero-poster">
        <div className="hero-poster-card">
          <div className="hero-poster-bg-img" />
          <div className="hero-poster-overlay" />

          <div className="hero-poster-content">
            {/* Explicit 20-30 mins delivery pill badge right on the poster */}
            <div className="hero-poster-pill">
              <Clock size={13} strokeWidth={2.5} />
              <span>20-30 mins delivery</span>
            </div>

            <h2 className="hero-poster-headline">
              Shop Smarter, Eat Better
            </h2>
            <p className="hero-poster-subtext">
              Fresh farm harvest & neighborhood kirana staples delivered right to your doorstep.
            </p>

            <div className="hero-poster-cta-row">
              <button
                type="button"
                className="hero-poster-cta"
                onClick={() => navigate('/store/localfresh')}
              >
                <span>Shop Now</span>
                <ArrowRight size={15} />
              </button>
              <span className="hero-poster-guarantee">
                <ShieldCheck size={14} color="#86EFAC" /> Sourced from Local Mandis
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Circular Categories Section (matching Image 1, 3, 4) ── */}
      <section className="home-section">
        <div className="section-header-row">
          <div>
            <h3 className="section-heading">Selected by Category</h3>
            <p className="section-subtext-light">Curated essentials from local stores</p>
          </div>
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

      {/* ── AI Seller Posters & Stores Catalog ── */}
      <section className="home-section">
        <div className="section-header-row store-header-with-toggle">
          <div>
            <h3 className="section-heading">Featured Sellers & Kirana Stores</h3>
            <p className="section-subheading">Verified neighborhood partners with live mandi stock</p>
          </div>

          {/* 2-Kind View Switcher: Grid View vs Compact View */}
          <div className="store-view-toggle-pill">
            <button
              type="button"
              className={`store-vt-btn ${storeViewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setStoreViewMode('grid')}
              title="Grid View (Poster Cards)"
              aria-label="Switch to Grid View"
            >
              <LayoutGrid size={15} />
              <span>Grid</span>
            </button>
            <button
              type="button"
              className={`store-vt-btn ${storeViewMode === 'compact' ? 'active' : ''}`}
              onClick={() => setStoreViewMode('compact')}
              title="Compact View (Dense List)"
              aria-label="Switch to Compact View"
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
          onClose={() => setSelectedProduct(null)}
        />
      )}

      {/* Categories Modal */}
      <CategoriesModal
        isOpen={isCatModalOpen}
        onClose={() => setIsCatModalOpen(false)}
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
