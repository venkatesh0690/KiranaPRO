import { useState, useMemo } from 'react';
import { ArrowLeft, Search, SlidersHorizontal, Star, Clock, X, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { getStoresForArea } from '../data/deliveryAreas';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';
import ProductDetailModal from '../components/ProductDetailModal';

export default function SearchPage({ userLocation }) {
  const { stores, products: productsByCategory } = useStore();
  const availableStores = useMemo(() => getStoresForArea(stores, userLocation), [stores,userLocation]);
  const navigate = useNavigate();
  const { totalItems } = useCart();
  const [query, setQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState(null);

  const tags = ['All', 'Fresh Veggies', 'Fruits', 'Milk & Dairy', 'Snacks', 'Beverages', 'Dal & Rice'];

  // Flatten all products across categories with category metadata
  const allProductsList = useMemo(() => {
    const list = [];
    Object.entries(productsByCategory).forEach(([cat, prods]) => {
      // Search only products sold by a shop serving the chosen area.
      const seller = availableStores.find(s => s.categories?.includes(cat) && !s.isSample)
        || availableStores.find(s => s.categories?.includes(cat));
      if (!seller) return;
      prods.forEach((p) => {
        list.push({ ...p, category: cat, storeId: seller.id, storeName: seller.name });
      });
    });
    return list;
  }, [productsByCategory, availableStores]);

  const filteredProducts = useMemo(() => {
    return allProductsList.filter((p) => {
      const matchQuery =
        !query ||
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.category.toLowerCase().includes(query.toLowerCase()) ||
        (p.brand && p.brand.toLowerCase().includes(query.toLowerCase()));

      const matchTag =
        selectedTag === 'All' ||
        (selectedTag === 'Milk & Dairy' && p.category.includes('Dairy')) ||
        (selectedTag === 'Fresh Veggies' && (p.category.includes('Produce') || p.category.includes('Vegetables') || p.category.includes('Leafy'))) ||
        (selectedTag === 'Fruits' && p.category.includes('Fruits')) ||
        (selectedTag === 'Snacks' && p.category.includes('Snacks')) ||
        (selectedTag === 'Beverages' && p.category.includes('Drinks')) ||
        (selectedTag === 'Dal & Rice' && (p.category.includes('Staples') || p.category.includes('Groceries')));

      return matchQuery && matchTag;
    });
  }, [allProductsList, query, selectedTag]);

  return (
    <div className="search-page">
      {/* Top Search Input with Back & Filter Icon */}
      <div className="search-page-header">
        <button type="button" className="search-back-btn" onClick={() => navigate('/home')}>
          <ArrowLeft size={18} />
        </button>

        <div className="search-page-input-wrap">
          <Search size={18} color="var(--n500)" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='Search "milk, bread, kurkure, onion..."'
          />
          {query && (
            <button type="button" className="search-clear-btn" onClick={() => setQuery('')}>
              <X size={15} />
            </button>
          )}
        </div>

        <button
          type="button"
          className="search-filter-icon-btn"
          onClick={() => alert('Filter options: Sort by price, distance under 1km, rating 4.5+')}
        >
          <SlidersHorizontal size={18} />
        </button>

        <button
          type="button"
          className="top-cart-btn"
          onClick={() => navigate('/cart')}
          aria-label={`Shopping cart with ${totalItems} items`}
          title="Open Shopping Cart"
          style={{ width: 42, height: 42, borderRadius: '50%', background: 'white', border: '1px solid var(--n200)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        >
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShoppingBag size={18} />
            {totalItems > 0 && (
              <span className="top-cart-badge">{totalItems}</span>
            )}
          </div>
        </button>
      </div>

      {/* Filter Tag Chips (Image 1 Trending Products Style) */}
      <div className="search-tags-row">
        {tags.map((t) => (
          <button
            key={t}
            type="button"
            className={`search-tag-chip ${selectedTag === t ? 'active' : ''}`}
            onClick={() => setSelectedTag(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Search Results */}
      <div className="search-results-container">
        <div className="search-results-meta">
          <span>Found <strong>{filteredProducts.length}</strong> items in stores serving {userLocation}</span>
        </div>

        <div className="search-products-grid">
          {filteredProducts.map((p) => (
            <div key={p.id} onClick={() => setSelectedProduct(p)}>
              <ProductCard
                product={p}
                storeId={p.storeId}
                layout="big"
                categoryBg="var(--pastel-orange)"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          storeId={selectedProduct.storeId}
          storeName={selectedProduct.storeName}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}
