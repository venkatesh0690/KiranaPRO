import { ArrowUpRight, Clock3, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Calm, editorial-style store tile.
 * The entire tile remains a single keyboard-accessible navigation link.
 */
export default function StoreCard({ store }) {
  const isDirect = String(store.id).toLowerCase() === 'localfresh' || store.isAdminManaged;
  const description = store.posterTagline ||
    (Array.isArray(store.tags) ? store.tags.slice(0, 3).join(' · ') : '') ||
    'Everyday essentials from your neighborhood';
  const deliveryFee = Number(store.deliveryFee) === 0
    ? 'Free delivery'
    : `₹${store.deliveryFee} delivery`;
  const rating = Number(store.rating);

  return (
    <Link to={`/store/${store.id}`} className="store-card kp-store-card kp-editorial-card">
      <div className="kp-editorial-media" aria-hidden="true">
        {store.posterImage ? (
          <img src={store.posterImage} alt="" loading="lazy" decoding="async" />
        ) : (
          <span className="kp-editorial-placeholder">{store.image || '🏪'}</span>
        )}
      </div>

      <div className="kp-editorial-content">
        <div className="kp-editorial-eyebrow">
          <span>{isDirect ? 'FRESH MARKET' : 'NEIGHBORHOOD STORE'}</span>
          {store.distance && <span className="kp-editorial-distance">{store.distance}</span>}
        </div>

        <h3 className="kp-editorial-name">{store.name}</h3>
        <p className="kp-editorial-description">{description}</p>

        <div className="kp-editorial-facts">
          {store.deliveryTime && (
            <span className="kp-editorial-fact">
              <Clock3 size={14} strokeWidth={1.8} aria-hidden="true" />
              {store.deliveryTime}
            </span>
          )}
          <span className="kp-editorial-separator" aria-hidden="true" />
          <span className="kp-editorial-fact">{deliveryFee}</span>
          {rating > 0 && (
            <span className="kp-editorial-rating">
              <Star size={13} strokeWidth={1.8} aria-hidden="true" />
              {rating.toFixed(1)}
            </span>
          )}
        </div>

        <div className="kp-editorial-foot">
          <span className={store.isOpen === false ? 'kp-editorial-closed' : 'kp-editorial-cta'}>
            {store.isOpen === false ? 'Currently closed · View details' : 'Explore store'}
          </span>
          <ArrowUpRight size={17} strokeWidth={1.7} aria-hidden="true" />
        </div>
      </div>
    </Link>
  );
}
