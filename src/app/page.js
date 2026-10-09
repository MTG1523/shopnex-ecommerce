'use client';
import { useState, useEffect, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import { getCategoryEmoji, getStars, CATEGORIES, SORT_OPTIONS } from '@/lib/utils';

export default function HomePage() {
  const { addToCart, toast } = useApp();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('createdAt');
  const [searchInput, setSearchInput] = useState('');

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ sort });
      if (category !== 'All') params.set('category', category);
      if (search) params.set('search', search);
      const res = await fetch(`/api/products?${params}`);
      const data = await res.json();
      setProducts(data.products || []);
    } catch {
      toast('Failed to load products', 'error');
    } finally {
      setLoading(false);
    }
  }, [category, search, sort]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  return (
    <div>
      {/* Hero */}
      <section className="hero">
        <div className="container">
          <div style={{ maxWidth: '640px' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '6px 16px', borderRadius: '20px', marginBottom: '20px',
              background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)',
              fontSize: '13px', fontWeight: '600', color: 'var(--accent-light)',
            }}>
              ⚡ New arrivals just dropped
            </div>
            <h1 className="hero-title">
              The Future of Tech,{' '}
              <span className="hero-gradient-text">Delivered to You</span>
            </h1>
            <p className="hero-subtitle">
              Explore premium gadgets, laptops, and accessories. Curated for tech enthusiasts who refuse to compromise.
            </p>
            <div className="hero-actions">
              <button
                id="shop-now-btn"
                className="btn btn-primary"
                onClick={() => document.getElementById('catalog').scrollIntoView({ behavior: 'smooth' })}
              >
                Shop Now →
              </button>
              <span style={{ color: 'var(--text-muted)', fontSize: '14px', alignSelf: 'center' }}>
                🔒 Secure checkout · Free returns
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Catalog */}
      <section id="catalog" className="section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Product Catalog</h2>
            <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
              {products.length} products
            </span>
          </div>

          {/* Filters */}
          <div className="filters-bar">
            <div className="search-input-wrap">
              <span className="search-icon">🔍</span>
              <input
                id="search-input"
                type="text"
                className="form-input search-input"
                placeholder="Search products..."
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
              />
            </div>
            <div className="filter-chips">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  id={`filter-${cat.toLowerCase()}`}
                  className={`chip ${category === cat ? 'active' : ''}`}
                  onClick={() => setCategory(cat)}
                >
                  {cat !== 'All' && getCategoryEmoji(cat) + ' '}{cat}
                </button>
              ))}
            </div>
            <select
              id="sort-select"
              className="form-input form-select"
              style={{ width: 'auto', minWidth: '160px' }}
              value={sort}
              onChange={e => setSort(e.target.value)}
            >
              {SORT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Products */}
          {loading ? (
            <div className="loading-center">
              <div className="spinner" />
              <p>Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🔍</div>
              <div className="empty-state-title">No products found</div>
              <p>Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="products-grid">
              {products.map(product => (
                <ProductCard
                  key={product._id}
                  product={product}
                  onAddToCart={() => addToCart(product)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features strip */}
      <section style={{ padding: '60px 0', borderTop: '1px solid var(--border)', marginTop: '20px' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '32px', textAlign: 'center' }}>
            {[
              { icon: '🚀', title: 'Fast Delivery', desc: 'Free shipping on orders over $50' },
              { icon: '🔒', title: 'Secure Payment', desc: '256-bit SSL encrypted checkout' },
              { icon: '↩️', title: 'Easy Returns', desc: '30-day hassle-free returns' },
              { icon: '💬', title: '24/7 Support', desc: 'Expert help whenever you need it' },
            ].map(f => (
              <div key={f.title} style={{ color: 'var(--text-secondary)' }}>
                <div style={{ fontSize: '36px', marginBottom: '12px' }}>{f.icon}</div>
                <div style={{ fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>{f.title}</div>
                <div style={{ fontSize: '13px' }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function ProductCard({ product, onAddToCart }) {
  const emoji = getCategoryEmoji(product.category);
  const stars = getStars(product.rating);

  return (
    <div className="product-card">
      <div className="product-img">
        <span style={{ fontSize: '72px', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))' }}>{emoji}</span>
      </div>
      <div className="product-info">
        <div className="product-category">{product.category}</div>
        <div className="product-name" title={product.name}>{product.name}</div>
        <div className="product-rating">
          <span className="stars">{stars}</span>
          <span className="rating-count">({product.reviews?.toLocaleString()})</span>
        </div>
        <div className="product-footer">
          <span className="product-price">${product.price.toFixed(2)}</span>
          {product.stock > 0 ? (
            <button
              id={`add-cart-${product._id}`}
              className="add-to-cart-btn"
              onClick={() => onAddToCart(product)}
              aria-label={`Add ${product.name} to cart`}
            >
              🛒 Add
            </button>
          ) : (
            <span className="out-of-stock">Out of Stock</span>
          )}
        </div>
        {product.stock > 0 && product.stock < 5 && (
          <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--warning)', fontWeight: '600' }}>
            ⚡ Only {product.stock} left!
          </div>
        )}
      </div>
    </div>
  );
}
