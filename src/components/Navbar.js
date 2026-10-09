'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';

export default function Navbar() {
  const { state, logout, toggleCart } = useApp();
  const pathname = usePathname();
  const router = useRouter();

  const cartCount = state.cart.reduce((sum, i) => sum + i.quantity, 0);

  function handleLogout() {
    logout();
    router.push('/');
  }

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-inner">
          <Link href="/" className="navbar-logo">⚡ ShopNex</Link>

          <div className="navbar-links">
            <Link href="/" className={`navbar-link ${pathname === '/' ? 'active' : ''}`}>Store</Link>
            {state.user && (
              <Link href="/orders" className={`navbar-link ${pathname === '/orders' ? 'active' : ''}`}>My Orders</Link>
            )}
            {state.user?.role === 'admin' && (
              <Link href="/admin" className={`navbar-link ${pathname.startsWith('/admin') ? 'active' : ''}`}>Admin</Link>
            )}
          </div>

          <div className="navbar-actions">
            <button id="cart-toggle-btn" className="cart-btn" onClick={toggleCart}>
              🛒 Cart
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </button>

            {state.user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                  Hi, {state.user.name.split(' ')[0]}
                </span>
                {state.user.role === 'admin' && (
                  <span className="badge badge-admin">Admin</span>
                )}
                <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Sign Out</button>
              </div>
            ) : (
              <Link href="/auth" className="btn btn-primary btn-sm">Sign In</Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
