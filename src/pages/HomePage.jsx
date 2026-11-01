import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, ArrowUpRight, ChevronDown, ChevronLeft, ChevronRight,
  MapPin, Menu, Search, ShoppingBag, UserRound, SlidersHorizontal
} from 'lucide-react';
import { allCategories } from '../data/stores';
import { ANDHRA_RECIPE_BASKETS } from '../data/recipeBaskets';
import { getStoresForArea, FREE_DELIVERY_THRESHOLD, isLocalFreshStore } from '../data/deliveryAreas';
import { useStore } from '../context/StoreContext';
import { useCart } from '../context/CartContext';
import { useSecurity } from '../context/SecurityContext';
import { useCustomerOrders } from '../context/OrderHistoryContext';
import StoreCard from '../components/StoreCard';
import { HomeOffersCarousel } from '../components/StoreOffersCarousel';
import CategoriesModal from '../components/CategoriesModal';
import ParchiScannerModal from '../components/ParchiScannerModal';
import VizagZoneMapModal from '../components/VizagZoneMapModal';
import { MANDI_SAVER_COMBOS, isEveningClearanceActive } from '../utils/mandiClearanceAndGrades';
import AuthModal from '../components/AuthModal';

const storeFilters = [
  { id: 'all', label: 'All' },
  { id: 'fast', label: 'Fast delivery' },
  { id: 'rated', label: 'Top rated' },
];

export default function HomePage({ userLocation, onLocationChange }) {
  const navigate = useNavigate();
  const { stores, products } = useStore();
  const { totalItems, addItem } = useCart();
  const { orderCount } = useCustomerOrders();
  const { authSession } = useSecurity();
  const [activeFilter, setActiveFilter] = useState('all');
  const [authMode, setAuthMode] = useState(null);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [seniorMode, setSeniorMode] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isParchiOpen, setIsParchiOpen] = useState(false);
  const [passActive, setPassActive] = useState(() => {
    try {
      return localStorage.getItem('kiranapro_pass') !== 'inactive';
    } catch {
      return true;
    }
  });

  const togglePass = () => {
    setPassActive(prev => {
      const next = !prev;
      try { localStorage.setItem('kiranapro_pass', next ? 'active' : 'inactive'); } catch {}
      return next;
    });
  };

  const areaStores = getStoresForArea(stores, userLocation);
  const filteredStores = areaStores.filter(store => {
    if (activeFilter === 'fast') return /15|20|30/.test(store.deliveryTime || '');
    if (activeFilter === 'rated') return Number(store.rating) >= 4.7;
    return true;
  });

  const openCategory = (categoryName) => {
    setCategoriesOpen(false);
    const preferred = areaStores.find(store =>
      String(store.id).toLowerCase() === 'localfresh' && (store.categories?.includes(categoryName) || (categoryName === 'Exotic & Seasonal' && store.categories?.includes('Fresh Produce')))
    );
    const match = preferred || areaStores.find(store => store.categories?.includes(categoryName));
    if (match) {
      navigate(`/store/${match.id}`, { state: { category: categoryName } });
    } else {
      navigate('/search');
    }
  };

  return (
    <div className={`home-container kp-home kp-concept ${seniorMode ? "kp-senior-mode" : ""}`}>
      {/* ── Instacart Clean White Navbar ── */}
      <header className="kp-concept-header">
        <div className="kp-concept-header-top">
          <div className="kp-instacart-brand-wrap">
            <button
              type="button"
              className="kp-instacart-menu-btn"
              onClick={() => setCategoriesOpen(true)}
              aria-label="Open categories menu"
              title="Shop by Category"
            >
              <Menu size={22} />
            </button>
            <button
              type="button"
              className="kp-concept-wordmark"
              aria-label="KiranaPRO home"
              onClick={() => navigate('/home')}
            >
              <span className="kp-instacart-carrot-icon" aria-hidden="true">🥕</span>
              <span>kirana<span>pro</span></span>
            </button>
          </div>

          <button type="button" className="kp-concept-location" onClick={() => setIsMapOpen(true)} title="Change delivery neighborhood">
            <span className="kp-concept-pin"><MapPin size={16} strokeWidth={2.2} /></span>
            <span className="kp-concept-location-label">Delivering to <strong>{userLocation || 'Choose delivery area'}</strong></span>
            <ChevronDown size={15} aria-hidden="true" />
          </button>

          <div className="kp-concept-header-actions">
            <button
              type="button"
              className={`kp-concept-header-icon ${seniorMode ? 'is-senior' : ''}`}
              onClick={() => setSeniorMode(s => !s)}
              title="Senior Citizen / Easy Read Mode (A+)"
              aria-label="Toggle Senior Citizen Easy Read Mode"
              style={{ fontWeight: 850, fontSize: '13px' }}
            >
              A+
            </button>
            {authSession?.isAuthenticated ? (
              <button
                type="button"
                className="kp-concept-header-icon"
                onClick={() => navigate('/profile')}
                aria-label="Open account"
              >
                <UserRound size={18} strokeWidth={2} />
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className="kp-instacart-login-btn"
                  onClick={() => setAuthMode('login')}
                >
                  Log in
                </button>
                <button
                  type="button"
                  className="kp-instacart-signup-btn"
                  onClick={() => setAuthMode('signup')}
                >
                  Sign up
                </button>
              </>
            )}
            <button
              type="button"
              className="kp-concept-header-icon kp-concept-cart"
              onClick={() => navigate('/cart')}
              aria-label={`Cart with ${totalItems} items`}
            >
              <ShoppingBag size={18} strokeWidth={2} />
              {totalItems > 0 && <span>{totalItems}</span>}
            </button>
          </div>
        </div>
      </header>

      {/* ── Search Bar Line with KiranaCoins VIP Button ── */}
      <div className="kp-concept-search-line">
        <div className="kp-search-bar-wrap">
          <button
            type="button"
            className="kp-concept-search"
            onClick={() => navigate('/search')}
            aria-label="Search all groceries, vegetables and stores"
          >
            <Search size={18} aria-hidden="true" className="kp-concept-search-icon" />
            <span className="kp-concept-search-text">Search products and stores...</span>
            <span className="kp-concept-search-arrow"><ArrowRight size={16} aria-hidden="true" /></span>
          </button>
          <button
            type="button"
            className="kp-scan-parchi-inline-btn"
            onClick={() => setIsParchiOpen(true)}
            title="Snap or Paste Paper Grocery List"
            aria-label="Scan Paper Grocery List"
          >
            <span aria-hidden="true">📝</span>
            <span className="kp-parchi-text">Parchi</span>
          </button>
        </div>

        {/* KiranaCoins VIP Button (Preserved on the right side of the search bar, in the same line) */}
        <button
          type="button"
          className={`kp-kiranacoins-banner ${passActive ? 'is-vip' : ''}`}
          onClick={togglePass}
          title="KiranaCoins VIP Member & Rewards"
          aria-label={`KiranaCoins: 140 Coins. ${passActive ? 'VIP Active' : 'Activate VIP Pass'}`}
        >
          <div className="kp-kc-coin-wrap">
            <span className="kp-kc-coin-icon">🪙</span>
          </div>
          <div className="kp-kc-info">
            <div className="kp-kc-top">
              <span className="kp-kc-name">KiranaCoins</span>
              <span className="kp-kc-badge">{passActive ? 'VIP' : '140'}</span>
            </div>
            <span className="kp-kc-sub">
              {passActive ? '✓ VIP Active' : 'Worth ₹140'}
            </span>
          </div>
        </button>
      </div>

      {passActive && (
        <div className="kp-pass-active-strip">
          <span>⭐ <strong>KiranaPRO Pass Active:</strong> ₹0 Free Delivery &bull; 5% Coins Cashback unlocked!</span>
          <button type="button" className="kp-pass-strip-close" onClick={togglePass} title="Manage Pass">Manage</button>
        </div>
      )}

      {/* ── Instacart Deep Forest Green Hero Banner ── */}
      <section className="kp-instacart-hero-section" aria-label="Instacart Grocery Delivery">
        <div className="kp-instacart-hero-card">
          <div className="kp-instacart-hero-left">
            <h1 className="kp-instacart-hero-title">
              Order groceries for delivery or pickup today
            </h1>
            <div className="kp-instacart-hero-action">
              <button
                type="button"
                className="kp-instacart-hero-cta-btn"
                onClick={() => navigate('/store/localfresh')}
              >
                Sign up to get 40% off (up to ₹150)
              </button>
            </div>
            <p className="kp-instacart-hero-subtext">
              2 orders in 14 days · 20% on first mandi cart · Fast delivery in 20–30 mins
            </p>
          </div>
          <div className="kp-instacart-hero-right">
            <div className="kp-instacart-hero-media-wrap">
              <img
                src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=720&q=80"
                alt="Fresh produce and grocery ingredients"
                className="kp-instacart-hero-img"
                loading="eager"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── "Shop by category" (Preserved as requested) ── */}
      <section className="kp-concept-categories kp-concept-compact-categories kp-neu-categories-section" aria-labelledby="kp-concept-categories-title">
        <div className="kp-concept-section-heading">
          <div className="kp-concept-heading-copy">
            <h2 id="kp-concept-categories-title">Shop by category</h2>
          </div>
          <button className="kp-concept-link" type="button" onClick={() => setCategoriesOpen(true)}>
            View all <ArrowUpRight size={16} aria-hidden="true" />
          </button>
        </div>
        <div className="kp-neu-circular-grid" aria-label="Swipe through shopping categories" tabIndex={0} role="list">
          {allCategories.slice(0, 10).map(category => (
            <button
              key={category.id}
              className="kp-neu-circle-card"
              type="button"
              onClick={() => openCategory(category.name)}
              aria-label={`Shop ${category.name}`}
            >
              <div className="kp-neu-circle-bubble" aria-hidden="true">
                {category.icon}
              </div>
              <span className="kp-neu-circle-label">{category.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ── "Stores to help you save" & HomeOffersCarousel ── */}
      <section className="kp-concept-feature" aria-label="Current delivery and basket offers">
        <div className="kp-insta-save-rail-section">
          <div className="kp-insta-rail-header">
            <h2 className="kp-insta-rail-title">Stores to help you save</h2>
            <div className="kp-insta-rail-arrows">
              <button
                type="button"
                className="kp-insta-arrow-btn"
                aria-label="Scroll left"
                onClick={() => {
                  const el = document.getElementById('kp-insta-store-tiles');
                  if (el) el.scrollBy({ left: -240, behavior: 'smooth' });
                }}
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                className="kp-insta-arrow-btn"
                aria-label="Scroll right"
                onClick={() => {
                  const el = document.getElementById('kp-insta-store-tiles');
                  if (el) el.scrollBy({ left: 240, behavior: 'smooth' });
                }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
          <div id="kp-insta-store-tiles" className="kp-insta-store-tile-track">
            {areaStores.map(store => {
              const bg = isLocalFreshStore(store) ? '#108910'
                : store.id.includes('siripuram') ? '#DC2626'
                : store.id.includes('balaji') ? '#2563EB'
                : store.id.includes('vijaya') ? '#7C3AED'
                : '#374151';
              return (
                <button
                  key={store.id}
                  type="button"
                  className="kp-insta-store-tile"
                  onClick={() => navigate(`/store/${store.id}`)}
                >
                  <div className="kp-insta-store-badge-card" style={{ background: bg, color: '#FFFFFF' }}>
                    {store.name.charAt(0)}
                  </div>
                  <span className="kp-insta-store-tile-name">{store.name}</span>
                  <span className="kp-insta-store-tile-eta">{store.deliveryTime || '20-30 mins'}</span>
                  <span className="kp-insta-deal-tag">
                    {isLocalFreshStore(store) ? 'Mandi Direct' : 'No markups'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <HomeOffersCarousel stores={areaStores} catalog={products}
          navigate={navigate} area={userLocation} totalItems={totalItems} orderCount={orderCount} />
      </section>

      {/* ── "All stores in [Location]" ── */}
      <section className="kp-concept-stores" aria-labelledby="kp-concept-stores-title">
        <div className="kp-concept-section-heading kp-concept-stores-heading">
          <div className="kp-concept-heading-copy">
            <h2 id="kp-concept-stores-title">
              Stores in <span className="kp-instacart-location-name" onClick={() => setIsMapOpen(true)}>{userLocation}</span>
            </h2>
          </div>
          <span className="kp-concept-count">{filteredStores.length} stores</span>
        </div>
        <div className="kp-concept-filters" role="group" aria-label="Filter local stores">
          <SlidersHorizontal size={17} aria-hidden="true" />
          {storeFilters.map(filter => (
            <button
              key={filter.id}
              type="button"
              className={activeFilter === filter.id ? 'is-active' : ''}
              aria-pressed={activeFilter === filter.id}
              onClick={() => setActiveFilter(filter.id)}
            >
              {filter.label}
            </button>
          ))}
        </div>
        <p className="kp-zone-list-note">LocalFresh serves all areas. Sample stores are previews and cannot accept orders yet.</p>
        {filteredStores.length ? (
          <div className="kp-concept-store-grid">
            {filteredStores.map(store => <StoreCard key={store.id} store={store} />)}
          </div>
        ) : (
          <div className="kp-concept-empty">
            <p>No stores match this filter.</p>
            <button type="button" onClick={() => setActiveFilter('all')}>See all stores <ArrowRight size={16} /></button>
          </div>
        )}
      </section>

      {/* ── 🍲 WHAT TO COOK TODAY 1-TAP MEAL KITS (Preserved as requested) ── */}
      <section className="kp-recipe-banner-section" aria-label="What to Cook Today Andhra Recipe Baskets">
        <div
          className="kp-recipe-hero-banner"
          onClick={() => navigate('/recipes')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && navigate('/recipes')}
          title="Explore What to Cook Today Recipe Baskets"
        >
          <div className="kp-recipe-banner-left">
            <div className="kp-recipe-banner-tags">
              <span className="kp-recipe-tag-pill">🍲 WHAT TO COOK TODAY</span>
              <span className="kp-recipe-tag-sub">1-TAP MEAL KITS</span>
            </div>
            <h2 className="kp-recipe-banner-headline">
              What to Cook Today? Fresh Mandi Recipe Kits
            </h2>
            <p className="kp-recipe-banner-subtext">
              Gutti Vankaya, Pesarattu, Pappu Charu & more. Pre-portioned fresh ingredients delivered in 20–30 mins.
            </p>
            <div className="kp-recipe-cta-wrap">
              <span className="kp-recipe-cta-button">
                Explore Recipe Kits <ArrowRight size={15} />
              </span>
              <span className="kp-recipe-meta-text">6 Authentic Andhra Dishes</span>
            </div>
          </div>
          <div className="kp-recipe-banner-right">
            <div className="kp-recipe-badge-bubble">
              <span className="kp-recipe-bubble-emoji">🍆</span>
              <span className="kp-recipe-bubble-label">Gutti Vankaya</span>
            </div>
            <div className="kp-recipe-badge-bubble secondary">
              <span className="kp-recipe-bubble-emoji">🥞</span>
              <span className="kp-recipe-bubble-label">Pesarattu Kit</span>
            </div>
          </div>
        </div>
      </section>

      <div className="kp-concept-footer">
        <span>KiranaPRO</span>
      </div>

      <CategoriesModal isOpen={categoriesOpen} onClose={() => setCategoriesOpen(false)} onSelectCategory={openCategory} />
      <AuthModal isOpen={Boolean(authMode)} initialMode={authMode || 'login'} onClose={() => setAuthMode(null)} />
      {isMapOpen && <VizagZoneMapModal
        currentArea={userLocation}
        onSelectArea={area => { onLocationChange?.(area); setIsMapOpen(false); }}
        onClose={() => setIsMapOpen(false)}
      />}
      {isParchiOpen && <ParchiScannerModal
        catalog={Object.values(products || {}).flatMap(list =>
          Array.isArray(list) ? list.filter(item => String(item?.id || '').startsWith('lf-')) : [])}
        onClose={() => setIsParchiOpen(false)}
      />}
    </div>
  );
}
