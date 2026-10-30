/**
 * Android & iOS Native Platform Integrations (Phase 35 Prompt 35.1 & 35.3)
 */

export function triggerHaptic(duration = 10) {
  try {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      navigator.vibrate(duration);
    }
  } catch {}
}

export function shareContent({ title, text, url }) {
  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : 'https://kiranapro.vercel.app');
  if (typeof navigator !== 'undefined' && navigator.share) {
    navigator.share({ title: title || 'KiranaPRO', text, url: shareUrl }).catch(() => {});
  } else if (typeof window !== 'undefined') {
    // Fallback to WhatsApp deep link
    const waText = encodeURIComponent(`${title ? title + ' - ' : ''}${text ? text + ' ' : ''}${shareUrl}`);
    window.open(`https://wa.me/?text=${waText}`, '_blank');
  }
}

export function setMetaThemeColor(color) {
  if (typeof document === 'undefined') return;
  let meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('name', 'theme-color');
    document.head.appendChild(meta);
  }
  meta.setAttribute('content', color);
}
