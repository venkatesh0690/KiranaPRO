import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, ArrowLeft, ShieldCheck, CheckCircle2, ChevronRight, Lock, Phone, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useSecurity } from '../context/SecurityContext';

export default function SellerLoginPage() {
  const navigate = useNavigate();
  const { stores, setSellerStoreId, setActiveRole } = useStore();
  const { loginSeller } = useSecurity();
  const [selectedStoreId, setSelectedStoreId] = useState(1);
  const [phone, setPhone] = useState('9848022334');
  const [pin, setPin] = useState('1234');
  const [showPin, setShowPin] = useState(false);
  const [authError, setAuthError] = useState('');

  const selectedStore = stores.find((s) => s.id === selectedStoreId) || stores[1];

  const handleLogin = (e) => {
    e?.preventDefault();
    setAuthError('');

    const res = loginSeller(selectedStoreId, phone, pin, selectedStore?.name);
    if (!res.success) {
      setAuthError(res.error);
      return;
    }

    setSellerStoreId(selectedStoreId);
    setActiveRole('seller');
    navigate('/seller/dashboard');
  };

  return (
    <div className="portal-auth-page">
      {/* Top Navigation */}
      <div className="portal-auth-header">
        <button type="button" className="p-back-btn" onClick={() => navigate('/')}>
          <ArrowLeft size={18} />
          <span>Back to Customer App</span>
        </button>
        <span className="p-role-badge seller">🏪 Kirana Partner Portal</span>
      </div>

      <div className="portal-auth-card">
        {/* Banner */}
        <div className="portal-welcome-banner">
          <div className="pwb-icon">🏪</div>
          <h2>KiranaPRO Seller Hub</h2>
          <p>
            Update live stocks, set daily mandi prices & dispatch orders (delivered in 20–30 mins) within your 2 km neighborhood.
          </p>
        </div>

        {/* Quick Demo Store Selector */}
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
          <span>Protected with rate limiting & anti-brute force lock. Default PIN: <strong>1234</strong></span>
        </div>
      </div>
    </div>
  );
}
