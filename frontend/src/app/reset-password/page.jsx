'use client';
import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

const RAW_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const BASE_URL = RAW_API_URL.replace(/\/api\/?$/, '');

function ResetContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) return setError('Passwords do not match');
    if (password.length < 6) return setError('Password must be at least 6 characters');
    setLoading(true); setError('');
    try {
      const res = await fetch(`${BASE_URL}/api/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reset password');
      setDone(true);
      setTimeout(() => router.push('/login'), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    // Reuse the authentication screen styling.
    // Done state aur form dono handle ho jayenge
    <div style={{ minHeight:'calc(100svh - 90px)', display:'flex', alignItems:'center', justifyContent:'center', background:'#faf7f1', padding:'24px', fontFamily:"'Jost',sans-serif" }}>
      <div style={{ width:'100%', maxWidth:'420px', padding:'clamp(24px,6vw,40px)', background:'#fffdf9', border:'1px solid #e1d5c6', borderRadius:'18px', boxShadow:'0 18px 50px rgba(71,49,34,.08)' }}>
        {done ? (
          <div style={{ textAlign:'center' }}>
            <div style={{ fontSize:'40px', marginBottom:'16px' }}>✅</div>
            <h2 style={{ color:'#352820', fontFamily:"'Cormorant Garamond',serif", fontStyle:'italic', fontWeight:300, fontSize:'1.8rem', margin:'0 0 12px' }}>Password Reset!</h2>
            <p style={{ color:'#806d62', fontSize:'13px' }}>Redirecting to login...</p>
          </div>
        ) : (
          <>
            <p style={{ fontSize:'9px', letterSpacing:'0.5em', textTransform:'uppercase', color:'#c9a96e', margin:'0 0 10px' }}>New Password</p>
            <h1 style={{ color:'#352820', fontFamily:"'Cormorant Garamond',serif", fontStyle:'italic', fontWeight:300, fontSize:'2rem', margin:'0 0 24px' }}>Reset Password</h1>
            {error && <div style={{ background:'rgba(220,38,38,0.1)', border:'1px solid rgba(220,38,38,0.25)', color:'#fca5a5', fontSize:'12px', padding:'10px 14px', marginBottom:'20px', borderRadius:'2px' }}>{error}</div>}
            <form onSubmit={handleSubmit}>
              {[['New Password', password, setPassword], ['Confirm Password', confirm, setConfirm]].map(([label, val, setter], i) => (
                <div key={i} style={{ marginBottom:'16px' }}>
                  <label style={{ display:'block', fontSize:'9px', letterSpacing:'0.3em', textTransform:'uppercase', color:'#8f7b6d', marginBottom:'8px' }}>{label}</label>
                  <div style={{ position:'relative' }}>
                    <input type={showPass ? 'text' : 'password'} value={val} onChange={e => setter(e.target.value)} required
                      style={{ width:'100%', boxSizing:'border-box', background:'#fffdf9', border:'1px solid #ded1c1', color:'#352820', fontFamily:"'Jost',sans-serif", fontSize:'14px', padding:'12px 48px 12px 16px', outline:'none', borderRadius:'8px' }} />
                    {i === 0 && <button type="button" onClick={() => setShowPass(p => !p)}
                      style={{ position:'absolute', right:'14px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.3)' }}>
                      {showPass ? <EyeOff size={15}/> : <Eye size={15}/>}
                    </button>}
                  </div>
                </div>
              ))}
              <button type="submit" disabled={loading}
                style={{ width:'100%', padding:'13px', background:'#3d2d25', color:'#fffaf2', fontFamily:"'Jost',sans-serif", fontSize:'11px', fontWeight:600, letterSpacing:'0.35em', textTransform:'uppercase', border:'none', cursor:'pointer', borderRadius:'999px', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', marginTop:'8px' }}>
                {loading ? <Loader2 size={16} style={{ animation:'spin 1s linear infinite' }}/> : 'Set New Password'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return <Suspense fallback={<div style={{ minHeight:'100vh', background:'#faf7f1' }}/>}><ResetContent /></Suspense>;
}
