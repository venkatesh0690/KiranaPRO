import { useState } from 'react';
import { Plus, Minus, AlertTriangle, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';
import CatalogProductVisual from './CatalogProductVisual';
import { triggerHaptic } from '../utils/nativePlatform';

export default function ProductCard({ product, storeId, layout = 'big', categoryBg = '#FFF3E0' }) {
  const { cart, addItem, removeItem } = useCart();
  const cartItem = cart.items.find((i) => i.id === product.id);
  const qty = cartItem ? cartItem.quantity : 0;
  
  // Stock count logic
  const isOutOfStock = product.inStock === false || product.stock_count === 0;
  const stockCount = typeof product.stock_count === 'number' ? product.stock_count : (isOutOfStock ? 0 : 12);
  const isScarcity = stockCount > 0 && stockCount <= 5;
  
  // Tiered bulk pricing calculation for staples
  const isProduce = product.category === 'Vegetables' || product.category === 'Produce' || product.category === 'Fruits';
  const hasTieredDiscount = isProduce && product.price >= 20;
  const bulkPricePerUnit = hasTieredDiscount ? Math.max(product.price - 5, 10) : product.price;

  const discount = product.mrp > product.price
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
    : 0;

  const handleIncrement = () => {
    if (qty >= stockCount) return;
    triggerHaptic(10);
    addItem(storeId, product);
  };

  const handleDecrement = () => {
    triggerHaptic(10);
    removeItem(product.id);
  };

  const isMandi = String(storeId).toLowerCase() === 'localfresh' || product.isMandiDirect;

  return (
    <div className={`pc ${layout} ${isOutOfStock ? 'oos' : ''}`}>
      {/* ── Zone 1: Product Image Box with Savings Ribbon & Source Tag ── */}
      <div className="pc-img-wrap aspect-square" style={{ background: categoryBg, position: 'relative' }}>
        <CatalogProductVisual product={product} />
        {discount > 0 && (
          <div className="pc-disc" style={{ background: '#15803D', fontWeight: 850 }}>
            {product.mrp - product.price >= 5 ? `SAVE ₹${product.mrp - product.price}` : `${discount}% OFF`}
          </div>
        )}
        {isOutOfStock && (
          <div className="pc-oos-layer">Out of Stock</div>
        )}
      </div>

      {/* ── Zone 2: Title, Telugu Line-Height Guard & Unit Details ── */}
      <div className="pc-body">
        {/* Source Micro-Chip */}
        <div className="pc-source-chip">
          {isMandi ? (
            <span className="source-mandi">🌾 Mandi Direct</span>
          ) : (
            <span className="source-kirana">🏪 Local Kirana</span>
          )}
        </div>

        <span className="pc-unit">{product.unit}</span>
        <h4 className="pc-name kp-bilingual-title" style={{ minHeight: '2.9em', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {product.name}
        </h4>

        {/* Live Scarcity Indicator */}
        {isScarcity && (
          <div className="pc-scarcity-pill">
            <AlertTriangle size={11} /> Only {stockCount} left in stock!
          </div>
        )}

        {/* ── Zone 3: Price Stack (Tabular Numerics) ── */}
        <div className="pc-price-row">
          <span className="pc-price tabular-nums">₹{product.price}</span>
          {product.mrp > product.price && (
            <span className="pc-mrp tabular-nums">₹{product.mrp}</span>
          )}
        </div>

        {/* Tiered Bulk Price Badge */}
        {hasTieredDiscount && (
          <div className="pc-tiered-badge">
            ₹{product.price}/{product.unit || 'unit'} (₹{bulkPricePerUnit}/unit for 2+)
          </div>
        )}
      </div>

      {/* ── Zone 4: Action Zone with Generous Thumb Target & Haptics ── */}
      <div className="pc-action">
        {!isOutOfStock ? (
          qty === 0 ? (
            <button
              type="button"
              className="pc-add-btn"
              onClick={handleIncrement}
              style={{ minHeight: '36px', minWidth: '44px' }}
            >
              ADD
            </button>
          ) : (
            <div className="pc-qty" style={{ minHeight: '36px' }}>
              <button
                type="button"
                onClick={handleDecrement}
                aria-label="Decrease quantity"
              >
                <Minus size={13} strokeWidth={3} />
              </button>
              <span className="tabular-nums" style={{ minWidth: '20px', textAlign: 'center' }}>{qty}</span>
              <button
                type="button"
                onClick={handleIncrement}
                disabled={qty >= stockCount}
                aria-label="Increase quantity"
                style={{ opacity: qty >= stockCount ? 0.4 : 1 }}
              >
                <Plus size={13} strokeWidth={3} />
              </button>
            </div>
          )
        ) : (
          <button type="button" className="pc-add-btn" disabled>
            Sold Out
          </button>
        )}
      </div>
    </div>
  );
}
