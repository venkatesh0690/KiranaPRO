import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Navigation, Store, Shield, ArrowRight, Check, UserPlus, LogIn, User } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useSecurity } from '../context/SecurityContext';
import AuthModal from '../components/AuthModal';

const quickSpots = [
  { label: 'Maddilapalem', distance: '0.4 km', icon: '🏪' },
  { label: 'MVP Colony', distance: '0.3 km', icon: '🏬' },
  { label: 'Seethammadhara', distance: '0.7 km', icon: '🌳' },
  { label: 'Dwaraka Nagar', distance: '0.9 km', icon: '🏢' },
  { label: 'Siripuram', distance: '1.2 km', icon: '🛍️' },
  { label: 'Gopalapatnam', distance: '1.8 km', icon: '⛽' },
];

export default function LocationPage({ onLocationSet }) {
  const [detecting, setDetecting] = useState(false);
  const [selectedSpot, setSelectedSpot] = useState('Maddilapalem, Vizag');
  const [customInput, setCustomInput] = useState('');
  const [showManualModal, setShowManualModal] = useState(false);
  const [authModalMode, setAuthModalMode] = useState(null); // 'user-signup' | 'seller-signup' | 'user-login'

  const { setActiveRole } = useStore();
  const { authSession } = useSecurity();
  const navigate = useNavigate();

  const handleGpsDetect = () => {
    setDetecting(true);
    setTimeout(() => {
      const detected = 'Maddilapalem, Vizag';
      setSelectedSpot(detected);
      setDetecting(false);
      onLocationSet(detected);
      navigate('/home');
    }, 1200);
  };

  const handleConfirm = () => {
    const finalLocation = customInput.trim() || selectedSpot;
    onLocationSet(finalLocation);
    navigate('/home');
  };

  return (
    <div className="loc-onboarding-screen">
      {/* ── Top Role Switcher & Sign Up Links ── */}
      <div className="startup-role-nav">
        <span className="startup-brand">⚡ Kirana<strong>PRO</strong></span>
        <div className="startup-role-pills">
          {/* User Sign Up Button */}
          <button
            type="button"
            className="role-pill-btn signup-user"
            onClick={() => setAuthModalMode('user-signup')}
            title="Create Customer Account"
          >
            <UserPlus size={13} />
            <span>User Sign Up</span>
          </button>

          {/* Seller Sign Up Button */}
          <button
            type="button"
            className="role-pill-btn signup-seller"
            onClick={() => setAuthModalMode('seller-signup')}
            title="Register your Kirana Store"
          >
            <Store size={13} />
            <span>Seller Sign Up</span>
          </button>

          <button
            type="button"
            className="role-pill-btn seller"
            onClick={() => {
              setActiveRole('seller');
              navigate('/seller/login');
            }}
            title="Sellers: Add and update stock"
          >
            🏪 Seller Login
          </button>
          <button
            type="button"
            className="role-pill-btn admin"
            onClick={() => {
              setActiveRole('admin');
              navigate('/admin/login');
            }}
            title="Platform Admin Access"
          >
            🛡️ Admin Login
          </button>
        </div>
      </div>

      {/* ── Main Location Graphic Card ── */}
      <div className="loc-card-container">
        {/* Radar Graphic with Concentric Circles */}
        <div className="loc-radar-wrapper">
          <div className="radar-circle radar-c3" />
          <div className="radar-circle radar-c2" />
          <div className="radar-circle radar-c1" />
          
          {/* Subtle Map Grid Lines */}
          <div className="radar-grid-lines">
            <div className="r-line r-line-h" />
            <div className="r-line r-line-v" />
            <div className="r-line r-line-d1" />
            <div className="r-line r-line-d2" />
          </div>

          {/* Central Blue Beacon with Location Icon */}
          <div className={`radar-beacon ${detecting ? 'detecting' : ''}`}>
            <MapPin size={34} color="white" fill="white" />
          </div>
        </div>

        {/* Text Block */}
        <div className="loc-text-block">
          <h1 className="loc-main-title">Location</h1>
          <p className="loc-main-subtitle">
            We will help you find local kirana stores around you within <strong>2 km</strong> ready to deliver in <strong>20–30 minutes</strong> (LocalFresh Mandi in 2 hrs).
          </p>

          <div className="loc-carousel-dots">
            <span className="c-dot active" />
            <span className="c-dot" />
          </div>
        </div>

        {/* Selected Area / Quick Selection */}
        <div className="loc-area-picker-card">
          <div className="picker-header">
            <span>Delivering To:</span>
            <button
              type="button"
              className="picker-change-link"
              onClick={() => setShowManualModal(!showManualModal)}
            >
              {showManualModal ? 'Done' : 'Change Area'}
            </button>
          </div>
          
          <div className="picker-selected-value">
            <MapPin size={18} color="var(--brand)" />
            <strong>{customInput || selectedSpot}</strong>
            <span className="picker-radius-badge">⚡ 2km Active</span>
          </div>

          {/* Collapsible Area Chips */}
          {showManualModal && (
            <div className="quick-spots-grid">
              {quickSpots.map((spot) => {
                const fullLoc = `${spot.label}, Vizag`;
                const isSelected = selectedSpot === fullLoc && !customInput;
                return (
                  <button
                    key={spot.label}
                    type="button"
                    className={`q-spot-btn ${isSelected ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedSpot(fullLoc);
                      setCustomInput('');
                    }}
                  >
                    <span>{spot.icon}</span>
                    <span className="q-spot-name">{spot.label}</span>
                    <span className="q-spot-dist">{spot.distance}</span>
                    {isSelected && <Check size={14} color="var(--brand)" />}
                  </button>
                );
              })}

              <div className="manual-input-box">
                <input
                  type="text"
                  placeholder="Or enter your street / colony name..."
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleConfirm();
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Primary Bottom Button */}
        <div className="loc-bottom-cta-box">
          <button
            type="button"
            className="loc-start-btn"
            onClick={detecting ? undefined : handleConfirm}
          >
            {detecting ? 'Detecting your coordinates...' : `Deliver to ${customInput || selectedSpot.split(',')[0]}`}
            <ArrowRight size={18} />
          </button>

          <button
            type="button"
            className="loc-gps-link-btn"
            onClick={handleGpsDetect}
          >
            <Navigation size={14} />
            <span>{detecting ? 'Accessing GPS...' : 'Use Precise GPS Location'}</span>
          </button>
        </div>

        {/* Dedicated Sign Up Action Strip for Both User and Seller */}
        <div className="loc-signup-actions-strip">
          <div className="loc-sas-title">New to KiranaPRO?</div>
          <div className="loc-sas-buttons">
            <button
              type="button"
              className="loc-sas-btn user"
              onClick={() => setAuthModalMode('user-signup')}
            >
              <UserPlus size={15} />
              <span>User Sign Up</span>
            </button>
            <button
              type="button"
              className="loc-sas-btn seller"
              onClick={() => setAuthModalMode('seller-signup')}
            >
              <Store size={15} />
              <span>Seller Sign Up</span>
            </button>
          </div>
        </div>

        {/* Footer Trust Indicators */}
        <div className="loc-footer-trust">
          <div className="lft-item">
            <Shield size={13} color="var(--accent-green)" />
            <span>Fast 20–30 Mins Delivery</span>
          </div>
          <span className="lft-dot">•</span>
          <div className="lft-item">
            <Store size={13} color="var(--brand)" />
            <span>6 Real Kiranas in Vizag</span>
          </div>
        </div>
      </div>

      {/* Reusable Auth Modal for User & Seller Registration */}
      <AuthModal
        isOpen={Boolean(authModalMode)}
        initialMode={authModalMode || 'user-signup'}
        onClose={() => setAuthModalMode(null)}
        onSuccess={(type) => {
          setAuthModalMode(null);
          if (type === 'seller') {
            navigate('/seller/dashboard');
          } else {
            handleConfirm();
          }
        }}
      />
    </div>
  );
}
