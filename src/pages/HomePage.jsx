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
  ShieldCheck,
  Heart,
  Plus,
  Minus
} from 'lucide-react';
import { allCategories } from '../data/stores';
import { useStore } from '../context/StoreContext';
import { useCart } from '../context/CartContext';
import { useSecurity } from '../context/SecurityContext';
import StoreCard from '../components/StoreCard';
import ProductDetailModal from '../components/ProductDetailModal';
import CategoriesModal from '../components/CategoriesModal';
import AuthModal from '../components/AuthModal';

// Popular Now products curated directly from uploaded design images (Image 1 & 2)
const POPULAR_PRODUCTS = [
  {
    id: 'pop-1',
    name: 'Brussels Sprouts & Greens',
    price: 48,
    mrp: 60,
    unit: '500 g',
    discount: '-20%',
    rating: 4.9,
    reviewsCount: 142,
    brand: 'LocalFresh Mandi',
    image: 'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?auto=format&fit=crop&w=500&q=80',
    fallbackEmoji: '🥬',
    storeId: 'localfresh',
    storeName: 'LocalFresh Mandi'
  },
  {
    id: 'pop-2',
    name: 'Rainbow Organic Carrots',
    price: 44,
    mrp: 56,
    unit: '500 g',
    discount: '-21%',
    rating: 4.8,
    reviewsCount: 98,
    brand: 'Farm Harvest',
    image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=500&q=80',
    fallbackEmoji: '🥕',
    storeId: 'localfresh',
    storeName: 'LocalFresh Mandi'
  },
  {
    id: 'pop-3',
    name: 'Farm Fresh Red Tomatoes',
    price: 32,
    mrp: 42,
    unit: '1 kg',
    discount: '-24%',
    rating: 4.9,
    reviewsCount: 320,
    brand: 'LocalFresh Mandi',
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=500&q=80',
    fallbackEmoji: '🍅',
    storeId: 'localfresh',
    storeName: 'LocalFresh Mandi'
  },
  {
    id: 'pop-4',
    name: 'Amul Taaza Toned Milk',
    price: 54,
    mrp: 58,
    unit: '1 Litre',
    discount: 'Fresh Daily',
    rating: 4.9,
    reviewsCount: 412,
    brand: 'Amul',
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=500&q=80',
    fallbackEmoji: '🥛',
    storeId: 1,
    storeName: 'Sharma General Store'
  },
  {
    id: 'pop-5',
    name: 'Crisp Washington Red Apples',
    price: 145,
    mrp: 180,
    unit: '1 kg',
    discount: '-19%',
    rating: 4.8,
    reviewsCount: 165,
    brand: 'Fresh Orchard',
    image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=500&q=80',
    fallbackEmoji: '🍎',
    storeId: 'localfresh',
    storeName: 'LocalFresh Mandi'
  },
  {
    id: 'pop-6',
    name: 'Fresh Nagpur Sweet Oranges',
    price: 75,
    mrp: 95,
    unit: '1 kg',
    discount: '-21%',
    rating: 4.7,
    reviewsCount: 88,
    brand: 'Nagpur Fresh',
    image: 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?auto=format&fit=crop&w=500&q=80',
    fallbackEmoji: '🍊',
    storeId: 'localfresh',
    storeName: 'LocalFresh Mandi'
  }
];

export default function HomePage() {
  const navigate = useNavigate();
  const { stores } = useStore();
  const { cart, addItem, removeItem, totalItems } = useCart();
  const { authSession, logout } = useSecurity();

  const [authModalMode, setAuthModalMode] = useState(null);
  const [activeCategory, setActiveCategory] = useState('vegetables');
  const [activeStoreFilter, setActiveStoreFilter] = useState('all');
  const [storeViewMode, setStoreViewMode] = useState('grid'); // 'grid' | 'compact'
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [likedMap, setLikedMap] = useState({});

  const toggleLike = (prodId, e) => {
    e.stopPropagation();
    setLikedMap((prev) => ({ ...prev, [prodId]: !prev[prodId] }));
  };

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
      <header className="groceasy-header">
        <div className="groceasy-top-row">
          {/* Location Chip */}
          <div className="groceasy-loc-chip" onClick={() => navigate('/')}>
            <div className="groceasy-loc-icon-wrap">
              <MapPin size={15} color="#FFFFFF" />
            </div>
            <div className="groceasy-loc-text">
              <span className="groceasy-loc-label">Deliver to</span>
              <div className="groceasy-loc-val">
                <strong>Maddilapalem, Vizag • 2 km</strong>
                <ChevronRight size={13} color="#A7F3D0" />
              </div>
            </div>
          </div>

          {/* Clean Sign Up & Log In Buttons */}
          <div className="groceasy-top-actions">
            {!authSession.isAuthenticated ? (
              <div className="groceasy-auth-strip">
                <button
                  type="button"
                  className="groceasy-auth-btn signup"
                  onClick={() => setAuthModalMode('signup')}
                >
                  <UserPlus size={13} />
                  <span>Sign Up</span>
                </button>
                <button
                  type="button"
                  className="groceasy-auth-btn login"
                  onClick={() => setAuthModalMode('login')}
                >
                  <LogIn size={13} />
                  <span>Log In</span>
                </button>
              </div>
            ) : (
              <div className="groceasy-auth-strip logged-in">
                <span className="groceasy-user-chip">
                  <User size={13} />
                  <span>{authSession.userName}</span>
                </span>
                <button
                  type="button"
                  className="groceasy-auth-btn logout"
                  onClick={logout}
                  title="Sign Out"
                >
                  <LogOut size={13} />
                </button>
              </div>
            )}

            {/* Notification Bell in Circle */}
            <button
              type="button"
              className="groceasy-circle-btn notif"
              onClick={() => alert('Nearby stores deliver within 20–30 mins! Mandi orders delivered in 2 hours.')}
              aria-label="Notifications"
            >
              <Bell size={18} color="#FFFFFF" />
              <span className="groceasy-notif-dot" />
            </button>

            {/* Shopping Cart in Circle */}
            <button
              type="button"
              className="groceasy-circle-btn cart"
              onClick={() => navigate('/cart')}
              aria-label={`Cart with ${totalItems} items`}
            >
              <ShoppingBag size={18} color="#FFFFFF" />
              {totalItems > 0 && (
                <span className="groceasy-cart-badge">{totalItems}</span>
              )}
            </button>
          </div>
        </div>

        {/* White Rounded Pill Search Bar (Matching Image 1) */}
        <div className="groceasy-search-bar" onClick={() => navigate('/search')}>
          <Search size={18} color="#64748B" />
          <span className="groceasy-search-placeholder">Search groceries, vegetables, milk, spices...</span>
          <button
            type="button"
            className="groceasy-search-filter-btn"
            onClick={(e) => {
              e.stopPropagation();
              navigate('/search');
            }}
          >
            <SlidersHorizontal size={16} />
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
                  if (['vegetables', 'fruits', 'leafy', 'flowers', 'pickles', 'groceries'].includes(cat.id)) {
                    navigate('/store/localfresh');
                  } else {
                    navigate('/store/1');
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

      {/* ── "Popular Now" Products (Matching Image 1 & 2 Screens) ── */}
      <section className="home-section groceasy-popular-section">
        <div className="section-header-row">
          <div>
            <h3 className="groceasy-sec-title">Popular Now</h3>
            <p className="groceasy-sec-sub">Fastest selling fresh items in your neighborhood</p>
          </div>
          <button
            type="button"
            className="groceasy-see-all-link"
            onClick={() => navigate('/store/localfresh')}
          >
            See all
          </button>
        </div>

        <div className="groceasy-products-grid">
          {POPULAR_PRODUCTS.map((prod) => {
            const cartItem = cart.items.find((i) => i.id === prod.id);
            const qty = cartItem ? cartItem.quantity : 0;
            const isLiked = likedMap[prod.id] || false;

            return (
              <div
                key={prod.id}
                className="groceasy-product-card"
                onClick={() => setSelectedProduct(prod)}
              >
                {/* Top Row: Discount Badge & Heart Wishlist */}
                <div className="gpc-top-row">
                  {prod.discount ? (
                    <span className="gpc-discount-badge">{prod.discount}</span>
                  ) : <span />}
                  <button
                    type="button"
                    className="gpc-heart-btn"
                    onClick={(e) => toggleLike(prod.id, e)}
                    aria-label="Wishlist"
                  >
                    <Heart
                      size={15}
                      fill={isLiked ? '#FF4D4D' : 'none'}
                      color={isLiked ? '#FF4D4D' : '#94A3B8'}
                    />
                  </button>
                </div>

                {/* Clean Product Image on Pure White Background */}
                <div className="gpc-img-wrap">
                  <img
                    src={prod.image}
                    alt={prod.name}
                    className="gpc-real-img"
                    loading="lazy"
                  />
                </div>

                {/* Details */}
                <div className="gpc-details">
                  <h4 className="gpc-name">{prod.name}</h4>
                  <span className="gpc-unit">{prod.unit} • {prod.storeName}</span>

                  <div className="gpc-price-action-row">
                    <div className="gpc-price-box">
                      <span className="gpc-price">₹{prod.price}</span>
                      {prod.mrp > prod.price && (
                        <span className="gpc-mrp">₹{prod.mrp}</span>
                      )}
                    </div>

                    {/* Circular Add Button or Counter (matching Image 1 & 2) */}
                    {qty === 0 ? (
                      <button
                        type="button"
                        className="gpc-add-circle-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          addItem(prod.storeId, prod);
                        }}
                        title="Add to basket"
                      >
                        <Plus size={16} strokeWidth={2.8} />
                      </button>
                    ) : (
                      <div className="gpc-qty-pill" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          className="gpc-qp-btn"
                          onClick={() => removeItem(prod.id)}
                        >
                          <Minus size={12} />
                        </button>
                        <span className="gpc-qp-count">{qty}</span>
                        <button
                          type="button"
                          className="gpc-qp-btn"
                          onClick={() => addItem(prod.storeId, prod)}
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── AI Hero Promo Poster (Matching Image 1 & 2: 20-30 mins delivery) ── */}
      <section className="home-section">
        <div className="groceasy-promo-poster-card">
          <div className="gpp-content">
            <div className="gpp-pill-badge">
              <Clock size={13} strokeWidth={2.5} />
              <span>20-30 mins delivery</span>
            </div>

            <h2 className="gpp-title">Shop Smarter, Eat Better</h2>
            <p className="gpp-desc">
              Fresh farm vegetables & neighborhood kirana staples delivered right to your doorstep. Use coupon <strong>TASTY12</strong> for flat ₹30 off!
            </p>

            <button
              type="button"
              className="gpp-cta-btn"
              onClick={() => navigate('/store/localfresh')}
            >
              <span>See Detail & Shop</span>
              <ArrowRight size={15} />
            </button>
          </div>

          <div className="gpp-visual-wrap">
            <img
              src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80"
              alt="Fresh Groceries"
              className="gpp-visual-img"
            />
          </div>
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
