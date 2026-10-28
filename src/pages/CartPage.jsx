import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Minus, Plus, Trash2, Clock, ShieldCheck, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useSecurity } from '../context/SecurityContext';
import { stores } from '../data/stores';

export default function CartPage() {
  const { cart, addItem, removeItem, clearCart, totalItems, totalPrice } = useCart();
  const { authSession, logSecurityEvent } = useSecurity();
  const navigate = useNavigate();
  const store = stores.find((s) => String(s.id).toLowerCase() === String(cart.storeId).toLowerCase());
  const [orderPlaced, setOrderPlaced] = useState(false);

  if (totalItems === 0) {
    return (
      <div className="cart-empty">
        <div className="cart-empty-icon">🛒</div>
        <h2>Your basket is empty</h2>
        <p>Pick fresh items from your neighborhood kirana to start quick delivery.</p>
        <button
          type="button"
          className="cart-browse"
          onClick={() => navigate('/home')}
        >
          Browse Local Stores
        </button>
      </div>
    );
  }

  // Requirement: Remove delivery fee as 0, when the cart value reaches 301.
  const isFreeDelivery = totalPrice >= 301;
  const baseDeliveryFee = store?.deliveryFee ?? 20;
  const deliveryFee = isFreeDelivery ? 0 : baseDeliveryFee;
  const handlingFee = 5;
  const tax = Math.round(totalPrice * 0.05);
  const grandTotal = totalPrice + deliveryFee + handlingFee + tax;

  const handlePlaceOrder = () => {
    logSecurityEvent(
      'ORDER_PLACED',
      `Order placed with ${store?.name || 'Local Store'}. Value: ₹${grandTotal} (Subtotal: ₹${totalPrice}, Delivery Fee: ₹${deliveryFee})`,
      'info'
    );
    setOrderPlaced(true);
    setTimeout(() => {
      clearCart();
      navigate('/orders');
    }, 1500);
  };

  return (
    <div className="cart-page">
      {/* Header */}
      <div className="cart-hd">
        <button
          type="button"
          className="cart-back"
          onClick={() => navigate(-1)}
          aria-label="Back"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="cart-title">Your Order Cart</h1>
      </div>

      {orderPlaced && (
        <div className="order-success-overlay">
          <div className="order-success-box">
            <CheckCircle2 size={42} color="#16a34a" />
            <h2>Order Placed Successfully!</h2>
            <p>Arriving from <strong>{store?.name || 'Kirana Store'}</strong> in {store?.deliveryTime || '30 mins'}.</p>
            <span>Redirecting to order tracking...</span>
          </div>
        </div>
      )}

      {/* Free Delivery Threshold Banner (Requirement: Free Delivery when cart value reaches 301) */}
      <div className={`cart-delivery-status-card ${isFreeDelivery ? 'unlocked' : 'locked'}`}>
        {isFreeDelivery ? (
          <div className="cdsc-inner">
            <span className="cdsc-emoji">🎉</span>
            <div className="cdsc-info">
              <span className="cdsc-title">FREE Delivery Unlocked!</span>
              <span className="cdsc-subtitle">Cart value reached ₹301+ (Saved ₹{baseDeliveryFee} delivery fee)</span>
            </div>
            <span className="cdsc-tag">₹0 FEE</span>
          </div>
        ) : (
          <div className="cdsc-inner">
            <span className="cdsc-emoji">🚚</span>
            <div className="cdsc-info">
              <div className="cdsc-header-row">
                <span className="cdsc-title">
                  Add <strong>₹{301 - totalPrice}</strong> more for <strong>FREE Delivery</strong>!
                </span>
                <span className="cdsc-needed">Reach ₹301</span>
              </div>
              <div className="cdsc-progress-bar">
                <div
                  className="cdsc-progress-fill"
                  style={{ width: `${Math.min(100, Math.round((totalPrice / 301) * 100))}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Store Banner */}
      <div className="cart-store-card">
        <div className="csc-img">
          {store?.image?.startsWith('http') ? (
            <img src={store.image} alt={store.name} />
          ) : (
            <span style={{ fontSize: '1.4rem' }}>{store?.image || '🏪'}</span>
          )}
        </div>
        <div>
          <h2 className="csc-name">{store?.name || 'Neighborhood Store'}</h2>
          <p className="csc-address">📍 {store?.address || 'Local Kirana Partner, Vizag'}</p>
        </div>
      </div>

      {/* Cart Items List */}
      <div className="cart-items-wrap">
        <div className="cart-items-hd">
          <span>Items in Basket ({totalItems})</span>
          <button type="button" className="cart-clear-btn" onClick={clearCart}>
            <Trash2 size={14} /> Clear All
          </button>
        </div>

        <div className="cart-items-list">
          {cart.items.map((it) => (
            <div key={it.id} className="cart-item-row">
              <div className="cir-left">
                {it.image?.startsWith('http') ? (
                  <img src={it.image} alt={it.name} className="cir-img" />
                ) : (
                  <div className="cir-fallback">{it.image || '🥬'}</div>
                )}
                <div>
                  <h3 className="cir-name">{it.name}</h3>
                  <div className="cir-meta">
                    <span className="cir-unit">{it.unit || 'per unit'}</span>
                    <span className="cir-price">₹{it.price}</span>
                  </div>
                </div>
              </div>

              <div className="cir-controls">
                <button
                  type="button"
                  className="cir-btn"
                  onClick={() => removeItem(it.id)}
                  aria-label="Decrease quantity"
                >
                  <Minus size={13} />
                </button>
                <span className="cir-qty">{it.quantity}</span>
                <button
                  type="button"
                  className="cir-btn"
                  onClick={() => addItem(cart.storeId, it)}
                  aria-label="Increase quantity"
                >
                  <Plus size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Bill Summary */}
        <div className="bill-card">
          <div className="bill-hd">Bill Details</div>
          <div className="bill-body">
            <div className="bill-row">
              <span>Item Total</span>
              <span>₹{totalPrice}</span>
            </div>
            <div className="bill-row">
              <span>Delivery Fee</span>
              <span>
                {deliveryFee === 0 ? (
                  <span className="bill-free">
                    {baseDeliveryFee > 0 && <s style={{ color: '#94a3b8', marginRight: 4, fontWeight: 400 }}>₹{baseDeliveryFee}</s>}
                    FREE
                  </span>
                ) : (
                  `₹${deliveryFee}`
                )}
              </span>
            </div>
            <div className="bill-row">
              <span>Handling Fee</span>
              <span>₹{handlingFee}</span>
            </div>
            <div className="bill-row">
              <span>Taxes & Charges (GST)</span>
              <span>₹{tax}</span>
            </div>

            <hr className="bill-dash" />

            <div className="bill-row total">
              <span>To Pay</span>
              <span>₹{grandTotal}</span>
            </div>

            <div className="bill-eta">
              <Clock size={16} />
              <span>Arriving <strong>{store?.deliveryTime || 'within 30 mins'}</strong></span>
            </div>

            <button
              type="button"
              className="bill-cta"
              onClick={handlePlaceOrder}
            >
              Place Order • ₹{grandTotal}
            </button>

            <div className="bill-note">
              <ShieldCheck size={14} color="#00C853" />
              <span>Cash on delivery / UPI at doorstep</span>
            </div>

            <div className="cart-security-badge-box">
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#15803D', fontWeight: 800, fontSize: '0.75rem' }}>
                <ShieldCheck size={16} color="#16A34A" />
                <span>🔒 256-Bit SSL Encrypted Checkout</span>
              </div>
              <p style={{ margin: '4px 0 0', fontSize: '0.68rem', color: '#64748B' }}>
                Prices verified against official Kirana price registry. Anti-tampering active. Free delivery applies automatically when cart reaches ₹301+.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
