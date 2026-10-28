import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Search, Package, ShoppingBag, User } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { totalItems } = useCart();

  const currentPath = location.pathname;

  const tabs = [
    { id: 'home', label: 'Home', icon: Home, path: '/home' },
    { id: 'search', label: 'Search', icon: Search, path: '/search' },
    { id: 'orders', label: 'Orders', icon: Package, path: '/orders' },
    { id: 'cart', label: 'Cart', icon: ShoppingBag, path: '/cart', badge: totalItems },
    { id: 'profile', label: 'Profile', icon: User, path: '/profile' },
  ];

  return (
    <nav className="bottom-nav">
      <div className="bottom-nav-inner">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentPath === tab.path || (tab.id === 'home' && currentPath.startsWith('/store'));
          return (
            <button
              key={tab.id}
              type="button"
              className={`bnav-item ${isActive ? 'active' : ''}`}
              onClick={() => navigate(tab.path)}
            >
              <div className="bnav-icon-wrap">
                <Icon size={20} strokeWidth={isActive ? 2.4 : 1.8} />
                {Boolean(tab.badge && tab.badge > 0) && (
                  <span className="bnav-badge">{tab.badge}</span>
                )}
              </div>
              <span className="bnav-label">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
