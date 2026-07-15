"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, ArrowLeft, Loader2 } from 'lucide-react';

const RAW_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const BASE_URL = RAW_API_URL.replace(/\/api\/?$/, '');

// ── Modes: 'login' | 'signup' | 'forgot' | 'forgot-sent'
export default function AuthPage() {
  const [mode, setMode]           = useState('login');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [name, setName]           = useState('');
  const [showPass, setShowPass]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const router = useRouter();

  const reset = (nextMode) => { setError(''); setMode(nextMode); };

  // ── AUTH SUBMIT ──────────────────────────────────────────────────────────
  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    const endpoint = mode === 'login' ? `${BASE_URL}/api/login` : `${BASE_URL}/api/signup`;
    try {
      const res  = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mode === 'login' ? { email, password } : { name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');

      if (mode === 'login') {
        localStorage.setItem('user',  JSON.stringify({ id: data.user.id, email: data.user.email, role: data.user.role || 'user' }));
        localStorage.setItem('token', data.token || '');
        window.dispatchEvent(new Event('userLoggedIn'));
        window.location.href = (data.user.role || '').toLowerCase() === 'admin' ? '/admin' : '/women-store';
      } else {
        setMode('login');
        setError(''); // use a success message instead
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── FORGOT PASSWORD SUBMIT ───────────────────────────────────────────────
  const handleForgot = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res  = await fetch(`${BASE_URL}/api/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send reset email');
      setMode('forgot-sent');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Jost:wght@300;400;500;600&display=swap');

       .auth-root {
  height: 100vh;
  max-height: 100vh;
  overflow: hidden;
  display: flex;                /* ✅ yeh missing tha! */
  font-family: 'Jost', sans-serif;
  background: #0b0905;
  margin-top: -64px;
  padding-top: 64px;            /* ✅ content neeche dhakelo */
  box-sizing: border-box;
}

@media (min-width: 768px) {
  .auth-root {
    margin-top: -80px;
    padding-top: 80px;          /* ✅ md navbar height */
  }
}

        /* ── LEFT PANEL ── */
        .auth-left {
          position: relative;
          flex: 1;
          display: none;
          overflow: hidden;
        }
        @media (min-width: 900px) { .auth-left { display: block; } }

        .auth-left-img {
          position: absolute; inset: 0;
          width: 100%; height: 100%;
          object-fit: cover;
          filter: brightness(0.55) saturate(0.8);
        }

        .auth-left-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(11,9,5,0.6) 0%, rgba(11,9,5,0.1) 60%, transparent 100%);
        }

        .auth-left-content {
          position: absolute; inset: 0;
          display: flex; flex-direction: column;
          justify-content: space-between;
          padding: 48px;
        }

        .auth-logo {
          display: flex; flex-direction: column; gap: 4px;
        }
        .auth-logo-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2.2rem; font-weight: 600;
          letter-spacing: 0.35em; color: #fff;
          line-height: 1;
        }
        .auth-logo-line {
          display: flex; align-items: center; gap: 10px;
        }
        .auth-logo-bar {
          height: 1px; width: 36px;
          background: #c9a96e;
        }
        .auth-logo-sub {
          font-size: 9px; letter-spacing: 0.55em;
          text-transform: uppercase; color: #c9a96e;
          font-weight: 500;
        }

        .auth-left-quote {
          color: rgba(255,255,255,0.85);
        }
        .auth-left-quote blockquote {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic; font-size: 1.6rem;
          font-weight: 300; line-height: 1.5;
          margin: 0 0 16px;
        }
        .auth-left-quote p {
          font-size: 10px; letter-spacing: 0.35em;
          text-transform: uppercase; color: #c9a96e;
          margin: 0;
        }

        /* ── RIGHT PANEL ── */
        .auth-right {
          width: 100%;
          max-width: 480px;
          height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 32px 40px;
          background: #0f0c08;
          position: relative;
          overflow: hidden;
          box-sizing: border-box;
        }

        /* subtle grain texture */
        .auth-right::before {
          content: '';
          position: absolute; inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
          pointer-events: none; z-index: 0;
        }

        .auth-right > * { position: relative; z-index: 1; }

        /* mobile logo */
        .auth-mobile-logo {
          display: flex; flex-direction: column; gap: 4px;
          margin-bottom: 40px;
        }
        @media (min-width: 900px) { .auth-mobile-logo { display: none; } }

        /* ── FORM HEADER ── */
        .auth-header { margin-bottom: 24px; }
        .auth-header-eyebrow {
          font-size: 9px; letter-spacing: 0.5em;
          text-transform: uppercase; color: #c9a96e;
          margin-bottom: 10px;
        }
        .auth-header h1 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2.4rem; font-weight: 300;
          font-style: italic; color: #f5efe6;
          line-height: 1.1; margin: 0 0 12px;
        }
        .auth-header p {
          font-size: 13px; color: rgba(255,255,255,0.35);
          line-height: 1.6; margin: 0;
        }

        /* ── FORM FIELDS ── */
        .auth-field { margin-bottom: 14px; }
        .auth-field label {
          display: block;
          font-size: 9px; letter-spacing: 0.3em;
          text-transform: uppercase; color: rgba(255,255,255,0.4);
          margin-bottom: 8px;
        }
        .auth-input-wrap { position: relative; }
        .auth-input {
          width: 100%; box-sizing: border-box;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          color: #f5efe6; font-family: 'Jost', sans-serif;
          font-size: 14px; padding: 12px 16px;
          outline: none; transition: border-color 0.25s, background 0.25s;
          border-radius: 2px;
        }
        .auth-input::placeholder { color: rgba(255,255,255,0.2); }
        .auth-input:focus {
          border-color: #c9a96e;
          background: rgba(201,169,110,0.05);
        }
        .auth-input.has-toggle { padding-right: 48px; }

        .auth-toggle-btn {
          position: absolute; right: 14px; top: 50%;
          transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          color: rgba(255,255,255,0.3); padding: 0;
          display: flex; align-items: center;
          transition: color 0.2s;
        }
        .auth-toggle-btn:hover { color: #c9a96e; }

        /* ── ERROR ── */
        .auth-error {
          background: rgba(220,38,38,0.1);
          border: 1px solid rgba(220,38,38,0.25);
          color: #fca5a5; font-size: 12px;
          padding: 10px 14px; margin-bottom: 20px;
          border-radius: 2px;
        }

        /* ── FORGOT LINK ── */
        .auth-forgot {
          display: flex; justify-content: flex-end;
          margin-top: -12px; margin-bottom: 24px;
        }
        .auth-forgot button {
          background: none; border: none; cursor: pointer;
          font-size: 11px; color: rgba(255,255,255,0.3);
          font-family: 'Jost', sans-serif; letter-spacing: 0.05em;
          padding: 0; transition: color 0.2s;
        }
        .auth-forgot button:hover { color: #c9a96e; }

        /* ── PRIMARY BUTTON ── */
        .auth-btn {
          width: 100%; padding: 13px;
          background: #c9a96e; color: #0b0905;
          font-family: 'Jost', sans-serif;
          font-size: 11px; font-weight: 600;
          letter-spacing: 0.35em; text-transform: uppercase;
          border: none; cursor: pointer;
          transition: background 0.25s, transform 0.15s;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          border-radius: 1px;
        }
        .auth-btn:hover:not(:disabled) { background: #e2c485; }
        .auth-btn:active:not(:disabled) { transform: scale(0.99); }
        .auth-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        /* ── DIVIDER ── */
        .auth-divider {
          display: flex; align-items: center; gap: 16px;
          margin: 18px 0;
        }
        .auth-divider span {
          flex: 1; height: 1px;
          background: rgba(255,255,255,0.08);
        }
        .auth-divider p {
          font-size: 10px; color: rgba(255,255,255,0.2);
          letter-spacing: 0.2em; text-transform: uppercase;
          margin: 0; white-space: nowrap;
        }

        /* ── SWITCH ── */
        .auth-switch {
          text-align: center; font-size: 12px;
          color: rgba(255,255,255,0.3);
        }
        .auth-switch button {
          background: none; border: none; cursor: pointer;
          font-family: 'Jost', sans-serif;
          color: #c9a96e; font-size: 12px;
          letter-spacing: 0.05em; padding: 0; margin-left: 4px;
          text-decoration: underline; text-underline-offset: 3px;
          transition: color 0.2s;
        }
        .auth-switch button:hover { color: #e2c485; }

        /* ── BACK LINK ── */
        .auth-back {
          display: inline-flex; align-items: center; gap: 6px;
          background: none; border: none; cursor: pointer;
          font-family: 'Jost', sans-serif;
          font-size: 11px; color: rgba(255,255,255,0.3);
          letter-spacing: 0.1em; padding: 0;
          margin-bottom: 32px; transition: color 0.2s;
        }
        .auth-back:hover { color: #c9a96e; }

        /* ── SENT STATE ── */
        .auth-sent {
          text-align: center; padding: 20px 0;
        }
        .auth-sent-icon {
          width: 64px; height: 64px; border-radius: 50%;
          background: rgba(201,169,110,0.12);
          border: 1px solid rgba(201,169,110,0.3);
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 24px; font-size: 28px;
        }
        .auth-sent h2 {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic; font-size: 1.8rem;
          font-weight: 300; color: #f5efe6; margin: 0 0 12px;
        }
        .auth-sent p {
          font-size: 13px; color: rgba(255,255,255,0.35);
          line-height: 1.7; margin: 0 0 32px;
        }

        /* ── DECORATIVE CORNER ── */
        .auth-corner-tl, .auth-corner-br {
          position: absolute;
          width: 40px; height: 40px;
          pointer-events: none; z-index: 2;
        }
        .auth-corner-tl { top: 20px; left: 20px;
          border-top: 1px solid rgba(201,169,110,0.3);
          border-left: 1px solid rgba(201,169,110,0.3);
        }
        .auth-corner-br { bottom: 20px; right: 20px;
          border-bottom: 1px solid rgba(201,169,110,0.3);
          border-right: 1px solid rgba(201,169,110,0.3);
        }
      `}</style>

      <div className="auth-root">

        {/* ── LEFT PANEL ── */}
        <div className="auth-left">
          <img
            className="auth-left-img"
            src="https://i.pinimg.com/1200x/54/f6/da/54f6da4fac291ab1af9e8a952fd54216.jpg"
            alt="KIA Fashion"
          />
          <div className="auth-left-overlay" />
          <div className="auth-left-content">
            <div className="auth-logo">
              <span className="auth-logo-name">KIA</span>
              <div className="auth-logo-line">
                <div className="auth-logo-bar" />
                <span className="auth-logo-sub">Jewels</span>
              </div>
            </div>
            <div className="auth-left-quote">
              <blockquote>"Style is a way to say who you are without having to speak."</blockquote>
              <p>— Rachel Zoe</p>
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="auth-right">
          <div className="auth-corner-tl" />
          <div className="auth-corner-br" />

          {/* Mobile Logo */}
          <div className="auth-mobile-logo" style={{ marginBottom: '24px' }}>
            <span className="auth-logo-name" style={{ color: '#f5efe6', fontFamily: "'Cormorant Garamond', serif", fontSize: '1.8rem', letterSpacing: '0.25em' }}>KIA</span>
            <div className="auth-logo-line">
              <div className="auth-logo-bar" />
              <span className="auth-logo-sub">Jewels</span>
            </div>
          </div>

          {/* ── FORGOT SENT ── */}
          {mode === 'forgot-sent' && (
            <div className="auth-sent">
              <div className="auth-sent-icon">✉️</div>
              <h2>Check your inbox</h2>
              <p>We've sent a password reset link to<br /><strong style={{ color: '#c9a96e' }}>{email}</strong><br />Please check your email and follow the instructions.</p>
              <button className="auth-btn" onClick={() => reset('login')}>Back to Login</button>
            </div>
          )}

          {/* ── FORGOT PASSWORD ── */}
          {mode === 'forgot' && (
            <>
              <button className="auth-back" onClick={() => reset('login')}>
                <ArrowLeft size={13} /> Back to login
              </button>
              <div className="auth-header">
                <p className="auth-header-eyebrow">Account Recovery</p>
                <h1>Forgot Password?</h1>
                <p>Enter your registered email address and we'll send you a link to reset your password.</p>
              </div>
              {error && <div className="auth-error">{error}</div>}
              <form onSubmit={handleForgot}>
                <div className="auth-field">
                  <label>Email Address</label>
                  <div className="auth-input-wrap">
                    <input className="auth-input" type="email" placeholder="your@email.com"
                      value={email} onChange={e => setEmail(e.target.value)} required />
                  </div>
                </div>
                <button className="auth-btn" type="submit" disabled={loading}>
                  {loading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : 'Send Reset Link'}
                </button>
              </form>
            </>
          )}

          {/* ── LOGIN / SIGNUP ── */}
          {(mode === 'login' || mode === 'signup') && (
            <>
              <div className="auth-header">
                <p className="auth-header-eyebrow">{mode === 'login' ? 'Welcome Back' : 'Join Us'}</p>
                <h1>{mode === 'login' ? 'Sign in to your account' : 'Create an account'}</h1>
                <p>{mode === 'login' ? 'Access your jewellery box, orders and wishlist.' : 'Join KIA Fashion for private access to new collections and atelier offers.'}</p>
              </div>

              {error && <div className="auth-error">{error}</div>}

              <form onSubmit={handleAuth}>
                {mode === 'signup' && (
                  <div className="auth-field">
                    <label>Full Name</label>
                    <div className="auth-input-wrap">
                      <input className="auth-input" type="text" placeholder="Your name"
                        value={name} onChange={e => setName(e.target.value)} required />
                    </div>
                  </div>
                )}

                <div className="auth-field">
                  <label>Email Address</label>
                  <div className="auth-input-wrap">
                    <input className="auth-input" type="email" placeholder="your@email.com"
                      value={email} onChange={e => setEmail(e.target.value)} required />
                  </div>
                </div>

                <div className="auth-field">
                  <label>Password</label>
                  <div className="auth-input-wrap">
                    <input className={`auth-input has-toggle`} type={showPass ? 'text' : 'password'}
                      placeholder="••••••••" value={password}
                      onChange={e => setPassword(e.target.value)} required />
                    <button type="button" className="auth-toggle-btn" onClick={() => setShowPass(p => !p)}>
                      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {mode === 'login' && (
                  <div className="auth-forgot">
                    <button type="button" onClick={() => reset('forgot')}>Forgot password?</button>
                  </div>
                )}

                <button className="auth-btn" type="submit" disabled={loading}>
                  {loading
                    ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                    : mode === 'login' ? 'Sign In' : 'Create Account'}
                </button>
              </form>

              <div className="auth-divider">
                <span /><p>or</p><span />
              </div>

              <div className="auth-switch">
                {mode === 'login' ? (
                  <>Don't have an account?<button onClick={() => reset('signup')}>Sign Up</button></>
                ) : (
                  <>Already have an account?<button onClick={() => reset('login')}>Sign In</button></>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
