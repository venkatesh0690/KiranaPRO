import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, ArrowUpRight, ChevronDown, MapPin, Search, ShoppingBag, UserRound,
  SlidersHorizontal, Sparkles, Store as StoreIcon, ChevronRight, LayoutGrid
} from 'lucide-react';
import { allCategories } from '../data/stores';
import { getFeaturedCategories, getQuickCategories } from '../data/homeDiscovery.js';
import { getStoresForArea, FREE_DELIVERY_THRESHOLD } from '../data/deliveryAreas';
import { useStore } from '../context/StoreContext';
import { useCart } from '../context/CartContext';
import { useSecurity } from '../context/SecurityContext';
import { useCustomerOrders } from '../context/OrderHistoryContext';
import StoreCard from '../components/StoreCard';
import { HomeOffersCarousel } from '../components/StoreOffersCarousel';
import CategoriesModal from '../components/CategoriesModal';
import AuthModal from '../components/AuthModal';

const storeFilters = [
  { id: 'all', label: 'All stores' },
  { id: 'fast', label: 'Fast delivery' },
  { id: 'rated', label: 'Top rated' },
];

export default function HomePage({ userLocation }) {
  const navigate = useNavigate();
  const { stores, products } = useStore();
  const { totalItems } = useCart();
  const { orderCount } = useCustomerOrders();
  const { authSession } = useSecurity();
  const [activeFilter, setActiveFilter] = useState('all');
  const [authMode, setAuthMode] = useState(null);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [showAllStores, setShowAllStores] = useState(false);

  const areaStores = getStoresForArea(stores,userLocation);
  const featuredCategories = getFeaturedCategories(areaStores,products);
  const quickCategories=getQuickCategories(areaStores,allCategories);
  const filteredStores = areaStores.filter(store => {
    if (activeFilter === 'fast') return /15|20|30/.test(store.deliveryTime || '');
    if (activeFilter === 'rated') return Number(store.rating) >= 4.7;
    return true;
  });

  const openCategory = (categoryName) => {
    setCategoriesOpen(false);
    const preferred = areaStores.find(store =>
      String(store.id).toLowerCase() === 'localfresh' && store.categories?.includes(categoryName)
    );
    const match = preferred || areaStores.find(store => store.categories?.includes(categoryName));
    if (match) {
      navigate(`/store/${match.id}`, { state: { category: categoryName } });
    } else {
      navigate('/search');
    }
  };

  return (
    <div className="home-container kp-home kp-concept">
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

        <button type="button" className="kp-concept-location" onClick={() => navigate('/')}>
          <span className="kp-concept-pin"><MapPin size={17} strokeWidth={2} /></span>
          <span className="kp-concept-location-label">Delivering to <strong>{userLocation || 'Choose your delivery area'}</strong></span>
          <ChevronDown size={16} aria-hidden="true" />
        </button>
      </header>

      <div className="kp-concept-search-line">
        <button type="button" className="kp-concept-search" onClick={() => navigate('/search')} aria-label="Search all groceries, vegetables and stores">
          <Search size={19} aria-hidden="true" />
          <span>What are you looking for?</span>
          <span className="kp-concept-search-arrow"><ArrowRight size={18} aria-hidden="true" /></span>
        </button>
      </div>

      <section className="kp-concept-categories kp-concept-compact-categories" aria-labelledby="kp-concept-categories-title">
        <div className="kp-concept-section-heading">
          <div className="kp-concept-heading-copy">
            <span className="kp-concept-index">01 / EXPLORE</span>
            <h2 id="kp-concept-categories-title">Shop by category</h2>
          </div>
          <button className="kp-concept-link" type="button" onClick={() => setCategoriesOpen(true)}>
            View all <ArrowUpRight size={16} aria-hidden="true" />
          </button>
        </div>
        <div className="kp-concept-mini-category-list" aria-label="Swipe through shopping categories" tabIndex={0}>
          {quickCategories.map(category => (
            <button
              key={category.id}
              className="kp-concept-mini-category-card"
              type="button"
              onClick={() => openCategory(category.name)}
              aria-label={`Shop ${category.name}`}
            >
              <span className="kp-concept-mini-category-art" aria-hidden="true">{category.icon}</span>
              <span className="kp-concept-mini-category-name">{category.name}</span>
            </button>
          ))}
          <button type="button" className="kp-concept-mini-category-card kp-category-more"
            onClick={()=>setCategoriesOpen(true)} aria-label="See all categories">
            <span className="kp-concept-mini-category-art"><LayoutGrid size={24} aria-hidden="true"/></span>
            <span className="kp-concept-mini-category-name">More</span>
          </button>
        </div>
      </section>

      <section className="kp-concept-feature" aria-label="Current delivery and basket offers">
        <HomeOffersCarousel stores={areaStores} catalog={products}
          navigate={navigate} area={userLocation} totalItems={totalItems} orderCount={orderCount} />
      </section>

      <section className="kp-home-featured-categories" aria-labelledby="kp-featured-heading">
        <div className="kp-home-reference-heading">
          <div className="kp-home-heading-icon"><Sparkles size={20} aria-hidden="true" /></div>
          <div className="kp-home-reference-heading-text">
            <h2 id="kp-featured-heading">Featured categories</h2>
            <p>Everyday essentials at your fingertips</p>
          </div>
          <button type="button" className="kp-home-see-all" onClick={()=>setCategoriesOpen(true)}>
            See all <ChevronRight size={15} aria-hidden="true"/>
          </button>
        </div>
        <div className="kp-featured-category-rail" aria-label="Featured categories" tabIndex={0}>
          {featuredCategories.map(category=>(
            <button type="button" className="kp-featured-category-tile"
              key={category.id} aria-label={`Browse ${category.name}`}
              onClick={()=>openCategory(category.name)}>
              <div className="kp-featured-category-photo">
                <img src={category.image} alt={`Representative photograph of ${category.name}`}
                  loading="lazy" decoding="async" width="480" height="300"/>
              </div>
              <div className="kp-featured-category-meta">
                <strong>{category.name}</strong>
                <span>{category.count} {category.isSampleOnly?'preview items':'items'}</span>
                <span className="kp-featured-category-arrow"><ArrowRight size={14} aria-hidden="true"/></span>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className={`kp-concept-stores kp-nearby-stores ${showAllStores?'is-expanded':''}`}
        aria-labelledby="kp-concept-stores-title">
        <div className="kp-home-reference-heading kp-concept-stores-heading">
          <div className="kp-home-heading-icon"><StoreIcon size={20} aria-hidden="true"/></div>
          <div className="kp-home-reference-heading-text">
            <h2 id="kp-concept-stores-title">Stores near you</h2>
            <p>{areaStores.length} nearby listings · {userLocation}</p>
          </div>
          <button type="button" className="kp-home-see-all"
            onClick={()=>{setShowAllStores(current=>!current);setActiveFilter('all');}}>
            {showAllStores?'Show less':'View all'} <ChevronRight size={15} aria-hidden="true"/>
          </button>
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

      <div className="kp-concept-footer">
        <span>KiranaPRO</span>
      </div>

      <CategoriesModal isOpen={categoriesOpen} onClose={() => setCategoriesOpen(false)} onSelectCategory={openCategory} />
      <AuthModal isOpen={Boolean(authMode)} initialMode={authMode || 'login'} onClose={() => setAuthMode(null)} />
    </div>
  );
}
