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
import { FREE_DELIVERY_THRESHOLD, getDeliveryFee, isStoreAvailableInArea, isLocalFreshStore } from '../data/deliveryAreas';
import { VALID_COUPONS, MIN_PROMO_SUBTOTAL, evaluateCoupon, getOrderSavings, getAutomaticBasketDiscount } from '../data/checkoutOffers';
import { useCustomerOrders } from '../context/OrderHistoryContext';
import FulfilmentPicker from '../components/FulfilmentPicker';
import CatalogProductVisual from '../components/CatalogProductVisual';
import AuthModal from '../components/AuthModal';
import { quoteFulfilment, validateFulfilment } from '../utils/fulfilment';

export default function CartPage({ userLocation }) {
  const { cart, addItem, removeItem, clearCart, totalItems, totalPrice } = useCart();
  const { stores } = useStore();
  const { authSession, logSecurityEvent } = useSecurity();
  const { orderCount, nextOrderNumber, recordOrder } = useCustomerOrders();
  const navigate = useNavigate();
  const store = stores.find((s) => String(s.id).toLowerCase() === String(cart.storeId).toLowerCase());
  const storeServesArea = store && isStoreAvailableInArea(store,userLocation);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [guestAuthOpen,setGuestAuthOpen] = useState(false);
  const placingRef = useRef(false);
  const [checkoutStep,setCheckoutStep] = useState('review');
  const [deliveryAddress,setDeliveryAddress]=useState('');
  const [fulfilment,setFulfilment] = useState({mode:'standard',date:'',slot:''});

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
  const baseDeliveryFee = getDeliveryFee(store,Math.min(totalPrice,FREE_DELIVERY_THRESHOLD),null,cart.items);
  const activePromo = getOrderSavings(totalPrice,nextOrderNumber,appliedCoupon);
  const couponQualified = Boolean(appliedCoupon) && activePromo.eligible;
  const autoDiscount = getAutomaticBasketDiscount(totalPrice);
  const couponDiscount = couponQualified ? activePromo.discount : autoDiscount;
  const savingLabel = couponQualified ? appliedCoupon : (autoDiscount>0 ? 'Basket discount' : null);
  const currentQuote = quoteFulfilment({
    store,subtotal:totalPrice,discount:couponDiscount,mode:fulfilment.mode,items:cart.items
  });
  const {deliveryFee,handlingFee,tax,total:grandTotal} = currentQuote;
  const isLocalFresh = isLocalFreshStore(store);
  const isPickup = fulfilment.mode==='pickup';
  const isFreeDelivery = !isLocalFresh && totalPrice > FREE_DELIVERY_THRESHOLD;
  const fulfilmentValidation = validateFulfilment(fulfilment);

  const handlePlaceOrder = async () => {
    if(authSession.isTemporary) {
      setOrderError('Sign in with a customer account to save an order. Guest preview is for browsing only.');
      setGuestAuthOpen(true);
      return;
    }
    if(placingRef.current || orderPlaced || !storeServesArea || store?.isSample) return;
    placingRef.current = true;
    setOrderError(null);
    if(!authSession.userId){
      setOrderError('Please log in again before placing an order.');
      placingRef.current=false;
      return;
    }
    if(!isPickup && deliveryAddress.trim().length<8){
      setOrderError('Enter a full delivery address before placing the request.');
      placingRef.current=false;
      return;
    }
    const actualNext=nextOrderNumber;
    const latest=getOrderSavings(totalPrice,actualNext,appliedCoupon);
    // An expired coupon never blocks the order; use the eligible automatic
    // basket discount when applicable and don't redeem the invalid code.
    const effectiveDiscount=latest.eligible
      ? latest.discount : getAutomaticBasketDiscount(totalPrice);
    const effectiveCode=latest.eligible ? latest.code
      : (effectiveDiscount>0 ? 'BASKET30' : null);
    const requested = validateFulfilment(fulfilment,new Date());
    if(!requested.valid || checkoutStep!=='fulfilment') {
      setOrderError(requested.reason || 'Choose an order service before continuing.');
      placingRef.current=false;
      return;
    }
    const finalQuote=quoteFulfilment({
      store,subtotal:totalPrice,discount:effectiveDiscount,mode:requested.mode,items:cart.items
    });
    const saved=await recordOrder({
      storeId:cart.storeId,storeName:store?.name || 'Local Store',
      storeArea:userLocation,deliveryAddress:isPickup ? (store?.address || 'Store pickup address') : deliveryAddress.trim(),
      items:cart.items.map(i=>({id:i.id,name:i.name,qty:i.quantity,price:i.price,unit:i.unit})),
      subtotal:totalPrice,deliveryFee:finalQuote.deliveryFee,discount:effectiveDiscount,
      discountCode:effectiveCode,total:finalQuote.total,
      handlingFee:finalQuote.handlingFee,tax:finalQuote.tax,
      fulfilment:requested,
      paymentMethod:'Demo checkout — no payment processed'
    });
    if(!saved.success) {
      setOrderError(saved.error);
      placingRef.current=false;
      return;
    }
    logSecurityEvent('DEMO_ORDER_RECORDED',
      `Demo order ${saved.order.id} recorded for ${store?.name}; mode ${requested.mode}, no booking or payment made`,'info');
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
          onClick={() => checkoutStep==='fulfilment' ? (setCheckoutStep('review'),setOrderError(null)) : navigate(-1)}
          aria-label={checkoutStep==='fulfilment' ? 'Back to cart review' : 'Back'}
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="cart-title">{checkoutStep==='review'?'Review your basket':'Choose order service'}</h1>
      </div>

      {orderPlaced && (
        <div className="order-success-overlay">
          <div className="order-success-box">
            <CheckCircle2 size={42} color="#16a34a" />
            <h2>Demo Order Saved</h2>
            <p>Demo request saved to your account. No payment, delivery booking or pickup arrangement has been made.</p>
            <span>Redirecting to order tracking...</span>
          </div>
        </div>
      )}

      <div className="kp-cart-progress" aria-label="Checkout progress">
        <span className={checkoutStep==='review'?'current':'done'}>01 / Basket</span>
        <span className={checkoutStep==='fulfilment'?'current':''}>02 / Delivery or pickup</span>
      </div>

      {checkoutStep==='review' ? (
        <>
      {/* Other stores offer free delivery above ₹300; LocalFresh has its own delivery fee. */}
      <div className={`cart-delivery-status-card ${isFreeDelivery ? 'unlocked' : 'locked'}`}>
        {isLocalFresh ? (
          <div className="cdsc-inner">
            <span className="cdsc-emoji">🚚</span>
            <div className="cdsc-info">
              <span className="cdsc-title">LocalFresh delivery</span>
              <span className="cdsc-subtitle">Delivery charge is included in your bill. Pickup has no delivery fee.</span>
            </div>
          </div>
        ) : isFreeDelivery ? (
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
                <CatalogProductVisual product={it} />
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

        </>
      ) : (
        <FulfilmentPicker
          value={fulfilment}
          onChange={next=>{setFulfilment(next);setOrderError(null);}}
          store={store}
          area={userLocation}
        />
      )}

      {/* Bill Summary */}
      <div className="cart-bill-card">
        <h3 className="bill-title">Bill Details</h3>
        <div className="bill-rows">
          <div className="bill-row">
            <span>Item Total</span>
            <span>₹{totalPrice}</span>
          </div>

          <div className="bill-row">
            <span>{isPickup?'Store pickup — no delivery':'Delivery fee'}</span>
            <span>
              {isPickup ? (
                <span className="bill-free">₹0 · Customer pickup</span>
              ) : deliveryFee === 0 ? (
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
            <span>Handling fee</span>
            <span>₹{handlingFee}</span>
          </div>

          <div className="bill-row">
            <span>Estimated GST (demo)</span>
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
      {checkoutStep==='review' && <div className="kp-coupon-eligibility-note">
        <strong>Order #{nextOrderNumber}</strong> · {isLocalFresh
          ? 'LocalFresh delivery charge is shown in your bill.'
          : 'Free delivery above ₹300.'}
        {totalPrice>500
          ? ' Automatic basket saving up to ₹30 (5%, capped) applies if no eligible coupon is used.'
          : ' Basket discount up to ₹30 unlocks above ₹500.'}
        {' '}Only one discount applies per order.
      </div>}
      {orderError && <p role="alert" className="kp-cart-unavailable">{orderError}</p>}
      {checkoutStep==='fulfilment' && (
        <div className="kp-checkout-mode-summary" role="status">
          <strong>{isPickup ? 'Collect from store · ₹0 delivery' :
            fulfilment.mode==='scheduled' ? 'Scheduled delivery' : 'Standard delivery'}</strong>
          <span>
            {isPickup
              ? 'Only handling fee and estimated GST are charged in addition to the grocery total, after any eligible discount.'
              : fulfilment.mode==='scheduled'
                ? isLocalFresh
                  ? 'The delivery charge for this store is shown in your bill.'
                  : 'Standard delivery fee applies at ₹300 or below; free above ₹300.'
                : isLocalFresh
                  ? 'The delivery charge for this store is shown in your bill.'
                  : 'Normal delivery charges apply at ₹300 or below; free above ₹300.'}
          </span>
          {fulfilmentValidation.valid && fulfilment.mode!=='standard' && (
            <span className="kp-checkout-selected-time">
              Requested: {fulfilmentValidation.date} · {fulfilmentValidation.label} IST
            </span>
          )}
          {isPickup && (
            <span className="kp-checkout-pickup-warning">
              Pickup point and packing readiness require the store's confirmation. Do not travel based on this demo request.
            </span>
          )}
        </div>
      )}
      {checkoutStep==='fulfilment' && !isPickup && !authSession.isTemporary && (
        <div className="auth-field" style={{margin:'16px 18px'}}>
          <label htmlFor="checkout-delivery-address">Full delivery address</label>
          <input id="checkout-delivery-address" type="text"
            autoComplete="street-address" required minLength={8} maxLength={1000}
            value={deliveryAddress} onChange={event=>setDeliveryAddress(event.target.value)}
            placeholder="House number, street, landmark, area, Visakhapatnam"
            style={{width:'100%',padding:12,marginTop:8,border:'1px solid #aaa',borderRadius:8}}/>
          <small>Saved only to your server-verified order; not shared with other customers.</small>
        </div>
      )}
      {authSession.isTemporary && (
        <div className="kp-guest-cart-message" role="status">
          Guest preview — browse and build your basket. Log in to save a demo order.
        </div>
      )}
      <AuthModal isOpen={guestAuthOpen} initialMode="login"
        onClose={()=>setGuestAuthOpen(false)} onSuccess={()=>setGuestAuthOpen(false)}/>
      {/* Floating Checkout Button */}
      <div className="cart-checkout-bar">
        <div className="ccb-left">
          <span className="ccb-amount">₹{grandTotal}</span>
          <span className="ccb-savings">
            {isPickup ? 'Pickup · ₹0 delivery' : isFreeDelivery ? `Saved ₹${baseDeliveryFee} delivery` : `${totalItems} items in basket`}
          </span>
        </div>
        <button
          type="button"
          className="cart-checkout-btn"
          onClick={() => {
            if(checkoutStep==='review') {
              setCheckoutStep('fulfilment');
              setOrderError(null);
              window.scrollTo?.({top:0,behavior:'smooth'});
              document.querySelector('.app-content-area')?.scrollTo?.({top:0,behavior:'smooth'});
            } else if(authSession.isTemporary) setGuestAuthOpen(true);
            else handlePlaceOrder();
          }}
          disabled={orderPlaced || !storeServesArea || Boolean(store?.isSample) ||
            (checkoutStep==='fulfilment' && !fulfilmentValidation.valid)}
        >
          <span>{store?.isSample ? 'Sample store — checkout unavailable' :
            checkoutStep==='review' ? 'Continue to order service' :
            authSession.isTemporary ? 'Sign in to save order' :
            fulfilment.mode==='pickup' ? 'Save pickup request (demo)' :
            fulfilment.mode==='scheduled' ? 'Save delivery request (demo)' :
            'Save demo order'}</span>
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
