import React, { useState } from 'react';
import { X, User, Store, Shield, ArrowRight, CheckCircle2, AlertCircle, KeyRound, Phone, MapPin, UserPlus, LogIn } from 'lucide-react';
import { useSecurity } from '../context/SecurityContext';

export default function AuthModal({ isOpen, onClose, initialMode = 'signup', onSuccess }) {
  const { loginCustomer, loginTemporaryCustomer, signupCustomer, signupSeller } = useSecurity();
  const [activeTab, setActiveTab] = useState(initialMode === 'login' ? 'login' : 'signup'); // 'signup' | 'login'
  const [signupRole, setSignupRole] = useState('user'); // 'user' | 'seller'

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

  // Login State
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPin, setLoginPin] = useState('');

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleGuestStart = () => {
    const result=loginTemporaryCustomer();
    if(result.success){
      onClose();
      onSuccess?.('user',result.user);
    }
  };

  const handleUserSignupSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const res = await signupCustomer(userName, userPhone, userPin, userAddress);
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

  const handleSellerSignupSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const res = await signupSeller(storeName, ownerName, sellerPhone, sellerPin, sellerAddress, storeCategory);
    if (res.success) {
      setSuccessMsg('Store application submitted. Administrator approval is required before seller access.');
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess('user');
      }, 1200);
    } else {
      setError(res.error);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const res = await loginCustomer(loginPhone, loginPin);
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

        {/* Tab Switcher: Just Sign Up and Log In */}
        <div className="auth-tabs-row clean">
          <button
            type="button"
            className={`auth-tab-btn ${activeTab === 'signup' ? 'active' : ''}`}
            onClick={() => { setActiveTab('signup'); setError(''); setSuccessMsg(''); }}
          >
            <UserPlus size={14} />
            <span>Sign Up</span>
          </button>
          <button
            type="button"
            className={`auth-tab-btn ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => { setActiveTab('login'); setError(''); setSuccessMsg(''); }}
          >
            <LogIn size={14} />
            <span>Log In</span>
          </button>
        </div>

        {/* Feedback Messages */}
        {error && (
          <div className="auth-alert-box error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}
        {successMsg && (
          <div className="auth-alert-box success">
            <CheckCircle2 size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ── Mode 1: Sign Up (User or Seller) ── */}
        {activeTab === 'signup' && (
          <div>
            {/* Account Type Selector */}
            <div className="auth-role-select-box">
              <button
                type="button"
                className={`auth-role-opt ${signupRole === 'user' ? 'active' : ''}`}
                onClick={() => setSignupRole('user')}
              >
                <User size={14} />
                <span>Customer Account</span>
              </button>
              <button
                type="button"
                className={`auth-role-opt ${signupRole === 'seller' ? 'active' : ''}`}
                onClick={() => setSignupRole('seller')}
              >
                <Store size={14} />
                <span>Store Partner</span>
              </button>
            </div>

            {signupRole === 'user' ? (
              <form onSubmit={handleUserSignupSubmit} className="auth-body-form">
                <div className="auth-form-title-wrap">
                  <h3>Create Customer Account</h3>
                  <p>Fast checkout, order tracking & local store offers</p>
                </div>

                <div className="auth-field">
                  <label>Full Name</label>
                  <div className="auth-input-icon-wrap">
                    <User size={16} className="auth-icon" />
                    <input
                      type="text"
                      placeholder="e.g. Laxman"
                      value={userName}
                      onChange={e => setUserName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="auth-field">
                  <label>Mobile Number</label>
                  <div className="auth-input-icon-wrap">
                    <Phone size={16} className="auth-icon" />
                    <input
                      type="tel"
                      placeholder="10-digit mobile number"
                      maxLength={10}
                      value={userPhone}
                      onChange={e => setUserPhone(e.target.value.replace(/\D/g, ''))}
                      required
                    />
                  </div>
                </div>

                <div className="auth-field">
                  <label>Set Account Password (10+ characters)</label>
                  <div className="auth-input-icon-wrap">
                    <KeyRound size={16} className="auth-icon" />
                    <input
                      type="password"
                      placeholder="At least 10 characters"
                      minLength={10}
                      maxLength={128}
                      value={userPin}
                      onChange={e => setUserPin(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="auth-field">
                  <label>Delivery Address</label>
                  <div className="auth-input-icon-wrap">
                    <MapPin size={16} className="auth-icon" />
                    <input
                      type="text"
                      placeholder="Flat / Street, Maddilapalem, Vizag"
                      value={userAddress}
                      onChange={e => setUserAddress(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="auth-submit-btn user">
                  <span>Create Account</span>
                  <ArrowRight size={16} />
                </button>
              </form>
            ) : (
              <form onSubmit={handleSellerSignupSubmit} className="auth-body-form">
                <div className="auth-form-title-wrap">
                  <h3>Register Kirana Store</h3>
                  <p>Start receiving local orders within your 2km radius</p>
                </div>

                <div className="auth-field">
                  <label>Store Name</label>
                  <div className="auth-input-icon-wrap">
                    <Store size={16} className="auth-icon" />
                    <input
                      type="text"
                      placeholder="e.g. Sri Lakshmi Provisions"
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
                      placeholder="e.g. Rajesh Sharma"
                      value={ownerName}
                      onChange={e => setOwnerName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="auth-field">
                  <label>Registered Store Mobile</label>
                  <div className="auth-input-icon-wrap">
                    <Phone size={16} className="auth-icon" />
                    <input
                      type="tel"
                      placeholder="10-digit mobile number"
                      maxLength={10}
                      value={sellerPhone}
                      onChange={e => setSellerPhone(e.target.value.replace(/\D/g, ''))}
                      required
                    />
                  </div>
                </div>

                <div className="auth-field">
                  <label>Set Store Password (10+ characters)</label>
                  <div className="auth-input-icon-wrap">
                    <KeyRound size={16} className="auth-icon" />
                    <input
                      type="password"
                      placeholder="At least 10 characters"
                      minLength={10}
                      maxLength={128}
                      value={sellerPin}
                      onChange={e => setSellerPin(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="auth-field">
                  <label>Store Location</label>
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
                  <span>Register Store</span>
                  <ArrowRight size={16} />
                </button>
              </form>
            )}
          </div>
        )}

        {/* ── Mode 2: Log In ── */}
        {activeTab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="auth-body-form">
            <div className="auth-form-title-wrap">
              <h3>Sign In to KiranaPRO</h3>
              <p>Enter your 10-digit registered mobile and password</p>
            </div>

            <div className="auth-field">
              <label>10-Digit Mobile Number</label>
              <div className="auth-input-icon-wrap">
                <Phone size={16} className="auth-icon" />
                <input
                  type="tel"
                  placeholder="e.g. 98480 22334"
                  maxLength={10}
                  value={loginPhone}
                  onChange={e => setLoginPhone(e.target.value.replace(/\D/g, ''))}
                  required
                />
              </div>
            </div>

            <div className="auth-field">
              <label>Password</label>
              <div className="auth-input-icon-wrap">
                <KeyRound size={16} className="auth-icon" />
                <input
                  type="password"
                  placeholder="Your account password"
                  minLength={10}
                      maxLength={128}
                  value={loginPin}
                  onChange={e => setLoginPin(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="auth-submit-btn user">
              <span>Sign In</span>
              <ArrowRight size={16} />
            </button>

            <button type="button" className="kp-auth-guest" onClick={handleGuestStart}>
              Explore as guest — one tap
            </button>
            <p className="kp-auth-guest-note">Temporary 30-minute preview. No customer account or order history is created.</p>
            <div className="auth-portal-links-sub">
              <span>Looking for store portals? </span>
              <a href="/seller/login">Seller Hub</a> • <a href="/admin/login">Admin Console</a>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
