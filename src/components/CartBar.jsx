import { Link, useLocation } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import CatalogProductVisual from './CatalogProductVisual';

export default function CartBar({ storeId }) {
  const { cart, totalItems, totalPrice } = useCart();
  const location = useLocation();

  // Hide on cart page, portal routes (admin/seller), or when cart is empty
  if (totalItems === 0 || location.pathname === '/cart' || location.pathname.startsWith('/admin') || location.pathname.startsWith('/seller')) {
    return null;
  }

  // If storeId is passed explicitly and differs from cart's storeId, don't show
  if (storeId && cart.storeId && String(cart.storeId) !== String(storeId)) {
    return null;
  }

  const totalSavings = cart.items.reduce(
    (sum, i) => sum + Math.max(0, (Number(i.mrp || i.price) - Number(i.price)) * i.quantity),
    0
  );
  const sampleThumbnails = cart.items.slice(0, 3);

  return (
    <aside className="kp-floating-cart-bar" role="region" aria-label="Current basket preview">
      <div className="kp-fcb-content">
        <div className="kp-fcb-left">
          <div className="kp-fcb-thumbnails" aria-hidden="true">
            {sampleThumbnails.map((item, index) => (
              <div key={item.id} className="kp-fcb-thumb-item" style={{ zIndex: 3 - index }}>
                <CatalogProductVisual product={item} className="kp-fcb-visual" />
              </div>
            ))}
          </div>
          <div className="kp-fcb-meta">
            <div className="kp-fcb-headline">
              <span className="kp-fcb-count">{totalItems} {totalItems === 1 ? 'item' : 'items'}</span>
              <span className="kp-fcb-bullet">•</span>
              <span className="kp-fcb-price">₹{totalPrice}</span>
            </div>
            {totalSavings > 0 ? (
              <span className="kp-fcb-savings">You save ₹{totalSavings} vs MRP</span>
            ) : (
              <span className="kp-fcb-sub">Direct Mandi & Kirana rates</span>
            )}
          </div>
        </div>
        <Link to="/cart" className="kp-fcb-btn">
          <span>View Cart</span>
          <ArrowRight size={15} aria-hidden="true" />
        </Link>
      </div>
    </aside>
  );
}
