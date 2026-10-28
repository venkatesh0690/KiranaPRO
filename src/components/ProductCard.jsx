import { Plus, Minus } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function ProductCard({ product, storeId, layout = 'big', categoryBg = '#FFF3E0' }) {
  const { cart, addItem, removeItem } = useCart();
  const cartItem = cart.items.find((i) => i.id === product.id);
  const qty = cartItem ? cartItem.quantity : 0;
  const discount = product.mrp > product.price
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
    : 0;

  return (
    <div className={`pc ${layout} ${!product.inStock ? 'oos' : ''}`}>
      {/* Product Image Box */}
      <div className="pc-img-wrap" style={{ background: categoryBg }}>
        {product.image && (product.image.startsWith('http') || product.image.startsWith('/')) ? (
          <img
            src={product.image}
            alt={product.name}
            className="pc-real-img"
            loading="lazy"
            referrerPolicy="no-referrer"
            crossOrigin="anonymous"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              if (e.currentTarget.nextElementSibling) {
                e.currentTarget.nextElementSibling.style.display = 'block';
              }
            }}
          />
        ) : null}
        <span
          className="pc-emoji"
          style={{
            display: product.image && (product.image.startsWith('http') || product.image.startsWith('/')) ? 'none' : 'block'
          }}
        >
          {product.fallbackEmoji || (product.image?.startsWith('http') ? '🥬' : product.image)}
        </span>
        {discount > 0 && (
          <div className="pc-disc">{discount}% OFF</div>
        )}
        {!product.inStock && (
          <div className="pc-oos-layer">Out of Stock</div>
        )}
      </div>

      {/* Body details */}
      <div className="pc-body">
        <span className="pc-unit">{product.unit}</span>
        <h4 className="pc-name">{product.name}</h4>

        <div className="pc-price-row">
          <span className="pc-price">₹{product.price}</span>
          {product.mrp > product.price && (
            <span className="pc-mrp">₹{product.mrp}</span>
          )}
        </div>
      </div>

      {/* Action / Add button */}
      <div className="pc-action">
        {product.inStock ? (
          qty === 0 ? (
            <button
              type="button"
              className="pc-add-btn"
              onClick={() => addItem(storeId, product)}
            >
              ADD
            </button>
          ) : (
            <div className="pc-qty">
              <button
                type="button"
                onClick={() => removeItem(product.id)}
                aria-label="Decrease quantity"
              >
                <Minus size={13} strokeWidth={3} />
              </button>
              <span>{qty}</span>
              <button
                type="button"
                onClick={() => addItem(storeId, product)}
                aria-label="Increase quantity"
              >
                <Plus size={13} strokeWidth={3} />
              </button>
            </div>
          )
        ) : (
          <button type="button" className="pc-add-btn" disabled>
            Sold Out
          </button>
        )}
      </div>
    </div>
  );
}
