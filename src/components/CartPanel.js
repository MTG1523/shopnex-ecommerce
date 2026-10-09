'use client';
import { useApp } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import { getCategoryEmoji } from '@/lib/utils';

export default function CartPanel() {
  const { state, closeCart, removeFromCart, updateQty, clearCart } = useApp();
  const router = useRouter();

  const total = state.cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  if (!state.cartOpen) return null;

  return (
    <>
      <div className="cart-overlay" onClick={closeCart} />
      <div className="cart-panel" role="dialog" aria-label="Shopping cart">
        <div className="cart-header">
          <h2 className="cart-title">🛒 Your Cart</h2>
          <button id="cart-close-btn" className="btn btn-ghost btn-sm" onClick={closeCart}>✕ Close</button>
        </div>

        {state.cart.length === 0 ? (
          <div className="cart-empty">
            <div className="cart-empty-icon">🛍️</div>
            <p style={{ fontWeight: 600 }}>Your cart is empty</p>
            <p style={{ fontSize: '14px' }}>Add some products to get started</p>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {state.cart.map(item => (
                <div key={item.productId} className="cart-item">
                  <div className="cart-item-emoji">{getCategoryEmoji(item.category)}</div>
                  <div className="cart-item-info">
                    <div className="cart-item-name">{item.name}</div>
                    <div className="cart-item-price">${(item.price * item.quantity).toFixed(2)}</div>
                    <div className="qty-control">
                      <button
                        className="qty-btn"
                        onClick={() => updateQty(item.productId, item.quantity - 1)}
                        aria-label="Decrease quantity"
                      >−</button>
                      <span className="qty-num">{item.quantity}</span>
                      <button
                        className="qty-btn"
                        onClick={() => updateQty(item.productId, item.quantity + 1)}
                        aria-label="Increase quantity"
                      >+</button>
                    </div>
                  </div>
                  <button
                    className="remove-btn"
                    onClick={() => removeFromCart(item.productId)}
                    aria-label="Remove item"
                  >✕</button>
                </div>
              ))}
            </div>

            <div className="cart-footer">
              <div className="cart-total">
                <span>Total</span>
                <span style={{ color: 'var(--accent-light)' }}>${total.toFixed(2)}</span>
              </div>
              <button
                id="checkout-btn"
                className="btn btn-primary btn-full"
                onClick={() => {
                  closeCart();
                  router.push('/checkout');
                }}
              >
                Proceed to Checkout →
              </button>
              <button
                className="btn btn-ghost btn-full"
                style={{ marginTop: '8px' }}
                onClick={clearCart}
              >
                Clear Cart
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
