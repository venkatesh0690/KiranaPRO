import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Store,
  Phone,
  Lock,
  Eye,
  EyeOff,
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  ArrowLeft
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useSecurity } from '../context/SecurityContext';

export default function SellerLoginPage() {
  const navigate = useNavigate();
  const { stores, setCurrentSellerStore, setActiveRole } = useStore();
  const { loginSeller } = useSecurity();

  const [selectedStoreId, setSelectedStoreId] = useState(stores[1]?.id || 1); // Defaults to Sharma General Store
  const [phone, setPhone] = useState('9876543210');
  const [pin, setPin] = useState('1234');
  const [showPin, setShowPin] = useState(false);
  const [authError, setAuthError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    const targetStore = stores.find((s) => s.id === selectedStoreId) || stores[1];
    const res = loginSeller(targetStore.id, phone, pin, targetStore.name);

    if (res.success) {
      setCurrentSellerStore(targetStore);
      setActiveRole('seller');
      navigate('/seller/dashboard');
    } else {
      setAuthError(res.error || 'Authentication failed. Please check credentials.');
    }
  };

  return (
    <div className="portal-login-screen seller-theme">
      {/* Top Navbar */}
      <div className="portal-top-bar">
        <button
          type="button"
          className="portal-back-btn"
          onClick={() => {
            setActiveRole('user');
            navigate('/home');
          }}
        >
          <ArrowLeft size={16} />
          <span>Storefront</span>
        </button>
        <span className="portal-tag">Store Partner Console</span>
      </div>

      <div className="portal-card">
        {/* Portal Header */}
        <div className="portal-hd-icon seller">
          <Store size={32} color="#FFFFFF" />
        </div>
        <div className="portal-hd-titles">
          <h2>Kirana Partner Portal</h2>
          <p>
            Update live stocks, set daily mandi prices & dispatch orders (delivered in 20–30 mins) within your 2 km neighborhood.
          </p>
        </div>

        {/* Quick Store Selector */}
        <div className="quick-seller-select">
          <label className="auth-field-label">Select Your Registered Kirana Shop:</label>
          <div className="seller-stores-grid">
            {stores.slice(0, 4).map((store) => (
              <div
                key={store.id}
                className={`seller-store-card ${selectedStoreId === store.id ? 'active' : ''}`}
                onClick={() => {
                  setSelectedStoreId(store.id);
                  setAuthError('');
                }}
              >
                <span className="ssc-emoji">{store.image}</span>
                <div className="ssc-info">
                  <strong>{store.name}</strong>
                  <span>Owner: {store.owner} • {store.distance}</span>
                </div>
                {selectedStoreId === store.id && (
                  <CheckCircle2 size={18} color="var(--accent-green)" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Security Alert / Error Banner */}
        {authError && (
          <div className="auth-error-banner">
            <AlertTriangle size={18} color="#DC2626" />
            <span>{authError}</span>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleLogin} className="auth-form-block">
          <div className="auth-input-group">
            <label className="auth-field-label">Shopkeeper Registered Mobile:</label>
            <div className="auth-input-box">
              <Phone size={16} color="var(--n500)" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  setAuthError('');
                }}
                placeholder="10-digit mobile number"
                maxLength={10}
              />
            </div>
          </div>

          <div className="auth-input-group">
            <label className="auth-field-label">4-Digit Security PIN:</label>
            <div className="auth-input-box">
              <Lock size={16} color="var(--n500)" />
              <input
                type={showPin ? 'text' : 'password'}
                maxLength={4}
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setAuthError('');
                }}
                placeholder="Enter 4-digit PIN"
              />
              <button
                type="button"
                className="pin-toggle-btn"
                onClick={() => setShowPin(!showPin)}
                tabIndex={-1}
              >
                {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="auth-primary-btn seller"
          >
            <span>Log In to Store Dashboard</span>
            <ChevronRight size={18} />
          </button>
        </form>

        {/* Security Indicators */}
        <div className="quick-access-test-note">
          <ShieldCheck size={14} color="#059669" />
          <span>Protected with enterprise rate limiting & anti-brute force lockout shield.</span>
        </div>
      </div>
    </div>
  );
}
