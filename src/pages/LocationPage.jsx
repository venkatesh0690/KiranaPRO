import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Check, Home, LocateFixed, MapPin, Search, Store, X } from 'lucide-react';
import AuthModal from '../components/AuthModal';
import { useSecurity } from '../context/SecurityContext';
import { useStore } from '../context/StoreContext';

function formatSavedAddress(address) {
  return [address.title, address.street, address.landmark, address.city, address.pincode]
    .filter(Boolean)
    .join(', ');
}

export default function LocationPage({ onLocationSet, initialLocation = '' }) {
  const navigate = useNavigate();
  const { authSession, savedAddresses } = useSecurity();
  const { stores } = useStore();
  const isCustomer = authSession.isAuthenticated && authSession.role === 'customer';

  const [loginOpen, setLoginOpen] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [addressMode, setAddressMode] = useState('saved');
  const [manualAddress, setManualAddress] = useState(initialLocation);
  const [locationStatus, setLocationStatus] = useState('prompt');
  const [locationError, setLocationError] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // Never present the demo Home/Work addresses from older app versions as
  // if they belong to a real signed-in customer.
  const addresses = useMemo(() => (Array.isArray(savedAddresses) ? savedAddresses : [])
    .filter((address) => address && typeof address === 'object' && address.street)
    .filter((address) =>
      !(
        (address.id === 'addr-1' && address.title === 'Flat 402, Sai Residency') ||
        (address.id === 'addr-2' && address.title === 'Tech Hub Office, Floor 3')
      )
    ), [savedAddresses]);

  const preferredAddress = addresses.find((a) => a.isDefault) || addresses[0] || null;
  const selectedAddress = addresses.find((a) => String(a.id) === String(selectedAddressId))
    || preferredAddress;

  useEffect(() => {
    if (!isCustomer) return undefined;
    if (!navigator.permissions?.query) return undefined;

    let active = true;
    let permission;
    let listener;

    navigator.permissions.query({ name: 'geolocation' })
      .then((result) => {
        if (!active) return;
        permission = result;
        setLocationStatus(result.state);
        listener = () => {
          if (active) setLocationStatus(result.state);
        };
        if (result.addEventListener) result.addEventListener('change', listener);
      })
      .catch(() => { /* Permission status is not supported everywhere. */ });

    return () => {
      active = false;
      if (permission?.removeEventListener && listener) {
        permission.removeEventListener('change', listener);
      }
    };
  }, [isCustomer]);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('unsupported');
      setLocationError('Location access is unavailable on this device. Enter an address manually.');
      return;
    }
    setBusy(true);
    setLocationError('');
    navigator.geolocation.getCurrentPosition(
      () => {
        setBusy(false);
        setLocationStatus('granted');
        setLocationError('');
        // Coordinates are deliberately not treated as a delivery address:
        // this app does not yet have verified reverse-geocoding.
      },
      (geoError) => {
        setBusy(false);
        setLocationStatus(geoError.code === 1 ? 'denied' : 'prompt');
        setLocationError(geoError.code === 1
          ? 'Location was not permitted. Enable it in device settings or enter your address manually.'
          : 'Could not detect your location. You can still enter your address manually.');
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 300000 }
    );
  };

  const completeLocation = (event) => {
    event.preventDefault();
    const useManual = addressMode === 'manual' || addresses.length === 0;
    const chosen = useManual ? manualAddress.trim() : (selectedAddress ? formatSavedAddress(selectedAddress) : '');
    if (chosen.length < 4) {
      setError('Please select a saved address or enter your complete delivery address.');
      return;
    }
    setError('');
    onLocationSet(chosen);
    navigate('/home');
  };

  const onLoginSuccess = (type) => {
    setLoginOpen(false);
    if (type === 'seller') navigate('/seller/dashboard');
    // Customer session change displays the location sheet automatically.
  };

  if (!isCustomer) {
    return (
      <div className="kp-welcome">
        <div className="kp-welcome-image" aria-hidden="true" />
        <div className="kp-welcome-scrim" aria-hidden="true" />
        <header className="kp-welcome-header">
          <span className="kp-welcome-brand">
            <span className="kp-welcome-symbol">K</span>
            <span>Kirana<strong>PRO</strong></span>
          </span>
        </header>

        <main className="kp-welcome-main">
          <div className="kp-welcome-copy">
            <span className="kp-welcome-eyebrow">YOUR NEIGHBORHOOD MARKETPLACE</span>
            <h1>Fresh, local.<br />At your door.</h1>
            <p>Everyday groceries and fresh produce from the stores around you.</p>
            <button type="button" className="kp-welcome-login" onClick={() => setLoginOpen(true)}>
              <span>Log in to continue</span>
              <ArrowRight size={20} strokeWidth={1.75} aria-hidden="true" />
            </button>
            <span className="kp-welcome-note">Local shopping, made simple.</span>
          </div>
        </main>

        <AuthModal
          isOpen={loginOpen}
          initialMode="login"
          onClose={() => setLoginOpen(false)}
          onSuccess={onLoginSuccess}
        />
      </div>
    );
  }

  const showManual = addressMode === 'manual' || addresses.length === 0;

  return (
    <div className="kp-address-page">
      <div className="kp-address-preview" aria-hidden="true">
        <div className="kp-preview-head">
          <span className="kp-preview-brand">Kirana<strong>PRO</strong></span>
          <span className="kp-preview-sub">Your neighborhood, delivered.</span>
        </div>
        <div className="kp-preview-search">
          <Search size={18} aria-hidden="true" />
          <span>Search groceries and fresh essentials</span>
        </div>
        <h2>Explore local stores</h2>
        <div className="kp-preview-stores">
          {stores.slice(0, 3).map((store) => (
            <div className="kp-preview-store" key={store.id}>
              <div className="kp-preview-store-image">
                {store.posterImage
                  ? <img src={store.posterImage} alt="" loading="lazy" />
                  : <span>{store.image || '🏪'}</span>}
              </div>
              <strong>{store.name}</strong>
              <span>{store.deliveryTime}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="kp-address-overlay" aria-hidden="true" />

      <section className="kp-address-sheet" role="dialog" aria-modal="true" aria-labelledby="kp-address-title">
        <div className="kp-address-handle" aria-hidden="true" />

        {locationStatus !== 'granted' ? (
          <div className="kp-location-permission">
            <div className="kp-location-permission-copy">
              <div className="kp-permission-title">
                <LocateFixed size={19} strokeWidth={1.9} aria-hidden="true" />
                <h2>Location permission is off</h2>
              </div>
              <p>Allow location access to help confirm your delivery area. You can also enter an address manually.</p>
            </div>
            <button type="button" className="kp-location-grant" onClick={requestLocation} disabled={busy}>
              {busy ? 'Checking' : 'GRANT'}
            </button>
          </div>
        ) : (
          <div className="kp-location-enabled">
            <Check size={18} aria-hidden="true" />
            <span>Location access enabled. Choose your delivery address below.</span>
          </div>
        )}

        <div className="kp-address-sheet-body">
          <h2 id="kp-address-title">Select delivery address</h2>
          {locationError && <p role="status" className="kp-location-message">{locationError}</p>}

          {addresses.map((address) => (
            <button
              type="button"
              className={`kp-address-option ${!showManual && String(selectedAddress?.id) === String(address.id) ? 'selected' : ''}`}
              key={address.id}
              onClick={() => {
                setAddressMode('saved');
                setSelectedAddressId(address.id);
                setError('');
              }}
            >
              <span className="kp-address-option-icon">
                {address.type === 'Home' ? <Home size={21} /> : <MapPin size={21} />}
              </span>
              <span className="kp-address-option-text">
                <strong>{address.type || 'Saved address'}</strong>
                <span>{formatSavedAddress(address)}</span>
              </span>
              {!showManual && String(selectedAddress?.id) === String(address.id)
                ? <Check size={18} aria-hidden="true" className="kp-address-choice" />
                : null}
            </button>
          ))}

          <button
            type="button"
            className={`kp-address-option kp-manual-choice ${showManual ? 'selected' : ''}`}
            onClick={() => { setAddressMode('manual'); setError(''); }}
          >
            <span className="kp-address-option-icon"><Search size={22} /></span>
            <span className="kp-address-option-text">
              <strong>Enter location manually</strong>
              <span>Street, building, colony and city</span>
            </span>
            {showManual && <Check size={18} aria-hidden="true" className="kp-address-choice" />}
          </button>

          <form className="kp-address-form" onSubmit={completeLocation}>
            {showManual && (
              <label className="kp-manual-field">
                <span>Delivery address</span>
                <textarea
                  value={manualAddress}
                  onChange={(event) => { setManualAddress(event.target.value); setError(''); }}
                  placeholder="House / flat, street, colony, city and PIN code"
                  rows={2}
                  maxLength={240}
                  autoComplete="street-address"
                  required
                />
              </label>
            )}
            {error && <p role="alert" className="kp-address-error">{error}</p>}
            <button className="kp-address-continue" type="submit">
              Continue to stores <ArrowRight size={18} strokeWidth={1.8} aria-hidden="true" />
            </button>
          </form>

          <p className="kp-address-help">Your address is used for delivery selection. Location permission is optional.</p>
        </div>
      </section>
    </div>
  );
}
