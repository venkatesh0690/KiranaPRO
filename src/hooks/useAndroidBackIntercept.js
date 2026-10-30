import { useEffect } from 'react';

/**
 * Android Hardware/Gesture Back-Button Modal Intercept (Phase 35 Prompt 35.2)
 * Pushes a shallow history state when modal opens, so swiping back
 * or pressing the hardware back button closes the modal instead of
 * navigating away from the page.
 */
export function useAndroidBackIntercept(isOpen, onClose) {
  useEffect(() => {
    if (!isOpen) return;

    // Push a dummy history state entry for the modal
    window.history.pushState({ modalOpen: true }, '');

    const handlePopState = (e) => {
      // User pressed back button or edge-swiped back
      onClose();
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isOpen, onClose]);
}
