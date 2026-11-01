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
            <span className="kp-concept-index">01 / EXPLORE</span>
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
            <span className="kp-concept-index">02 / YOUR MARKETPLACE</span>
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

      {/* ── 03 / App Features & Visual Banner Showcase (User Uploaded Graphics) ── */}
      <section className="kp-home-app-showcase" aria-labelledby="kp-has-title">
        <div className="kp-has-heading">
          <div>
            <span className="kp-concept-index">03 / WHY KIRANAPRO</span>
            <h2 id="kp-has-title">Fast. Fresh. Direct from Mandis & Local Kiranas</h2>
          </div>
          <span className="kp-has-sub">Visakhapatnam Hyperlocal Network</span>
        </div>
        <div className="kp-has-grid">
          <div className="kp-has-card">
            <div className="kp-has-img-wrap">
              <img src="/banners/fast-fresh-delivered.png" alt="Fast Fresh Delivered - KiranaPRO local delivery bag" loading="lazy" />
            </div>
            <div className="kp-has-content">
              <span className="kp-has-tag">⚡ 20–30 MIN DELIVERY</span>
              <h3 className="kp-has-title">Fast. Fresh. Delivered.</h3>
              <p className="kp-has-desc">Your daily groceries and vegetables delivered hot and fresh directly to your door, right on time.</p>
            </div>
          </div>
          <div className="kp-has-card">
            <div className="kp-has-img-wrap">
              <img src="/banners/fresh-grocery-bag.png" alt="Fresh Mandi Harvest Vegetables in Grocery Bag" loading="lazy" />
            </div>
            <div className="kp-has-content">
              <span className="kp-has-tag">🌾 DIRECT MANDI HARVEST</span>
              <h3 className="kp-has-title">100% Hand-Inspected Quality</h3>
              <p className="kp-has-desc">Freshly harvested daily produce sourced directly from farmers and mandis. Zero dark-store surge pricing.</p>
            </div>
          </div>
          <div className="kp-has-card">
            <div className="kp-has-img-wrap">
              <img src="/banners/express-delivery-30min.png" alt="30-Minute Grocery Delivery partner emerging from mobile phone" loading="lazy" />
            </div>
            <div className="kp-has-content">
              <span className="kp-has-tag">🛵 IN-HOUSE FLEET</span>
              <h3 className="kp-has-title">30-Minute Express Delivery</h3>
              <p className="kp-has-desc">Doorstep Cash on Delivery (COD) with PIN verification and instant item inspection before paying.</p>
            </div>
          </div>
        </div>
      </section>

{/* ── 05 / 1-Tap Andhra Recipe Baskets (Phase 18 Prompt 18.1) ── */}
      <section className="kp-home-app-showcase" style={{ marginTop: '20px' }} aria-labelledby="kp-recipes-title">
        <div className="kp-has-heading">
          <div>
            <span className="kp-concept-index">05 / WHAT TO COOK TODAY</span>
            <h2 id="kp-recipes-title">1-Tap Andhra Recipe Baskets</h2>
          </div>
          <span className="kp-has-sub">Direct Mandi Meal Kits</span>
        </div>
        <div className="kp-recipe-grid">
          {ANDHRA_RECIPE_BASKETS.map(recipe => (
            <div key={recipe.id} className="kp-recipe-card">
              <div>
                <div className="kp-rc-head">
                  <span className="kp-rc-icon">{recipe.image}</span>
                  <span className="kp-rc-tag">{recipe.tag}</span>
                </div>
                <h3 className="kp-rc-title">{recipe.title}</h3>
                <div className="kp-rc-meta">⏱️ {recipe.time} · 👥 {recipe.servings}</div>
                <p style={{ fontSize: '11.5px', color: '#475569', lineHeight: 1.45, margin: '0 0 10px' }}>
                  {recipe.desc}
                </p>
                <div style={{ fontSize: '11px', color: '#64748B', marginBottom: '12px' }}>
                  Includes: {recipe.ingredients.map(i => i.name.split('(')[0].trim()).join(' · ')}
                </div>
              </div>
              <button
                type="button"
                className="kp-rc-btn"
                onClick={() => {
                  recipe.ingredients.forEach(it => {
                    addItem('localfresh', { id: it.id, name: it.name, price: it.price, mrp: it.price + 5, unit: it.unit });
                  });
                  navigate('/cart');
                }}
              >
                ⚡ Add Meal Kit to Basket (₹{recipe.ingredients.reduce((s, i) => s + i.price, 0)})
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ── 04 / My Monthly Kirana List (Phase 10 Prompt 10.2) ── */}
      <section className="kp-home-app-showcase" style={{ marginTop: '16px' }} aria-labelledby="kp-monthly-title">
        <div className="kp-has-heading">
          <div>
            <span className="kp-concept-index">04 / MONTHLY RATIONS</span>
            <h2 id="kp-monthly-title">My Household Kirana List</h2>
          </div>
          <span className="kp-has-sub">1-Tap Repeat Order</span>
        </div>
        <div style={{ background: '#FFFFFF', border: '1.5px solid #E2E8F0', borderRadius: '14px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <strong style={{ fontSize: '13.5px', color: '#0F172A', display: 'block' }}>Monthly Staples Pack (Dal, Rice, Oil, Spices)</strong>
            <span style={{ fontSize: '11.5px', color: '#64748B' }}>Save ₹140 vs Quick-Commerce dark stores · Fulfilled by neighborhood Kiranas</span>
          </div>
          <button
            type="button"
            style={{ padding: '8px 16px', background: '#166534', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '800', cursor: 'pointer' }}
            onClick={() => navigate('/store/localfresh')}
          >
            ⚡ Re-Order Basket (₹640)
          </button>
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
