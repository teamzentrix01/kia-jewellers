'use client';
import React from 'react';
import { useState, useEffect } from 'react';
import { getStoredAuth } from '../adminApi';

const ORDER_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
const PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refunded'];

const STATUS_COLORS = {
    pending:    'bg-yellow-100 text-yellow-700 border-yellow-200',
    confirmed:  'bg-blue-100 text-blue-700 border-blue-200',
    processing: 'bg-purple-100 text-purple-700 border-purple-200',
    shipped:    'bg-indigo-100 text-indigo-700 border-indigo-200',
    delivered:  'bg-green-100 text-green-700 border-green-200',
    cancelled:  'bg-red-100 text-red-700 border-red-200',
};

const PAYMENT_COLORS = {
    pending:  'bg-yellow-50 text-yellow-600',
    paid:     'bg-green-50 text-green-600',
    failed:   'bg-red-50 text-red-600',
    refunded: 'bg-gray-50 text-gray-600',
};

const STATUS_ICONS = {
    pending: '🕐', confirmed: '✅', processing: '⚙️',
    shipped: '🚚', delivered: '📦', cancelled: '❌',
};

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [updating, setUpdating] = useState(null);
    const [expandedOrder, setExpandedOrder] = useState(null);

    const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

    useEffect(() => { fetchOrders(); }, []);

    const fetchOrders = async () => {
        const { token } = getStoredAuth();
        try {
            setLoading(true);
            const res = await fetch(`${BASE_URL}/orders/all`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            setOrders(data.orders || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (orderId, field, value) => {
        const { token } = getStoredAuth();
        setUpdating(`${orderId}-${field}`);
        try {
            const res = await fetch(`${BASE_URL}/orders/${orderId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ [field]: value }),
            });
            const data = await res.json();
            if (data.success) {
                setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...data.order } : o));
            }
        } catch (err) {
            console.error(err);
        } finally {
            setUpdating(null);
        }
    };

    const filtered = orders.filter(o => {
        const matchSearch =
            String(o.id).includes(search) ||
            (o.user_email || '').toLowerCase().includes(search.toLowerCase()) ||
            (o.user_name || '').toLowerCase().includes(search.toLowerCase());
        const matchStatus = filterStatus === 'all' || o.status === filterStatus;
        return matchSearch && matchStatus;
    });

    const stats = {
        total: orders.length,
        pending: orders.filter(o => o.status === 'pending').length,
        delivered: orders.filter(o => o.status === 'delivered').length,
        cancelled: orders.filter(o => o.status === 'cancelled').length,
        revenue: orders.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0),
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-800" />
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {[
                    { label: 'Total Orders', value: stats.total, color: 'bg-stone-800 text-white' },
                    { label: 'Pending', value: stats.pending, color: 'bg-yellow-50 text-yellow-700' },
                    { label: 'Delivered', value: stats.delivered, color: 'bg-green-50 text-green-700' },
                    { label: 'Cancelled', value: stats.cancelled, color: 'bg-red-50 text-red-700' },
                    { label: 'Revenue', value: `₹${stats.revenue.toLocaleString()}`, color: 'bg-amber-50 text-amber-700' },
                ].map(s => (
                    <div key={s.label} className={`rounded-xl p-4 ${s.color} border border-black/5`}>
                        <p className="text-2xl font-black">{s.value}</p>
                        <p className="text-xs font-semibold opacity-70 mt-0.5 uppercase tracking-wider">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-stone-200 p-4 flex flex-col sm:flex-row gap-3">
                <input type="text" placeholder="Search by order ID, email, name..."
                    value={search} onChange={e => setSearch(e.target.value)}
                    className="flex-1 border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-300"
                />
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                    className="border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-300">
                    <option value="all">All Status</option>
                    {ORDER_STATUSES.map(s => (
                        <option key={s} value={s}>{STATUS_ICONS[s]} {s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                </select>
                <button onClick={fetchOrders}
                    className="bg-stone-800 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-stone-700 transition">
                    Refresh
                </button>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-stone-50 border-b border-stone-200">
                                {['Order', 'Customer', 'Amount', 'Payment', 'Order Status', 'Payment Status', 'Date', 'Details'].map(h => (
                                    <th key={h} className="text-left px-4 py-3 text-xs font-black uppercase tracking-wider text-stone-500">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="text-center py-12 text-stone-400">
                                        <div className="text-4xl mb-2">📭</div>
                                        <p>No orders found</p>
                                    </td>
                                </tr>
                            ) : filtered.map(order => {
                                const products = (() => {
                                    try { return typeof order.product_ids === 'string' ? JSON.parse(order.product_ids) : (order.product_ids || []); }
                                    catch { return []; }
                                })();
                                const isExpanded = expandedOrder === order.id;

                                return (
                                    // ✅ Fix: Fragment with key instead of <>
                                    <React.Fragment key={order.id}>
                                        <tr className="hover:bg-stone-50 transition border-b border-stone-100">
                                            <td className="px-4 py-3">
                                                <span className="font-black text-stone-800">#{order.id}</span>
                                                <p className="text-[10px] text-stone-400 mt-0.5">{order.items_count} items</p>
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="font-semibold text-stone-800 text-xs">{order.user_name || '—'}</p>
                                                <p className="text-[10px] text-stone-400">{order.user_email}</p>
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="font-black text-stone-800">₹{Number(order.total_amount).toLocaleString()}</p>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-xs font-bold uppercase text-stone-500">{order.payment_method || '—'}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <select
                                                    value={order.status}
                                                    onChange={e => updateStatus(order.id, 'status', e.target.value)}
                                                    disabled={updating === `${order.id}-status`}
                                                    className={`text-xs font-bold px-2 py-1.5 rounded-lg border cursor-pointer focus:outline-none disabled:opacity-60 ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}
                                                >
                                                    {ORDER_STATUSES.map(s => (
                                                        <option key={s} value={s}>{STATUS_ICONS[s]} {s.charAt(0).toUpperCase() + s.slice(1)}</option>
                                                    ))}
                                                </select>
                                                {updating === `${order.id}-status` && <span className="ml-1 text-[10px] text-stone-400">Saving...</span>}
                                            </td>
                                            <td className="px-4 py-3">
                                                <select
                                                    value={order.payment_status || 'pending'}
                                                    onChange={e => updateStatus(order.id, 'payment_status', e.target.value)}
                                                    disabled={updating === `${order.id}-payment_status`}
                                                    className={`text-xs font-bold px-2 py-1.5 rounded-lg cursor-pointer focus:outline-none disabled:opacity-60 ${PAYMENT_COLORS[order.payment_status || 'pending']}`}
                                                >
                                                    {PAYMENT_STATUSES.map(s => (
                                                        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                                                    ))}
                                                </select>
                                                {updating === `${order.id}-payment_status` && <span className="ml-1 text-[10px] text-stone-400">Saving...</span>}
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="text-xs text-stone-600">
                                                    {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </p>
                                                <p className="text-[10px] text-stone-400">
                                                    {new Date(order.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </td>
                                            <td className="px-4 py-3">
                                                <button onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                                                    className="text-xs font-bold text-stone-500 hover:text-stone-800 border border-stone-200 px-2 py-1 rounded-lg hover:border-stone-400 transition">
                                                    {isExpanded ? 'Hide' : 'View'}
                                                </button>
                                            </td>
                                        </tr>

                                        {/* Expanded Row */}
                                        {isExpanded && (
                                            <tr className="bg-stone-50">
                                                <td colSpan={8} className="px-6 py-4 border-b border-stone-100">
                                                    <div className="grid md:grid-cols-3 gap-6">
                                                        {/* Products */}
                                                        <div>
                                                            <p className="text-[10px] font-black uppercase tracking-wider text-stone-400 mb-3">Products</p>
                                                            <div className="space-y-2">
                                                                {products.length > 0 ? products.map((p, i) => (
                                                                    <div key={i} className="flex justify-between items-center bg-white rounded-lg px-3 py-2 text-xs border border-stone-100">
                                                                        <span className="font-semibold text-stone-700 truncate max-w-[150px]">{p.name}</span>
                                                                        <span className="text-stone-500 flex-shrink-0 ml-2">x{p.qty} • ₹{Number(p.price).toLocaleString()}</span>
                                                                    </div>
                                                                )) : <p className="text-xs text-stone-400">Product details unavailable</p>}
                                                            </div>
                                                        </div>

                                                        {/* Address */}
                                                        <div>
                                                            <p className="text-[10px] font-black uppercase tracking-wider text-stone-400 mb-3">Delivery Address</p>
                                                            <div className="bg-white rounded-lg px-3 py-2 text-xs border border-stone-100 space-y-1">
                                                                {order.address ? (
                                                                    <>
                                                                        <p className="font-semibold text-stone-700">{order.address}</p>
                                                                        <p className="text-stone-500">{order.city}, {order.state} — {order.pincode}</p>
                                                                        {order.delivery_phone && <p className="text-stone-500">📞 {order.delivery_phone}</p>}
                                                                    </>
                                                                ) : <p className="text-stone-400">Address unavailable</p>}
                                                            </div>
                                                        </div>

                                                        {/* Summary */}
                                                        <div>
                                                            <p className="text-[10px] font-black uppercase tracking-wider text-stone-400 mb-3">Summary</p>
                                                            <div className="bg-white rounded-lg px-3 py-2 text-xs border border-stone-100 space-y-2">
                                                                <div className="flex justify-between">
                                                                    <span className="text-stone-500">Total</span>
                                                                    <span className="font-black text-stone-800">₹{Number(order.total_amount).toLocaleString()}</span>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span className="text-stone-500">Payment</span>
                                                                    <span className="font-bold uppercase text-stone-700">{order.payment_method || '—'}</span>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span className="text-stone-500">Items</span>
                                                                    <span className="font-bold text-stone-700">{order.items_count}</span>
                                                                </div>
                                                                <div className="flex justify-between border-t pt-2">
                                                                    <span className="text-stone-500">Customer</span>
                                                                    <span className="font-bold text-stone-700 truncate ml-2">{order.user_email}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                <div className="px-4 py-3 border-t border-stone-100 bg-stone-50">
                    <p className="text-xs text-stone-400">{filtered.length} of {orders.length} orders shown</p>
                </div>
            </div>
        </div>
    );
}