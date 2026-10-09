'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';

export default function AuthPage() {
  const { login, toast } = useApp();
  const router = useRouter();
  const [tab, setTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');

  // Register form
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPass, setRegPass] = useState('');

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPass }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      login(data.user, data.token);
      toast(`Welcome back, ${data.user.name}!`, 'success');
      router.push('/');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: regName, email: regEmail, password: regPass }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      login(data.user, data.token);
      toast(`Account created! Welcome, ${data.user.name}!`, 'success');
      router.push('/');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="modal" style={{ position: 'relative', animation: 'none' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ fontSize: '40px', marginBottom: '8px' }}>⚡</div>
          <h1 className="modal-title" style={{ marginBottom: '4px' }}>ShopNex</h1>
          <p className="modal-subtitle" style={{ marginBottom: 0 }}>Your premium tech destination</p>
        </div>

        <div className="auth-tabs">
          <button
            id="login-tab"
            className={`auth-tab ${tab === 'login' ? 'active' : ''}`}
            onClick={() => { setTab('login'); setError(''); }}
          >
            Sign In
          </button>
          <button
            id="register-tab"
            className={`auth-tab ${tab === 'register' ? 'active' : ''}`}
            onClick={() => { setTab('register'); setError(''); }}
          >
            Create Account
          </button>
        </div>

        {error && <div className="alert alert-error">⚠️ {error}</div>}

        {tab === 'login' ? (
          <form id="login-form" onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="login-email" className="form-label">Email</label>
              <input
                id="login-email"
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div className="form-group">
              <label htmlFor="login-pass" className="form-label">Password</label>
              <input
                id="login-pass"
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={loginPass}
                onChange={e => setLoginPass(e.target.value)}
                required
              />
            </div>
            <button
              id="login-submit-btn"
              type="submit"
              className="btn btn-primary btn-full"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
            <div className="divider">or try demo accounts</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                type="button"
                id="demo-admin-btn"
                className="btn btn-secondary btn-sm"
                onClick={() => { setLoginEmail('admin@shopnex.com'); setLoginPass('admin123'); }}
              >
                👑 Admin Demo
              </button>
              <button
                type="button"
                id="demo-user-btn"
                className="btn btn-secondary btn-sm"
                onClick={() => { setLoginEmail('john@example.com'); setLoginPass('user123'); }}
              >
                👤 User Demo
              </button>
            </div>
          </form>
        ) : (
          <form id="register-form" onSubmit={handleRegister}>
            <div className="form-group">
              <label htmlFor="reg-name" className="form-label">Full Name</label>
              <input
                id="reg-name"
                type="text"
                className="form-input"
                placeholder="Jane Doe"
                value={regName}
                onChange={e => setRegName(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div className="form-group">
              <label htmlFor="reg-email" className="form-label">Email</label>
              <input
                id="reg-email"
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={regEmail}
                onChange={e => setRegEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="reg-pass" className="form-label">Password</label>
              <input
                id="reg-pass"
                type="password"
                className="form-input"
                placeholder="Min. 6 characters"
                value={regPass}
                onChange={e => setRegPass(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <button
              id="register-submit-btn"
              type="submit"
              className="btn btn-primary btn-full"
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Create Account →'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
