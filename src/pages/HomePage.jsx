import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronDown, MapPin, Search, ShoppingBag, UserRound } from 'lucide-react';
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

  const filteredStores = stores.filter((store) => {
    if (activeFilter === 'fast') return /15|20|30/.test(store.deliveryTime || '');
    if (activeFilter === 'rated') return Number(store.rating) >= 4.7;
    if (activeFilter === 'free') return Number(store.deliveryFee) === 0;
    return true;
  });

  const openCategory = (categoryName) => {
    setCategoriesOpen(false);
    const preferred = stores.find(
      (store) => String(store.id).toLowerCase() === 'localfresh' && store.categories?.includes(categoryName)
    );
    const match = preferred || stores.find((store) => store.categories?.includes(categoryName));
    if (match) {
      navigate(`/store/${match.id}`, { state: { category: categoryName } });
    } else {
      navigate('/search');
    }
  };

  return (
    <div className="home-container kp-home">
      <header className="kp-header">
        <div className="kp-header-top">
          <button className="kp-wordmark" type="button" onClick={() => navigate('/home')} aria-label="KiranaPRO home">
            <span className="kp-wordmark-symbol">K</span>
            <span>Kirana<span className="kp-wordmark-accent">PRO</span></span>
          </button>
          <div className="kp-header-actions">
            <button className="kp-account-link" type="button" onClick={() => authSession.isAuthenticated ? navigate('/profile') : setAuthMode('login')}>
              <UserRound size={17} />
              <span>{authSession.isAuthenticated ? 'Account' : 'Sign in'}</span>
            </button>
            <button className="kp-cart-icon" type="button" onClick={() => navigate('/cart')} aria-label={`Cart with ${totalItems} items`}>
              <ShoppingBag size={20} />
              {totalItems > 0 && <span className="kp-cart-count">{totalItems}</span>}
            </button>
          </div>
        </div>

        <button type="button" className="kp-delivery-location" onClick={() => navigate('/')}>
          <MapPin size={15} aria-hidden="true" />
          <span>Delivering to <strong>{userLocation || 'Choose your area'}</strong></span>
          <ChevronDown size={15} aria-hidden="true" />
        </button>
      </header>

      <section className="kp-home-search" aria-label="Search groceries and stores">
        <button
          type="button"
          className="kp-search-trigger kp-search-compact"
          onClick={() => navigate('/search')}
          aria-label="Search groceries, vegetables and stores"
        >
          <Search size={19} aria-hidden="true" />
          <span>Search groceries, vegetables, and stores</span>
          <ArrowRight size={17} className="kp-search-arrow" aria-hidden="true" />
        </button>
      </section>

      <HomeOffersCarousel stores={stores} catalog={products} navigate={navigate}/>

      <section className="kp-section" aria-labelledby="kp-category-title">
        <div className="kp-section-heading">
          <h2 id="kp-category-title">Shop by category</h2>
          <button type="button" className="kp-text-link" onClick={() => setCategoriesOpen(true)}>
            View all <ArrowRight size={15} />
          </button>
        </div>
        <div className="kp-category-scroll">
          {allCategories.slice(0, 10).map((category) => (
            <button
              type="button"
              className="kp-category"
              key={category.id}
              onClick={() => openCategory(category.name)}
              aria-label={`Shop ${category.name}`}
            >
              <span className="kp-category-icon" aria-hidden="true">{category.icon}</span>
              <span className="kp-category-name">{category.name}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="kp-section kp-stores-section" aria-labelledby="kp-stores-title">
        <div className="kp-section-heading">
          <div>
            <h2 id="kp-stores-title">Explore stores</h2>
            <p>Find your everyday favorites nearby.</p>
          </div>
          <span className="kp-result-count">{filteredStores.length} stores</span>
        </div>
        <div className="kp-filters" role="group" aria-label="Filter stores">
          {storeFilters.map((filter) => (
            <button
              type="button"
              key={filter.id}
              className={`kp-filter ${activeFilter === filter.id ? 'active' : ''}`}
              aria-pressed={activeFilter === filter.id}
              onClick={() => setActiveFilter(filter.id)}
            >
              {filter.label}
            </button>
          ))}
        </div>
        {filteredStores.length ? (
          <div className="kp-store-grid">
            {filteredStores.map((store) => <StoreCard key={store.id} store={store} layout="compact" />)}
          </div>
        ) : (
          <div className="kp-empty-stores">
            <p>No stores match this filter right now.</p>
            <button type="button" className="kp-text-link" onClick={() => setActiveFilter('all')}>See all stores</button>
          </div>
        )}
      </section>

      <CategoriesModal
        isOpen={categoriesOpen}
        onClose={() => setCategoriesOpen(false)}
        onSelectCategory={openCategory}
      />
      <AuthModal
        isOpen={Boolean(authMode)}
        initialMode={authMode || 'login'}
        onClose={() => setAuthMode(null)}
      />
    </div>
  );
}
