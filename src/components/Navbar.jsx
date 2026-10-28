import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, Bell, User } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function Navbar({ location }) {
  const { totalItems, totalPrice } = useCart();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* Brand */}
        <Link to="/home" className="brand">
          <div className="brand-mark">⚡</div>
          <span className="brand-text">Kirana<span>PRO</span></span>
        </Link>

        {/* Location */}
        <div className="nav-location" onClick={() => navigate('/')}>
          <div className="nav-loc-dot" />
          <div className="nav-loc-text">
            <span className="nav-loc-label">Delivering to</span>
            <span className="nav-loc-name">{location}</span>
          </div>
        </div>

        {/* Search */}
        <div className="nav-search">
          <Search size={16} className="nav-search-icon" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder='Search "milk, onions, chips…"'
          />
        </div>

        {/* Actions */}
        <button className="nav-icon-btn"><Bell size={19} /></button>
        <button className="nav-icon-btn"><User size={19} /></button>

        {totalItems > 0 && (
          <Link to="/cart" className="nav-cart-btn">
            <ShoppingBag size={16} />
            <div className="nav-cart-count">{totalItems}</div>
            <span>₹{totalPrice}</span>
          </Link>
        )}
      </div>
    </header>
  );
}
