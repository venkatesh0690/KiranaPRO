import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, ArrowUpRight, ChevronDown, MapPin, Search, ShoppingBag, UserRound,
  SlidersHorizontal
} from 'lucide-react';
import { allCategories } from '../data/stores';
import { useStore } from '../context/StoreContext';
import { useCart } from '../context/CartContext';
import { useSecurity } from '../context/SecurityContext';
import StoreCard from '../components/StoreCard';
import { HomeOffersCarousel } from '../components/StoreOffersCarousel';
import CategoriesModal from '../components/CategoriesModal';
import AuthModal from '../components/AuthModal';

const storeFilters = [
  { id: 'all', label: 'All stores' },
  { id: 'fast', label: 'Fast delivery' },
  { id: 'rated', label: 'Top rated' },
  { id: 'free', label: 'Free delivery' },
];

export default function HomePage({ userLocation }) {
  const navigate = useNavigate();
  const { stores, products } = useStore();
  const { totalItems } = useCart();
  const { authSession } = useSecurity();
  const [activeFilter, setActiveFilter] = useState('all');
  const [authMode, setAuthMode] = useState(null);
  const [categoriesOpen, setCategoriesOpen] = useState(false);

  const filteredStores = stores.filter(store => {
    if (activeFilter === 'fast') return /15|20|30/.test(store.deliveryTime || '');
    if (activeFilter === 'rated') return Number(store.rating) >= 4.7;
    if (activeFilter === 'free') return Number(store.deliveryFee) === 0;
    return true;
  });

  const openCategory = (categoryName) => {
    setCategoriesOpen(false);
    const preferred = stores.find(store =>
      String(store.id).toLowerCase() === 'localfresh' && store.categories?.includes(categoryName)
    );
    const match = preferred || stores.find(store => store.categories?.includes(categoryName));
    if (match) {
      navigate(`/store/${match.id}`, { state: { category: categoryName } });
    } else {
      navigate('/search');
    }
  };

  return (
    <div className="home-container kp-home kp-concept">
      <div className="kp-concept-preview-note">
        <span>DESIGN STUDY</span>
        <span>Version B · Preview only</span>
      </div>

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

      <section className="kp-concept-feature" aria-label="Offers at neighborhood stores">
        <div className="kp-concept-section-heading">
          <div className="kp-concept-heading-copy">
            <span className="kp-concept-index">01 / FEATURED</span>
            <h2>Good things, nearby.</h2>
          </div>
          <span className="kp-concept-subnote">Explore what's in store</span>
        </div>
        <HomeOffersCarousel stores={stores} catalog={products} navigate={navigate} />
      </section>

      <section className="kp-concept-categories" aria-labelledby="kp-concept-categories-title">
        <div className="kp-concept-section-heading">
          <div className="kp-concept-heading-copy">
            <span className="kp-concept-index">02 / EXPLORE</span>
            <h2 id="kp-concept-categories-title">Shop by category.</h2>
          </div>
          <button className="kp-concept-link" type="button" onClick={() => setCategoriesOpen(true)}>
            View all <ArrowUpRight size={16} aria-hidden="true" />
          </button>
        </div>
        <div className="kp-concept-category-grid">
          {allCategories.slice(0, 8).map((category, index) => (
            <button
              key={category.id}
              className="kp-concept-category-card"
              type="button"
              onClick={() => openCategory(category.name)}
              aria-label={`Shop ${category.name}`}
            >
              <span className="kp-concept-category-index">{String(index + 1).padStart(2, '0')}</span>
              <span className="kp-concept-category-emoji" aria-hidden="true">{category.icon}</span>
              <span className="kp-concept-category-bottom">
                <strong>{category.name}</strong>
                <ArrowUpRight size={17} aria-hidden="true" />
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="kp-concept-stores" aria-labelledby="kp-concept-stores-title">
        <div className="kp-concept-section-heading kp-concept-stores-heading">
          <div className="kp-concept-heading-copy">
            <span className="kp-concept-index">03 / YOUR MARKETPLACE</span>
            <h2 id="kp-concept-stores-title">Meet your local stores.</h2>
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
        <span>Fresh finds from your neighborhood.</span>
      </div>

      <CategoriesModal isOpen={categoriesOpen} onClose={() => setCategoriesOpen(false)} onSelectCategory={openCategory} />
      <AuthModal isOpen={Boolean(authMode)} initialMode={authMode || 'login'} onClose={() => setAuthMode(null)} />
    </div>
  );
}
