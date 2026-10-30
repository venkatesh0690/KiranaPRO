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
  const delivery = isLocalFreshStore(store)
    ? 'Delivery fee at checkout'
    : Number(store.deliveryFee) === 0 ? 'Free delivery' : `₹${store.deliveryFee} delivery`;

  const [voted, setVoted] = useState(() => {
    try {
      return localStorage.getItem(`kp_voted_${store.id}`) === 'true';
    } catch {
      return false;
    }
  });

  const [voteCount, setVoteCount] = useState(() => {
    const seed = (store.name || '').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const base = 28 + (seed % 27);
    try {
      const stored = localStorage.getItem(`kp_votecount_${store.id}`);
      return stored ? Number(stored) : base;
    } catch {
      return base;
    }
  });

  useEffect(() => () => clearTimeout(pending.current), []);

  const handleVote = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const nextVoted = !voted;
    const nextCount = nextVoted ? voteCount + 1 : voteCount - 1;
    setVoted(nextVoted);
    setVoteCount(nextCount);
    try {
      localStorage.setItem(`kp_voted_${store.id}`, String(nextVoted));
      localStorage.setItem(`kp_votecount_${store.id}`, String(nextCount));
    } catch {}
  };

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
          {rating > 0 && <span className="kp-gallery-rating"><Star size={13} aria-hidden="true" />{rating.toFixed(1)}</span>}
        </div>
        <p className="kp-gallery-description">
          {store.isSample ? 'Demand pending — vote to bring this shop online' : store.posterTagline || store.tags?.slice(0, 3).join(' · ') || 'Everyday essentials'}
        </p>
        {store.isSample ? (
          <div className="kp-fasttrack-row" onClick={e => e.stopPropagation()}>
            <button
              type="button"
              className={`kp-vote-fasttrack-btn ${voted ? 'voted' : ''}`}
              onClick={handleVote}
              aria-label={`Vote to fast-track onboarding for ${store.name}`}
            >
              <span className="kp-vote-icon">{voted ? '✓' : '⚡'}</span>
              <span>{voted ? `Fast-Track Requested (${voteCount} neighbors)` : `Vote to Fast-Track in Your Area (${voteCount} requested)`}</span>
            </button>
          </div>
        ) : (
          <div className="kp-gallery-meta">
            {store.deliveryTime && <span><Clock3 size={14} aria-hidden="true" /> {store.deliveryTime}</span>}
            <span className="kp-gallery-middot" aria-hidden="true">·</span>
            <span>{delivery}{isLocalFreshStore(store) ? '' : ` · Free above ₹${FREE_DELIVERY_THRESHOLD}`}</span>
          </div>
        )}
      </div>
    </Link>
  );
}
