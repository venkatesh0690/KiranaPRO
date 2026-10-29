import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight, ShoppingBag, Tag } from 'lucide-react';
import { FEATURED_CHECKOUT_OFFERS } from '../data/checkoutOffers';
import { getAreaFeaturedPicks } from '../utils/areaFeaturedPicks';
import CatalogProductVisual from './CatalogProductVisual';

function SwipeRail({ items, label, className = '', autoAdvance = false, children }) {
  const trackRef = useRef(null);
  const currentRef = useRef(0);
  const pausedUntil = useRef(0);
  const hovered = useRef(false);
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(false);

  const go = useCallback((index) => {
    const rail = trackRef.current;
    if (!rail || items.length === 0) return;
    const safe = (index + items.length) % items.length;
    const child = rail.children[safe];
    const first = rail.children[0];
    if (!child || !first) return;
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    rail.scrollTo({ left: child.offsetLeft - first.offsetLeft, behavior: reduced ? 'instant' : 'smooth' });
    currentRef.current = safe;
    setCurrent(safe);
  }, [items.length]);

  useEffect(() => {
    const rail = trackRef.current;
    if (!rail) return undefined;
    if (typeof IntersectionObserver !== 'function') {
      setVisible(true);
      return undefined;
    }
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(Boolean(entry?.isIntersecting)),
      { threshold:0.15 }
    );
    observer.observe(rail);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!autoAdvance || !visible || items.length < 2) return undefined;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined;
    const timer = window.setInterval(() => {
      if (!document.hidden && !hovered.current && Date.now() > pausedUntil.current) {
        go(currentRef.current + 1);
      }
    }, 5700);
    return () => window.clearInterval(timer);
  }, [autoAdvance, visible, items.length, go]);

  const onScroll = () => {
    const rail = trackRef.current;
    if (!rail || !rail.children.length) return;
    const first = rail.children[0].offsetLeft;
    let closest = 0;
    let distance = Infinity;
    Array.from(rail.children).forEach((child,index) => {
      const d = Math.abs(child.offsetLeft - first - rail.scrollLeft);
      if (d < distance) { closest = index; distance = d; }
    });
    setCurrent(closest);
    currentRef.current = closest;
  };

  return (
    <div className={`kp-area-rail ${className}`}>
      <div className="kp-area-rail-actions">
        <span aria-live="polite">{current + 1} / {items.length}</span>
        <button type="button" aria-label={`Previous ${label}`} disabled={items.length<2}
          onClick={() => {pausedUntil.current=Date.now()+12000;go(currentRef.current-1);}}>
          <ChevronLeft size={18} />
        </button>
        <button type="button" aria-label={`Next ${label}`} disabled={items.length<2}
          onClick={() => {pausedUntil.current=Date.now()+12000;go(currentRef.current+1);}}>
          <ChevronRight size={18} />
        </button>
      </div>
      <div
        ref={trackRef}
        role="region"
        aria-label={label}
        aria-roledescription="carousel"
        className="kp-area-rail-track"
        tabIndex={0}
        onScroll={onScroll}
        onPointerEnter={() => { hovered.current=true; }}
        onPointerLeave={() => { hovered.current=false; }}
        onFocus={() => { hovered.current=true; }}
        onBlur={() => { hovered.current=false; }}
        onTouchStart={() => {pausedUntil.current=Date.now()+12000;}}
        onKeyDown={event => {
          if (event.key==='ArrowRight') {event.preventDefault();go(currentRef.current+1);}
          if (event.key==='ArrowLeft') {event.preventDefault();go(currentRef.current-1);}
        }}
      >
        {items.map((item,index) => (
          <div key={item.id} className="kp-area-rail-item" role="group" aria-roledescription="slide"
            aria-label={`${index+1} of ${items.length}`}>
            {children(item,index)}
          </div>
        ))}
      </div>
      <div className="kp-area-rail-dots" aria-label={`${label} pagination`}>
        {items.map((item,index) => (
          <button type="button" key={item.id} className={current===index?'active':''}
            aria-current={current===index?'true':undefined}
            aria-label={`Go to ${label} slide ${index+1}`}
            onClick={() => {pausedUntil.current=Date.now()+12000;go(index);}} />
        ))}
      </div>
    </div>
  );
}

export function NeighborhoodOffers({ area, navigate, totalItems }) {
  // Checkout rules are shared with CartPage. These are actionable discounts,
  // not unimplemented store marketing claims.
  const offers = FEATURED_CHECKOUT_OFFERS;
  const openOffer = () => navigate(totalItems > 0 ? '/cart' : '/store/localfresh');

  return (
    <section className="kp-area-section kp-area-offers" aria-labelledby="kp-area-offers-title">
      <div className="kp-area-section-head">
        <div>
          <span className="kp-concept-index">02 / YOUR SAVINGS</span>
          <h2 id="kp-area-offers-title">More for your basket.</h2>
          <p>Checkout offers available when shopping in {area}.</p>
        </div>
        <span className="kp-area-head-icon" aria-hidden="true"><Tag size={20}/></span>
      </div>
      <SwipeRail items={offers} label="Checkout offers" className="kp-area-offer-rail" autoAdvance>
        {offer => (
          <article className={`kp-area-offer-card kp-area-offer-${offer.tone}`}>
            <div className="kp-area-offer-content">
              <span className="kp-area-offer-kicker">{offer.kicker}</span>
              <h3>{offer.title}</h3>
              <p>{offer.subtitle}</p>
              <div className="kp-area-offer-bottom">
                {offer.code
                  ? <span className="kp-area-code">CODE: {offer.code}</span>
                  : <span className="kp-area-code">ALL STORES</span>}
                <button type="button" onClick={openOffer} aria-label={`Shop with offer ${offer.title}`}>
                  Shop now <ArrowRight size={15}/>
                </button>
              </div>
            </div>
            <div className="kp-area-offer-graphic" aria-hidden="true">
              <span>{offer.icon}</span>
              <strong>{offer.highlight}</strong>
            </div>
          </article>
        )}
      </SwipeRail>
    </section>
  );
}

export function NeighborhoodPicks({ area, stores, catalog, navigate }) {
  const picks = useMemo(() =>
    getAreaFeaturedPicks(stores, catalog, area, 9),
    [area,stores,catalog]
  );
  if (!picks.length) return null;

  const openProduct = entry => navigate(`/store/${entry.storeId}`, {
    state:{ category:entry.category, productId:entry.id }
  });

  return (
    <section className="kp-area-section kp-area-trending" aria-labelledby="kp-area-trending-title">
      <div className="kp-area-section-head">
        <div>
          <span className="kp-concept-index">04 / NEAR YOU</span>
          <h2 id="kp-area-trending-title">Trending picks in {area}.</h2>
          <p>Recommended from products listed by stores serving your area.</p>
        </div>
        <span className="kp-area-head-icon" aria-hidden="true"><ShoppingBag size={20}/></span>
      </div>
      <SwipeRail items={picks} label={`Grocery picks in ${area}`} className="kp-area-picks-rail">
        {entry => (
          <button type="button" className="kp-area-pick-card" onClick={() => openProduct(entry)}
            aria-label={`View ${entry.product.name} at ${entry.storeName}, ₹${entry.product.price}`}>
            <span className="kp-area-pick-photo">
              <CatalogProductVisual product={entry.product} />
              <span className="kp-area-pick-arrow"><ArrowUpRight size={16} aria-hidden="true"/></span>
            </span>
            <span className="kp-area-pick-category">{entry.category}</span>
            <strong>{entry.product.name}</strong>
            <span className="kp-area-pick-unit">{entry.product.unit}</span>
            <span className="kp-area-pick-bottom">
              <b>₹{entry.product.price}</b>
              {Number(entry.product.mrp)>Number(entry.product.price) &&
                <del>₹{entry.product.mrp}</del>}
            </span>
            <span className="kp-area-pick-store">{entry.storeName}</span>
          </button>
        )}
      </SwipeRail>
      <p className="kp-area-disclaimer">
        Picks use available catalog and review metadata, not verified real-time order trends.
        Demo stores are excluded.
      </p>
    </section>
  );
}
