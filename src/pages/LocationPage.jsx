import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Check, MapPin, ShoppingBasket } from 'lucide-react';
import AuthModal from '../components/AuthModal';
import { useSecurity } from '../context/SecurityContext';
import { useStore } from '../context/StoreContext';
import { DELIVERY_AREAS, getStoresForArea, isDeliveryArea } from '../data/deliveryAreas';

export default function LocationPage({ onLocationSet, initialLocation = '' }) {
  const navigate = useNavigate();
  const { authSession, loginTemporaryCustomer } = useSecurity();
  const { stores } = useStore();
  const isCustomer = authSession.isAuthenticated && authSession.role === 'customer';
  const [showLogin,setShowLogin] = useState(false);
  const [selectedArea,setSelectedArea] = useState(isDeliveryArea(initialLocation) ? initialLocation : '');
  const [error,setError] = useState('');

  const selectArea = event => {
    event.preventDefault();
    if (!isDeliveryArea(selectedArea)) {
      setError('Choose one of the five delivery areas.');
      return;
    }
    setError('');
    onLocationSet(selectedArea);
    navigate('/home');
  };

  const onLoginSuccess = (role) => {
    setShowLogin(false);
    if (role === 'seller') navigate('/seller/dashboard');
  };

  if (!isCustomer) {
    return (
      <div className="kp-welcome">
        <div className="kp-welcome-image" aria-hidden="true" />
        <div className="kp-welcome-scrim" aria-hidden="true" />
        <header className="kp-welcome-header">
          <span className="kp-welcome-brand"><span className="kp-welcome-symbol">K</span>
            <span>Kirana<strong>PRO</strong></span>
          </span>
        </header>
        <main className="kp-welcome-main">
          <div className="kp-welcome-copy">
            <span className="kp-welcome-eyebrow">YOUR NEIGHBORHOOD MARKETPLACE</span>
            <h1>Fresh, local.<br />At your door.</h1>
            <p>Everyday groceries and fresh produce from the stores around you.</p>
            <button type="button" className="kp-welcome-login" onClick={() => setShowLogin(true)}>
              <span>Log in to continue</span><ArrowRight size={20} aria-hidden="true" />
            </button>
            <button type="button" className="kp-welcome-guest"
              onClick={() => loginTemporaryCustomer()}>
              Explore as guest <ArrowRight size={17} aria-hidden="true"/>
            </button>
            <span className="kp-welcome-note">Guest preview expires in 30 minutes. Browsing only; sign in to place an order.</span>
          </div>
        </main>
        <AuthModal isOpen={showLogin} initialMode="login"
          onClose={() => setShowLogin(false)} onSuccess={onLoginSuccess} />
      </div>
    );
  }

  return (
    <div className="kp-zone-page">
      <div className="kp-zone-preview" aria-hidden="true">
        <div className="kp-zone-preview-brand">Kirana<strong>PRO</strong></div>
        <p>Choose your neighborhood to see its nearby stores.</p>
        <div className="kp-zone-preview-graphics">
          <span>🥬</span><span>🛒</span><span>🌽</span><span>🥛</span>
        </div>
      </div>
      <div className="kp-zone-overlay" aria-hidden="true" />
      <section className="kp-zone-sheet" role="dialog" aria-modal="true" aria-labelledby="kp-zone-heading">
        <span className="kp-zone-handle" aria-hidden="true" />
        <div className="kp-zone-intro">
          <span className="kp-zone-overline"><MapPin size={15} /> VISAKHAPATNAM DELIVERY</span>
          <h1 id="kp-zone-heading">Select your area</h1>
          <p>Browse four neighborhood stores plus LocalFresh in each area. Sample stores are previews.</p>
        </div>
        <form onSubmit={selectArea}>
          <div className="kp-zone-choices" role="group" aria-label="Available delivery areas">
            {DELIVERY_AREAS.map(area => {
              const shops = getStoresForArea(stores,area);
              const selected = selectedArea === area;
              return (
                <button type="button" key={area}
                  className={`kp-zone-option ${selected?'selected':''}`}
                  aria-pressed={selected}
                  onClick={() => { setSelectedArea(area);setError(''); }}>
                  <span className="kp-zone-option-icon"><ShoppingBasket size={19} /></span>
                  <span className="kp-zone-option-name">
                    <strong>{area}</strong>
                    <span>{Math.max(0,shops.length-1)} neighborhood listings + LocalFresh</span>
                  </span>
                  <span className="kp-zone-check">{selected ? <Check size={18} /> : null}</span>
                </button>
              );
            })}
          </div>
          {error && <p role="alert" className="kp-zone-error">{error}</p>}
          <button type="submit" className="kp-zone-continue" disabled={!selectedArea}>
            <span>Continue to stores</span><ArrowRight size={18} />
          </button>
        </form>
        <p className="kp-zone-footnote">Choose only from these five locations. Sample shop listings are labeled until merchants register.</p>
      </section>
    </div>
  );
}
