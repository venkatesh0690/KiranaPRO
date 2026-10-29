import { useEffect, useMemo, useRef, useState } from 'react';
import { getStoreGallery, getStoreImageFallback } from '../data/storeGallery';

export default function StorePhotoCarousel({ store, className = '', onSwipe }) {
  const gallery = useMemo(() => getStoreGallery(store), [store?.id]);
  const [active, setActive] = useState(0);
  const root = useRef(null);
  const touchStart = useRef(null);
  const visible = useRef(false);
  const [canAutoplay, setCanAutoplay] = useState(false);

  useEffect(() => setActive(0), [store?.id]);

  useEffect(() => {
    const node = root.current;
    if (!node || !('IntersectionObserver' in window)) {
      visible.current = true;
      setCanAutoplay(true);
      return undefined;
    }
    const observer = new IntersectionObserver(([entry]) => {
      visible.current = Boolean(entry?.isIntersecting);
      setCanAutoplay(visible.current);
    }, { threshold: 0.12 });
    observer.observe(node);
    return () => observer.disconnect();
  }, [store?.id]);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (!canAutoplay || gallery.length <= 1 || prefersReducedMotion) return undefined;
    const timer = window.setInterval(() => {
      if (!document.hidden && visible.current) setActive(index => (index + 1) % gallery.length);
    }, 3600);
    return () => window.clearInterval(timer);
  }, [canAutoplay, gallery.length]);

  const touchBegin = (event) => {
    if (!event.touches?.length) return;
    touchStart.current = { x: event.touches[0].clientX, y: event.touches[0].clientY };
  };

  const touchEnd = (event) => {
    if (!touchStart.current || !event.changedTouches?.length) return;
    const deltaX = event.changedTouches[0].clientX - touchStart.current.x;
    const deltaY = event.changedTouches[0].clientY - touchStart.current.y;
    touchStart.current = null;
    if (Math.abs(deltaX) > 35 && Math.abs(deltaX) > Math.abs(deltaY) * 1.15) {
      setActive(index => (index + (deltaX < 0 ? 1 : gallery.length - 1)) % gallery.length);
      onSwipe?.();
    }
  };

  const fallback = getStoreImageFallback(store);
  if (!gallery.length) {
    return (
      <div className={`kp-store-slideshow kp-sample-photo ${className}`}
        aria-label={`Sample store listing without a verified photograph: ${store.name}`}>
        <span aria-hidden="true">{store.image || '🏪'}</span>
        <strong>Sample store</strong>
        <small>Photo pending merchant registration</small>
      </div>
    );
  }
  return (
    <div
      ref={root}
      className={`kp-store-slideshow ${className}`}
      onTouchStart={touchBegin}
      onTouchEnd={touchEnd}
      aria-label={`Illustrative photos for ${store.name}`}
    >
      {gallery.map((photo, index) => (
        <img
          className={`kp-store-slide ${index === active ? 'is-active' : ''}`}
          key={photo.src}
          src={photo.src}
          alt={index === active ? photo.alt : ''}
          aria-hidden={index !== active}
          draggable={false}
          loading={index === 0 ? 'eager' : 'lazy'}
          decoding="async"
          onError={(event) => {
            const image = event.currentTarget;
            if (fallback && !image.dataset.fallback) {
              image.dataset.fallback = 'true';
              image.src = fallback;
            } else {
              image.style.display = 'none';
            }
          }}
        />
      ))}
      <span className="kp-photo-disclosure">Representative store photography</span>
      <div className="kp-store-photo-dots" aria-hidden="true">
        {gallery.map((_, index) => (
          <span key={index} className={index === active ? 'is-active' : ''} />
        ))}
      </div>
    </div>
  );
}
