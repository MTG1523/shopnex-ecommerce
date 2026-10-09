'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { getCategoryEmoji } from '@/lib/utils';

export default function CheckoutPage() {
  const { state, clearCart, toast, apiRequest } = useApp();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    zip: '',
    country: '',
    cardName: '',
    cardNumber: '',
    expiry: '',
    cvv: '',
    paymentMethod: 'card',
  });

  const cartTotal = state.cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const tax = cartTotal * 0.08;
  const shipping = cartTotal >= 50 ? 0 : 9.99;
  const orderTotal = cartTotal + tax + shipping;

  function update(field, val) {
    setForm(f => ({ ...f, [field]: val }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!state.user) {
      router.push('/auth');
      return;
    }
    if (state.cart.length === 0) return;

    setLoading(true);
    setError('');
    try {
      const res = await apiRequest('/api/orders', {
        method: 'POST',
        body: JSON.stringify({
          items: state.cart.map(i => ({ productId: i.productId, quantity: i.quantity })),
          shippingAddress: {
            name: `${form.firstName} ${form.lastName}`,
            address: form.address,
            city: form.city,
            zip: form.zip,
            country: form.country,
          },
          paymentMethod: form.paymentMethod,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      clearCart();
      setSuccess(data.order);
      toast('Order placed successfully! 🎉', 'success');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (state.cart.length === 0 && !success) {
    return (
      <div className="container">
        <div className="empty-state" style={{ paddingTop: '120px' }}>
          <div className="empty-state-icon">🛒</div>
          <div className="empty-state-title">Your cart is empty</div>
          <p style={{ marginBottom: '24px' }}>Add some products before checking out.</p>
          <button className="btn btn-primary" onClick={() => router.push('/')}>Browse Products →</button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="container">
        <div style={{ maxWidth: '560px', margin: '80px auto', textAlign: 'center' }}>
          <div style={{ fontSize: '72px', marginBottom: '20px' }}>🎉</div>
          <h1 className="page-title" style={{ marginBottom: '12px' }}>Order Confirmed!</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '16px' }}>
            Thank you for your purchase! Your order is being processed.
          </p>
          <div className="card" style={{ padding: '24px', marginBottom: '24px', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Order ID</span>
              <span style={{ fontWeight: '700', fontFamily: 'monospace' }}>#{success._id.slice(-8).toUpperCase()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Total</span>
              <span style={{ fontWeight: '700' }}>${success.total.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Status</span>
              <span className="badge badge-pending">Pending</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={() => router.push('/orders')}>View My Orders</button>
            <button className="btn btn-secondary" onClick={() => router.push('/')}>Continue Shopping</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1 className="page-title">Checkout</h1>
        <p className="page-subtitle">Complete your order · Secure 256-bit SSL</p>
      </div>

      {!state.user && (
        <div className="alert alert-error" style={{ marginBottom: '24px' }}>
          ⚠️ Please <a href="/auth" style={{ color: 'var(--accent-light)', textDecoration: 'underline' }}>sign in</a> to place an order.
        </div>
      )}

      {error && <div className="alert alert-error">⚠️ {error}</div>}

      <form id="checkout-form" onSubmit={handleSubmit}>
        <div className="checkout-grid">
          <div>
            {/* Shipping */}
            <div className="checkout-section">
              <h2 className="checkout-section-title">📦 Shipping Information</h2>
              <div className="input-row">
                <div className="form-group">
                  <label htmlFor="checkout-fname" className="form-label">First Name</label>
                  <input id="checkout-fname" type="text" className="form-input" required
                    value={form.firstName} onChange={e => update('firstName', e.target.value)} />
                </div>
                <div className="form-group">
                  <label htmlFor="checkout-lname" className="form-label">Last Name</label>
                  <input id="checkout-lname" type="text" className="form-input" required
                    value={form.lastName} onChange={e => update('lastName', e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="checkout-email" className="form-label">Email</label>
                <input id="checkout-email" type="email" className="form-input" required
                  value={form.email} onChange={e => update('email', e.target.value)} />
              </div>
              <div className="form-group">
                <label htmlFor="checkout-address" className="form-label">Address</label>
                <input id="checkout-address" type="text" className="form-input" required
                  value={form.address} onChange={e => update('address', e.target.value)} />
              </div>
              <div className="input-row">
                <div className="form-group">
                  <label htmlFor="checkout-city" className="form-label">City</label>
                  <input id="checkout-city" type="text" className="form-input" required
                    value={form.city} onChange={e => update('city', e.target.value)} />
                </div>
                <div className="form-group">
                  <label htmlFor="checkout-zip" className="form-label">ZIP Code</label>
                  <input id="checkout-zip" type="text" className="form-input" required
                    value={form.zip} onChange={e => update('zip', e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="checkout-country" className="form-label">Country</label>
                <select id="checkout-country" className="form-input form-select" required
                  value={form.country} onChange={e => update('country', e.target.value)}>
                  <option value="">Select country</option>
                  <option>United States</option>
                  <option>United Kingdom</option>
                  <option>Canada</option>
                  <option>Australia</option>
                  <option>Germany</option>
                  <option>France</option>
                  <option>India</option>
                  <option>Other</option>
                </select>
              </div>
            </div>

            {/* Payment */}
            <div className="checkout-section">
              <h2 className="checkout-section-title">💳 Payment Method</h2>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                {['card', 'paypal', 'bank'].map(method => (
                  <button
                    key={method}
                    type="button"
                    id={`payment-${method}`}
                    className={`btn ${form.paymentMethod === method ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                    onClick={() => update('paymentMethod', method)}
                  >
                    {method === 'card' && '💳 Card'}
                    {method === 'paypal' && '🅿️ PayPal'}
                    {method === 'bank' && '🏦 Bank'}
                  </button>
                ))}
              </div>
              {form.paymentMethod === 'card' && (
                <>
                  <div className="form-group">
                    <label htmlFor="card-name" className="form-label">Name on Card</label>
                    <input id="card-name" type="text" className="form-input" required
                      value={form.cardName} onChange={e => update('cardName', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="card-number" className="form-label">Card Number</label>
                    <input id="card-number" type="text" className="form-input" required
                      placeholder="1234 5678 9012 3456" maxLength={19}
                      value={form.cardNumber}
                      onChange={e => update('cardNumber', e.target.value.replace(/\D/g, '').replace(/(\d{4})/g, '$1 ').trim())} />
                  </div>
                  <div className="input-row">
                    <div className="form-group">
                      <label htmlFor="card-expiry" className="form-label">Expiry (MM/YY)</label>
                      <input id="card-expiry" type="text" className="form-input" required
                        placeholder="MM/YY" maxLength={5}
                        value={form.expiry} onChange={e => update('expiry', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label htmlFor="card-cvv" className="form-label">CVV</label>
                      <input id="card-cvv" type="text" className="form-input" required
                        placeholder="•••" maxLength={4}
                        value={form.cvv} onChange={e => update('cvv', e.target.value)} />
                    </div>
                  </div>
                </>
              )}
              {form.paymentMethod !== 'card' && (
                <div className="alert alert-success">
                  ✅ You will be redirected to {form.paymentMethod === 'paypal' ? 'PayPal' : 'your bank'} after placing the order.
                </div>
              )}
            </div>
          </div>

          {/* Summary */}
          <div className="checkout-summary">
            <h2 style={{ fontWeight: '800', marginBottom: '20px', fontSize: '18px' }}>Order Summary</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              {state.cart.map(item => (
                <div key={item.productId} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    {getCategoryEmoji(item.category)} {item.name} ×{item.quantity}
                  </span>
                  <span style={{ fontWeight: '600' }}>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="summary-row">
              <span style={{ color: 'var(--text-secondary)' }}>Subtotal</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span style={{ color: 'var(--text-secondary)' }}>Shipping</span>
              <span style={{ color: shipping === 0 ? 'var(--success)' : 'inherit' }}>
                {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
              </span>
            </div>
            <div className="summary-row">
              <span style={{ color: 'var(--text-secondary)' }}>Tax (8%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span style={{ color: 'var(--accent-light)' }}>${orderTotal.toFixed(2)}</span>
            </div>
            <button
              id="place-order-btn"
              type="submit"
              className="btn btn-primary btn-full"
              style={{ marginTop: '20px' }}
              disabled={loading || !state.user}
            >
              {loading ? 'Placing Order...' : `Place Order · $${orderTotal.toFixed(2)}`}
            </button>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', marginTop: '12px' }}>
              🔒 Secured by SSL encryption
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
