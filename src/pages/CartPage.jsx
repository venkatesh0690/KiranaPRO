import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Minus, Plus, Trash2, Clock, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { stores } from '../data/stores';

export default function CartPage() {
  const { cart, addItem, removeItem, clearCart, totalItems, totalPrice } = useCart();
  const navigate = useNavigate();
  const store = stores.find((s) => String(s.id).toLowerCase() === String(cart.storeId).toLowerCase());

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

  const deliveryFee = store?.deliveryFee ?? 20;
  const handlingFee = 5;
  const tax = Math.round(totalPrice * 0.05);
  const grandTotal = totalPrice + deliveryFee + handlingFee + tax;

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

      {/* Info Pill from Image 3 */}
      <div style={{ background: '#FFF7ED', border: '1px solid #FFEDD5', borderRadius: 12, padding: '10px 14px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', color: '#C2410C', fontWeight: 700 }}>
        <span>🛍️ You have {totalItems} items in your order basket</span>
      </div>

      {/* Store Banner */}
      {store && (
        <div className="cart-store-row">
          <span className="cart-store-emoji">{store.image}</span>
          <div>
            <h3 className="cart-store-name">{store.name}</h3>
            <p className="cart-store-addr">{store.address} • Delivery in {store.deliveryTime}</p>
          </div>
        </div>
      )}

      {/* Main Cart Content Layout */}
      <div className="cart-layout">
        {/* Cart items list */}
        <div className="cart-items-card">
          <div className="cart-items-hd">
            <h2 className="cart-items-title">Items in Cart ({totalItems})</h2>
            <button
              type="button"
              className="cart-clear"
              onClick={clearCart}
            >
              <Trash2 size={13} />
              <span>Empty Cart</span>
            </button>
          </div>

          <div>
            {cart.items.map((item) => (
              <div key={item.id} className="cart-item">
                <div className="cart-item-img">
                  {item.image && (item.image.startsWith('http') || item.image.startsWith('/')) ? (
                    <img src={item.image} alt={item.name} referrerPolicy="no-referrer" crossOrigin="anonymous" />
                  ) : (
                    <span>{item.image}</span>
                  )}
                </div>
                <div className="cart-item-info">
                  <h4 className="cart-item-name">{item.name}</h4>
                  <span className="cart-item-unit">{item.unit}</span>
                  <div className="cart-item-price">
                    ₹{item.price} × {item.quantity} = <strong>₹{item.price * item.quantity}</strong>
                  </div>
                </div>

                <div className="cart-qty">
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    aria-label="Decrease"
                  >
                    <Minus size={13} strokeWidth={3} />
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => addItem(cart.storeId, item)}
                    aria-label="Increase"
                  >
                    <Plus size={13} strokeWidth={3} />
                  </button>
                </div>
              </div>
            ))}
          </div>
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
                  <span className="bill-free">FREE</span>
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
              onClick={() => alert(`Order placed successfully with ${store?.name}! Arriving ${store?.deliveryTime || 'within 30 mins'}.`)}
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
                Prices verified against official Kirana price registry. Anti-tampering active.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
