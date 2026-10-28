import { ArrowUpRight, Clock3, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Image-first storefront discovery card.
 * One entire accessible link, keeping existing store navigation intact.
 */
export default function StoreCard({ store }) {
  const isDirect = String(store.id).toLowerCase() === 'localfresh' || store.isAdminManaged;
  const description = store.posterTagline ||
    (Array.isArray(store.tags) ? store.tags.slice(0, 3).join(' · ') : '') ||
    'Fresh essentials and local favorites';
  const rating = Number(store.rating);
  const delivery = Number(store.deliveryFee) === 0
    ? 'Free delivery'
    : `₹${store.deliveryFee} delivery`;

  return (
    <Link to={`/store/${store.id}`} className="store-card kp-gallery-card">
      <div className="kp-gallery-media">
        <span className="kp-gallery-fallback" aria-hidden="true">{store.image || '🏪'}</span>
        {store.posterImage && (
          <img
            src={store.posterImage}
            alt=""
            loading="lazy"
            decoding="async"
            onError={(event) => { event.currentTarget.style.display = 'none'; }}
          />
        )}
        {store.isOpen === false && (
          <span className="kp-gallery-closed">Currently closed</span>
        )}
        <span className="kp-gallery-open-icon" aria-hidden="true">
          <ArrowUpRight size={19} strokeWidth={1.7} />
        </span>
      </div>
      <div className="kp-gallery-copy">
        <div className="kp-gallery-kicker">
          <span>{isDirect ? 'DIRECT MARKET' : 'LOCAL STORE'}</span>
          {store.distance && <span className="kp-gallery-distance">{store.distance}</span>}
        </div>
        <div className="kp-gallery-title-row">
          <h3>{store.name}</h3>
          {rating > 0 && (
            <span className="kp-gallery-rating">
              <Star size={13} aria-hidden="true" strokeWidth={1.7} />
              {rating.toFixed(1)}
            </span>
          )}
        </div>
        <p className="kp-gallery-description">{description}</p>
        <div className="kp-gallery-meta">
          {store.deliveryTime && (
            <span><Clock3 size={14} aria-hidden="true" strokeWidth={1.7} /> {store.deliveryTime}</span>
          )}
          <span className="kp-gallery-middot" aria-hidden="true">·</span>
          <span>{delivery}</span>
        </div>
      </div>
    </Link>
  );
}
