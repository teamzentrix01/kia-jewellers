"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { userApi } from '@/lib/api';
import { Package, ChevronRight, Clock, CheckCircle, XCircle, Truck } from 'lucide-react';

const STATUS_CONFIG = {
    pending:   { label: 'Pending',   color: 'bg-yellow-100 text-yellow-700', icon: Clock },
    paid:      { label: 'Paid',      color: 'bg-blue-100 text-blue-700',     icon: CheckCircle },
    completed: { label: 'Completed', color: 'bg-green-100 text-green-700',   icon: CheckCircle },
    delivered: { label: 'Delivered', color: 'bg-green-100 text-green-700',   icon: Truck },
    cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700',       icon: XCircle },
};

export default function OrdersPage() {
    const router = useRouter();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) { router.push('/login'); return; }

        userApi.getOrders()
            .then(data => setOrders(data || []))
            .catch(err => {
                if (err.message?.includes('401')) {
                    localStorage.removeItem('token');
                    router.push('/login');
                }
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-black" />
        </div>
    );

    return (
        <div className="store-shell min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 py-10">
                {/* Header */}
                <div className="flex items-center gap-3 mb-8">
                    <Link href="/dashboard" className="text-gray-400 hover:text-black transition text-sm">
                        Dashboard
                    </Link>
                    <ChevronRight size={14} className="text-gray-300" />
                    <span className="font-bold text-gray-800">My Orders</span>
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-6">
                    My Orders
                    <span className="ml-2 text-base font-normal text-gray-400">({orders.length})</span>
                </h1>

                {orders.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm p-16 text-center">
                        <Package size={48} className="text-gray-200 mx-auto mb-4" />
                        <h2 className="text-lg font-semibold text-gray-500 mb-2">No orders yet</h2>
                        <p className="text-gray-400 text-sm mb-6">You have not placed any orders yet.</p>
                        <Link href="/" className="inline-block bg-black text-white px-8 py-3 rounded-lg text-sm font-bold uppercase tracking-wider hover:bg-gray-800 transition">
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map(order => {
                            const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                            const StatusIcon = status.icon;
                            const products = (() => {
                                try { return typeof order.product_ids === 'string' ? JSON.parse(order.product_ids) : (order.product_ids || []); }
                                catch { return []; }
                            })();

                            return (
                                <div key={order.id} className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="font-bold text-gray-900 text-lg">Order #{order.id}</span>
                                                <span className={`inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full font-semibold ${status.color}`}>
                                                    <StatusIcon size={12} />
                                                    {status.label}
                                                </span>
                                            </div>

                                            <p className="text-sm text-gray-500 mb-1">
                                                {order.items_count} item{order.items_count !== 1 ? 's' : ''}
                                                {order.payment_method && (
                                                    <span className="ml-2 text-gray-400">• {order.payment_method.toUpperCase()}</span>
                                                )}
                                            </p>

                                            {products.length > 0 && (
                                                <p className="text-xs text-gray-400 mt-1">
                                                    {products.slice(0, 2).map(p => p.name).join(', ')}
                                                    {products.length > 2 && ` +${products.length - 2} more`}
                                                </p>
                                            )}

                                            {order.address && (
                                                <p className="text-xs text-gray-400 mt-1">
                                                    📍 {order.address}, {order.city} — {order.pincode}
                                                </p>
                                            )}

                                            <p className="text-xs text-gray-400 mt-1">
                                                🕐 {new Date(order.created_at).toLocaleDateString('en-IN', {
                                                    day: 'numeric', month: 'long', year: 'numeric'
                                                })}
                                            </p>
                                        </div>

                                        <div className="text-right flex-shrink-0">
                                            <p className="text-2xl font-black text-gray-900">
                                                ₹{Number(order.total_amount).toLocaleString()}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">Total Amount</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
