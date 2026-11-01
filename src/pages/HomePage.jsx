import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, ArrowUpRight, ChevronDown, MapPin, Search, ShoppingBag, UserRound,
  SlidersHorizontal
} from 'lucide-react';
import { allCategories } from '../data/stores';
import { ANDHRA_RECIPE_BASKETS } from '../data/recipeBaskets';
import { getStoresForArea, FREE_DELIVERY_THRESHOLD } from '../data/deliveryAreas';
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
  { id: 'all', label: 'All stores' },
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

  const areaStores = getStoresForArea(stores,userLocation);
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
      <header className="kp-concept-header">
        <div className="kp-concept-header-top">
          <button
            type="button"
            className="kp-concept-wordmark"
            aria-label="KiranaPRO home"
            onClick={() => navigate('/home')}
          >
            <span className="kp-concept-monogram">K.</span>
            <span>Kirana<span>PRO</span></span>
          </button>
          <div className="kp-concept-header-actions">
            <button
              type="button"
              className={`kp-concept-header-icon ${seniorMode ? 'is-senior' : ''}`}
              onClick={() => setSeniorMode(s => !s)}
              title="Senior Citizen / Amma-Nanna Easy Read Mode (A+)"
              aria-label="Toggle Senior Citizen Easy Read Mode"
              style={{ fontWeight: 850, fontSize: '13px', color: seniorMode ? '#FFD166' : undefined }}
            >
              A+
            </button>
            <button
              type="button"
              className="kp-concept-header-icon"
              onClick={() => authSession.isAuthenticated ? navigate('/profile') : setAuthMode('login')}
              aria-label={authSession.isAuthenticated ? 'Open account' : 'Log in'}
            >
              <UserRound size={18} strokeWidth={1.9} />
            </button>
            <button type="button" className="kp-concept-header-icon kp-concept-cart" onClick={() => navigate('/cart')} aria-label={`Cart with ${totalItems} items`}>
              <ShoppingBag size={19} strokeWidth={1.9} />
              {totalItems > 0 && <span>{totalItems}</span>}
            </button>
          </div>
        </div>

        <button type="button" className="kp-concept-location" onClick={() => setIsMapOpen(true)}>
          <span className="kp-concept-pin"><MapPin size={17} strokeWidth={2} /></span>
          <span className="kp-concept-location-label">Delivering to <strong>{userLocation || 'Choose your delivery area'}</strong></span>
          <ChevronDown size={16} aria-hidden="true" />
        </button>
      </header>

      <div className="kp-concept-search-line">
        <div className="kp-search-bar-wrap">
          <button
            type="button"
            className="kp-concept-search"
            onClick={() => navigate('/search')}
            aria-label="Search all groceries, vegetables and stores"
          >
            <Search size={18} aria-hidden="true" className="kp-concept-search-icon" />
            <span className="kp-concept-search-text">Search 189+ groceries, direct mandi produce & stores...</span>
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

        {/* Resized KiranaCoins Banner on the right side of the search bar, in the same line */}
        <button
          type="button"
          className={`kp-kiranacoins-banner ${passActive ? 'is-vip' : ''}`}
          onClick={togglePass}
          title="KiranaPRO Pass VIP Member & KiranaCoins"
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

      <section className="kp-concept-feature" aria-label="Current delivery and basket offers">
        <HomeOffersCarousel stores={areaStores} catalog={products}
          navigate={navigate} area={userLocation} totalItems={totalItems} orderCount={orderCount} />
      </section>

      <section className="kp-concept-stores" aria-labelledby="kp-concept-stores-title">
        <div className="kp-concept-section-heading kp-concept-stores-heading">
          <div className="kp-concept-heading-copy">
            <h2 id="kp-concept-stores-title">Stores in {userLocation}</h2>
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

      {/* ── What to Cook Today Recipe Baskets Banner (Redirects to /recipes) ── */}
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
