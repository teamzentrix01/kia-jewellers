'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { userApi, addressApi, wishlistApi } from '@/lib/api';
import Link from 'next/link';
import Image from 'next/image';

const TABS = ['Overview', 'Orders', 'Wishlist', 'Addresses', 'Profile'];

export default function Dashboard() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('Overview');
    const [user, setUser] = useState(null);
    const [orders, setOrders] = useState([]);
    const [wishlist, setWishlist] = useState([]);
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [profileForm, setProfileForm] = useState({ name: '', phone: '', email: '', password: '' });
    const [profileMsg, setProfileMsg] = useState('');
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [addressForm, setAddressForm] = useState({
        name: '', phone: '', pincode: '', locality: '',
        address: '', city: '', state: '', address_type: 'home', is_default: false,
    });

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) { router.push('/login'); return; }
        fetchAll();
    }, []);
    useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab && TABS.includes(tab)) setActiveTab(tab);
}, []);

    const fetchAll = async () => {
        try {
            setLoading(true);
            const [profileData, ordersData, wishlistData, addressData] = await Promise.all([
                userApi.getProfile(),
                userApi.getOrders(),
                wishlistApi.get(),
                addressApi.get(),
            ]);
            setUser(profileData);
            setProfileForm({ name: profileData.name || '', phone: profileData.phone || '', email: profileData.email || '', password: '' });
            setOrders(ordersData || []);
            setWishlist(wishlistData.items || []);
            setAddresses(addressData || []);
        } catch (err) {
            console.error(err);
            if (err.message.includes('401')) { localStorage.removeItem('token'); router.push('/login'); }
        } finally {
            setLoading(false);
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        try {
            const updated = await userApi.updateProfile(profileForm);
            setUser(updated);
            setProfileMsg('✅ Profile updated successfully!');
            setTimeout(() => setProfileMsg(''), 3000);
        } catch (err) {
            setProfileMsg(`❌ ${err.message}`);
        }
    };

    const handleAddAddress = async (e) => {
        e.preventDefault();
        try {
            const newAddr = await addressApi.add(addressForm);
            setAddresses(prev => [newAddr, ...prev]);
            setShowAddressForm(false);
            setAddressForm({ name: '', phone: '', pincode: '', locality: '', address: '', city: '', state: '', address_type: 'home', is_default: false });
        } catch (err) {
            alert(err.message);
        }
    };

    const handleDeleteAddress = async (id) => {
        if (!confirm('Delete this address?')) return;
        try {
            await addressApi.delete(id);
            setAddresses(prev => prev.filter(a => a.id !== id));
        } catch (err) { alert(err.message); }
    };

    const handleRemoveWishlist = async (wishlistId) => {
        try {
            await wishlistApi.remove(wishlistId);
            setWishlist(prev => prev.filter(i => i.wishlistId !== wishlistId));
        } catch (err) { alert(err.message); }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        router.push('/login');
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
    );

    const initials = user?.name ? user.name.slice(0, 2).toUpperCase() : user?.email?.slice(0, 2).toUpperCase() || 'U';

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 flex flex-col sm:flex-row items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                        {initials}
                    </div>
                    <div className="text-center sm:text-left flex-1">
                        <h1 className="text-xl font-bold text-gray-800">{user?.name || 'Welcome back!'}</h1>
                        <p className="text-gray-500 text-sm">{user?.email}</p>
                        {user?.phone && <p className="text-gray-400 text-xs mt-0.5">📞 {user.phone}</p>}
                    </div>
                    <button onClick={handleLogout} className="text-sm text-red-500 hover:text-red-700 border border-red-200 px-4 py-2 rounded-lg transition">
                        Logout
                    </button>
                </div>

                {/* Stats Bar */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    {[
                        { label: 'Orders', value: orders.length, icon: '📦' },
                        { label: 'Wishlist', value: wishlist.length, icon: '❤️' },
                        { label: 'Addresses', value: addresses.length, icon: '📍' },
                    ].map(s => (
                        <div key={s.label} className="bg-white rounded-xl shadow-sm p-4 text-center cursor-pointer hover:shadow-md transition"
                            onClick={() => setActiveTab(s.label === 'Orders' ? 'Orders' : s.label === 'Wishlist' ? 'Wishlist' : 'Addresses')}>
                            <div className="text-2xl">{s.icon}</div>
                            <div className="text-2xl font-bold text-gray-800 mt-1">{s.value}</div>
                            <div className="text-xs text-gray-500">{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
                    {TABS.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
                                activeTab === tab
                                    ? 'bg-blue-600 text-white shadow'
                                    : 'bg-white text-gray-600 hover:bg-gray-100'
                            }`}
                        >{tab}</button>
                    ))}
                </div>

                {/* ─── TAB: Overview ─── */}
                {activeTab === 'Overview' && (
                    <div className="space-y-4">
                        <h2 className="font-bold text-gray-700 text-lg">Recent Orders</h2>
                        {orders.slice(0, 3).length === 0 ? (
                            <div className="bg-white rounded-xl p-8 text-center text-gray-400">
                                <div className="text-4xl mb-2">📦</div>
                                <p>No orders yet</p>
                                <Link href="/" className="text-blue-500 text-sm hover:underline mt-2 block">Start Shopping →</Link>
                            </div>
                        ) : orders.slice(0, 3).map(order => (
                            <OrderCard key={order.id} order={order} />
                        ))}
                        {orders.length > 3 && (
                            <button onClick={() => setActiveTab('Orders')} className="text-blue-600 text-sm hover:underline">
                                View all {orders.length} orders →
                            </button>
                        )}
                    </div>
                )}

                {/* ─── TAB: Orders ─── */}
                {activeTab === 'Orders' && (
                    <div className="space-y-4">
                        <h2 className="font-bold text-gray-700 text-lg">My Orders ({orders.length})</h2>
                        {orders.length === 0 ? (
                            <EmptyState icon="📦" message="No orders yet" link="/" linkText="Start Shopping" />
                        ) : orders.map(order => <OrderCard key={order.id} order={order} />)}
                    </div>
                )}

                {/* ─── TAB: Wishlist ─── */}
                {activeTab === 'Wishlist' && (
                    <div>
                        <h2 className="font-bold text-gray-700 text-lg mb-4">My Wishlist ({wishlist.length})</h2>
                        {wishlist.length === 0 ? (
                            <EmptyState icon="❤️" message="Your wishlist is empty" link="/" linkText="Browse Products" />
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {wishlist.map(({ wishlistId, product }) => (
                                    <div key={wishlistId} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition group">
                                        <div className="relative aspect-square bg-gray-100">
                                            {product.images?.[0] ? (
                                                <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-3xl">📦</div>
                                            )}
                                            <button
                                                onClick={() => handleRemoveWishlist(wishlistId)}
                                                className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition"
                                            >✕</button>
                                        </div>
                                        <div className="p-3">
                                            <Link href={`/product/${product.id}`}>
                                                <p className="text-sm font-semibold text-gray-800 truncate hover:text-blue-600">{product.name}</p>
                                            </Link>
                                            <p className="text-sm font-bold text-gray-900 mt-1">₹{product.discountedPrice}</p>
                                            {product.originalPrice > product.discountedPrice && (
                                                <p className="text-xs text-gray-400 line-through">₹{product.originalPrice}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ─── TAB: Addresses ─── */}
                {activeTab === 'Addresses' && (
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-bold text-gray-700 text-lg">Saved Addresses</h2>
                            <button
                                onClick={() => setShowAddressForm(!showAddressForm)}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                            >+ Add Address</button>
                        </div>

                        {/* Add Address Form */}
                        {showAddressForm && (
                            <form onSubmit={handleAddAddress} className="bg-white rounded-xl shadow-sm p-6 mb-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <h3 className="col-span-full font-semibold text-gray-700">New Address</h3>
                                {[
                                    { name: 'name', placeholder: 'Full Name' },
                                    { name: 'phone', placeholder: 'Phone Number' },
                                    { name: 'pincode', placeholder: 'Pincode' },
                                    { name: 'locality', placeholder: 'Locality / Area' },
                                    { name: 'city', placeholder: 'City' },
                                    { name: 'state', placeholder: 'State' },
                                ].map(f => (
                                    <input
                                        key={f.name}
                                        required
                                        placeholder={f.placeholder}
                                        value={addressForm[f.name]}
                                        onChange={e => setAddressForm(p => ({ ...p, [f.name]: e.target.value }))}
                                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                                    />
                                ))}
                                <textarea
                                    required
                                    placeholder="Full Address"
                                    rows={2}
                                    value={addressForm.address}
                                    onChange={e => setAddressForm(p => ({ ...p, address: e.target.value }))}
                                    className="col-span-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                                />
                                <div className="col-span-full flex gap-4 items-center">
                                    <label className="text-sm font-medium text-gray-600">Type:</label>
                                    {['home', 'work', 'other'].map(t => (
                                        <label key={t} className="flex items-center gap-1 text-sm cursor-pointer">
                                            <input type="radio" name="address_type" value={t}
                                                checked={addressForm.address_type === t}
                                                onChange={e => setAddressForm(p => ({ ...p, address_type: e.target.value }))} />
                                            {t.charAt(0).toUpperCase() + t.slice(1)}
                                        </label>
                                    ))}
                                    <label className="flex items-center gap-1 text-sm cursor-pointer ml-auto">
                                        <input type="checkbox" checked={addressForm.is_default}
                                            onChange={e => setAddressForm(p => ({ ...p, is_default: e.target.checked }))} />
                                        Set as Default
                                    </label>
                                </div>
                                <div className="col-span-full flex gap-3">
                                    <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
                                        Save Address
                                    </button>
                                    <button type="button" onClick={() => setShowAddressForm(false)}
                                        className="text-gray-500 px-6 py-2 rounded-lg text-sm border hover:bg-gray-50 transition">
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        )}

                        {addresses.length === 0 && !showAddressForm ? (
                            <EmptyState icon="📍" message="No addresses saved yet" />
                        ) : (
                            <div className="grid gap-4">
                                {addresses.map(addr => (
                                    <div key={addr.id} className={`bg-white rounded-xl shadow-sm p-5 border-2 ${addr.is_default ? 'border-blue-500' : 'border-transparent'}`}>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-semibold text-gray-800">{addr.name}</span>
                                                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded capitalize">{addr.address_type}</span>
                                                    {addr.is_default && <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded">Default</span>}
                                                </div>
                                                <p className="text-sm text-gray-600">{addr.address}, {addr.locality}</p>
                                                <p className="text-sm text-gray-600">{addr.city}, {addr.state} — {addr.pincode}</p>
                                                <p className="text-sm text-gray-500 mt-1">📞 {addr.phone}</p>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteAddress(addr.id)}
                                                className="text-red-400 hover:text-red-600 text-sm ml-4"
                                            >Delete</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ─── TAB: Profile ─── */}
                {activeTab === 'Profile' && (
                    <div className="max-w-xl">
                        <h2 className="font-bold text-gray-700 text-lg mb-4">Edit Profile</h2>
                        <form onSubmit={handleProfileUpdate} className="bg-white rounded-xl shadow-sm p-6 space-y-4">
                            {profileMsg && (
                                <div className={`text-sm p-3 rounded-lg ${profileMsg.startsWith('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                                    {profileMsg}
                                </div>
                            )}
                            {[
                                { key: 'name', label: 'Full Name', type: 'text', placeholder: 'Your name' },
                                { key: 'phone', label: 'Phone Number', type: 'tel', placeholder: '10-digit number' },
                                { key: 'email', label: 'Email Address', type: 'email', placeholder: 'your@email.com' },
                                { key: 'password', label: 'New Password', type: 'password', placeholder: 'Leave blank to keep current' },
                            ].map(f => (
                                <div key={f.key}>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">{f.label}</label>
                                    <input
                                        type={f.type}
                                        placeholder={f.placeholder}
                                        value={profileForm[f.key]}
                                        onChange={e => setProfileForm(p => ({ ...p, [f.key]: e.target.value }))}
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                                    />
                                </div>
                            ))}
                            <button type="submit"
                                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
                                Save Changes
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Helper Components ───────────────────────────────────
const STATUS_COLORS = {
    pending: 'bg-yellow-100 text-yellow-700',
    completed: 'bg-green-100 text-green-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
    paid: 'bg-blue-100 text-blue-700',
};

const OrderCard = ({ order }) => (
    <div className="bg-white rounded-xl shadow-sm p-5 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
                <span className="font-semibold text-gray-800">Order #{order.id}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
                    {order.status}
                </span>
            </div>
            <p className="text-sm text-gray-500">{order.items_count} item{order.items_count !== 1 ? 's' : ''}</p>
            {order.address && (
                <p className="text-xs text-gray-400 mt-1">📍 {order.address}, {order.city}</p>
            )}
            <p className="text-xs text-gray-400 mt-0.5">🕐 {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
        </div>
        <div className="text-right">
            <p className="font-bold text-gray-900 text-lg">₹{Number(order.total_amount).toLocaleString()}</p>
        </div>
    </div>
);

const EmptyState = ({ icon, message, link, linkText }) => (
    <div className="bg-white rounded-xl p-10 text-center text-gray-400">
        <div className="text-5xl mb-3">{icon}</div>
        <p className="font-medium">{message}</p>
        {link && <Link href={link} className="text-blue-500 text-sm hover:underline mt-2 block">{linkText} →</Link>}
    </div>
);