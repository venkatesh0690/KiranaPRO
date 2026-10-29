import { useState, useRef, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  Star,
  Clock,
  Bike,
  MapPin,
  Search,
  Info,
  Heart,
  Share2,
  ChevronDown,
  LayoutGrid,
  Rows3,
  ShoppingBag,
  X,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';
import { categoryMeta } from '../data/stores';
import { isStoreAvailableInArea, FREE_DELIVERY_THRESHOLD } from '../data/deliveryAreas';
import { navigateWithStoreTransition, storeImageTransitionName, storeTitleTransitionName } from '../utils/storeTransition';
import { useStore } from '../context/StoreContext';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';
import { StoreOffersCarousel } from '../components/StoreOffersCarousel';
import StorePhotoCarousel from '../components/StorePhotoCarousel';
import { getStoreGallery, getStoreImageFallback } from '../data/storeGallery';
import CartBar from '../components/CartBar';
import ProductDetailModal from '../components/ProductDetailModal';

export default function StorePage({ userLocation }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { stores, products: productsByCategory, orders } = useStore();
  const { totalItems } = useCart();
  const store = stores.find((s) => String(s.id).toLowerCase() === String(id).toLowerCase() && isStoreAvailableInArea(s,userLocation));

  const [activeCategory, setActiveCategory] = useState('');
  const [search, setSearch] = useState('');
  const [liked, setLiked] = useState(false);
  const [layoutMode, setLayoutMode] = useState('big'); // 'big' | 'small'
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [showStoreInfo, setShowStoreInfo] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const sectionRefs = useRef({});
  const productsScrollRef = useRef(null);
  const isUserScrollingRef = useRef(false);

  useEffect(() => {
    if (!store || !store.categories || store.categories.length === 0) return;
    const targetCat = location.state?.category;
    if (targetCat && store.categories.includes(targetCat)) {
      setActiveCategory(targetCat);
      setTimeout(() => {
        scrollToCategory(targetCat);
      }, 150);
    } else {
      setActiveCategory(store.categories[0]);
    }
  }, [store, location.state]);

  // Total products in this store
  const totalProductsCount = useMemo(() => {
    if (!store) return 0;
    return store.categories.reduce((acc, cat) => {
      return acc + (productsByCategory[cat] || []).length;
    }, 0);
  }, [store, productsByCategory]);

  // Category counts map
  const categoryCounts = useMemo(() => {
    if (!store) return {};
    const map = {};
    store.categories.forEach((cat) => {
      map[cat] = (productsByCategory[cat] || []).length;
    });
    return map;
  }, [store, productsByCategory]);

  // ScrollSpy: keep left pane constantly synced with groceries list as user scrolls
  useEffect(() => {
    if (!store || !productsScrollRef.current) return;

    const observerOptions = {
      root: document.querySelector('.app-content-area.store-view-mode'),
      rootMargin: '-10px 0px -70% 0px',
      threshold: [0, 0.1]
    };

    const handleIntersect = (entries) => {
      if (isUserScrollingRef.current) return;
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const categoryName = entry.target.getAttribute('data-category');
          if (categoryName) {
            setActiveCategory(categoryName);
          }
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersect, observerOptions);

    Object.entries(sectionRefs.current).forEach(([cat, el]) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [store, search]);

  if (!store) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 16 }}>
        <span style={{ fontSize: '3rem' }}>🏪</span>
        <h2>Store not available in {userLocation}</h2>
        <button
          type="button"
          onClick={() => navigateWithStoreTransition(navigate, '/home')}
          style={{ color: 'var(--brand)', fontWeight: 700 }}
        >
          ← Back to Home
        </button>
      </div>
    );
  }

  const scrollToCategory = (cat) => {
    setActiveCategory(cat);
    setShowCategoryMenu(false);
    isUserScrollingRef.current = true;

    const target = sectionRefs.current[cat];
    if (target) target.scrollIntoView({block:'start',behavior:'smooth'});

    // Release manual scroll lock after animation
    setTimeout(() => {
      isUserScrollingRef.current = false;
    }, 600);
  };

  const visibleCategories = store.categories.filter((cat) => {
    if (!search) return true;
    const products = productsByCategory[cat] || [];
    return products.some((p) => p.name.toLowerCase().includes(search.toLowerCase()));
  });

  const activeCategoryCount = categoryCounts[activeCategory] || 0;

  return (
    <div className="store-page-wrapper">
      {/* ─── Instamart Compact Sticky Header ─── */}
      <header className="sp-fixed-header">
        {/* Top Control Bar */}
        <div className="sp-header-top-row">
          <button
            type="button"
            className="sp-hdr-back-btn"
            onClick={() => navigate('/home')}
            aria-label="Back to home"
          >
            <ArrowLeft size={18} />
          </button>

          <div className="sp-hdr-title-area" onClick={() => setShowStoreInfo(true)} style={{ cursor: 'pointer' }}>
            <div className="sp-hdr-name-row">
              <div className="sp-hdr-store-photo" style={{ viewTransitionName: storeImageTransitionName(store.id) }}>
                {store.isSample ? (
                  <span className="kp-sample-header-icon" aria-label="Sample store">{store.image || '🏪'}</span>
                ) : <img
                  src={getStoreGallery(store)[0]?.src || getStoreImageFallback(store) || ''}
                  alt=""
                  decoding="async"
                  onError={event => {
                    const fallback = getStoreImageFallback(store);
                    if (fallback && !event.currentTarget.dataset.fallback) {
                      event.currentTarget.dataset.fallback='true';
                      event.currentTarget.src=fallback;
                    } else event.currentTarget.style.display='none';
                  }}
                />}
              </div>
              <h1 className="sp-hdr-store-name" style={{ viewTransitionName: storeTitleTransitionName(store.id) }}>{store.name}</h1>
              {store.isAdminManaged && (
                <span className="sp-hdr-mandi-badge" title="Direct Mandi Admin Managed">
                  <ShieldCheck size={11} strokeWidth={2.5} /> Mandi Direct
                </span>
              )}
            </div>

            <div className="sp-hdr-meta-row">
              <span className="sp-hdr-eta-pill">
                <Clock size={11} strokeWidth={2.5} /> {store.deliveryTime}
              </span>
              <span className="sp-hdr-rating-pill">
                <Star size={11} fill="#16A34A" color="#16A34A" /> {store.rating}
              </span>
              <span className="sp-hdr-dist-pill">
                <MapPin size={11} /> {store.distance}
              </span>
            </div>
          </div>

          <div className="sp-hdr-actions">
            <button
              type="button"
              className="sp-hdr-icon-btn"
              onClick={() => setShowStoreInfo(true)}
              aria-label="Store details"
              title="Store Information"
            >
              <Info size={16} />
            </button>
            <button
              type="button"
              className="sp-hdr-icon-btn"
              onClick={() => setLiked((l) => !l)}
              aria-label="Favorite store"
            >
              <Heart size={16} fill={liked ? '#FF5252' : 'none'} color={liked ? '#FF5252' : '#475569'} />
            </button>
            <button
              type="button"
              className="sp-hdr-icon-btn sp-hdr-cart-btn"
              onClick={() => navigate('/cart')}
              aria-label={`Cart with ${totalItems} items`}
              title="Open Cart"
            >
              <ShoppingBag size={16} />
              {totalItems > 0 && (
                <span className="sp-top-cart-badge">{totalItems}</span>
              )}
            </button>
          </div>
        </div>

        {/* Controls Row: Search + Layout + Category Dropdown */}
        <div className="sp-header-controls-row">
          <div className="sp-inpage-search">
            <Search size={15} color="#94A3B8" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search in ${store.name} (${totalProductsCount} items)...`}
            />
            {search && (
              <button
                type="button"
                className="sp-search-clear"
                onClick={() => setSearch('')}
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Quick Jump Category Menu */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              className="sp-hdr-cat-picker"
              onClick={() => setShowCategoryMenu((v) => !v)}
              aria-label="Jump to category"
            >
              <span>{activeCategory || 'Categories'}</span>
              <ChevronDown size={13} />
            </button>

            {showCategoryMenu && (
              <div className="sp-cat-dropdown-flyout">
                {store.categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className={`sp-cat-flyout-item ${activeCategory === cat ? 'active' : ''}`}
                    onClick={() => scrollToCategory(cat)}
                  >
                    <span>{categoryMeta[cat]?.icon || '📦'}</span>
                    <span className="flyout-name">{cat}</span>
                    <span className="flyout-count">({categoryCounts[cat] || 0})</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Big Grid vs Compact List Layout Toggle */}
          <div className="sp-layout-toggle-group">
            <button
              type="button"
              title="Grid Layout (Big Photo)"
              className={`sp-ltoggle-btn ${layoutMode === 'big' ? 'active' : ''}`}
              onClick={() => setLayoutMode('big')}
            >
              <LayoutGrid size={15} />
            </button>
            <button
              type="button"
              title="Compact Row Layout"
              className={`sp-ltoggle-btn ${layoutMode === 'small' ? 'active' : ''}`}
              onClick={() => setLayoutMode('small')}
            >
              <Rows3 size={15} />
            </button>
          </div>
        </div>
      </header>

      {/* ─── Instamart Fixed 2-Column Body ─── */}
      <div className="sp-split-body">
        {/* Left Column: Fixed Category Sidebar */}
        <aside className="sp-fixed-sidebar" aria-label="Grocery Categories">
          <div className="sp-sidebar-header-hint">Categories</div>
          {store.categories.map((cat) => {
            const meta = categoryMeta[cat] || { icon: '📦', bg: '#F1F5F9' };
            const isActive = activeCategory === cat;
            const count = categoryCounts[cat] || 0;

            return (
              <button
                key={cat}
                type="button"
                className={`sp-sidebar-cat-btn ${isActive ? 'is-active' : ''}`}
                onClick={() => scrollToCategory(cat)}
                title={`${cat} (${count} items)`}
              >
                <div
                  className="sp-sidebar-cat-thumb"
                  style={{
                    background: isActive ? '#DCFCE7' : meta.bg,
                    borderColor: isActive ? '#16A34A' : '#E2E8F0',
                  }}
                >
                  <span className="sp-sidebar-icon">{meta.icon}</span>
                </div>
                <span className="sp-sidebar-cat-name">{cat}</span>
                <span className="sp-sidebar-cat-count">{count}</span>
              </button>
            );
          })}
        </aside>

        {/* Right Column: Independently Scrollable Products List */}
        <main className="sp-scrollable-products" ref={productsScrollRef}>
          {store.isSample && <p className="kp-demo-disclaimer">Sample storefront · Merchant registration pending. Products are for preview only, and checkout is unavailable.</p>}
          {!search && <StorePhotoCarousel store={store} className="kp-store-detail-slideshow" />}
          {!search && (
            <StoreOffersCarousel
              store={store}
              catalog={productsByCategory}
              orders={orders}
              onOpenCategory={scrollToCategory}
              onOpenProduct={setSelectedProduct}
            />
          )}
          {visibleCategories.length === 0 ? (
            <div className="sp-no-results">
              <span style={{ fontSize: '2.5rem' }}>🔍</span>
              <h4>No items found matching "{search}"</h4>
              <p>Try searching for potato, tomato, onion, dal, milk or fruits.</p>
              <button
                type="button"
                className="sp-reset-search-btn"
                onClick={() => setSearch('')}
              >
                Clear Search
              </button>
            </div>
          ) : (
            visibleCategories.map((cat) => {
              const meta = categoryMeta[cat] || { icon: '📦', bg: '#F8FAFC' };
              const products = (productsByCategory[cat] || []).filter((p) =>
                !search || p.name.toLowerCase().includes(search.toLowerCase())
              );
              if (products.length === 0) return null;

              return (
                <section
                  key={cat}
                  data-category={cat}
                  className="sp-category-section"
                  ref={(el) => {
                    sectionRefs.current[cat] = el;
                  }}
                >
                  {/* Category Sticky Subheader */}
                  <div className="sp-sec-header">
                    <div className="sp-sec-header-left">
                      <span className="sp-sec-icon" style={{ background: meta.bg }}>
                        {meta.icon}
                      </span>
                      <div>
                        <h2 className="sp-sec-title">{cat}</h2>
                        <span className="sp-sec-subtitle">
                          {products.length} {products.length === 1 ? 'item' : 'items'} available
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Grid of Product Cards with Real Photos */}
                  <div className={`sp-products-grid layout-${layoutMode}`}>
                    {products.map((product) => (
                      <div
                        key={product.id}
                        onClick={() => setSelectedProduct(product)}
                        style={{ cursor: 'pointer' }}
                      >
                        <ProductCard
                          product={product}
                          storeId={store.id}
                          layout={layoutMode}
                          categoryBg={meta.bg}
                        />
                      </div>
                    ))}
                  </div>
                </section>
              );
            })
          )}
        </main>
      </div>

      {/* ─── Bottom Floating Cart Bar ─── */}
      <CartBar storeId={store.id} />

      {/* ─── Store Information Bottom Sheet Modal ─── */}
      {showStoreInfo && (
        <div className="sp-info-overlay" onClick={() => setShowStoreInfo(false)}>
          <div className="sp-info-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sp-info-sheet-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: '2rem' }}>{store.image}</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900 }}>{store.name}</h3>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748B' }}>
                    Managed by {store.owner}
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="sp-info-close-btn"
                onClick={() => setShowStoreInfo(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="sp-info-sheet-body">
              {store.isAdminManaged && (
                <div className="sp-info-mandi-box">
                  <ShieldCheck size={20} color="#16A34A" />
                  <div>
                    <strong>KiranaPRO Direct Mandi Hub</strong>
                    <p>
                      Sourced daily from local farmers and Rythu Bazaars. Cleaned, graded, and quality inspected with direct +₹4 markup.
                    </p>
                  </div>
                </div>
              )}

              <div className="sp-info-grid">
                <div className="sp-info-tile">
                  <Clock size={16} color="#E65100" />
                  <div>
                    <span className="sp-info-lbl">Delivery SLA</span>
                    <span className="sp-info-val">{store.deliveryTime}</span>
                  </div>
                </div>
                <div className="sp-info-tile">
                  <Star size={16} color="#16A34A" />
                  <div>
                    <span className="sp-info-lbl">Rating</span>
                    <span className="sp-info-val">{store.isSample ? 'Not rated' : `${store.rating} (${store.reviewCount}+ reviews)`}</span>
                  </div>
                </div>
                <div className="sp-info-tile">
                  <Bike size={16} color="#2563EB" />
                  <div>
                    <span className="sp-info-lbl">Delivery Fee</span>
                    <span className="sp-info-val">{`₹${store.deliveryFee} · FREE above ₹${FREE_DELIVERY_THRESHOLD}`}</span>
                  </div>
                </div>
                <div className="sp-info-tile">
                  <MapPin size={16} color="#7C3AED" />
                  <div>
                    <span className="sp-info-lbl">Radius</span>
                    <span className="sp-info-val">{store.isSample ? 'Coverage: selected area' : `${store.distance} (Up to 2 km)`}</span>
                  </div>
                </div>
              </div>

              <div className="sp-info-address-box">
                <span className="sp-info-lbl">Store Address</span>
                <p className="sp-info-addr-txt">{store.address}</p>
              </div>

              {store.offer && (
                <div className="sp-info-offer-box">
                  <span className="sp-offer-pill">Active Offer</span>
                  <p>{store.offer}</p>
                </div>
              )}
            </div>

            <button
              type="button"
              className="sp-info-done-btn"
              onClick={() => setShowStoreInfo(false)}
            >
              Back to Catalog
            </button>
          </div>
        </div>
      )}

      {/* ─── Product Detail Modal ─── */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          storeId={store.id}
          storeName={store.name}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}
