export function storeImageTransitionName(id) {
  return `kp-store-image-${String(id).replace(/[^a-z0-9_-]/gi, '-')}`;
}
export function storeTitleTransitionName(id) {
  return `kp-store-title-${String(id).replace(/[^a-z0-9_-]/gi, '-')}`;
}
// Prior implementation deferred React Router navigation into a browser view
// transition and forced flushSync. Android WebViews may cancel or reject the
// transition, leaving a store card apparently unresponsive. Route navigation
// must happen immediately; visual effects should never gate page access.
export function navigateWithStoreTransition(navigate, to) {
  navigate(to);
}
