import { useState } from 'react';
import CatalogProductVisual from './CatalogProductVisual';
import { X, Heart, Star, ShieldCheck, Clock, Share2, Plus, Minus, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function ProductDetailModal({ product, storeId, storeName, onClose }) {
  const { cart, addItem, removeItem } = useCart();
  const [activeTab, setActiveTab] = useState('description');
  const [pickingPref, setPickingPref] = useState('Standard');
  const [isLiked, setIsLiked] = useState(false);

  if (!product) return null;

  const cartItem = cart.items.find((i) => i.id === product.id);
  const qty = cartItem ? cartItem.quantity : 0;
  const discount = product.mrp > product.price
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
    : 0;

  return (
    <div className="pdm-backdrop" onClick={onClose}>
      <div className="pdm-card" onClick={(e) => e.stopPropagation()}>
        {/* Top Floating Controls */}
        <div className="pdm-top-nav">
          <button type="button" className="pdm-nav-btn" onClick={onClose} aria-label="Close">
            <ArrowLeft size={18} />
          </button>
          <div className="pdm-top-right">
            <button
              type="button"
              className="pdm-nav-btn"
              onClick={() => setIsLiked(!isLiked)}
              aria-label="Wishlist"
            >
              <Heart size={18} fill={isLiked ? '#FF5722' : 'none'} color={isLiked ? '#FF5722' : 'var(--n700)'} />
            </button>
            <button type="button" className="pdm-nav-btn" aria-label="Share">
              <Share2 size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="pdm-body">
          {/* Showcase visual container with 360-degree indicator */}
          <div className="pdm-showcase">
            <CatalogProductVisual product={product} className="kp-modal-catalog-image" />
            {discount > 0 && (
              <span className="pdm-discount-badge">{discount}% OFF</span>
            )}
          </div>

          {/* Product Header */}
          <div className="pdm-info-block">
            <div className="pdm-badge-row">
              <span className="pdm-store-pill">🏪 {storeName || 'Neighborhood Kirana'}</span>
              <span
                className="pdm-stock-pill"
                style={{
                  background: product.inStock ? '#E8F5E9' : '#FEE2E2',
                  color: product.inStock ? '#2E7D32' : '#DC2626'
                }}
              >
                {product.inStock ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>

            <h2 className="pdm-title">{product.name}</h2>
            <div className="pdm-meta-row">
              <span className="pdm-unit">{product.unit}</span>
              <span className="pdm-dot">•</span>
              <div className="pdm-rating-pill">
                <Star size={13} fill="#0C8A4E" color="#0C8A4E" />
                <span>{product.rating || 4.8}</span>
                <span className="pdm-review-count">({product.reviewsCount || 120} reviews)</span>
              </div>
            </div>

            {/* Price Row */}
            <div className="pdm-price-row">
              <span className="pdm-current-price">₹{product.price}</span>
              {product.mrp > product.price && (
                <span className="pdm-mrp-price">₹{product.mrp}</span>
              )}
              {discount > 0 && (
                <span className="pdm-save-tag">Save ₹{product.mrp - product.price}</span>
              )}
            </div>

            {/* Spec Pills (Inspired by Screenshot 2: Diameter, Shade Height, Cord Length) */}
            {product.specs && (
              <div className="pdm-specs-grid">
                {Object.entries(product.specs).map(([key, val]) => (
                  <div key={key} className="pdm-spec-box">
                    <span className="pdm-spec-key">{key}</span>
                    <span className="pdm-spec-val">{val}</span>
                  </div>
                ))}
              </div>
            )}

            {/* ── Instacart Ripeness / Cut Preference (Phase 13 Prompt 13.1) ── */}
            <div style={{ margin: '12px 0', padding: '10px 12px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px' }}>
              <span style={{ fontSize: '11px', fontWeight: '750', color: '#334155', display: 'block', marginBottom: '6px' }}>
                👨‍🌾 Mandi Shopper Note / Ripeness Preference:
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {['Tender & Small (For Fry)', 'Medium Standard', 'Ripe for Today', 'Raw for 2-3 Days'].map(pref => (
                  <button
                    key={pref}
                    type="button"
                    style={{
                      padding: '4px 8px', fontSize: '10.5px', borderRadius: '6px',
                      border: pickingPref === pref ? '1.5px solid #16A34A' : '1px solid #CBD5E1',
                      background: pickingPref === pref ? '#DCFCE7' : '#FFFFFF',
                      color: pickingPref === pref ? '#15803D' : '#475569',
                      fontWeight: pickingPref === pref ? '800' : '600',
                      cursor: 'pointer'
                    }}
                    onClick={() => setPickingPref(pref)}
                  >
                    {pref}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Mandi Harvest Timestamp Card (Phase 21 Prompt 21.2) ── */}
            <div style={{ margin: '0 0 12px', padding: '8px 12px', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#166534', fontWeight: '700' }}>
                <span>🌾</span>
                <span>Harvested Today at 4:30 AM · Anakapalle Rythu Belt</span>
              </div>
              <span style={{ fontSize: '9.5px', background: '#DCFCE7', color: '#15803D', padding: '2px 6px', borderRadius: '4px', fontWeight: '800' }}>
                Zero Cold-Storage
              </span>
            </div>

            {/* Delivery Assurance */}
            <div className="pdm-assurance-box">
              <div className="pdm-assurance-item">
                <Clock size={16} color="var(--accent-green)" />
                <span>
                  Delivered <strong>{product.specs?.Delivery || (String(storeId) === 'localfresh' ? 'within 2 hours' : 'in 20-30 mins')}</strong>
                </span>
              </div>
              <div className="pdm-assurance-item">
                <ShieldCheck size={16} color="var(--accent-blue)" />
                <span>100% Genuine, hand-inspected package</span>
              </div>
            </div>

            {/* Tabbed Info (Inspired by Screenshot 3: Description, Reviews, Policy) */}
            <div className="pdm-tabs-header">
              {['description', 'storage', 'reviews', 'policy'].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  className={`pdm-tab-btn ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            <div className="pdm-tab-content">
              {activeTab === 'description' && (
                <p className="pdm-description-text">
                  {product.description ||
                    'Freshly sourced and packed from local retail Kiranas. Handpicked by store owners and immediately dispatched via quick commerce riders within 2km.'}
                </p>
              )}
              {activeTab === 'storage' && (
                <div style={{ fontSize: '12px', color: '#334155', lineHeight: 1.5 }}>
                  <strong style={{ color: '#0F172A', display: 'block', marginBottom: '4px' }}>🌊 Visakhapatnam Coastal Humidity Storage Guide:</strong>
                  <p style={{ margin: 0 }}>
                    Store in ventilated paper bags. Do not wash leafy greens or vegetables before refrigerating to prevent moisture spoilage in coastal weather.
                  </p>
                </div>
              )}
              {activeTab === 'reviews' && (
                <div className="pdm-reviews-list">
                  <div className="pdm-review-snippet">
                    <div className="pdm-rev-user">Ramesh P. • ⭐⭐⭐⭐⭐</div>
                    <p>Very fresh and delivered in under 12 minutes. Exactly as good as buying in person from Sharma store!</p>
                  </div>
                  <div className="pdm-review-snippet">
                    <div className="pdm-rev-user">Priya K. • ⭐⭐⭐⭐⭐</div>
                    <p>Best pricing compared to other apps, plus it supports our local shop owner.</p>
                  </div>
                </div>
              )}
              {activeTab === 'policy' && (
                <p className="pdm-policy-text">
                  ⚡ <strong>Instant Doorstep Replacement:</strong> If damaged, expired, or unsatisfied, inform the delivery rider immediately or request a free replacement within 2 hours.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Floating Bottom Action Bar (Inspired by Screenshot 2 & 3) */}
        <div className="pdm-bottom-bar">
          <div className="pdm-bottom-price-info">
            <span className="pdm-bottom-label">Total Price</span>
            <span className="pdm-bottom-amount">₹{product.price * (qty > 0 ? qty : 1)}</span>
          </div>

          <div className="pdm-bottom-actions">
            {!product.inStock ? (
              <button
                type="button"
                className="pdm-add-cart-btn"
                disabled
                style={{ background: '#E2E8F0', color: '#64748B', cursor: 'not-allowed' }}
              >
                Sold Out (Out of Stock)
              </button>
            ) : qty === 0 ? (
              <button
                type="button"
                className="pdm-add-cart-btn"
                onClick={() => addItem(storeId, product)}
              >
                Add To Cart
              </button>
            ) : (
              <div className="pdm-qty-control">
                <button
                  type="button"
                  onClick={() => removeItem(product.id)}
                  aria-label="Decrease"
                >
                  <Minus size={15} strokeWidth={3} />
                </button>
                <span>{qty}</span>
                <button
                  type="button"
                  onClick={() => addItem(storeId, product)}
                  aria-label="Increase"
                >
                  <Plus size={15} strokeWidth={3} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
