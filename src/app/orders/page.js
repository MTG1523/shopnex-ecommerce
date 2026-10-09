'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { formatDate, formatPrice, getCategoryEmoji } from '@/lib/utils';

const STATUS_STEPS = ['pending', 'processing', 'shipped', 'delivered'];

export default function OrdersPage() {
  const { state, apiRequest, toast } = useApp();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (!state.user) { router.push('/auth'); return; }
    fetchOrders();
  }, [state.user]);

  async function fetchOrders() {
    setLoading(true);
    try {
      const res = await apiRequest('/api/orders');
      const data = await res.json();
      setOrders(data.orders || []);
    } catch {
      toast('Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  }

  function getStatusStep(status) {
    return STATUS_STEPS.indexOf(status);
  }

  if (loading) {
    return (
      <div className="loading-center">
        <div className="spinner" />
        <p>Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1 className="page-title">My Orders</h1>
        <p className="page-subtitle">{orders.length} orders placed</p>
      </div>

      {orders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📦</div>
          <div className="empty-state-title">No orders yet</div>
          <p style={{ marginBottom: '24px' }}>Start shopping to see your orders here.</p>
          <button className="btn btn-primary" onClick={() => router.push('/')}>Browse Products →</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {orders.map(order => (
            <div key={order._id} className="card" style={{ padding: '24px', cursor: 'pointer' }}
              onClick={() => setSelected(selected?._id === order._id ? null : order)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ fontFamily: 'monospace', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                    Order #{order._id.slice(-8).toUpperCase()}
                  </div>
                  <div style={{ fontWeight: '700', fontSize: '16px', marginBottom: '4px' }}>
                    {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{formatDate(order.createdAt)}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '22px', fontWeight: '900', marginBottom: '6px' }}>{formatPrice(order.total)}</div>
                  <span className={`badge badge-${order.status}`}>{order.status}</span>
                </div>
              </div>

              {/* Progress tracker */}
              {order.status !== 'cancelled' && (
                <div style={{ marginTop: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    {STATUS_STEPS.map((step, idx) => {
                      const current = getStatusStep(order.status);
                      const done = idx <= current;
                      return (
                        <div key={step} style={{ flex: 1, textAlign: 'center' }}>
                          <div style={{
                            width: '28px', height: '28px', borderRadius: '50%', margin: '0 auto 6px',
                            background: done ? 'var(--accent)' : 'var(--bg-secondary)',
                            border: `2px solid ${done ? 'var(--accent)' : 'var(--border)'}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '13px', fontWeight: '700',
                            color: done ? 'white' : 'var(--text-muted)',
                          }}>
                            {done ? '✓' : idx + 1}
                          </div>
                          <div style={{ fontSize: '11px', textTransform: 'capitalize', color: done ? 'var(--accent-light)' : 'var(--text-muted)' }}>
                            {step}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ height: '3px', background: 'var(--bg-secondary)', borderRadius: '2px', position: 'relative', marginTop: '4px' }}>
                    <div style={{
                      height: '100%', borderRadius: '2px',
                      width: `${Math.min(((getStatusStep(order.status) + 1) / STATUS_STEPS.length) * 100, 100)}%`,
                      background: 'linear-gradient(90deg, var(--accent), var(--accent-dark))',
                      transition: 'width 0.5s ease',
                    }} />
                  </div>
                </div>
              )}

              {/* Expanded items */}
              {selected?._id === order._id && (
                <div style={{ marginTop: '20px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                  <div style={{ fontWeight: '700', marginBottom: '12px', fontSize: '14px', color: 'var(--text-secondary)' }}>ORDER ITEMS</div>
                  {order.items.map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                      <span style={{ fontSize: '14px' }}>
                        {getCategoryEmoji(item.category)} {item.name} ×{item.quantity}
                      </span>
                      <span style={{ fontWeight: '600' }}>{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                  {order.shippingAddress?.address && (
                    <div style={{ marginTop: '14px', fontSize: '13px', color: 'var(--text-muted)' }}>
                      📍 {order.shippingAddress.name}, {order.shippingAddress.address}, {order.shippingAddress.city}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
