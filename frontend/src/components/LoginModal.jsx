'use client';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, ShoppingBag, User, Lock, Mail, Eye, EyeOff } from 'lucide-react';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function LoginModal({ isOpen, onClose, onSuccess, message = 'Login first to add the product in cart!' }) {
    const [tab, setTab] = useState('login');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [loginForm, setLoginForm] = useState({ email: '', password: '' });
    const [signupForm, setSignupForm] = useState({ name: '', email: '', password: '' });

    useEffect(() => {
        if (!isOpen) return undefined;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = previousOverflow; };
    }, [isOpen]);

    if (!isOpen || typeof document === 'undefined') return null;

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`${BASE_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(loginForm),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Login failed');

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            window.dispatchEvent(new Event('userLoggedIn'));
            onClose();
            if (onSuccess) onSuccess();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`${BASE_URL}/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(signupForm),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Signup failed');

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            onClose();
            if (onSuccess) onSuccess();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return createPortal((
        <div className="fixed inset-0 z-[400] flex items-center justify-center overflow-y-auto px-4 py-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div role="dialog" aria-modal="true" aria-labelledby="auth-modal-title" className="relative max-h-[calc(100svh-2rem)] w-full max-w-sm overflow-y-auto rounded-2xl border border-[#e3d7c8] bg-[#fffdf9] shadow-2xl">

                {/* Top Banner */}
                <div className="relative bg-[#f0e6d9] px-6 pb-6 pt-6 text-[#352820]">
                    <button onClick={onClose} aria-label="Close sign in" className="absolute right-4 top-4 text-[#8f7b6d] transition hover:text-[#352820]">
                        <X size={18} />
                    </button>
                    <div className="flex items-center gap-2 mb-2">
                        <ShoppingBag size={18} className="text-[#a68b6d]" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#9a7447]">KIA JEWELLERS</span>
                    </div>
                    <h2 id="auth-modal-title" className="max-w-[18rem] font-serif text-2xl font-normal leading-tight">{message}</h2>
                    <p className="mt-2 text-xs text-[#806d62]">Sign in or create an account to continue.</p>
                </div>

                {/* Tab switcher */}
                <div className="flex border-b border-gray-100">
                    {['login', 'signup'].map(t => (
                        <button key={t} onClick={() => { setTab(t); setError(''); }}
                            className={`flex-1 py-3 text-xs font-black uppercase tracking-widest transition ${
                                tab === t ? 'text-black border-b-2 border-black -mb-px' : 'text-gray-400 hover:text-gray-600'
                            }`}>
                            {t === 'login' ? 'Login' : 'Sign Up'}
                        </button>
                    ))}
                </div>

                <div className="p-5 sm:p-6">
                    {error && (
                        <div className="mb-4 bg-red-50 border border-red-100 text-red-600 text-xs px-3 py-2 rounded-lg">
                            {error}
                        </div>
                    )}

                    {/* LOGIN */}
                    {tab === 'login' && (
                        <form onSubmit={handleLogin} className="space-y-3">
                            <div className="relative">
                                <Mail size={14} className="absolute left-3 top-3 text-gray-400" />
                                <input type="email" required placeholder="Email address"
                                    value={loginForm.email}
                                    onChange={e => setLoginForm(p => ({ ...p, email: e.target.value }))}
                                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition"
                                />
                            </div>
                            <div className="relative">
                                <Lock size={14} className="absolute left-3 top-3 text-gray-400" />
                                <input type={showPassword ? 'text' : 'password'} required placeholder="Password"
                                    value={loginForm.password}
                                    onChange={e => setLoginForm(p => ({ ...p, password: e.target.value }))}
                                    className="w-full pl-9 pr-10 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition"
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600">
                                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                                </button>
                            </div>
                            <button type="submit" disabled={loading}
                                className="w-full bg-[#3d2d25] text-white py-3 rounded-full text-xs font-black uppercase tracking-widest hover:bg-[#a77b43] transition disabled:opacity-60">
                                {loading ? 'Logging in...' : 'Login & Continue'}
                            </button>
                        </form>
                    )}

                    {/* SIGNUP */}
                    {tab === 'signup' && (
                        <form onSubmit={handleSignup} className="space-y-3">
                            <div className="relative">
                                <User size={14} className="absolute left-3 top-3 text-gray-400" />
                                <input type="text" required placeholder="Full Name"
                                    value={signupForm.name}
                                    onChange={e => setSignupForm(p => ({ ...p, name: e.target.value }))}
                                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition"
                                />
                            </div>
                            <div className="relative">
                                <Mail size={14} className="absolute left-3 top-3 text-gray-400" />
                                <input type="email" required placeholder="Email address"
                                    value={signupForm.email}
                                    onChange={e => setSignupForm(p => ({ ...p, email: e.target.value }))}
                                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition"
                                />
                            </div>
                            <div className="relative">
                                <Lock size={14} className="absolute left-3 top-3 text-gray-400" />
                                <input type={showPassword ? 'text' : 'password'} required placeholder="Password"
                                    value={signupForm.password}
                                    onChange={e => setSignupForm(p => ({ ...p, password: e.target.value }))}
                                    className="w-full pl-9 pr-10 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition"
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600">
                                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                                </button>
                            </div>
                            <button type="submit" disabled={loading}
                                className="w-full bg-[#3d2d25] text-white py-3 rounded-full text-xs font-black uppercase tracking-widest hover:bg-[#a77b43] transition disabled:opacity-60">
                                {loading ? 'Creating account...' : 'Create Account & Continue'}
                            </button>
                        </form>
                    )}

                    <p className="text-center text-[10px] text-gray-400 mt-4">
                        By continuing, you agree to our Terms & Conditions and Privacy Policy
                    </p>
                </div>
            </div>
        </div>
    ), document.body);
}
