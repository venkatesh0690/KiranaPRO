import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Clock3, Star } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import StorePhotoCarousel from './StorePhotoCarousel';
import { FREE_DELIVERY_THRESHOLD } from '../data/deliveryAreas';
import { navigateWithStoreTransition, storeImageTransitionName, storeTitleTransitionName } from '../utils/storeTransition';

export default function StoreCard({ store }) {
  const navigate = useNavigate();
  const [opening, setOpening] = useState(false);
  const pending = useRef(null);
  const swipeBlockedUntil = useRef(0);
  const rating = Number(store.rating);
  const delivery = Number(store.deliveryFee) === 0 ? 'Free delivery' : `₹${store.deliveryFee} delivery`;
  useEffect(() => () => clearTimeout(pending.current),[]);

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
      navigateWithStoreTransition(navigate,`/store/${store.id}`);
    },160);
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
          {rating > 0 && <span className="kp-gallery-rating"><Star size={13} aria-hidden="true" />{rating.toFixed(1)}</span>}
        </div>
        <p className="kp-gallery-description">{store.isSample ? 'Demo listing — merchant not yet onboarded' : store.posterTagline || store.tags?.slice(0,3).join(' · ') || 'Everyday essentials'}</p>
        <div className="kp-gallery-meta">
          {store.deliveryTime && <span><Clock3 size={14} aria-hidden="true" /> {store.deliveryTime}</span>}
          <span className="kp-gallery-middot" aria-hidden="true">·</span>
          <span>{delivery} · Free above ₹{FREE_DELIVERY_THRESHOLD}</span>
        </div>
      </div>
    </Link>
  );
}
