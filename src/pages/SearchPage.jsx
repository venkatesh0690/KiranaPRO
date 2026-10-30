import { useState, useMemo, useEffect } from 'react';
import { ArrowLeft, Search, SlidersHorizontal, X, ShoppingBag, TrendingUp, History, Mic, FileText } from 'lucide-react';
import ParchiScannerModal from '../components/ParchiScannerModal';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { getStoresForArea } from '../data/deliveryAreas';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';
import ProductDetailModal from '../components/ProductDetailModal';
import { expandSynonyms } from '../utils/regionalSynonyms';

export default function SearchPage({ userLocation }) {
  const { stores, products: productsByCategory } = useStore();
  const availableStores = useMemo(() => getStoresForArea(stores, userLocation), [stores, userLocation]);
  const navigate = useNavigate();
  const { totalItems } = useCart();
  const [query, setQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isParchiOpen, setIsParchiOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const startVoiceSearch = () => {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
      alert('Voice recognition not supported in this browser. Please type your search.');
      return;
    }
    const recognition = new SpeechRec();
    recognition.lang = 'te-IN'; // Default to Indian English / Telugu
    setIsListening(true);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      const stored = localStorage.getItem('kp_recent_searches');
      return stored ? JSON.parse(stored) : ['Bendakaya', 'Tomato', 'Onion', 'Milk', 'Toor Dal'];
    } catch {
      return ['Bendakaya', 'Tomato', 'Onion', 'Milk', 'Toor Dal'];
    }
  });

  const trendingPills = [
    { label: 'Bendakaya (Bhindi)', q: 'Bendakaya' },
    { label: 'Dosakaya', q: 'Dosakaya' },
    { label: 'Vankaya (Brinjal)', q: 'Vankaya' },
    { label: 'Ullipayalu (Onion)', q: 'Onion' },
    { label: 'Dondakaya (Ivy Gourd)', q: 'Dondakaya' },
    { label: 'Fresh Milk', q: 'Milk' },
    { label: 'Toor Dal', q: 'Toor Dal' }
  ];

  const tags = ['All', 'Fresh Veggies', 'Fruits', 'Milk & Dairy', 'Snacks', 'Beverages', 'Dal & Rice'];

  const saveRecentSearch = (term) => {
    if (!term || term.trim().length < 2) return;
    const clean = term.trim();
    setRecentSearches(prev => {
      const next = [clean, ...prev.filter(t => t.toLowerCase() !== clean.toLowerCase())].slice(0, 8);
      try { localStorage.setItem('kp_recent_searches', JSON.stringify(next)); } catch {}
      return next;
    });
  };

  // Flatten all products across categories with category metadata
  const allProductsList = useMemo(() => {
    const list = [];
    Object.entries(productsByCategory).forEach(([cat, prods]) => {
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
    const expandedTerms = expandSynonyms(query);

    return allProductsList.filter((p) => {
      const pName = p.name.toLowerCase();
      const pCat = p.category.toLowerCase();
      const pBrand = (p.brand || '').toLowerCase();

      let matchQuery = !query;
      if (query) {
        matchQuery = expandedTerms.some(term => 
          pName.includes(term) || pCat.includes(term) || pBrand.includes(term)
        );
      }

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
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') saveRecentSearch(query); }}
            placeholder='Search "bendakaya, milk, bread, tomato, vankaya..."'
          />
          {query && (
            <button type="button" className="search-clear-btn" onClick={() => setQuery('')}>
              <X size={15} />
            </button>
          )}
          <button
            type="button"
            onClick={startVoiceSearch}
            style={{
              background: 'none',
              border: 'none',
              color: isListening ? '#DC2626' : 'var(--brand-primary, #1E3A2B)',
              cursor: 'pointer',
              padding: '6px',
              display: 'flex',
              alignItems: 'center'
            }}
            title="Telugu & Indian English Voice Search"
          >
            <Mic size={18} />
          </button>
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

      {/* Trending Telugu & English Search Suggestions Bar */}
      <div className="kp-trending-searches-bar">
        <div className="kp-trending-title"><TrendingUp size={13} /> Trending in Visakhapatnam:</div>
        <div className="kp-trending-scroll">
          {trendingPills.map(item => (
            <button
              key={item.label}
              type="button"
              className="kp-trending-chip"
              onClick={() => { setQuery(item.q); saveRecentSearch(item.q); }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Tag Chips */}
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
          {query && <span className="kp-synonym-active-hint">• Bilingual Telugu & Hindi search active</span>}
        </div>

        {filteredProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 20px', background: '#FFFFFF', borderRadius: '16px', border: '1.5px dashed #CBD5E1', margin: '20px 0' }}>
            <span style={{ fontSize: '42px', display: 'block', marginBottom: '12px' }}>🌾</span>
            <h3 style={{ fontSize: '17px', fontWeight: '850', color: '#0F172A', margin: '0 0 8px' }}>
              Couldn't find "{query}" in {userLocation}
            </h3>
            <p style={{ fontSize: '12.5px', color: '#64748B', maxWidth: '380px', margin: '0 auto 18px', lineHeight: 1.45 }}>
              Looking for fresh local produce? Try searching with regional names: <strong>Bendakaya</strong>, <strong>Vankaya</strong>, <strong>Ullipayalu</strong>, or <strong>Dosakaya</strong>.
            </p>
            <button
              type="button"
              style={{ padding: '10px 18px', background: '#1E3A2B', color: '#FFFFFF', border: 'none', borderRadius: '10px', fontSize: '12px', fontWeight: '800', cursor: 'pointer' }}
              onClick={() => alert(`Request recorded! Our Visakhapatnam Mandi sourcing team will look for "${query}" in tomorrow morning's auction.`)}
            >
              📢 Request Our Mandi Team to Stock "{query}" Tomorrow
            </button>
          </div>
        ) : (
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
        )}
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
