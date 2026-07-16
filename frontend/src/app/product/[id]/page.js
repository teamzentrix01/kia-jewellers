"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ShoppingBag, Heart, Star, Share2, ChevronRight, Loader2, ShieldCheck, RotateCcw, X, ZoomIn, MapPin, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { wishlistApi } from '@/lib/api';
import LoginModal from '@/components/LoginModal';
import RelatedProducts from '@/components/RelatedProducts';

export default function ProductDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { addToCart } = useCart();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState('');
    const [cartLoading, setCartLoading] = useState(false);
    const [cartAdded, setCartAdded] = useState(false);
    const [wishlisted, setWishlisted] = useState(false);
    const [wishlistLoading, setWishlistLoading] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [pendingAction, setPendingAction] = useState(null);
    const [zoomOpen, setZoomOpen] = useState(false);
    const [pincode, setPincode] = useState('');
    const [deliveryMessage, setDeliveryMessage] = useState('');
    const [recentlyViewed, setRecentlyViewed] = useState([]);

    useEffect(() => {
        const fetchProductDetail = async () => {
            try {
                setLoading(true);
                const res = await fetch(`http://localhost:5000/api/product-detail/${id}`);
                const data = await res.json();
                setProduct(data);
                const imgs = typeof data.images === 'string' ? JSON.parse(data.images || "[]") : (data.images || []);
                if (imgs.length > 0) setActiveImage(imgs[0]);
                try {
                    const previous = JSON.parse(localStorage.getItem('recentlyViewed') || '[]').filter(item => item.id !== data.id);
                    const next = [{ id: data.id, name: data.name, image: imgs[0], price: Number(data.discounted_price || data.discountedPrice || 0) }, ...previous].slice(0, 6);
                    localStorage.setItem('recentlyViewed', JSON.stringify(next));
                    setRecentlyViewed(previous.slice(0, 4));
                } catch { setRecentlyViewed([]); }
            } catch (err) {
                console.error("Error:", err);
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchProductDetail();
    }, [id]);

    const handleLoginSuccess = async () => {
        if (pendingAction === 'cart') await doAddToCart();
        else if (pendingAction === 'wishlist') await doToggleWishlist();
        setPendingAction(null);
    };

    const doAddToCart = async () => {
        if (product?.in_stock === false) { alert('Product out of stock hai!'); return; }
        setCartLoading(true);
        const result = await addToCart(product.id);
        setCartLoading(false);
        if (result.success) {
            setCartAdded(true);
            setTimeout(() => setCartAdded(false), 2500);
        } else {
            alert(result.error || 'Unable to add this item to your cart.');
        }
    };

    const handleAddToCart = async () => {
        const token = localStorage.getItem('token');
        if (!token) { setPendingAction('cart'); setShowLoginModal(true); return; }
        await doAddToCart();
    };

    const doToggleWishlist = async () => {
        setWishlistLoading(true);
        try {
            const res = await wishlistApi.toggle(product.id);
            setWishlisted(res.wishlisted);
        } catch (err) {
            alert(err.message || 'Unable to update your wishlist.');
        } finally {
            setWishlistLoading(false);
        }
    };

    const handleWishlist = async () => {
        const token = localStorage.getItem('token');
        if (!token) { setPendingAction('wishlist'); setShowLoginModal(true); return; }
        await doToggleWishlist();
    };

    if (loading) return <div className="h-screen flex justify-center items-center"><Loader2 className="animate-spin text-gray-300" size={40} /></div>;
    if (!product) return <div className="h-screen flex justify-center items-center text-gray-400">Product Not Found</div>;

    const allImages = typeof product.images === 'string' ? JSON.parse(product.images || "[]") : (product.images || []);
    const originalPrice = parseFloat(product.original_price || product.originalPrice || 0);
    const discountedPrice = parseFloat(product.discounted_price || product.discountedPrice || 0);
    const discountPercent = originalPrice > 0 ? Math.round(((originalPrice - discountedPrice) / originalPrice) * 100) : 0;
    const inStock = product.in_stock ?? true;
    const category = product.category || '';

    const cartBtnLabel = () => {
        if (!inStock) return 'Out of Stock';
        if (cartLoading) return 'Adding...';
        if (cartAdded) return '✓ Added to Cart!';
        return 'Add To Bag';
    };

    const cartBtnClass = () => {
        if (!inStock) return 'bg-gray-300 text-gray-500 cursor-not-allowed';
        if (cartAdded) return 'bg-green-600 text-white';
        return 'bg-[#3c2b23] text-white hover:bg-[#a77b43]';
    };

    return (
        <div className="product-page min-h-screen bg-[#fbf7f0] pb-24 text-[#33261f] md:pb-10">

            <LoginModal
                isOpen={showLoginModal}
                onClose={() => { setShowLoginModal(false); setPendingAction(null); }}
                onSuccess={handleLoginSuccess}
                message={pendingAction === 'wishlist' ? 'Please sign in to use your wishlist.' : 'Please sign in to add this product to your cart.'}
            />
            {zoomOpen && <div className="fixed inset-0 z-[300] grid place-items-center bg-[#1d1511]/90 p-4" onClick={() => setZoomOpen(false)}><button className="absolute right-5 top-5 grid h-11 w-11 place-items-center rounded-full bg-white text-[#352820]"><X size={20}/></button><img src={activeImage || allImages[0]} alt={product.name} className="max-h-[92vh] max-w-[92vw] object-contain" onClick={event => event.stopPropagation()}/></div>}

            {/* Breadcrumb */}
            <div className="max-w-[1180px] mx-auto px-5 py-5 hidden md:block">
                <nav className="flex items-center gap-2 text-[10px] text-gray-400 uppercase tracking-widest">
                    <Link href="/">Home</Link>
                    <ChevronRight size={10} />
                    <span className="capitalize">{category}</span>
                    <ChevronRight size={10} />
                    <span className="text-black font-semibold truncate max-w-[200px]">{product.name}</span>
                </nav>
            </div>

            {/* Main Content — with side related products on desktop */}
            <div className="max-w-[1180px] mx-auto md:px-5">
                <div className="flex gap-8">

                    {/* ── CENTER: Product Detail ── */}
                    <div className="flex-1 flex flex-col md:flex-row gap-7 lg:gap-12 min-w-0">

                        {/* Images */}
                        <div className="w-full md:w-[56%] flex flex-col md:flex-row gap-3">
                            {/* Thumbnails */}
                            <div className="flex md:flex-col gap-2 order-2 md:order-1 overflow-x-auto md:overflow-y-auto no-scrollbar md:w-16 shrink-0 px-4 md:px-0">
                                {allImages.map((img, idx) => (
                                    <div key={idx} onClick={() => setActiveImage(img)}
                                        className={`cursor-pointer aspect-[3/4] w-14 md:w-full border-2 transition-all duration-300 rounded-sm overflow-hidden flex-shrink-0 ${activeImage === img ? 'border-black opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                                        <img src={img} className="w-full h-full object-cover" alt={`thumb-${idx}`} />
                                    </div>
                                ))}
                            </div>

                            {/* Main Image */}
                            <div className="flex-1 order-1 md:order-2 aspect-[4/5] max-h-[560px] bg-[#efe8de] overflow-hidden relative flex items-center justify-center rounded-t-[5rem] md:rounded-t-[7rem]">
                                <img src={activeImage || allImages[0]} className="w-full h-full object-contain transition-opacity duration-500" alt={product.name} />
                                <button onClick={() => setZoomOpen(true)} className="absolute bottom-4 right-4 grid h-10 w-10 place-items-center rounded-full bg-white/85 text-[#3d2d25] shadow"><ZoomIn size={17}/></button>
                                <button onClick={() => router.back()} className="absolute top-4 left-4 p-2 bg-white/80 backdrop-blur rounded-full shadow-sm z-20 md:hidden">
                                    <X size={20} className="text-gray-800" />
                                </button>
                                <button className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur rounded-full shadow-sm">
                                    <Share2 size={18} className="text-gray-600" />
                                </button>
                            </div>
                        </div>

                        {/* Details */}
                        <div className="w-full md:w-[44%] px-5 md:px-0 mt-4 md:mt-0">
                            <div className="md:sticky md:top-24 space-y-5">

                                {/* Name */}
                                <div className="border-b pb-4">
                                    <p className="text-[9px] font-bold text-[#a77b43] uppercase tracking-[.28em] mb-2">{product.isCombo ? "KIA GIFT COMBO" : (product.brand || "KIA JEWELLERS")}</p>
                                    <h1 className="font-serif text-2xl md:text-4xl font-light text-[#33261f] tracking-tight leading-[1.05]">{product.name}</h1>
                                </div>

                                {/* Rating */}
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1 bg-green-700 text-white px-2 py-0.5 text-[10px] font-bold">
                                        {product.reviewer_rating || 4.2} <Star size={10} fill="currentColor" />
                                    </div>
                                    <span className="text-[11px] text-gray-400 border-l pl-3 uppercase tracking-wider font-semibold">Verified Buyer</span>
                                </div>

                                {/* Price */}
                                <div className="py-3">
                                    <div className="flex items-baseline gap-3">
                                        <span className="font-serif text-3xl text-[#33261f]">₹{discountedPrice.toLocaleString()}</span>
                                        {originalPrice > discountedPrice && (
                                            <>
                                                <span className="text-gray-400 line-through text-lg font-light">₹{originalPrice.toLocaleString()}</span>
                                                <span className="text-[#8a6738] font-bold text-[9px] bg-[#eee1cb] px-2 py-1 rounded-full">{discountPercent}% OFF</span>
                                            </>
                                        )}
                                    </div>
                                    <p className="text-[9px] text-[#8a735f] font-bold mt-2 uppercase tracking-[.16em]">Tax included · Complimentary insured shipping</p>
                                    {!inStock && <p className="text-[11px] text-red-500 font-bold mt-1 uppercase tracking-wider">⚠ Out of Stock</p>}
                                </div>

                                {/* Trust Badges */}
                                <div className="grid grid-cols-2 gap-2 py-4 border-y border-[#e5dacb]">
                                    <div className="flex gap-3 items-center text-[11px] text-gray-600 font-medium"><RotateCcw size={14} className="text-gray-400" /> 15 Days Easy Returns</div>
                                    <div className="flex gap-3 items-center text-[11px] text-gray-600 font-medium"><ShieldCheck size={14} className="text-gray-400" /> 100% Original Quality</div>
                                </div>

                                <div className="rounded-xl border border-[#e5dacb] bg-white/45 p-3">
                                    <p className="mb-2 flex items-center gap-2 text-[9px] font-bold uppercase tracking-[.2em] text-[#795f4e]"><MapPin size={13}/> Check delivery</p>
                                    <div className="flex gap-2"><input inputMode="numeric" maxLength={6} value={pincode} onChange={event => { setPincode(event.target.value.replace(/\D/g, '')); setDeliveryMessage(''); }} placeholder="6-digit pincode" className="min-w-0 flex-1 rounded-full border border-[#d8c9b7] bg-white px-4 py-2 text-xs outline-none"/><button onClick={() => setDeliveryMessage(pincode.length === 6 ? `Delivery expected in 4–6 business days to ${pincode}.` : 'Please enter a valid 6-digit pincode.')} className="rounded-full bg-[#3d2d25] px-4 text-[8px] font-bold uppercase tracking-widest text-white">Check</button></div>
                                    {deliveryMessage && <p className="mt-2 text-[10px] text-[#7b675b]">{deliveryMessage}</p>}
                                </div>

                                {/* Desktop Buttons */}
                                <div className="hidden md:flex gap-3 pt-2">
                                    <button onClick={handleAddToCart} disabled={cartLoading || !inStock}
                                        className={`flex-[2] py-4 text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${cartBtnClass()}`}>
                                        <ShoppingBag size={18} />
                                        {cartBtnLabel()}
                                    </button>
                                    <button onClick={handleWishlist} disabled={wishlistLoading}
                                        className={`flex-1 border py-4 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${wishlisted ? 'border-[#b87572] bg-[#f7e8e4] text-[#a34f4b]' : 'border-[#cdbfae] hover:border-[#3c2b23]'}`}>
                                        <Heart size={18} fill={wishlisted ? 'currentColor' : 'none'} className={wishlisted ? 'text-red-500' : ''} />
                                    </button>
                                </div>

                                {/* Description */}
                                <div className="rounded-xl border border-[#e5dacb] bg-white/45 p-4">
                                    <h3 className="text-[9px] font-bold uppercase tracking-[.24em] text-[#8f6c3e] mb-3">The details</h3>
                                    <p className="text-[13px] text-[#746158] leading-relaxed">{product.full_description || product.short_description || "A timeless jewel, thoughtfully crafted to become part of your story."}</p>
                                </div>
                                <div className="divide-y divide-[#e5dacb] border-y border-[#e5dacb]">
                                  <details className="group py-3"><summary className="cursor-pointer list-none text-[9px] font-bold uppercase tracking-[.22em]">Materials & authenticity <span className="float-right">+</span></summary><p className="pt-3 text-xs leading-5 text-[#746158]">Hand-finished materials with a KIA authenticity certificate and quality inspection.</p></details>
                                  <details className="group py-3"><summary className="cursor-pointer list-none text-[9px] font-bold uppercase tracking-[.22em]">Care guide <span className="float-right">+</span></summary><p className="pt-3 text-xs leading-5 text-[#746158]">Store separately, avoid moisture and perfume, and clean gently with a soft dry cloth.</p></details>
                                  <details className="group py-3"><summary className="cursor-pointer list-none text-[9px] font-bold uppercase tracking-[.22em]">Shipping & returns <span className="float-right">+</span></summary><p className="pt-3 text-xs leading-5 text-[#746158]">Complimentary insured shipping and a simple 15-day exchange window.</p></details>
                                </div>
                                <a href={`https://wa.me/?text=${encodeURIComponent(`I would like a consultation for ${product.name}`)}`} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 rounded-full border border-[#cdbfae] py-3 text-[9px] font-bold uppercase tracking-widest"><MessageCircle size={14}/> WhatsApp consultation</a>

                                {product.isCombo && product.comboItems?.length > 0 && (
                                    <div className="pt-3 border-t border-gray-100">
                                        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-900 mb-3">This Combo Includes</h3>
                                        <div className="space-y-2">
                                            {product.comboItems.map((item) => (
                                                <Link key={item.id} href={`/product/${item.id}`} className="grid grid-cols-[44px_1fr_auto] items-center gap-3 rounded border border-gray-100 p-2 transition hover:border-gray-300">
                                                    <img src={item.images?.[0] || '/placeholder.jpg'} alt={item.name} className="h-11 w-11 object-cover" />
                                                    <span className="min-w-0 truncate text-xs font-bold text-gray-700">{item.name}</span>
                                                    <span className="text-xs font-bold text-gray-500">x{item.quantity}</span>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Review */}
                                {product.reviewer_name && (
                                    <div className="pt-3 border-t border-gray-100">
                                        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-900 mb-3">Top Review</h3>
                                        <div className="bg-gray-50 rounded-lg p-3">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs font-bold text-gray-700">{product.reviewer_name}</span>
                                                <div className="flex items-center gap-0.5 bg-green-700 text-white px-1.5 py-0.5 text-[9px] font-bold rounded">
                                                    {product.reviewer_rating} <Star size={8} fill="currentColor" className="ml-0.5" />
                                                </div>
                                            </div>
                                            <p className="text-xs text-gray-500">{product.reviewer_review}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── BOTTOM: Related Products ── */}
                <div className="border-t border-gray-100 mt-8">
                    <RelatedProducts
                        category={category}
                        currentProductId={Number(id)}
                        layout="bottom"
                    />
                </div>
                {recentlyViewed.length > 0 && <section className="border-t border-[#e5dacb] py-10"><div className="mb-5"><p className="section-kicker">Continue exploring</p><h2 className="font-serif text-2xl">Recently viewed</h2></div><div className="grid grid-cols-2 gap-3 md:grid-cols-4">{recentlyViewed.map(item => <Link href={`/product/${item.id}`} key={item.id} className="group"><div className="aspect-[4/5] overflow-hidden rounded-xl bg-[#eee7de]"><img src={item.image || '/placeholder.jpg'} alt={item.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105"/></div><p className="mt-2 truncate font-serif text-sm">{item.name}</p><p className="mt-1 text-xs">₹{item.price.toLocaleString('en-IN')}</p></Link>)}</div></section>}
            </div>

            {/* Mobile Buttons */}
            <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t p-3 flex gap-3 z-50">
                <button onClick={handleWishlist} disabled={wishlistLoading}
                    className={`flex-1 border py-4 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${wishlisted ? 'border-red-400 bg-red-50 text-red-500' : 'border-black'}`}>
                    <Heart size={18} fill={wishlisted ? 'currentColor' : 'none'} />
                    {wishlisted ? 'Wishlisted' : 'Wishlist'}
                </button>
                <button onClick={handleAddToCart} disabled={cartLoading || !inStock}
                    className={`flex-[2] py-4 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${cartBtnClass()}`}>
                    <ShoppingBag size={18} />
                    {cartBtnLabel()}
                </button>
            </div>
        </div>
    );
}
