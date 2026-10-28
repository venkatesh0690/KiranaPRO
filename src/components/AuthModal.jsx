import React, { useState } from 'react';
import { X, User, Store, Shield, ArrowRight, CheckCircle2, AlertCircle, KeyRound, Phone, MapPin, UserPlus, LogIn } from 'lucide-react';
import { useSecurity } from '../context/SecurityContext';

export default function AuthModal({ isOpen, onClose, initialMode = 'user-signup', onSuccess }) {
  const { loginCustomer, signupCustomer, signupSeller, sampleCredentials } = useSecurity();
  const [mode, setMode] = useState(initialMode); // 'user-signup' | 'seller-signup' | 'user-login'

  // User Signup State
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [userPin, setUserPin] = useState('');
  const [userAddress, setUserAddress] = useState('Maddilapalem, Vizag');

  // Seller Signup State
  const [storeName, setStoreName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [sellerPhone, setSellerPhone] = useState('');
  const [sellerPin, setSellerPin] = useState('');
  const [sellerAddress, setSellerAddress] = useState('Shop 4, Maddilapalem Main Road, Vizag');
  const [storeCategory, setStoreCategory] = useState('Kirana & Provisions');

  // User Login State
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPin, setLoginPin] = useState('');

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleUserSignupSubmit = (e) => {
    e.preventDefault();
    setError('');
    const res = signupCustomer(userName, userPhone, userPin, userAddress);
    if (res.success) {
      setSuccessMsg(`Account created! Welcome, ${userName}`);
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess('user', res.user);
      }, 1000);
    } else {
      setError(res.error);
    }
  };

  const handleSellerSignupSubmit = (e) => {
    e.preventDefault();
    setError('');
    const res = signupSeller(storeName, ownerName, sellerPhone, sellerPin, sellerAddress, storeCategory);
    if (res.success) {
      setSuccessMsg(`Store registered! Store ID: #${res.storeId}`);
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess('seller');
      }, 1200);
    } else {
      setError(res.error);
    }
  };

  const handleUserLoginSubmit = (e) => {
    e.preventDefault();
    setError('');
    const res = loginCustomer(loginPhone, loginPin);
    if (res.success) {
      setSuccessMsg(`Welcome back, ${res.user.userName}!`);
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess('user', res.user);
      }, 1000);
    } else {
      setError(res.error);
    }
  };

  const fillSampleUser = () => {
    setLoginPhone(sampleCredentials.user.phone);
    setLoginPin(sampleCredentials.user.pin);
    setError('');
  };

  return (
    <div className="auth-modal-backdrop" onClick={onClose}>
      <div className="auth-modal-card" onClick={e => e.stopPropagation()}>
        {/* Header with Close */}
        <div className="auth-modal-header">
          <div className="auth-brand-badge">⚡ Kirana<strong>PRO</strong></div>
          <button type="button" className="auth-close-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="auth-tabs-row">
          <button
            type="button"
            className={`auth-tab-btn ${mode === 'user-signup' ? 'active' : ''}`}
            onClick={() => { setMode('user-signup'); setError(''); setSuccessMsg(''); }}
          >
            <UserPlus size={14} />
            <span>User Sign Up</span>
          </button>
          <button
            type="button"
            className={`auth-tab-btn ${mode === 'seller-signup' ? 'active' : ''}`}
            onClick={() => { setMode('seller-signup'); setError(''); setSuccessMsg(''); }}
          >
            <Store size={14} />
            <span>Seller Sign Up</span>
          </button>
          <button
            type="button"
            className={`auth-tab-btn ${mode === 'user-login' ? 'active' : ''}`}
            onClick={() => { setMode('user-login'); setError(''); setSuccessMsg(''); }}
          >
            <LogIn size={14} />
            <span>User Login</span>
          </button>
        </div>

        {/* Status Alerts */}
        {error && (
          <div className="auth-alert error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="auth-alert success">
            <CheckCircle2 size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ── Mode 1: User Sign Up ── */}
        {mode === 'user-signup' && (
          <form onSubmit={handleUserSignupSubmit} className="auth-body-form">
            <div className="auth-form-title-wrap">
              <h3>Create Customer Account</h3>
              <p>Instant grocery delivery within 20–30 mins to your doorstep</p>
            </div>

            <div className="auth-field">
              <label>Full Name</label>
              <div className="auth-input-icon-wrap">
                <User size={16} className="auth-icon" />
                <input
                  type="text"
                  placeholder="e.g. Ramesh Kumar"
                  value={userName}
                  onChange={e => setUserName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="auth-field">
              <label>10-Digit Mobile Number</label>
              <div className="auth-input-icon-wrap">
                <Phone size={16} className="auth-icon" />
                <input
                  type="tel"
                  placeholder="e.g. 98480 22334"
                  maxLength={10}
                  value={userPhone}
                  onChange={e => setUserPhone(e.target.value.replace(/\D/g, ''))}
                  required
                />
              </div>
            </div>

            <div className="auth-field">
              <label>Set 4-Digit Security PIN</label>
              <div className="auth-input-icon-wrap">
                <KeyRound size={16} className="auth-icon" />
                <input
                  type="password"
                  placeholder="••••"
                  maxLength={4}
                  value={userPin}
                  onChange={e => setUserPin(e.target.value.replace(/\D/g, ''))}
                  required
                />
              </div>
            </div>

            <div className="auth-field">
              <label>Delivery Address / Street</label>
              <div className="auth-input-icon-wrap">
                <MapPin size={16} className="auth-icon" />
                <input
                  type="text"
                  placeholder="e.g. Flat 301, Maddilapalem, Vizag"
                  value={userAddress}
                  onChange={e => setUserAddress(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="auth-submit-btn user">
              <span>Create Customer Account</span>
              <ArrowRight size={16} />
            </button>

            <div className="auth-switch-prompt">
              Already have an account?{' '}
              <button type="button" onClick={() => { setMode('user-login'); setError(''); }}>
                Login here
              </button>
            </div>
          </form>
        )}

        {/* ── Mode 2: Seller Sign Up ── */}
        {mode === 'seller-signup' && (
          <form onSubmit={handleSellerSignupSubmit} className="auth-body-form">
            <div className="auth-form-title-wrap">
              <h3>Register Your Kirana Store</h3>
              <p>Add products, manage inventory and reach nearby customers</p>
            </div>

            <div className="auth-field">
              <label>Store Name</label>
              <div className="auth-input-icon-wrap">
                <Store size={16} className="auth-icon" />
                <input
                  type="text"
                  placeholder="e.g. Sri Balaji Super Store"
                  value={storeName}
                  onChange={e => setStoreName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="auth-field">
              <label>Owner / Manager Name</label>
              <div className="auth-input-icon-wrap">
                <User size={16} className="auth-icon" />
                <input
                  type="text"
                  placeholder="e.g. K. Satyanarayana"
                  value={ownerName}
                  onChange={e => setOwnerName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="auth-field">
              <label>Seller Mobile Number</label>
              <div className="auth-input-icon-wrap">
                <Phone size={16} className="auth-icon" />
                <input
                  type="tel"
                  placeholder="e.g. 98765 43210"
                  maxLength={10}
                  value={sellerPhone}
                  onChange={e => setSellerPhone(e.target.value.replace(/\D/g, ''))}
                  required
                />
              </div>
            </div>

            <div className="auth-field">
              <label>Set 4-Digit Management PIN</label>
              <div className="auth-input-icon-wrap">
                <KeyRound size={16} className="auth-icon" />
                <input
                  type="password"
                  placeholder="••••"
                  maxLength={4}
                  value={sellerPin}
                  onChange={e => setSellerPin(e.target.value.replace(/\D/g, ''))}
                  required
                />
              </div>
            </div>

            <div className="auth-field">
              <label>Store Location & Landmark</label>
              <div className="auth-input-icon-wrap">
                <MapPin size={16} className="auth-icon" />
                <input
                  type="text"
                  placeholder="Shop #, Street name, Vizag"
                  value={sellerAddress}
                  onChange={e => setSellerAddress(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="auth-submit-btn seller">
              <span>Register Kirana Store</span>
              <ArrowRight size={16} />
            </button>

            <div className="auth-switch-prompt">
              Already registered?{' '}
              <a href="/seller/login" style={{ color: '#0284c7', fontWeight: 600 }}>
                Open Seller Login
              </a>
            </div>
          </form>
        )}

        {/* ── Mode 3: User Login ── */}
        {mode === 'user-login' && (
          <form onSubmit={handleUserLoginSubmit} className="auth-body-form">
            <div className="auth-form-title-wrap">
              <h3>Customer Sign In</h3>
              <p>Enter your 10-digit mobile number and 4-digit PIN</p>
            </div>

            {/* Quick Fill Sample User Chip */}
            <div className="sample-cred-chip-box" onClick={fillSampleUser}>
              <div className="sc-chip-icon">💡</div>
              <div className="sc-chip-text">
                <strong>Click to auto-fill sample customer:</strong>
                <span>Phone: <strong>{sampleCredentials.user.phone}</strong> • PIN: <strong>{sampleCredentials.user.pin}</strong></span>
              </div>
            </div>

            <div className="auth-field">
              <label>10-Digit Mobile Number</label>
              <div className="auth-input-icon-wrap">
                <Phone size={16} className="auth-icon" />
                <input
                  type="tel"
                  placeholder="98480 22334"
                  maxLength={10}
                  value={loginPhone}
                  onChange={e => setLoginPhone(e.target.value.replace(/\D/g, ''))}
                  required
                />
              </div>
            </div>

            <div className="auth-field">
              <label>4-Digit PIN</label>
              <div className="auth-input-icon-wrap">
                <KeyRound size={16} className="auth-icon" />
                <input
                  type="password"
                  placeholder="••••"
                  maxLength={4}
                  value={loginPin}
                  onChange={e => setLoginPin(e.target.value.replace(/\D/g, ''))}
                  required
                />
              </div>
            </div>

            <button type="submit" className="auth-submit-btn user">
              <span>Log In as Customer</span>
              <ArrowRight size={16} />
            </button>

            <div className="auth-switch-prompt">
              Don't have an account?{' '}
              <button type="button" onClick={() => { setMode('user-signup'); setError(''); }}>
                Sign up here
              </button>
            </div>
          </form>
        )}

        {/* Sample Credentials Footer Drawer */}
        <div className="auth-sample-drawer">
          <div className="asd-title">🔑 Testing & Sample Platform Credentials:</div>
          <div className="asd-grid">
            <div className="asd-col">
              <span className="asd-role">👤 Customer:</span>
              <code>Phone: 9848022334</code>
              <code>PIN: 1234</code>
            </div>
            <div className="asd-col">
              <span className="asd-role">🏪 Seller:</span>
              <code>Store #1 / Phone: 9876543210</code>
              <code>PIN: 1234</code>
            </div>
            <div className="asd-col">
              <span className="asd-role">🛡️ Admin:</span>
              <code>admin@kiranapro.com</code>
              <code>Password: admin123</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
