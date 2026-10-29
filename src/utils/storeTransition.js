import { flushSync } from 'react-dom';

export function storeImageTransitionName(id) {
  return `kp-store-image-${String(id).replace(/[^a-z0-9_-]/gi, '-')}`;
}
export function storeTitleTransitionName(id) {
  return `kp-store-title-${String(id).replace(/[^a-z0-9_-]/gi, '-')}`;
}
export function navigateWithStoreTransition(navigate, to) {
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || typeof document.startViewTransition !== 'function') {
    navigate(to);
    return;
  }
  document.startViewTransition(() => {
    flushSync(() => navigate(to));
  });
}
