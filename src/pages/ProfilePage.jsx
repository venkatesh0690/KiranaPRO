import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Package, MapPin, Shield, RotateCcw, ChevronRight, LogOut, Bell, Heart, CreditCard, UserPlus, LogIn, Store } from 'lucide-react';
import { useSecurity } from '../context/SecurityContext';
import AuthModal from '../components/AuthModal';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { authSession, logout } = useSecurity();
  const [authModalMode, setAuthModalMode] = useState(null);

  const menuSections = [
    {
      title: 'Order Management',
      items: [
        { icon: Package, label: 'My Order History', action: () => navigate('/orders'), badge: '1 Live' },
        { icon: MapPin, label: 'Saved Shipping Addresses', desc: 'Maddilapalem & MVP Colony' },
        { icon: CreditCard, label: 'Payment Methods & UPI', desc: 'UPI, Cards & Cash on Delivery' },
      ]
    },
    {
      title: 'Preferences & Safety',
      items: [
        { icon: Heart, label: 'Saved Kirana Stores & Wishlist' },
        { icon: Bell, label: 'Notifications & Order Alerts' },
        { icon: Shield, label: 'Privacy Policy & Terms' },
        { icon: RotateCcw, label: 'Return & 2-Hour Replacement Policy' },
      ]
    }
  ];

  return (
    <div className="profile-page">
      {/* Top Header */}
      <div className="profile-top-bar">
        <button type="button" className="profile-back-btn" onClick={() => navigate('/home')}>
          <ArrowLeft size={18} />
        </button>
        <h1 className="profile-top-title">My Profile</h1>
      </div>

      {/* User Card: Only show user name when authenticated, otherwise Guest User */}
      <div className="profile-user-card">
        <div className="profile-avatar-wrap">
          <div className="profile-avatar">{authSession.isAuthenticated ? '👨‍💼' : '👤'}</div>
        </div>
        <div className="profile-user-info">
          {authSession.isAuthenticated && authSession.userName ? (
            <>
              <h2 className="profile-user-name">{authSession.userName}</h2>
              <span className="profile-user-phone">{authSession.userPhone || '+91 98480 22334'}</span>
              <span className="profile-user-location">📍 Maddilapalem, Vizag • Active 2km Radius</span>
            </>
          ) : (
            <>
              <h2 className="profile-user-name">Guest Customer</h2>
              <span className="profile-user-phone">Sign in to track orders & save delivery address</span>
              <div className="profile-guest-actions">
                <button
                  type="button"
                  className="profile-auth-btn user-signup"
                  onClick={() => setAuthModalMode('user-signup')}
                >
                  <UserPlus size={14} />
                  <span>User Sign Up</span>
                </button>
                <button
                  type="button"
                  className="profile-auth-btn user-login"
                  onClick={() => setAuthModalMode('user-login')}
                >
                  <LogIn size={14} />
                  <span>Log In</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Menu Options */}
      <div className="profile-menu-container">
        {menuSections.map((sec) => (
          <div key={sec.title} className="profile-menu-group">
            <h3 className="profile-group-title">{sec.title}</h3>
            <div className="profile-group-card">
              {sec.items.map((it) => {
                const Icon = it.icon;
                return (
                  <div
                    key={it.label}
                    className="profile-menu-row"
                    onClick={it.action || (() => alert(`${it.label} settings opened.`))}
                  >
                    <div className="profile-menu-icon-wrap">
                      <Icon size={18} color="var(--brand)" />
                    </div>
                    <div className="profile-menu-text">
                      <span className="profile-menu-label">{it.label}</span>
                      {it.desc && <span className="profile-menu-desc">{it.desc}</span>}
                    </div>
                    {it.badge && <span className="profile-menu-badge">{it.badge}</span>}
                    <ChevronRight size={17} color="var(--n400)" />
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Partner Store Sign Up Banner */}
        <div className="profile-seller-cta-box" onClick={() => setAuthModalMode('seller-signup')}>
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

      {/* Auth Modal */}
      <AuthModal
        isOpen={Boolean(authModalMode)}
        initialMode={authModalMode || 'user-signup'}
        onClose={() => setAuthModalMode(null)}
        onSuccess={() => setAuthModalMode(null)}
      />
    </div>
  );
}
