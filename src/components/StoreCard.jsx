import { Star, Clock, Bike, Package, ChevronRight, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function StoreCard({ store, layout = 'grid' }) {
  const isMandi = store.id === 'localfresh' || store.isAdminManaged;
  const isNearby = !isMandi && parseFloat(store.distance || '1.0') <= 0.5;

  // ─── Compact View (Dense Horizontal Row) ───
  if (layout === 'compact') {
    return (
      <Link to={`/store/${store.id}`} className="store-card layout-compact">
        {/* Left Gradient Avatar */}
        <div
          className="scc-avatar"
          style={{ background: `linear-gradient(135deg, ${store.coverFrom}, ${store.coverTo})` }}
        >
          <span className="scc-emoji">{store.image}</span>
          {!store.isOpen && <div className="scc-closed-badge">Closed</div>}
        </div>

        {/* Center Information */}
        <div className="scc-content">
          <div className="scc-top-line">
            <div className="scc-title-wrap">
              <h4 className="scc-name">{store.name}</h4>
              {isMandi && (
                <span className="scc-mandi-tag">
                  <ShieldCheck size={11} strokeWidth={2.5} /> Mandi Direct
                </span>
              )}
              {isNearby && (
                <span className="scc-nearby-tag">⚡ Nearby</span>
              )}
            </div>

            <div className="scc-rating">
              <Star size={11} fill="#16A34A" color="#16A34A" />
              <span>{store.rating}</span>
            </div>
          </div>

          <p className="scc-tags-txt">{store.tags.slice(0, 3).join(' • ')}</p>

          <div className="scc-meta-row">
            <span
              className="scc-eta-pill"
              style={{
                color: isMandi ? '#15803D' : (isNearby ? '#059669' : '#D97706'),
                background: isMandi ? '#DCFCE7' : (isNearby ? '#ECFDF5' : '#FEF3C7')
              }}
            >
              <Clock size={11} strokeWidth={2.5} /> {store.deliveryTime}
            </span>
            <span className="scc-meta-sep">•</span>
            <span className="scc-fee">
              {store.deliveryFee === 0 ? 'Free Delivery' : `₹${store.deliveryFee} Fee`}
            </span>
            <span className="scc-meta-sep">•</span>
            <span className="scc-dist">{store.distance}</span>
          </div>
        </div>

        {/* Right Arrow */}
        <div className="scc-arrow">
          <ChevronRight size={16} />
        </div>
      </Link>
    );
  }

  // ─── Grid View (2-Column Card) ───
  return (
    <Link to={`/store/${store.id}`} className="store-card layout-grid">
      {/* Cover Banner */}
      <div
        className="sc-cover"
        style={{ background: `linear-gradient(135deg, ${store.coverFrom}, ${store.coverTo})` }}
      >
        <span className="sc-emoji">{store.image}</span>

        {isMandi ? (
          <div className="sc-featured" style={{ background: '#16A34A', color: 'white' }}>
            🥦 Mandi • Within 2 hrs
          </div>
        ) : isNearby ? (
          <div className="sc-featured" style={{ background: '#059669', color: 'white' }}>
            ⚡ 20 Mins (Nearby)
          </div>
        ) : store.isFeatured ? (
          <div className="sc-featured">⭐ Featured</div>
        ) : null}

        {store.offer && (
          <div className="sc-offer-strip">
            <p className="sc-offer-text">🏷️ {store.offer}</p>
          </div>
        )}

        {!store.isOpen && (
          <div className="sc-closed-veil">
            <div className="sc-closed-badge">Closed</div>
          </div>
        )}
      </div>

      {/* Body Details */}
      <div className="sc-body">
        <div className="sc-top">
          <div className="sc-name-wrap">
            <h3 className="sc-name">{store.name}</h3>
            {isMandi ? (
              <span className="sc-badge-mandi">🛡️ Mandi Hub</span>
            ) : isNearby ? (
              <span className="sc-badge-nearby">⚡ Near You</span>
            ) : null}
          </div>
          <div className="sc-rating">
            <Star size={11} fill="#16A34A" color="#16A34A" />
            <span className="sc-rating-num">{store.rating}</span>
          </div>
        </div>

        <p className="sc-tags">{store.tags.slice(0, 2).join(' · ')}</p>

        <div className="sc-meta">
          <div
            className="sc-meta-pill"
            style={{
              color: isMandi ? '#15803D' : (isNearby ? '#059669' : '#D97706'),
              fontWeight: 800
            }}
          >
            <Clock size={11} strokeWidth={2.5} />
            <span>{store.deliveryTime}</span>
          </div>
          <span className="sc-dot">•</span>
          <div className="sc-meta-pill">
            <Package size={11} />
            <span>{store.distance}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
