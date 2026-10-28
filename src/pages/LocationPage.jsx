import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Navigation,
  Store,
  Shield,
  ArrowRight,
  Check,
  UserPlus,
  LogIn,
  User,
  Sparkles,
  Clock,
  CheckCircle2,
  Bike,
  Heart,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useSecurity } from '../context/SecurityContext';
import AuthModal from '../components/AuthModal';

const quickSpots = [
  { label: 'Maddilapalem', distance: '0.4 km', icon: '🏪', eta: '20 mins' },
  { label: 'MVP Colony', distance: '0.3 km', icon: '🏬', eta: '20 mins' },
  { label: 'Seethammadhara', distance: '0.7 km', icon: '🌳', eta: '25 mins' },
  { label: 'Dwaraka Nagar', distance: '0.9 km', icon: '🏢', eta: '30 mins' },
  { label: 'Siripuram', distance: '1.2 km', icon: '🛍️', eta: '30 mins' },
  { label: 'Gopalapatnam', distance: '1.8 km', icon: '⛽', eta: '30 mins' },
];

export default function LocationPage({ onLocationSet }) {
  const [detecting, setDetecting] = useState(false);
  const [selectedSpot, setSelectedSpot] = useState('Maddilapalem, Vizag');
  const [customInput, setCustomInput] = useState('');
  const [showManualModal, setShowManualModal] = useState(false);
  const [authModalMode, setAuthModalMode] = useState(null); // 'signup' | 'login'
  const videoRef = useRef(null);

  const { setActiveRole } = useStore();
  const { authSession } = useSecurity();
  const navigate = useNavigate();

  // Ensure video autoplay plays seamlessly
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // Autoplay policy fallback
      });
    }
  }, []);

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
    <div className="loc-onboarding-screen groceasy-loc-theme">
      {/* ── Top Role Switcher & Auth Links ── */}
      <header className="startup-role-nav">
        <div className="startup-brand-wrap">
          <span className="startup-brand">⚡ Kirana<strong>PRO</strong></span>
          <span className="startup-tagline">Neighborhood Groceries in 20-30 Mins</span>
        </div>

        <div className="startup-role-pills">
          {/* Sign Up & Log In Buttons */}
          <button
            type="button"
            className="role-pill-btn signup-clean"
            onClick={() => setAuthModalMode('signup')}
            title="Create Customer or Seller Account"
          >
            <UserPlus size={13} />
            <span>Sign Up</span>
          </button>
          <button
            type="button"
            className="role-pill-btn login-clean"
            onClick={() => setAuthModalMode('login')}
            title="Sign in to your account"
          >
            <LogIn size={13} />
            <span>Log In</span>
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
            🏪 Seller Hub
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
            🛡️ Admin
          </button>
        </div>
      </header>

      {/* ── Main Interactive Showcase & Location Container ── */}
      <div className="loc-card-container">
        {/* Animated Visual Hero with Cosmos MP4 Video & Floating 3D Badges */}
        <div className="loc-hero-visual-stage">
          {/* Glowing Animated Ambient Backlight */}
          <div className="loc-ambient-glow" />

          {/* Animated Cosmos MP4 Video Card */}
          <div className="loc-video-card-frame">
            <video
              ref={videoRef}
              src="https://cdn.cosmos.so/e4f0e678-7134-4458-bf51-272c3b1be635.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="loc-hero-cosmos-video"
            />
            <div className="loc-video-overlay-gradient" />

            {/* In-Video Live Delivery Tag */}
            <div className="loc-video-floating-tag">
              <span className="loc-vft-dot" />
              <span>Live Delivery Active in Vizag</span>
            </div>
          </div>

          {/* Floating Levitation Badges (Inspired by Uploaded Image 1, 2 & 3) */}
          <div className="loc-floating-badge badge-top-left anim-float-slow">
            <div className="lfb-icon">⚡</div>
            <div className="lfb-text">
              <strong>20–30 Mins</strong>
              <span>Fastest Local Dispatch</span>
            </div>
          </div>

          <div className="loc-floating-badge badge-top-right anim-float-medium">
            <div className="lfb-icon">🥦</div>
            <div className="lfb-text">
              <strong>Direct Mandi</strong>
              <span>Fresh Farm Harvest</span>
            </div>
          </div>

          <div className="loc-floating-badge badge-bottom-left anim-float-fast">
            <div className="lfb-icon">📍</div>
            <div className="lfb-text">
              <strong>Within 2 km</strong>
              <span>Trusted Local Stores</span>
            </div>
          </div>
        </div>

        {/* ── Headline & Promise Section (Inspired by Image 2: "We deliver freshness to your hand") ── */}
        <div className="loc-text-block">
          <div className="loc-fresh-pill-badge">
            <Sparkles size={13} color="#15803D" />
            <span>Pure Freshness Direct from Kirana Partners</span>
          </div>

          <h1 className="loc-main-title">
            We deliver freshness to your hand.
          </h1>
          <p className="loc-main-subtitle">
            From local soil and trusted neighborhood kirana stores to your doorstep in <strong>20–30 minutes</strong> (LocalFresh Mandi in 2 hrs).
          </p>

          {/* 3-Step Animated Trust Pillars (Directly matching Image 2 mockup) */}
          <div className="loc-trust-steps-row">
            <div className="lts-step">
              <div className="lts-circle check">
                <Check size={13} strokeWidth={3} />
              </div>
              <span>Fast 20-30m Delivery</span>
            </div>
            <div className="lts-line" />
            <div className="lts-step">
              <div className="lts-circle check">
                <Check size={13} strokeWidth={3} />
              </div>
              <span>Trusted Service</span>
            </div>
            <div className="lts-line" />
            <div className="lts-step">
              <div className="lts-circle handshake">
                <ShieldCheck size={13} strokeWidth={2.5} />
              </div>
              <span>Fresh Promise</span>
            </div>
          </div>
        </div>

        {/* ── Selected Area / Interactive Picker Card ── */}
        <div className="loc-area-picker-card">
          <div className="picker-header">
            <div className="ph-left">
              <span className="ph-dot" />
              <span>Delivering To Your Address:</span>
            </div>
            <button
              type="button"
              className="picker-change-link"
              onClick={() => setShowManualModal(!showManualModal)}
            >
              {showManualModal ? 'Done' : 'Change Colony'}
            </button>
          </div>
          
          <div className="picker-selected-value">
            <div className="psv-left">
              <div className="psv-pin-wrap">
                <MapPin size={18} color="#FFFFFF" />
              </div>
              <div className="psv-text">
                <strong>{customInput || selectedSpot}</strong>
                <span>Active 2km Hyperlocal Radius</span>
              </div>
            </div>
            <span className="picker-radius-badge">⚡ 20–30 Mins ETA</span>
          </div>

          {/* Collapsible Area Chips */}
          {showManualModal && (
            <div className="quick-spots-grid anim-fade-in">
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
                    <span className="q-spot-emoji">{spot.icon}</span>
                    <div className="q-spot-info">
                      <span className="q-spot-name">{spot.label}</span>
                      <span className="q-spot-dist">{spot.distance} • {spot.eta}</span>
                    </div>
                    {isSelected && <Check size={15} color="#16A34A" strokeWidth={3} />}
                  </button>
                );
              })}

              <div className="manual-input-box">
                <MapPin size={16} color="#64748B" />
                <input
                  type="text"
                  placeholder="Or enter your street, apartment or colony name..."
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

        {/* ── Primary Action Controls ── */}
        <div className="loc-bottom-cta-box">
          <button
            type="button"
            className="loc-start-btn anim-pulse-subtle"
            onClick={detecting ? undefined : handleConfirm}
          >
            <span>{detecting ? 'Detecting your coordinates...' : `Deliver to ${customInput || selectedSpot.split(',')[0]}`}</span>
            <ArrowRight size={18} />
          </button>

          <button
            type="button"
            className="loc-gps-link-btn"
            onClick={handleGpsDetect}
          >
            <div className={`gps-radar-pin ${detecting ? 'detecting' : ''}`}>
              <Navigation size={15} color="#15803D" />
            </div>
            <span>{detecting ? 'Accessing satellite GPS coordinates...' : 'Use Precise GPS Auto-Detect'}</span>
          </button>
        </div>

        {/* Sign Up & Seller Partner strip */}
        <div className="loc-signup-actions-strip">
          <div className="loc-sas-title">New to KiranaPRO?</div>
          <div className="loc-sas-buttons">
            <button
              type="button"
              className="loc-sas-btn user"
              onClick={() => setAuthModalMode('signup')}
            >
              <UserPlus size={15} />
              <span>Customer Sign Up</span>
            </button>
            <button
              type="button"
              className="loc-sas-btn seller"
              onClick={() => setAuthModalMode('signup')}
            >
              <Store size={15} />
              <span>Register Kirana Store</span>
            </button>
          </div>
        </div>

        {/* Footer Trust Indicators */}
        <div className="loc-footer-trust">
          <div className="lft-item">
            <Shield size={13} color="#16A34A" />
            <span>Fast 20–30 Mins Delivery</span>
          </div>
          <span className="lft-dot">•</span>
          <div className="lft-item">
            <Store size={13} color="#16A34A" />
            <span>6 Real Kirana Partners in Vizag</span>
          </div>
          <span className="lft-dot">•</span>
          <div className="lft-item">
            <Sparkles size={13} color="#F59E0B" />
            <span>Free Delivery on ₹301+</span>
          </div>
        </div>
      </div>

      {/* Clean Auth Modal */}
      <AuthModal
        isOpen={Boolean(authModalMode)}
        initialMode={authModalMode || 'signup'}
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
