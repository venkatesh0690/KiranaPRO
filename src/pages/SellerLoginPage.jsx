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
  const { setSellerStoreId, setActiveRole } = useStore();
  const { loginSeller } = useSecurity();

  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [authError, setAuthError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    const res = await loginSeller('', phone, pin);

    if (res.success) {
      setSellerStoreId(res.user.storeId);
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

        <p className="auth-field-label" style={{marginBottom:16}}>
          Sign in with your registered store partner account.
          The server automatically opens only the store assigned to your account.
        </p>

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
            <label className="auth-field-label">Account Password:</label>
            <div className="auth-input-box">
              <Lock size={16} color="var(--n500)" />
              <input
                type={showPin ? 'text' : 'password'}
                minLength={10}
                maxLength={128}
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setAuthError('');
                }}
                placeholder="At least 10 characters"
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
