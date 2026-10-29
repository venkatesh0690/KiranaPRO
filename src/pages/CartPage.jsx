import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Minus,
  Plus,
  Trash2,
  Clock,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Tag,
  Check,
  X,
  ChevronRight
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useSecurity } from '../context/SecurityContext';
import { useStore } from '../context/StoreContext';
import { FREE_DELIVERY_THRESHOLD, getDeliveryFee, isStoreAvailableInArea } from '../data/deliveryAreas';
import { VALID_COUPONS, MIN_PROMO_SUBTOTAL, evaluateCoupon, getOrderSavings, getAutomaticBasketDiscount } from '../data/checkoutOffers';
import { useCustomerOrders, readCustomerOrders, getCustomerKey } from '../context/OrderHistoryContext';

export default function CartPage({ userLocation }) {
  const { cart, addItem, removeItem, clearCart, totalItems, totalPrice } = useCart();
  const { stores } = useStore();
  const { authSession, logSecurityEvent } = useSecurity();
  const { orderCount, nextOrderNumber, recordOrder } = useCustomerOrders();
  const navigate = useNavigate();
  const store = stores.find((s) => String(s.id).toLowerCase() === String(cart.storeId).toLowerCase());
  const storeServesArea = store && isStoreAvailableInArea(store,userLocation);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const placingRef = useRef(false);

  // Coupon selection is tied to the customer's next successfully placed order.
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null); // one coupon code
  const [couponStatus, setCouponStatus] = useState(null);
  const [orderError, setOrderError] = useState(null);

  const handleApplyCoupon = (codeToApply) => {
    const code = String(codeToApply || couponCode).trim().toUpperCase();
    if(!code)return;
    const quote = evaluateCoupon(code,totalPrice,nextOrderNumber);
    if(!quote.eligible){
      setCouponStatus({type:'error',message:quote.reason});
      return;
    }
    setAppliedCoupon(code);
    setCouponStatus({type:'success',message:`${code} unlocked for order #${nextOrderNumber}.`});
    setCouponCode('');
  };
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponStatus(null);
  };

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

  // Free delivery is independent of coupons: only when subtotal > ₹300.
  const isFreeDelivery = totalPrice > FREE_DELIVERY_THRESHOLD;
  const baseDeliveryFee = store?.deliveryFee ?? 20;
  const deliveryFee = getDeliveryFee(store,totalPrice);
  const activePromo = getOrderSavings(totalPrice,nextOrderNumber,appliedCoupon);
  const couponQualified = Boolean(appliedCoupon) && activePromo.eligible;
  const autoDiscount = getAutomaticBasketDiscount(totalPrice);
  const couponDiscount = couponQualified ? activePromo.discount : autoDiscount;
  const savingLabel = couponQualified ? appliedCoupon : (autoDiscount>0 ? 'Basket discount' : null);
  const handlingFee = 5;
  const tax = Math.round(Math.max(0,totalPrice-couponDiscount)*.05);
  const grandTotal = Math.max(0,totalPrice-couponDiscount+deliveryFee+handlingFee+tax);

  const handlePlaceOrder = () => {
    if(placingRef.current || orderPlaced || !storeServesArea || store?.isSample) return;
    placingRef.current = true;
    setOrderError(null);
    const accountKey=getCustomerKey(authSession);
    if(!accountKey) {
      setOrderError('Please log in again before placing an order.');
      placingRef.current=false;
      return;
    }
    // Re-read order history at submission instead of trusting a stale screen.
    const actualNext=readCustomerOrders(accountKey).length+1;
    const latest=getOrderSavings(totalPrice,actualNext,appliedCoupon);
    // An expired coupon never blocks the order; use the eligible automatic
    // basket discount when applicable and don't redeem the invalid code.
    const effectiveDiscount=latest.eligible
      ? latest.discount : getAutomaticBasketDiscount(totalPrice);
    const effectiveCode=latest.eligible ? latest.code
      : (effectiveDiscount>0 ? 'BASKET30' : null);
    const finalTax=Math.round(Math.max(0,totalPrice-effectiveDiscount)*.05);
    const finalTotal=Math.max(0,totalPrice-effectiveDiscount+deliveryFee+handlingFee+finalTax);
    const saved=recordOrder({
      storeId:cart.storeId,storeName:store?.name || 'Local Store',
      storeArea:userLocation,
      items:cart.items.map(i=>({id:i.id,name:i.name,qty:i.quantity,price:i.price,unit:i.unit})),
      subtotal:totalPrice,deliveryFee,discount:effectiveDiscount,
      discountCode:effectiveCode,total:finalTotal,handlingFee,tax:finalTax,
      paymentMethod:'Demo checkout — no payment processed'
    });
    if(!saved.success) {
      setOrderError(saved.error);
      placingRef.current=false;
      return;
    }
    logSecurityEvent('DEMO_ORDER_RECORDED',
      `Demo order #${saved.order.orderNumber} saved for ${store?.name}; subtotal ₹${totalPrice}, discount ₹${effectiveDiscount}`,'info');
    setOrderPlaced(true);
    window.setTimeout(()=>{
      clearCart();
      navigate('/orders');
    },750);
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
            <h2>Demo Order Saved</h2>
            <p>Your order was saved locally. No payment or delivery has been scheduled.</p>
            <span>Redirecting to order tracking...</span>
          </div>
        </div>
      )}

      {/* Free delivery applies once the item subtotal exceeds ₹300. */}
      <div className={`cart-delivery-status-card ${isFreeDelivery ? 'unlocked' : 'locked'}`}>
        {isFreeDelivery ? (
          <div className="cdsc-inner">
            <span className="cdsc-emoji">🎉</span>
            <div className="cdsc-info">
              <span className="cdsc-title">FREE Delivery Unlocked!</span>
              <span className="cdsc-subtitle">
                {`Cart is above ₹300 (Saved ₹${baseDeliveryFee} delivery fee)`}
              </span>
            </div>
            <span className="cdsc-tag">₹0 FEE</span>
          </div>
        ) : (
          <div className="cdsc-inner">
            <span className="cdsc-emoji">🚚</span>
            <div className="cdsc-info">
              <div className="cdsc-header-row">
                <span className="cdsc-title">
                  Add <strong>₹{Math.max(0, FREE_DELIVERY_THRESHOLD + 1 - totalPrice)}</strong> more for <strong>FREE Delivery</strong>!
                </span>
                <span className="cdsc-needed">Above ₹300</span>
              </div>
              <div className="cdsc-progress-bar">
                <div
                  className="cdsc-progress-fill"
                  style={{ width: `${Math.min(100, Math.round((totalPrice / (FREE_DELIVERY_THRESHOLD + 1)) * 100))}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Store Banner */}
      <div className="cart-store-card">
        <div className="csc-img">
          {store?.posterImage ? (
            <img src={store.posterImage} alt={store.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }} />
          ) : (
            <span style={{ fontSize: '1.4rem' }}>{store?.image || '🏪'}</span>
          )}
        </div>
        <div>
          <h2 className="csc-name">{store?.name || 'Neighborhood Store'}</h2>
          <p className="csc-address">📍 {store?.address || 'Local Kirana Partner, Vizag'}</p>
        </div>
      </div>

      {/* Cart Items List: Redesigned with small icons and item names (matching Image 2) */}
      <div className="cart-items-wrap">
        <div className="cart-items-hd">
          <span>Items in Basket ({totalItems})</span>
          <button type="button" className="cart-clear-btn" onClick={clearCart}>
            <Trash2 size={13} /> Clear All
          </button>
        </div>

        <div className="cart-compact-items-list">
          {cart.items.map((it) => (
            <div key={it.id} className="cart-compact-row">
              {/* Small Icon Thumbnail (matching Image 2) */}
              <div className="cc-thumb-wrap">
                {it.image?.startsWith('http') ? (
                  <img src={it.image} alt={it.name} className="cc-thumb-img" />
                ) : (
                  <div className="cc-thumb-emoji">{it.image || '🥬'}</div>
                )}
              </div>

              {/* Item Name & Details */}
              <div className="cc-info">
                <h3 className="cc-name">{it.name}</h3>
                <div className="cc-sub-meta">
                  <span className="cc-unit">{it.unit || 'unit'}</span>
                  <span className="cc-price">₹{it.price}</span>
                </div>
              </div>

              {/* Compact Quantity Controls */}
              <div className="cc-controls">
                <button
                  type="button"
                  className="cc-qty-btn minus"
                  onClick={() => removeItem(it.id)}
                  aria-label="Decrease quantity"
                >
                  <Minus size={12} />
                </button>
                <span className="cc-qty-count">{it.quantity}</span>
                <button
                  type="button"
                  className="cc-qty-btn plus"
                  onClick={() => addItem(cart.storeId, it)}
                  aria-label="Increase quantity"
                >
                  <Plus size={12} />
                </button>
              </div>

              {/* Delete Cross Icon */}
              <button
                type="button"
                className="cc-delete-btn"
                onClick={() => {
                  for (let i = 0; i < (it.quantity || 1); i++) {
                    removeItem(it.id);
                  }
                }}
                title="Remove item"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ── Coupon Code Entry Field (Inspired by Image 2 Checkout Screen) ── */}
      <div className="cart-coupon-card">
        <div className="coupon-card-header">
          <Tag size={16} color="var(--brand)" />
          <span>Apply Promo Code</span>
        </div>

        {!appliedCoupon ? (
          <div className="coupon-input-box">
            <input
              type="text"
              placeholder="Coupon: WELCOME, REPEAT, ADDICTED"
              value={couponCode}
              onChange={(e) => {
                setCouponCode(e.target.value);
                setCouponStatus(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleApplyCoupon();
              }}
            />
            <button
              type="button"
              className="coupon-apply-btn"
              onClick={() => handleApplyCoupon()}
            >
              <span>Apply</span>
            </button>
          </div>
        ) : (
          <div className="coupon-applied-pill">
            <div className="cap-left">
              <CheckCircle2 size={16} color="#16A34A" />
              <div>
                <strong>{appliedCoupon} {couponQualified ? 'applied' : 'not eligible'}</strong>
                <span>
                  {couponQualified ? `Saved ₹${activePromo.discount}` : activePromo.reason}
                </span>
              </div>
            </div>
            <button
              type="button"
              className="coupon-remove-btn"
              onClick={handleRemoveCoupon}
              title="Remove coupon"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Quick Suggestion Chips */}
        {!appliedCoupon && (
          <div className="coupon-suggestions-row">
            <span className="cs-label">Try:</span>
            {['WELCOME','REPEAT','ADDICTED'].map((code) => (
              <button
                key={code}
                type="button"
                className="coupon-chip-btn"
                onClick={() => handleApplyCoupon(code)}
              >
                {code}
              </button>
            ))}
          </div>
        )}

        {couponStatus && (
          <div className={`coupon-msg-inline ${couponStatus.type}`}>
            {couponStatus.type === 'success' ? <Check size={13} /> : <AlertCircle size={13} />}
            <span>{couponStatus.message}</span>
          </div>
        )}
      </div>

      {appliedCoupon && !couponQualified && (
        <p className="kp-coupon-threshold-note" role="status">
          {appliedCoupon} is not applicable to order #{nextOrderNumber}: {activePromo.reason}
          {autoDiscount>0 && ' The automatic basket discount applies instead when eligible.'}
        </p>
      )}

      {/* Delivery area is selected from five fixed Vizag zones. */}
      <button type="button" className="cart-delivery-address-card" onClick={() => navigate('/')}>
        <div className="cdac-left">
          <span className="cdac-icon">📍</span>
          <div>
            <span className="cdac-label">Delivery area: {userLocation}</span>
            <span className="cdac-address">Change delivery area</span>
          </div>
        </div>
        <ChevronRight size={16} color="#94A3B8" />
      </button>

      {/* Bill Summary */}
      <div className="cart-bill-card">
        <h3 className="bill-title">Bill Details</h3>
        <div className="bill-rows">
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

          {couponDiscount > 0 && (
            <div className="bill-row discount">
              <span>{savingLabel}</span>
              <span className="bill-discount-txt">-₹{couponDiscount}</span>
            </div>
          )}

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
        </div>
      </div>

      {(!storeServesArea || store?.isSample) && (
        <p role="status" className="kp-cart-unavailable">
          {store?.isSample
            ? 'This is a sample store listing. Checkout will open when a verified merchant is onboarded.'
            : 'This store is not available in your selected delivery area. Choose another area or store.'}
        </p>
      )}
      <div className="kp-coupon-eligibility-note">
        <strong>Order #{nextOrderNumber}</strong> · Free delivery above ₹300.
        {totalPrice>500
          ? ' Automatic basket saving up to ₹30 (5%, capped) applies if no eligible coupon is used.'
          : ' Basket discount up to ₹30 unlocks above ₹500.'}
        {' '}Only one discount applies per order.
      </div>
      {orderError && <p role="alert" className="kp-cart-unavailable">{orderError}</p>}
      {/* Floating Checkout Button */}
      <div className="cart-checkout-bar">
        <div className="ccb-left">
          <span className="ccb-amount">₹{grandTotal}</span>
          <span className="ccb-savings">
            {isFreeDelivery ? `Saved ₹${baseDeliveryFee} delivery` : `${totalItems} items in basket`}
          </span>
        </div>
        <button
          type="button"
          className="cart-checkout-btn"
          onClick={handlePlaceOrder}
          disabled={orderPlaced || !storeServesArea || Boolean(store?.isSample)}
        >
          <span>{store?.isSample ? 'Sample store — checkout unavailable' : 'Save Demo Order'}</span>
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
