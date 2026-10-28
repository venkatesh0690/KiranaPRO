import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function CartBar({ storeId }) {
  const { cart, totalItems, totalPrice } = useCart();
  if (totalItems === 0 || cart.storeId !== storeId) return null;

  return (
    <div className="cart-bar">
      <div className="cb-left">
        <div className="cb-icon">
          <ShoppingBag size={18} color="white" />
        </div>
        <div>
          <p className="cb-items">{totalItems} {totalItems === 1 ? 'item' : 'items'} in cart</p>
          <p className="cb-price">₹{totalPrice}</p>
        </div>
      </div>
      <Link to="/cart" className="cb-btn">
        View Cart <ArrowRight size={15} />
      </Link>
    </div>
  );
}
