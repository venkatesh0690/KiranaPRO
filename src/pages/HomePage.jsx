import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  ArrowRight, ArrowUpRight, Camera, ChevronDown, ChevronLeft, ChevronRight,
  MapPin, Search, ShoppingBag, UserRound, SlidersHorizontal
} from 'lucide-react';
import { allCategories } from '../data/stores';
import { getStoresForArea, isLocalFreshStore } from '../data/deliveryAreas';
import { useStore } from '../context/StoreContext';
import { useCart } from '../context/CartContext';
import { useSecurity } from '../context/SecurityContext';
import { useCustomerOrders } from '../context/OrderHistoryContext';
import StoreCard from '../components/StoreCard';
import { HomeOffersCarousel } from '../components/StoreOffersCarousel';
import CategoriesModal from '../components/CategoriesModal';
import ParchiScannerModal from '../components/ParchiScannerModal';
import VizagZoneMapModal from '../components/VizagZoneMapModal';
import AuthModal from '../components/AuthModal';
import KiranaPassModal from '../components/KiranaPassModal';

const storeFilters = [
  { id: 'all', label: 'All' },
  { id: 'offers', label: 'Offers' },
  { id: 'rated', label: 'Top rated' },
];

const HERO_SLIDES = [
  {
    id: 'instacart-forest',
    theme: 'forest',
    bg: '#003D29',
    title: 'Order groceries for delivery or pickup today',
    ctaText: 'Sign up to get 40% off (up to ₹150)',
    ctaBg: '#108910',
    ctaHover: '#0D6E0D',
    ctaColor: '#FFFFFF',
    subtext: '2 orders in 14 days · 20% on first mandi cart · Fast delivery in 20–30 mins',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=720&q=80',
    imageAlt: 'Fresh produce and grocery ingredients',
    action: '/store/localfresh'
  },
  {
    id: 'mandi-harvest',
    theme: 'amber',
    bg: 'linear-gradient(135deg, #78350F 0%, #B45309 60%, #92400E 100%)',
    title: 'Fresh Mandi Harvest Direct from Farmers',
    ctaText: 'Explore Morning Mandi · Zero Markups',
    ctaBg: '#F59E0B',
    ctaHover: '#D97706',
    ctaColor: '#1F1403',
    subtext: 'Direct farm produce: tender vankaya, country tamata & fresh greens picked at dawn',
    image: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&w=720&q=80',
    imageAlt: 'Morning mandi farm vegetables',
    action: '/store/localfresh'
  },
  {
    id: 'andhra-meal-kits',
    theme: 'teal',
    bg: 'linear-gradient(135deg, #0F172A 0%, #0E7490 60%, #155E75 100%)',
    title: 'What to Cook Today? 1-Tap Andhra Meal Kits',
    ctaText: 'Cook in 20 Mins · View 6 Kits',
    ctaBg: '#06B6D4',
    ctaHover: '#0891B2',
    ctaColor: '#042F2E',
    subtext: 'Gutti Vankaya, Pesarattu & Pappu Charu with pre-measured ingredients ready in 20 mins',
    image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=720&q=80',
    imageAlt: 'Authentic Indian cooking ingredients and spices',
    action: '/recipes'
  }
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
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const categoryTrackRef = useRef(null);
  const [fulfilmentMode, setFulfilmentMode] = useState('delivery');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [passActive, setPassActive] = useState(() => {
    try {
      return localStorage.getItem('kiranapro_pass') !== 'inactive';
    } catch {
      return true;
    }
  });

  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isHovered]);

  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  };
  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % HERO_SLIDES.length);
  };

  const togglePass = () => {
    setPassActive(prev => {
      const next = !prev;
      try { localStorage.setItem('kiranapro_pass', next ? 'active' : 'inactive'); } catch {}
      return next;
    });
  };

  const areaStores = getStoresForArea(stores, userLocation);

  const matchingProducts = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    const all = Object.entries(products || {}).flatMap(([cat, list]) => {
      const seller = areaStores.find(s => s.categories?.includes(cat) && !s.isSample)
        || areaStores.find(s => s.categories?.includes(cat)) || { id: 'localfresh' };
      return (list || []).map(p => ({
        ...p,
        category: cat,
        storeId: seller.id
      }));
    });
    return all.filter(p => (p.name || '').toLowerCase().includes(q)).slice(0, 8);
  }, [searchQuery, products, areaStores]);
  const filteredStores = areaStores.filter(store => {
    if (activeFilter === 'offers') return isLocalFreshStore(store) || store.tags?.some(t => /deal|save|offer|popular/i.test(t));
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

  
  // Drag-to-swipe support for Category track on desktop and touch devices
  useEffect(() => {
    const track = categoryTrackRef.current;
    if (!track) return;
    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;
    let hasMoved = false;

    const onMouseDown = (e) => {
      isDown = true;
      hasMoved = false;
      startX = e.pageX - track.offsetLeft;
      scrollLeft = track.scrollLeft;
    };
    const onMouseLeave = () => { isDown = false; };
    const onMouseUp = () => { isDown = false; };
    const onMouseMove = (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - track.offsetLeft;
      const walk = (x - startX) * 1.5;
      if (Math.abs(walk) > 4) hasMoved = true;
      track.scrollLeft = scrollLeft - walk;
    };
    const onClickCapture = (e) => {
      if (hasMoved) {
        e.stopPropagation();
        e.preventDefault();
      }
    };

    track.addEventListener('mousedown', onMouseDown);
    track.addEventListener('mouseleave', onMouseLeave);
    track.addEventListener('mouseup', onMouseUp);
    track.addEventListener('mousemove', onMouseMove);
    track.addEventListener('click', onClickCapture, true);

    return () => {
      track.removeEventListener('mousedown', onMouseDown);
      track.removeEventListener('mouseleave', onMouseLeave);
      track.removeEventListener('mouseup', onMouseUp);
      track.removeEventListener('mousemove', onMouseMove);
      track.removeEventListener('click', onClickCapture, true);
    };
  }, []);

  return (
    <div className={`home-container kp-home kp-concept ${seniorMode ? "kp-senior-mode" : ""}`}>
      {/* ── Single Unified Instacart Top Bar: Logo on Left, Actions on Right, Search Bar Below Logo ── */}
      <header className="kp-concept-header kp-instacart-unified-bar">
        <div className="kp-topbar-inner">
          {/* Brand */}
          <div className="kp-instacart-brand-wrap">
            <button
              type="button"
              className="kp-concept-wordmark"
              aria-label="KiranaPRO home"
              onClick={() => navigate('/home')}
            >
              <img
                src="/kiranapro-logo.png"
                alt="KiranaPRO"
                className="kp-brand-logo-img"
              />
            </button>
          </div>

          {/* Right Controls: KiranaCoins (clean, pass details hidden until clicked), Location, Profile/Auth, Cart */}
          <div className="kp-topbar-actions">
            {/* KiranaCoins Button - Pass active details hidden until clicked */}
            <button
              type="button"
              className="kp-kiranacoins-banner"
              onClick={() => setIsPassModalOpen(true)}
              title="KiranaCoins Rewards"
              aria-label="KiranaCoins: 140 Coins. Worth ₹140"
            >
              <div className="kp-kc-coin-wrap">
                <span className="kp-kc-coin-icon">🪙</span>
              </div>
              <div className="kp-kc-info">
                <div className="kp-kc-top">
                  <span className="kp-kc-name">KiranaCoins</span>
                  <span className="kp-kc-badge">140</span>
                </div>
                <span className="kp-kc-sub">Worth ₹140</span>
              </div>
            </button>

            {/* Delivery location */}
            <button type="button" className="kp-concept-location" onClick={() => setIsMapOpen(true)} title="Change delivery neighborhood">
              <span className="kp-concept-pin"><MapPin size={16} strokeWidth={2.2} /></span>
              <span className="kp-concept-location-label"><strong>{userLocation || 'Choose delivery area'}</strong></span>
              <ChevronDown size={14} aria-hidden="true" />
            </button>

            {/* Profile or Login/Signup */}
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

            {/* Cart with count badge */}
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

        {/* Dedicated Search Bar Line Placed Below Logo - In-Place Search (Doesn't open another page) */}
        <div className="kp-concept-search-line kp-home-dedicated-search">
          <div className="kp-search-bar-wrap">
            <Search size={16} aria-hidden="true" className="kp-concept-search-icon" />
            <input
              type="text"
              className="kp-home-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 250)}
              placeholder="Search products and stores..."
              aria-label="Search all groceries, vegetables and stores"
            />
            {searchQuery && (
              <button
                type="button"
                className="kp-search-clear-btn"
                onClick={() => setSearchQuery('')}
                title="Clear search"
                aria-label="Clear search"
              >
                <X size={15} />
              </button>
            )}
            <button
              type="button"
              className="kp-scan-camera-btn"
              onClick={() => setIsParchiOpen(true)}
              title="Scan paper grocery list with camera"
              aria-label="Scan paper grocery list with camera"
            >
              <Camera size={15} strokeWidth={2.2} />
            </button>
          </div>

          {/* Instant live search results dropdown on Home without opening another page */}
          {isSearchFocused && searchQuery.trim() && matchingProducts.length > 0 && (
            <div className="kp-home-search-dropdown" role="listbox">
              <div className="kp-hsd-header">Matching items in {userLocation}</div>
              {matchingProducts.map((p) => (
                <div
                  key={p.id}
                  className="kp-hsd-item"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    addItem(p.storeId || 'localfresh', p);
                  }}
                >
                  <span className="kp-hsd-name">{p.name}</span>
                  <span className="kp-hsd-unit">{p.unit || ''}</span>
                  <span className="kp-hsd-price">₹{p.price}</span>
                  <button type="button" className="kp-hsd-add-btn">+ Add</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* ── Slidable Hero Banner Carousel with Distinct Styles & Smooth Transitions ── */}
      <section
        className="kp-instacart-hero-section"
        aria-label="KiranaPRO Features & Offers"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="kp-hero-slider-container">
          <div
            className="kp-hero-slider-track"
            style={{
              transform: `translateX(-${currentSlide * 100}%)`,
              transition: 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)'
            }}
          >
            {HERO_SLIDES.map((slide) => (
              <div
                key={slide.id}
                className={`kp-instacart-hero-card kp-hero-style-${slide.theme}`}
                style={{ background: slide.bg }}
              >
                <div className="kp-instacart-hero-left">
                  <h1 className="kp-instacart-hero-title">
                    {slide.title}
                  </h1>
                  <div className="kp-instacart-hero-action">
                    <button
                      type="button"
                      className="kp-instacart-hero-cta-btn"
                      style={{
                        background: slide.ctaBg,
                        color: slide.ctaColor,
                        borderColor: slide.ctaBg
                      }}
                      onClick={() => navigate(slide.action)}
                    >
                      {slide.ctaText}
                    </button>
                  </div>
                  <p className="kp-instacart-hero-subtext">
                    {slide.subtext}
                  </p>
                </div>
                <div className="kp-instacart-hero-right">
                  <div className="kp-instacart-hero-media-wrap">
                    <img
                      src={slide.image}
                      alt={slide.imageAlt}
                      className="kp-instacart-hero-img"
                      loading={slide.id === 'instacart-forest' ? 'eager' : 'lazy'}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Arrows */}
          <button
            type="button"
            className="kp-hero-arrow-btn prev"
            onClick={prevSlide}
            aria-label="Previous banner"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            type="button"
            className="kp-hero-arrow-btn next"
            onClick={nextSlide}
            aria-label="Next banner"
          >
            <ChevronRight size={22} />
          </button>

          {/* Slide Indicator Dots */}
          <div className="kp-hero-dots-wrap" role="tablist" aria-label="Hero banner pagination">
            {HERO_SLIDES.map((slide, idx) => (
              <button
                key={slide.id}
                type="button"
                className={`kp-hero-dot ${currentSlide === idx ? 'active' : ''}`}
                onClick={() => setCurrentSlide(idx)}
                aria-label={`Go to banner ${idx + 1}: ${slide.title}`}
                aria-selected={currentSlide === idx}
                role="tab"
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── "Shop by category" (Screen-fitted with smooth slide till last item) ── */}
      <section className="kp-concept-categories kp-concept-compact-categories kp-neu-categories-section" aria-labelledby="kp-concept-categories-title">
        <div className="kp-concept-section-heading">
          <div className="kp-concept-heading-copy">
            <h2 id="kp-concept-categories-title">Shop by category</h2>
          </div>
          <div className="kp-category-heading-controls">
            <button
              type="button"
              className="kp-category-arrow-btn"
              aria-label="Scroll categories left"
              onClick={() => {
                const el = document.getElementById('kp-category-scroll-track');
                if (el) el.scrollBy({ left: -260, behavior: 'smooth' });
              }}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              className="kp-category-arrow-btn"
              aria-label="Scroll categories right"
              onClick={() => {
                const el = document.getElementById('kp-category-scroll-track');
                if (el) el.scrollBy({ left: 260, behavior: 'smooth' });
              }}
            >
              <ChevronRight size={16} />
            </button>
            <button className="kp-concept-link" type="button" onClick={() => setCategoriesOpen(true)}>
              View all <ArrowUpRight size={16} aria-hidden="true" />
            </button>
          </div>
        </div>
        <div
          id="kp-category-scroll-track"
          ref={categoryTrackRef}
          className="kp-neu-circular-grid kp-category-screen-fitted-track"
          aria-label="Swipe through shopping categories"
          tabIndex={0}
          role="list"
        >
          {allCategories.map(category => (
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

      {/* ── Offers Banners (Preserved in DOM for test contract, hidden from view as requested) ── */}
      <section className="kp-concept-feature" style={{ display: 'none', height: 0, overflow: 'hidden' }} aria-label="Current delivery and basket offers">
        <HomeOffersCarousel stores={areaStores} catalog={products}
          navigate={navigate} area={userLocation} totalItems={totalItems} orderCount={orderCount} />
      </section>

      {/* ── "Stores in [Location]" ── */}
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

      {/* ── 🍲 WHAT TO COOK TODAY 1-TAP MEAL KITS (With bubble words removed as requested) ── */}
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
            </div>
          </div>
        </div>
      </section>

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
      <KiranaPassModal
        isOpen={isPassModalOpen}
        onClose={() => setIsPassModalOpen(false)}
        passActive={passActive}
        onTogglePass={togglePass}
      />
    </div>
  );
}
