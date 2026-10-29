import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronDown, MapPin } from 'lucide-react';
import AuthModal from '../components/AuthModal';

const knownAreas = [
  'Maddilapalem, Vizag',
  'MVP Colony, Vizag',
  'Seethammadhara, Vizag',
  'Dwaraka Nagar, Vizag',
  'Siripuram, Vizag',
  'Gopalapatnam, Vizag',
];
const OTHER_AREA = '__other__';

export default function LocationPage({ onLocationSet, initialLocation = '' }) {
  const navigate = useNavigate();
  const isKnownArea = knownAreas.includes(initialLocation);
  const [area, setArea] = useState(
    initialLocation ? (isKnownArea ? initialLocation : OTHER_AREA) : knownAreas[0]
  );
  const [manualArea, setManualArea] = useState(
    initialLocation && !isKnownArea ? initialLocation : ''
  );
  const [error, setError] = useState('');
  const [showLogin, setShowLogin] = useState(false);

  const continueShopping = (event) => {
    event?.preventDefault();
    const chosenLocation = (area === OTHER_AREA ? manualArea : area).trim();
    if (!chosenLocation) {
      setError('Enter a delivery area to continue.');
      return;
    }

    setError('');
    onLocationSet(chosenLocation);
    navigate('/home');
  };

  const handleLoginSuccess = (type) => {
    setShowLogin(false);
    // The seller and admin dashboards are still available on their protected routes.
    if (type === 'seller') {
      navigate('/seller/dashboard');
      return;
    }
    continueShopping();
  };

  return (
    <div className="kp-entry">
      <header className="kp-entry-header">
        <div className="kp-entry-brand" aria-label="KiranaPRO">
          <span className="kp-entry-mark" aria-hidden="true">K</span>
          <span>Kirana<strong>PRO</strong></span>
        </div>
        <span className="kp-entry-header-note">Your everyday marketplace</span>
      </header>

      <main className="kp-entry-main">
        <div className="kp-entry-content">
          <div className="kp-entry-eyebrow"><span className="kp-entry-dot" /> MADE FOR YOUR NEIGHBORHOOD</div>
          <h1>Everyday shopping, <em>closer to home.</em></h1>
          <p className="kp-entry-description">
            Fresh produce and essentials from trusted local stores.
          </p>

          <form className="kp-entry-form" onSubmit={continueShopping}>
            <label className="kp-entry-field-label" htmlFor="kp-delivery-area">
              Your delivery area
            </label>
            <div className="kp-entry-location">
              <MapPin size={17} strokeWidth={1.8} aria-hidden="true" />
              <select
                id="kp-delivery-area"
                value={area}
                onChange={(event) => {
                  setArea(event.target.value);
                  setError('');
                }}
              >
                {knownAreas.map((spot) => (
                  <option key={spot} value={spot}>{spot}</option>
                ))}
                <option value={OTHER_AREA}>Enter another area</option>
              </select>
              <ChevronDown size={16} strokeWidth={1.8} className="kp-entry-chevron" aria-hidden="true" />
            </div>

            {area === OTHER_AREA && (
              <label className="kp-entry-manual-label" htmlFor="kp-custom-area">
                <span>Street, colony or neighborhood</span>
                <input
                  id="kp-custom-area"
                  type="text"
                  value={manualArea}
                  onChange={(event) => {
                    setManualArea(event.target.value);
                    setError('');
                  }}
                  placeholder="e.g. Rushikonda, Vizag"
                  maxLength={120}
                  autoComplete="address-level3"
                  autoFocus
                />
              </label>
            )}

            {error && <p role="alert" className="kp-entry-error">{error}</p>}

            <button className="kp-entry-continue" type="submit">
              <span>Continue shopping</span>
              <ArrowRight size={17} strokeWidth={1.8} aria-hidden="true" />
            </button>
          </form>

          <div className="kp-entry-auth">
            <span>Already have an account?</span>
            <button type="button" className="kp-entry-login" onClick={() => setShowLogin(true)}>
              Log in
            </button>
          </div>
        </div>
      </main>

      <footer className="kp-entry-footer">
        <span>Local stores. Everyday essentials.</span>
        <span>Visakhapatnam, Andhra Pradesh</span>
      </footer>

      <AuthModal
        isOpen={showLogin}
        initialMode="login"
        onClose={() => setShowLogin(false)}
        onSuccess={handleLoginSuccess}
      />
    </div>
  );
}
