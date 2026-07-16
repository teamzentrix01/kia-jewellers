'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function RelatedProducts({ category, currentProductId, layout = 'bottom' }) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [scrollIdx, setScrollIdx] = useState(0);

    useEffect(() => {
        if (!category) return;
        fetch(`${BASE_URL}/products?category=${encodeURIComponent(category)}&limit=20`)
            .then(r => r.json())
            .then(data => {
                const list = Array.isArray(data) ? data : [];
                // Exclude the current product.
                setProducts(list.filter(p => p.id !== currentProductId).slice(0, 8));
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [category, currentProductId]);

    if (loading) return (
        <div className="flex gap-3 overflow-hidden">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="flex-shrink-0 w-40 md:w-48 animate-pulse">
                    <div className="aspect-[3/4] bg-gray-100 rounded-lg mb-2" />
                    <div className="h-3 bg-gray-100 rounded w-3/4 mb-1" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
            ))}
        </div>
    );

    if (products.length === 0) return null;

    // ── SIDE LAYOUT (desktop sidebar) ────────────────────
    if (layout === 'side') {
        return (
            <div className="w-56 flex-shrink-0 hidden lg:block">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-4 border-b pb-2">
                    You May Also Like
                </h3>
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1 no-scrollbar">
                    {products.map(product => {
                        const img = Array.isArray(product.images) ? product.images[0] : product.image_url;
                        const price = product.discounted_price || product.discountedPrice || product.price;
                        const original = product.original_price || product.originalPrice;
                        const discount = original > price ? Math.round(((original - price) / original) * 100) : 0;

                        return (
                            <Link key={product.id} href={`/product/${product.id}`}
                                className="flex gap-3 group hover:bg-gray-50 rounded-lg p-1.5 -mx-1.5 transition">
                                <div className="w-16 h-20 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                                    {img && <img src={img} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />}
                                </div>
                                <div className="flex-1 min-w-0 py-1">
                                    <p className="text-[11px] font-semibold text-gray-800 truncate leading-tight group-hover:text-[#a68b6d] transition">
                                        {product.name}
                                    </p>
                                    <p className="text-[11px] font-bold text-gray-900 mt-1">₹{Number(price).toLocaleString()}</p>
                                    {discount > 0 && (
                                        <p className="text-[9px] text-green-600 font-bold">{discount}% off</p>
                                    )}
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        );
    }

    // ── BOTTOM LAYOUT (horizontal scroll) ────────────────
    const visibleCount = 4;
    const maxIdx = Math.max(0, products.length - visibleCount);

    return (
        <div className="w-full mt-12 pb-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 px-4 md:px-0">
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#a68b6d] mb-1">
                        More from {category}
                    </p>
                    <h3 className="text-xl font-serif font-bold text-gray-900">You May Also Like</h3>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setScrollIdx(i => Math.max(0, i - 1))}
                        disabled={scrollIdx === 0}
                        className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:border-black hover:text-black transition disabled:opacity-30"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <button
                        onClick={() => setScrollIdx(i => Math.min(maxIdx, i + 1))}
                        disabled={scrollIdx >= maxIdx}
                        className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:border-black hover:text-black transition disabled:opacity-30"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>

            {/* Scrollable Grid */}
            <div className="overflow-hidden">
                <div
                    className="flex gap-4 transition-transform duration-500 ease-in-out px-4 md:px-0"
                    style={{ transform: `translateX(calc(-${scrollIdx} * (${100 / visibleCount}% + 16px / ${visibleCount})))` }}
                >
                    {products.map((product, idx) => {
                        const img = Array.isArray(product.images) ? product.images[0] : product.image_url;
                        const price = product.discounted_price || product.discountedPrice || product.price;
                        const original = product.original_price || product.originalPrice;
                        const discount = original > price ? Math.round(((original - price) / original) * 100) : 0;

                        return (
                            <Link
                                key={product.id}
                                href={`/product/${product.id}`}
                                className="flex-shrink-0 group"
                                style={{ width: `calc(${100 / visibleCount}% - ${(visibleCount - 1) * 16 / visibleCount}px)` }}
                            >
                                {/* Image */}
                                <div className="aspect-[3/4] bg-gray-50 rounded-xl overflow-hidden relative mb-3">
                                    {img ? (
                                        <img src={img} alt={product.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-4xl">📦</div>
                                    )}
                                    {discount > 0 && (
                                        <span className="absolute top-2 left-2 bg-orange-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded">
                                            {discount}% OFF
                                        </span>
                                    )}
                                </div>

                                {/* Info */}
                                <div>
                                    <p className="text-[11px] font-bold text-gray-800 truncate group-hover:text-[#a68b6d] transition capitalize">
                                        {product.name}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-sm font-black text-gray-900">₹{Number(price).toLocaleString()}</span>
                                        {discount > 0 && (
                                            <span className="text-[10px] text-gray-400 line-through">₹{Number(original).toLocaleString()}</span>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Dots indicator */}
            {maxIdx > 0 && (
                <div className="flex justify-center gap-1.5 mt-6">
                    {[...Array(maxIdx + 1)].map((_, i) => (
                        <button key={i} onClick={() => setScrollIdx(i)}
                            className={`rounded-full transition-all ${scrollIdx === i ? 'w-6 h-1.5 bg-black' : 'w-1.5 h-1.5 bg-gray-300'}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
