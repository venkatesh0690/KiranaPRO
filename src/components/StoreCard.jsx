import { Star, Clock, Bike, Package, ChevronRight, ShieldCheck, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function StoreCard({ store, layout = 'grid' }) {
  const isMandi = store.id === 'localfresh' || store.isAdminManaged;
  const isNearby = !isMandi && parseFloat(store.distance || '1.0') <= 0.5;

  // ─── Compact View (Horizontal Row with Real Poster Thumbnail) ───
  if (layout === 'compact') {
    return (
      <Link to={`/store/${store.id}`} className="store-card layout-compact">
        {/* Left AI Poster Thumbnail */}
        <div className="scc-avatar-wrap">
          {store.posterImage ? (
            <img src={store.posterImage} alt={store.name} className="scc-poster-thumb" />
          ) : (
            <div
              className="scc-avatar"
              style={{ background: `linear-gradient(135deg, ${store.coverFrom}, ${store.coverTo})` }}
            >
              <span className="scc-emoji">{store.image}</span>
            </div>
          )}
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

          <p className="scc-tags-txt">
            {store.posterTagline || store.tags.slice(0, 3).join(' • ')}
          </p>

          <div className="scc-meta-row">
            <span
              className="scc-eta-pill"
              style={{
                color: isMandi ? '#15803D' : (isNearby ? '#059669' : '#D97706'),
                background: isMandi ? '#DCFCE7' : (isNearby ? '#ECFDF5' : '#FEF3C7')
              }}
            >
              <Clock size={11} strokeWidth={2.5} /> {store.posterBadge || store.deliveryTime}
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
          <ChevronRight size={18} />
        </div>
      </Link>
    );
  }

  // ─── Grid View (Card with Rich AI Seller Poster Banner) ───
  return (
    <Link to={`/store/${store.id}`} className="store-card layout-grid">
      {/* AI-Designed Seller Poster Cover */}
      <div className="sc-cover-poster-wrap">
        {store.posterImage ? (
          <img src={store.posterImage} alt={store.name} className="sc-poster-img" />
        ) : (
          <div
            className="sc-cover"
            style={{ background: `linear-gradient(135deg, ${store.coverFrom}, ${store.coverTo})` }}
          >
            <span className="sc-emoji">{store.image}</span>
          </div>
        )}
        <div className="sc-poster-gradient-overlay" />

        {/* Top Badges */}
        <div className="sc-poster-top-bar">
          <div
            className="sc-delivery-badge-pill"
            style={{
              background: isMandi ? 'rgba(22, 163, 74, 0.92)' : 'rgba(15, 23, 42, 0.85)',
              color: '#FFFFFF'
            }}
          >
            <Clock size={11} strokeWidth={2.5} />
            <span>{isMandi ? '🥦 Mandi • Within 2 hrs' : (store.posterBadge || '⚡ 20-30 mins delivery')}</span>
          </div>

          <div className="sc-rating-pill-floating">
            <Star size={11} fill="#16A34A" color="#16A34A" />
            <span>{store.rating}</span>
          </div>
        </div>

        {/* Offer Ribbon */}
        {store.offer && (
          <div className="sc-offer-strip">
            <p className="sc-offer-text">🏷️ {store.offer}</p>
          </div>
        )}

        {!store.isOpen && (
          <div className="sc-closed-veil">
            <div className="sc-closed-badge">Closed for Today</div>
          </div>
        )}
      </div>

      {/* Body Details */}
      <div className="sc-body">
        <div className="sc-top">
          <div className="sc-name-wrap">
            <span className="sc-store-avatar-mini">{store.image}</span>
            <h3 className="sc-name">{store.name}</h3>
          </div>
          {isMandi && (
            <span className="sc-badge-mandi">🛡️ Mandi Hub</span>
          )}
          {isNearby && !isMandi && (
            <span className="sc-badge-nearby">⚡ Near You</span>
          )}
        </div>

        <p className="sc-tagline">
          {store.posterTagline || store.tags.slice(0, 3).join(' · ')}
        </p>

        <div className="sc-footer-meta">
          <div className="sc-fee-tag">
            {store.deliveryFee === 0 ? (
              <span className="sc-free-del">Free Delivery</span>
            ) : (
              <span>₹{store.deliveryFee} Delivery</span>
            )}
          </div>
          <span className="sc-dot">•</span>
          <div className="sc-dist-tag">
            <Package size={11} />
            <span>{store.distance}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
