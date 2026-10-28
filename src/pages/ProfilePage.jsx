import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Package, MapPin, Shield, RotateCcw, ChevronRight, LogOut, Bell, Heart, CreditCard } from 'lucide-react';

export default function ProfilePage() {
  const navigate = useNavigate();

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

      {/* User Card (Screenshot 3 Profile Header) */}
      <div className="profile-user-card">
        <div className="profile-avatar-wrap">
          <div className="profile-avatar">👨‍💼</div>
        </div>
        <div className="profile-user-info">
          <h2 className="profile-user-name">Venkatesh Rao</h2>
          <span className="profile-user-phone">+91 98480 22334</span>
          <span className="profile-user-location">📍 Maddilapalem, Vizag • Active 2km Radius</span>
        </div>
      </div>

      {/* Menu Options (Screenshot 3 Profile List) */}
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

        {/* Logout button */}
        <button
          type="button"
          className="profile-logout-btn"
          onClick={() => {
            if (confirm('Are you sure you want to log out or switch location?')) {
              navigate('/');
            }
          }}
        >
          <LogOut size={16} />
          <span>Switch Location / Change Profile</span>
        </button>
      </div>
    </div>
  );
}
