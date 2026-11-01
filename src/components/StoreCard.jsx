import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Clock3, Star } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import StorePhotoCarousel from './StorePhotoCarousel';
import { FREE_DELIVERY_THRESHOLD, isLocalFreshStore } from '../data/deliveryAreas';
import { navigateWithStoreTransition, storeImageTransitionName, storeTitleTransitionName } from '../utils/storeTransition';

export default function StoreCard({ store }) {
  const navigate = useNavigate();
  const [opening, setOpening] = useState(false);
  const pending = useRef(null);
  const swipeBlockedUntil = useRef(0);
  const rating = Number(store.rating);
  const displayRating = (
    rating > 0
      ? rating
      : 4.6 + (((store.name || '').charCodeAt(0) % 4) * 0.1)
  ).toFixed(1);
  const delivery = isLocalFreshStore(store)
    ? 'Delivery fee at checkout'
    : Number(store.deliveryFee) === 0 ? 'Free delivery' : `₹${store.deliveryFee} delivery`;
  const isDeliveryNotAccepted =
    store.isOpen === false ||
    (store.deliveryTime && store.deliveryTime.toLowerCase().includes('not accept'));
  const categoryTag = isLocalFreshStore(store)
    ? 'Fresh Produce'
    : (() => {
        const name = (store.name || '').toLowerCase();
        const tags = (store.tags || []).join(' ').toLowerCase();
        const cats = (store.categories || []).join(' ').toLowerCase();
        const combined = `${name} ${tags} ${cats}`;
        if (combined.includes('snack') || combined.includes('treat') || combined.includes('drinks') || combined.includes('munchies')) return 'Snacks';
        if (combined.includes('supplies') || combined.includes('home') || combined.includes('cleaning') || combined.includes('stationery') || combined.includes('departmental') || combined.includes('personal care')) return 'Supplies';
        if (combined.includes('fresh produce') || combined.includes('fruits') || combined.includes('vegetables') || combined.includes('basket') || combined.includes('harvest')) return 'Fresh Produce';
        if (combined.includes('provisions') || combined.includes('spices') || combined.includes('pulses') || combined.includes('grains')) return 'Provisions';
        return 'Groceries';
      })();

  useEffect(() => () => clearTimeout(pending.current), []);

  const openStore = (event) => {
    if (Date.now() < swipeBlockedUntil.current) { event.preventDefault(); return; }
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || opening) return;
    event.preventDefault();
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      navigate(`/store/${store.id}`);
      return;
    }
    setOpening(true);
    // Visible tap feedback before navigation, even in older Android WebViews.
    pending.current = window.setTimeout(() => {
      navigateWithStoreTransition(navigate, `/store/${store.id}`);
    }, 65);
  };

  return (
    <Link
      to={`/store/${store.id}`}
      className={`store-card kp-gallery-card kp-motion-store ${opening ? 'kp-is-opening' : ''}`}
      onClick={openStore}
      aria-label={`Open ${store.name}`}
    >
      <div className="kp-gallery-media" style={{ viewTransitionName: storeImageTransitionName(store.id) }}>
        <StorePhotoCarousel
          store={store}
          onSwipe={() => { swipeBlockedUntil.current = Date.now() + 650; }}
        />
        {store.isOpen === false && <span className="kp-gallery-closed">Currently closed</span>}
        <span className="kp-gallery-open-icon" aria-hidden="true"><ArrowUpRight size={19} strokeWidth={1.7}/></span>
      </div>
      <div className="kp-gallery-copy">
        <div className="kp-gallery-kicker">
          <span>{store.isAdminManaged ? 'DIRECT MARKET' : store.isSample ? 'SAMPLE STORE' : 'LOCAL STORE'}</span>
          {store.distance && <span className="kp-gallery-distance">{store.distance}</span>}
        </div>
        <div className="kp-gallery-title-row">
          <h3 style={{ viewTransitionName: storeTitleTransitionName(store.id) }}>{store.name}</h3>
          <span className="kp-gallery-rating"><Star size={13} aria-hidden="true" fill="currentColor" />{displayRating}</span>
        </div>
        <p className="kp-gallery-description">
          {store.isSample ? 'Preview Store · Opening Soon' : store.posterTagline || store.tags?.slice(0, 3).join(' · ') || 'Everyday essentials'}
        </p>
        <div className="kp-insta-card-delivery">
          <span className="kp-insta-eta-bolt">
            {isDeliveryNotAccepted
              ? '⚡ Delivery not accepted'
              : `⚡ Delivery ${store.deliveryTime?.toLowerCase().startsWith('within') ? store.deliveryTime : `in ${store.deliveryTime || '20–30 mins'}`}`}
          </span>
          <span className="kp-insta-pickup-note">· 🚗 Pickup available</span>
        </div>
        <div className="kp-insta-card-tags">
          <span className="kp-insta-deal-tag">{categoryTag}</span>
          {!isLocalFreshStore(store) && (
            <span className="kp-insta-sub-tag">Free delivery above ₹{FREE_DELIVERY_THRESHOLD}</span>
          )}
        </div>
        {store.isSample ? (
          <div className="kp-gallery-meta">
            <span className="kp-sample-store-note">Preview Store · Opening Soon</span>
          </div>
        ) : (
          <div className="kp-gallery-meta">
            {store.deliveryTime && <span><Clock3 size={14} aria-hidden="true" /> {store.deliveryTime}</span>}
            <span className="kp-gallery-middot" aria-hidden="true">·</span>
            <span>{delivery}{isLocalFreshStore(store) ? '' : ` · Free delivery above ₹${FREE_DELIVERY_THRESHOLD}`}</span>
          </div>
        )}
      </div>
    </Link>
  );
}
