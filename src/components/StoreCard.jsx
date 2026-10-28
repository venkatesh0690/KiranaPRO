import { ArrowUpRight, Clock3, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function StoreCard({ store }) {
  const isMandi = String(store.id).toLowerCase() === 'localfresh' || store.isAdminManaged;
  const description = store.posterTagline || (Array.isArray(store.tags) ? store.tags.slice(0, 3).join(' · ') : '');
  const delivery = store.deliveryFee === 0 ? 'Free delivery' : `₹${store.deliveryFee} delivery`;

  return (
    <Link to={`/store/${store.id}`} className="store-card kp-store-card">
      <div className="kp-store-image">
        {store.posterImage
          ? <img src={store.posterImage} alt="" loading="lazy" />
          : <span role="img" aria-label="Store">{store.image || '🏪'}</span>
        }
      </div>
      <div className="kp-store-info">
        <div className="kp-store-title-row">
          <h3>{store.name}</h3>
          {isMandi && <span className="kp-store-direct">Direct</span>}
        </div>
        <p className="kp-store-description">{description || 'Neighborhood grocery essentials'}</p>
        <div className="kp-store-details">
          <span><Clock3 size={13} /> {store.deliveryTime}</span>
          <span className="kp-meta-dot" aria-hidden="true">·</span>
          <span>{delivery}</span>
          {Number(store.rating) > 0 && <span className="kp-store-rating"><Star size={13} /> {store.rating}</span>}
        </div>
        {!store.isOpen && <span className="kp-store-closed">Currently closed</span>}
      </div>
      <ArrowUpRight className="kp-store-arrow" size={17} aria-hidden="true" />
    </Link>
  );
}
