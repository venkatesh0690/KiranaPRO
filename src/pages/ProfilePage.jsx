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
  X,
  Share2,
  Sparkles,
  Coins,
  Award,
  Building2
} from 'lucide-react';
import { useSecurity } from '../context/SecurityContext';
import AuthModal from '../components/AuthModal';
import { getChillarBalance, getCustomerTrustScore, isGoldNeighbor } from '../utils/chillarKhata';

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
  const [theme, setTheme] = useState(() => {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('kp_theme');
      if (saved) return saved;
    }
    return typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [theme]);

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

      {/* ── Hyperlocal Trust & Rewards Dashboard (Phases 24, 26, 29) ── */}
      <div style={{ padding: '0 16px', margin: '14px 0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        
        {/* COD Trust Score & Gold Status */}
        <div style={{
          background: 'linear-gradient(135deg, #1E3A2B 0%, #14532D 100%)',
          borderRadius: '16px',
          padding: '16px',
          color: '#FFFFFF',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', background: 'rgba(255,255,255,0.2)', padding: '3px 8px', borderRadius: '12px' }}>
              🌟 {isGoldNeighbor() ? 'VERIFIED GOLD NEIGHBOR' : 'TRUST SCORE: 85/100'}
            </span>
            <span style={{ fontSize: '12px', color: '#86EFAC', fontWeight: '750' }}>
              COD Cap: ₹5,000 Unlocked
            </span>
          </div>
          <h3 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: '800' }}>
            Doorstep Cash on Delivery Trust Status
          </h3>
          <p style={{ margin: 0, fontSize: '11.5px', color: '#D1FAE5', lineHeight: '1.45' }}>
            100% on-time verified PIN handovers. Priority dispatch across Visakhapatnam and zero confirmation calls.
          </p>
        </div>

        {/* Chillar Khata & Monthly Savings Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {/* Chillar Khata (Loose Change Wallet) */}
          <div style={{
            background: '#FFFFFF',
            border: '1.5px solid #E2E8F0',
            borderRadius: '14px',
            padding: '12px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#D97706', marginBottom: '4px' }}>
              <Coins size={16} />
              <span style={{ fontSize: '11px', fontWeight: '800' }}>CHILLAR KHATA</span>
            </div>
            <div style={{ fontSize: '18px', fontWeight: '900', color: 'var(--brand-primary, #1E3A2B)' }}>
              ₹{getChillarBalance()}
            </div>
            <div style={{ fontSize: '10px', color: '#64748B', marginTop: '2px' }}>
              Loose coins auto-saved. Deducts from next COD order.
            </div>
          </div>

          {/* Monthly Grocery Savings */}
          <div style={{
            background: '#FFFFFF',
            border: '1.5px solid #E2E8F0',
            borderRadius: '14px',
            padding: '12px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#16A34A', marginBottom: '4px' }}>
              <Award size={16} />
              <span style={{ fontSize: '11px', fontWeight: '800' }}>MONTHLY SAVED</span>
            </div>
            <div style={{ fontSize: '18px', fontWeight: '900', color: '#15803D' }}>
              ₹420
            </div>
            <div style={{ fontSize: '10px', color: '#64748B', marginTop: '2px' }}>
              Saved vs. MRP & dark-store surge fees this month.
            </div>
          </div>
        </div>

        {/* Neighbor Referral: Give ₹25, Get ₹25 */}
        <div style={{
          background: 'var(--bg-subtle, #EEF2EB)',
          borderRadius: '14px',
          padding: '14px',
          border: '1px solid rgba(0,0,0,0.06)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--brand-primary, #1E3A2B)' }}>
              🎁 Give ₹25, Get ₹25 Neighbor Referral
            </span>
            <span style={{ fontSize: '11px', fontWeight: '800', background: '#FFFFFF', padding: '2px 8px', borderRadius: '6px', border: '1px solid #CBD5E1' }}>
              VIZAG-RAJU25
            </span>
          </div>
          <p style={{ margin: '0 0 10px', fontSize: '11px', color: '#475569', lineHeight: 1.4 }}>
            Invite an apartment neighbor. When they receive their first PIN-verified COD order, ₹25 is credited to your Chillar Khata!
          </p>
          <button
            type="button"
            onClick={() => {
              const text = encodeURIComponent(
                'Order fresh Visakhapatnam Mandi veggies & Kirana groceries on KiranaPRO! Use my code VIZAG-RAJU25 for ₹25 OFF your first COD order above ₹250.\n\nhttps://kiranapro-two.vercel.app'
              );
              window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
            }}
            style={{
              width: '100%',
              padding: '8px',
              background: '#25D366',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              fontSize: '11px',
              fontWeight: '800',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <Share2 size={13} /> Share Code on WhatsApp
          </button>
        </div>

        {/* Switch to B2B Wholesale Banner */}
        <div
          onClick={() => navigate('/b2b')}
          style={{
            background: '#FFFFFF',
            border: '1.5px solid #CBD5E1',
            borderRadius: '14px',
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Building2 size={18} color="var(--brand-primary, #1E3A2B)" />
            <div>
              <div style={{ fontSize: '13px', fontWeight: '800', color: '#1E293B' }}>
                Buying for a Tiffin Center, Mess or Hostel?
              </div>
              <div style={{ fontSize: '11px', color: '#64748B' }}>
                Switch to commercial bulk sack & crate pricing (5:30 AM drop)
              </div>
            </div>
          </div>
          <ChevronRight size={16} color="#64748B" />
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
