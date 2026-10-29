import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Package,
  MapPin,
  Shield,
  RotateCcw,
  ChevronRight,
  LogOut,
  Bell,
  Heart,
  CreditCard,
  UserPlus,
  LogIn,
  Store,
  Edit2,
  Plus,
  Trash2,
  CheckCircle2,
  Home,
  Briefcase,
  X
} from 'lucide-react';
import { useSecurity } from '../context/SecurityContext';
import AuthModal from '../components/AuthModal';

export default function ProfilePage({ userLocation }) {
  const navigate = useNavigate();
  const {
    authSession,
    logout,
    updateUserName,
    savedAddresses,
    addAddress,
    removeAddress,
    setDefaultAddress
  } = useSecurity();

  const [authModalMode, setAuthModalMode] = useState(null);

  // Edit Name State (Requirement: Add option to modify user name)
  const [isEditNameModalOpen, setIsEditNameModalOpen] = useState(false);
  const [newNameInput, setNewNameInput] = useState(authSession.userName || '');
  const [nameError, setNameError] = useState('');
  const [nameSuccess, setNameSuccess] = useState('');

  // Add Address State (Requirement: Add different shipping address)
  const [isAddAddressModalOpen, setIsAddAddressModalOpen] = useState(false);
  const [addrType, setAddrType] = useState('Home');
  const [addrTitle, setAddrTitle] = useState('');
  const [addrStreet, setAddrStreet] = useState('');
  const [addrLandmark, setAddrLandmark] = useState('');
  const [addrCity, setAddrCity] = useState('Visakhapatnam (Vizag)');
  const [addrPincode, setAddrPincode] = useState('530013');
  const [addrIsDefault, setAddrIsDefault] = useState(false);
  const [addrError, setAddrError] = useState('');

  const handleSaveName = (e) => {
    e.preventDefault();
    setNameError('');
    const res = updateUserName(newNameInput);
    if (res.success) {
      setNameSuccess('Name updated successfully!');
      setTimeout(() => {
        setNameSuccess('');
        setIsEditNameModalOpen(false);
      }, 900);
    } else {
      setNameError(res.error || 'Failed to update name');
    }
  };

  const handleSaveAddress = (e) => {
    e.preventDefault();
    setAddrError('');
    if (!addrTitle.trim() || !addrStreet.trim()) {
      setAddrError('Please enter a title and street address.');
      return;
    }

    addAddress({
      type: addrType,
      title: addrTitle,
      street: addrStreet,
      landmark: addrLandmark,
      city: addrCity,
      pincode: addrPincode,
      isDefault: addrIsDefault
    });

    // Reset & Close
    setAddrTitle('');
    setAddrStreet('');
    setAddrLandmark('');
    setAddrIsDefault(false);
    setIsAddAddressModalOpen(false);
  };

  return (
    <div className="profile-page">
      {/* Top Header */}
      <div className="profile-top-bar">
        <button type="button" className="profile-back-btn" onClick={() => navigate('/home')}>
          <ArrowLeft size={18} />
        </button>
        <h1 className="profile-top-title">My Profile</h1>
      </div>

      {/* User Card: Shows name with Edit button, or Guest state */}
      <div className="profile-user-card">
        <div className="profile-avatar-wrap">
          <div className="profile-avatar">{authSession.isAuthenticated ? '👨‍💼' : '👤'}</div>
        </div>
        <div className="profile-user-info">
          {authSession.isAuthenticated && authSession.userName ? (
            <>
              <div className="profile-name-edit-row">
                <h2 className="profile-user-name">{authSession.userName}</h2>
                <button
                  type="button"
                  className="profile-edit-badge-btn"
                  onClick={() => {
                    setNewNameInput(authSession.userName);
                    setIsEditNameModalOpen(true);
                  }}
                  title="Modify User Name"
                >
                  <Edit2 size={12} />
                  <span>Edit Name</span>
                </button>
              </div>
              <span className="profile-user-phone">{authSession.userPhone ||
                (authSession.isTemporary ? 'Guest preview · no phone linked' : 'Phone number not provided')}</span>
              <span className="profile-user-location">
                📍 {userLocation || 'Delivery area not selected'} · Visakhapatnam
                {authSession.isTemporary ? ' · Temporary preview' : ''}
              </span>
            </>
          ) : (
            <>
              <div className="profile-name-edit-row">
                <h2 className="profile-user-name">Guest Customer</h2>
                <button
                  type="button"
                  className="profile-edit-badge-btn"
                  onClick={() => {
                    setNewNameInput('');
                    setIsEditNameModalOpen(true);
                  }}
                  title="Set Your Name"
                >
                  <Edit2 size={12} />
                  <span>Set Name</span>
                </button>
              </div>
              <span className="profile-user-phone">Sign in to track orders & save delivery address</span>
              <div className="profile-guest-actions">
                <button
                  type="button"
                  className="profile-auth-btn user-signup"
                  onClick={() => setAuthModalMode('signup')}
                >
                  <UserPlus size={14} />
                  <span>Sign Up</span>
                </button>
                <button
                  type="button"
                  className="profile-auth-btn user-login"
                  onClick={() => setAuthModalMode('login')}
                >
                  <LogIn size={14} />
                  <span>Log In</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Saved Shipping Addresses Section (Requirement: Add different shipping address) ── */}
      <div className="profile-addresses-section">
        <div className="pas-header">
          <div className="pas-hd-left">
            <MapPin size={18} color="var(--brand)" />
            <h3>Saved Shipping Addresses</h3>
          </div>
          <button
            type="button"
            className="pas-add-btn"
            onClick={() => setIsAddAddressModalOpen(true)}
          >
            <Plus size={14} />
            <span>Add Address</span>
          </button>
        </div>

        <div className="pas-cards-list">
          {(savedAddresses || []).map((addr) => (
            <div key={addr.id} className={`pas-card ${addr.isDefault ? 'is-default' : ''}`}>
              <div className="pas-card-top">
                <div className="pas-type-tag">
                  {addr.type === 'Home' ? <Home size={13} /> : addr.type === 'Work' ? <Briefcase size={13} /> : <MapPin size={13} />}
                  <span>{addr.type || 'Address'}</span>
                </div>
                {addr.isDefault ? (
                  <span className="pas-default-pill">
                    <CheckCircle2 size={12} /> Default Shipping
                  </span>
                ) : (
                  <button
                    type="button"
                    className="pas-make-default-btn"
                    onClick={() => setDefaultAddress(addr.id)}
                  >
                    Set as Default
                  </button>
                )}
              </div>

              <div className="pas-details">
                <h4 className="pas-title">{addr.title}</h4>
                <p className="pas-street">{addr.street}</p>
                {addr.landmark && <span className="pas-landmark">Landmark: {addr.landmark}</span>}
                <span className="pas-city">{addr.city} • PIN: {addr.pincode}</span>
              </div>

              <div className="pas-actions">
                {savedAddresses.length > 1 && (
                  <button
                    type="button"
                    className="pas-delete-btn"
                    onClick={() => removeAddress(addr.id)}
                    title="Remove address"
                  >
                    <Trash2 size={13} /> Remove
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Order & Preferences Management ── */}
      <div className="profile-menu-container">
        <div className="profile-menu-group">
          <h3 className="profile-group-title">Order Management</h3>
          <div className="profile-group-card">
            <div
              className="profile-menu-row"
              onClick={() => navigate('/orders')}
            >
              <div className="profile-menu-icon-wrap">
                <Package size={18} color="var(--brand)" />
              </div>
              <div className="profile-menu-text">
                <span className="profile-menu-label">My Orders</span>
                <span className="profile-menu-desc">Track active shipments & past invoices</span>
              </div>
              <span className="profile-menu-badge">1 Live</span>
              <ChevronRight size={17} color="var(--n400)" />
            </div>

            <div
              className="profile-menu-row"
              onClick={() => setIsAddAddressModalOpen(true)}
            >
              <div className="profile-menu-icon-wrap">
                <MapPin size={18} color="var(--brand)" />
              </div>
              <div className="profile-menu-text">
                <span className="profile-menu-label">Add Different Shipping Address</span>
                <span className="profile-menu-desc">Manage home, office & alternative delivery locations</span>
              </div>
              <ChevronRight size={17} color="var(--n400)" />
            </div>

            <div
              className="profile-menu-row"
              onClick={() => alert('UPI, Google Pay, PhonePe, Cards & Cash on Delivery supported.')}
            >
              <div className="profile-menu-icon-wrap">
                <CreditCard size={18} color="var(--brand)" />
              </div>
              <div className="profile-menu-text">
                <span className="profile-menu-label">Payment Methods</span>
                <span className="profile-menu-desc">UPI, Cards & Cash on Delivery</span>
              </div>
              <ChevronRight size={17} color="var(--n400)" />
            </div>
          </div>
        </div>

        {/* Partner Store Sign Up Banner */}
        <div className="profile-seller-cta-box" onClick={() => setAuthModalMode('signup')}>
          <div className="pscb-left">
            <Store size={20} className="text-sky-600" />
            <div>
              <div className="pscb-title">Own a Kirana Store?</div>
              <div className="pscb-desc">Register as a seller & start getting online orders</div>
            </div>
          </div>
          <ChevronRight size={18} color="#0284c7" />
        </div>

        {/* Logout / Switch Location button */}
        <button
          type="button"
          className="profile-logout-btn"
          onClick={() => {
            if (authSession.isAuthenticated) {
              logout();
            } else {
              navigate('/');
            }
          }}
        >
          <LogOut size={16} />
          <span>{authSession.isAuthenticated ? 'Sign Out / Log Out' : 'Switch Location'}</span>
        </button>
      </div>

      {/* ── Modal 1: Modify User Name (Requirement: Add option to modify user name) ── */}
      {isEditNameModalOpen && (
        <div className="profile-modal-backdrop" onClick={() => setIsEditNameModalOpen(false)}>
          <div className="profile-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="pmc-header">
              <div className="pmc-title-wrap">
                <Edit2 size={18} color="var(--brand)" />
                <h3>Modify Your Name</h3>
              </div>
              <button
                type="button"
                className="pmc-close-btn"
                onClick={() => setIsEditNameModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveName} className="pmc-form">
              <p className="pmc-desc">
                Your name will appear on orders, delivery packages & receipts.
              </p>

              <div className="pmc-field">
                <label>Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Laxman"
                  value={newNameInput}
                  onChange={(e) => setNewNameInput(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              {nameError && <div className="pmc-msg error">{nameError}</div>}
              {nameSuccess && <div className="pmc-msg success">{nameSuccess}</div>}

              <div className="pmc-actions">
                <button
                  type="button"
                  className="pmc-cancel-btn"
                  onClick={() => setIsEditNameModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="pmc-save-btn">
                  Save Name
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal 2: Add Different Shipping Address (Requirement: Add different shipping address) ── */}
      {isAddAddressModalOpen && (
        <div className="profile-modal-backdrop" onClick={() => setIsAddAddressModalOpen(false)}>
          <div className="profile-modal-card wide" onClick={(e) => e.stopPropagation()}>
            <div className="pmc-header">
              <div className="pmc-title-wrap">
                <MapPin size={18} color="var(--brand)" />
                <h3>Add Different Shipping Address</h3>
              </div>
              <button
                type="button"
                className="pmc-close-btn"
                onClick={() => setIsAddAddressModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveAddress} className="pmc-form">
              {/* Type Switcher */}
              <div className="pmc-type-picker">
                {['Home', 'Work', 'Other'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    className={`pmc-type-opt ${addrType === t ? 'active' : ''}`}
                    onClick={() => setAddrType(t)}
                  >
                    {t === 'Home' ? <Home size={13} /> : t === 'Work' ? <Briefcase size={13} /> : <MapPin size={13} />}
                    <span>{t}</span>
                  </button>
                ))}
              </div>

              <div className="pmc-field">
                <label>Address Title / Nickname</label>
                <input
                  type="text"
                  placeholder="e.g. Flat 402, Sai Residency or Parents Home"
                  value={addrTitle}
                  onChange={(e) => setAddrTitle(e.target.value)}
                  required
                />
              </div>

              <div className="pmc-field">
                <label>Street, Colony & Building Details</label>
                <input
                  type="text"
                  placeholder="Door #, Street name, Colony, Maddilapalem"
                  value={addrStreet}
                  onChange={(e) => setAddrStreet(e.target.value)}
                  required
                />
              </div>

              <div className="pmc-field">
                <label>Landmark (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Opposite AU Out Gate, Near Hanuman Temple"
                  value={addrLandmark}
                  onChange={(e) => setAddrLandmark(e.target.value)}
                />
              </div>

              <div className="pmc-row-2">
                <div className="pmc-field">
                  <label>City</label>
                  <input
                    type="text"
                    value={addrCity}
                    onChange={(e) => setAddrCity(e.target.value)}
                    required
                  />
                </div>
                <div className="pmc-field">
                  <label>Pincode</label>
                  <input
                    type="text"
                    placeholder="530013"
                    value={addrPincode}
                    onChange={(e) => setAddrPincode(e.target.value)}
                    required
                  />
                </div>
              </div>

              <label className="pmc-checkbox-row">
                <input
                  type="checkbox"
                  checked={addrIsDefault}
                  onChange={(e) => setAddrIsDefault(e.target.checked)}
                />
                <span>Set as default shipping address for checkout</span>
              </label>

              {addrError && <div className="pmc-msg error">{addrError}</div>}

              <div className="pmc-actions">
                <button
                  type="button"
                  className="pmc-cancel-btn"
                  onClick={() => setIsAddAddressModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="pmc-save-btn">
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={Boolean(authModalMode)}
        initialMode={authModalMode || 'signup'}
        onClose={() => setAuthModalMode(null)}
      />
    </div>
  );
}
