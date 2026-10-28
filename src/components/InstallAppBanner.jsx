import React, { useState, useEffect } from 'react';
import { Download, Smartphone, X, Check } from 'lucide-react';

export default function InstallAppBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Check if already in standalone mode (already installed)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    if (isStandalone) {
      setInstalled(true);
      return;
    }

    // Check iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    window.addEventListener('appinstalled', () => {
      setInstalled(true);
      setShowBanner(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  if (installed || !showBanner) return null;

  return (
    <div className="install-app-banner">
      <div className="install-app-content">
        <div className="install-app-icon">
          <Smartphone size={22} className="text-emerald-600" />
        </div>
        <div className="install-app-text">
          <div className="install-app-title">Get KiranaPRO Mobile App</div>
          <div className="install-app-desc">Faster ordering & instant notifications</div>
        </div>
      </div>
      <div className="install-app-actions">
        {isIOS ? (
          <span className="install-ios-hint">Tap <strong>Share</strong> then <strong>Add to Home Screen</strong></span>
        ) : (
          <button onClick={handleInstallClick} className="install-btn">
            <Download size={15} />
            <span>Install</span>
          </button>
        )}
        <button onClick={() => setShowBanner(false)} className="install-dismiss-btn" aria-label="Close">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
