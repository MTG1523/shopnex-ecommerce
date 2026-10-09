'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { formatDate, formatPrice, getCategoryEmoji, CATEGORIES } from '@/lib/utils';

export default function AdminPage() {
  const { state, apiRequest, toast } = useApp();
  const router = useRouter();
  const [tab, setTab] = useState('overview');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Product form
  const [showProductForm, setShowProductForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [productForm, setProductForm] = useState({ name: '', description: '', price: '', category: 'Audio', stock: '' });

  useEffect(() => {
    if (!state.user) { router.push('/auth'); return; }
    if (state.user.role !== 'admin') { router.push('/'); return; }
    loadAll();
  }, [state.user]);

  async function loadAll() {
    setLoading(true);
    try {
      const [pRes, oRes, uRes] = await Promise.all([
        apiRequest('/api/products'),
        apiRequest('/api/orders'),
        apiRequest('/api/users'),
      ]);
      const [pd, od, ud] = await Promise.all([pRes.json(), oRes.json(), uRes.json()]);
      setProducts(pd.products || []);
      setOrders(od.orders || []);
      setUsers(ud.users || []);
    } catch {
      toast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveProduct(e) {
    e.preventDefault();
    try {
      if (editProduct) {
        const res = await apiRequest(`/api/products/${editProduct._id}`, {
          method: 'PUT',
          body: JSON.stringify({ ...productForm, price: parseFloat(productForm.price), stock: parseInt(productForm.stock) }),
        });
        if (res.ok) {
          toast('Product updated!', 'success');
          closeProductForm();
          loadAll();
        }
      } else {
        const res = await apiRequest('/api/products', {
          method: 'POST',
          body: JSON.stringify(productForm),
        });
        if (res.ok) {
          toast('Product created!', 'success');
          closeProductForm();
          loadAll();
        }
      }
    } catch { toast('Failed to save product', 'error'); }
  }

  async function handleDeleteProduct(id) {
    if (!confirm('Delete this product?')) return;
    const res = await apiRequest(`/api/products/${id}`, { method: 'DELETE' });
    if (res.ok) { toast('Product deleted', 'success'); loadAll(); }
  }

  async function handleOrderStatus(orderId, status) {
    const res = await apiRequest(`/api/orders/${orderId}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    if (res.ok) { toast(`Order status updated to ${status}`, 'success'); loadAll(); }
  }

  function openProductForm(product = null) {
    setEditProduct(product);
    setProductForm(product ? {
      name: product.name, description: product.description,
      price: product.price.toString(), category: product.category, stock: product.stock.toString(),
    } : { name: '', description: '', price: '', category: 'Audio', stock: '' });
    setShowProductForm(true);
  }

  function closeProductForm() {
    setShowProductForm(false);
    setEditProduct(null);
  }

  const totalRevenue = orders.reduce((s, o) => o.status !== 'cancelled' ? s + o.total : s, 0);
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const lowStock = products.filter(p => p.stock < 5).length;

  if (loading) return <div className="loading-center"><div className="spinner" /><p>Loading dashboard...</p></div>;

  return (
    <div className="container" style={{ paddingBottom: '60px' }}>
      <div className="page-header">
        <h1 className="page-title">⚙️ Admin Dashboard</h1>
        <p className="page-subtitle">Manage products, orders, and users</p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-value">{formatPrice(totalRevenue)}</div>
          <div className="stat-label">Total Revenue</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-value">{orders.length}</div>
          <div className="stat-label">Total Orders</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🛍️</div>
          <div className="stat-value">{products.length}</div>
          <div className="stat-label">Products</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-value">{users.length}</div>
          <div className="stat-label">Users</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-value" style={{ color: pendingOrders > 0 ? 'var(--warning)' : 'inherit' }}>{pendingOrders}</div>
          <div className="stat-label">Pending Orders</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⚠️</div>
          <div className="stat-value" style={{ color: lowStock > 0 ? 'var(--error)' : 'inherit' }}>{lowStock}</div>
          <div className="stat-label">Low Stock</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        {[
          { id: 'overview', label: '📊 Overview' },
          { id: 'products', label: '🛍️ Products' },
          { id: 'orders', label: '📦 Orders' },
          { id: 'users', label: '👥 Users' },
        ].map(t => (
          <button key={t.id} id={`admin-tab-${t.id}`} className={`admin-tab ${tab === t.id ? 'active' : ''}`}
            onClick={() => setTab(t.id)}>{t.label}</button>
        ))}
      </div>

      {/* Overview Tab */}
      {tab === 'overview' && (
        <div>
          <h2 style={{ fontWeight: '700', marginBottom: '16px' }}>Recent Orders</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 10).map(order => (
                  <tr key={order._id}>
                    <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>#{order._id.slice(-8).toUpperCase()}</td>
                    <td>{order.userName}</td>
                    <td>{order.items.length} items</td>
                    <td style={{ fontWeight: '700' }}>{formatPrice(order.total)}</td>
                    <td><span className={`badge badge-${order.status}`}>{order.status}</span></td>
                    <td style={{ color: 'var(--text-muted)' }}>{formatDate(order.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Products Tab */}
      {tab === 'products' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontWeight: '700' }}>All Products</h2>
            <button id="add-product-btn" className="btn btn-primary btn-sm" onClick={() => openProductForm()}>
              + Add Product
            </button>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Rating</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '24px' }}>{getCategoryEmoji(p.category)}</span>
                        <div>
                          <div style={{ fontWeight: '600', fontSize: '14px' }}>{p.name}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {p.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td><span className="badge badge-user">{p.category}</span></td>
                    <td style={{ fontWeight: '700' }}>{formatPrice(p.price)}</td>
                    <td>
                      <span style={{ color: p.stock < 5 ? 'var(--error)' : p.stock < 15 ? 'var(--warning)' : 'var(--success)', fontWeight: '600' }}>
                        {p.stock}
                      </span>
                    </td>
                    <td style={{ color: '#fbbf24' }}>★ {p.rating}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button id={`edit-product-${p._id}`} className="btn btn-secondary btn-sm"
                          onClick={() => openProductForm(p)}>Edit</button>
                        <button id={`delete-product-${p._id}`} className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteProduct(p._id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Orders Tab */}
      {tab === 'orders' && (
        <div>
          <h2 style={{ fontWeight: '700', marginBottom: '20px' }}>All Orders</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Order ID</th><th>Customer</th><th>Email</th><th>Total</th><th>Status</th><th>Date</th><th>Update Status</th></tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order._id}>
                    <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>#{order._id.slice(-8).toUpperCase()}</td>
                    <td style={{ fontWeight: '600' }}>{order.userName}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{order.userEmail}</td>
                    <td style={{ fontWeight: '700' }}>{formatPrice(order.total)}</td>
                    <td><span className={`badge badge-${order.status}`}>{order.status}</span></td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{formatDate(order.createdAt)}</td>
                    <td>
                      <select
                        id={`order-status-${order._id}`}
                        className="form-input form-select"
                        style={{ padding: '6px 32px 6px 10px', fontSize: '13px', width: 'auto' }}
                        value={order.status}
                        onChange={e => handleOrderStatus(order._id, e.target.value)}
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {tab === 'users' && (
        <div>
          <h2 style={{ fontWeight: '700', marginBottom: '20px' }}>All Users</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th></tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user._id}>
                    <td style={{ fontWeight: '600' }}>{user.name}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{user.email}</td>
                    <td><span className={`badge badge-${user.role}`}>{user.role}</span></td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{formatDate(user.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Product Form Modal */}
      {showProductForm && (
        <div className="modal-overlay">
          <div className="modal">
            <button className="modal-close" onClick={closeProductForm}>✕</button>
            <h2 className="modal-title">{editProduct ? 'Edit Product' : 'Add Product'}</h2>
            <p className="modal-subtitle">{editProduct ? 'Update product details' : 'Add a new product to your catalog'}</p>
            <form id="product-form" onSubmit={handleSaveProduct}>
              <div className="form-group">
                <label className="form-label">Product Name</label>
                <input type="text" className="form-input" required value={productForm.name}
                  onChange={e => setProductForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-input" rows={3} value={productForm.description}
                  onChange={e => setProductForm(f => ({ ...f, description: e.target.value }))}
                  style={{ resize: 'vertical', minHeight: '80px' }} />
              </div>
              <div className="input-row">
                <div className="form-group">
                  <label className="form-label">Price ($)</label>
                  <input type="number" step="0.01" min="0" className="form-input" required value={productForm.price}
                    onChange={e => setProductForm(f => ({ ...f, price: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Stock</label>
                  <input type="number" min="0" className="form-input" required value={productForm.stock}
                    onChange={e => setProductForm(f => ({ ...f, stock: e.target.value }))} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-input form-select" value={productForm.category}
                  onChange={e => setProductForm(f => ({ ...f, category: e.target.value }))}>
                  {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button id="save-product-btn" type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  {editProduct ? 'Save Changes' : 'Add Product'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={closeProductForm}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
