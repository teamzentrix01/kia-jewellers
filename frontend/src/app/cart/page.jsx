'use client';
/* eslint-disable react/no-unescaped-entities */
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CartPage() {
    const { items, loading, updateQuantity, removeItem, clearCart, totalPrice, totalSavings, totalItems } = useCart();
    const router = useRouter();

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
    );

    if (items.length === 0) return (
        <div className="store-shell min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
            <div className="text-6xl">🛒</div>
            <h2 className="text-2xl font-bold text-gray-700">Your cart is empty</h2>
            <p className="text-gray-500">Add items to your cart to see them here</p>
            <Link href="/" className="mt-4 bg-[#3d2d25] text-white px-8 py-3 rounded-full text-xs font-semibold uppercase tracking-widest hover:bg-[#a77b43] transition">
                Continue Shopping
            </Link>
        </div>
    );

    return (
        <div className="store-shell min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">
                    My Cart <span className="text-gray-400 text-lg font-normal">({totalItems} items)</span>
                </h1>

                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Cart Items */}
                    <div className="flex-1 space-y-4">
                        {items.map(({ cartId, quantity, product }) => (
                            <div key={cartId} className="cart-line bg-white rounded-xl shadow-sm p-4 flex gap-4">
                                {/* Product Image */}
                                <div className="cart-image w-28 h-28 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                                    {product.images?.[0] ? (
                                        <img
                                            src={product.images[0]}
                                            alt={product.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-3xl">📦</div>
                                    )}
                                </div>

                                {/* Product Info */}
                                <div className="flex-1 min-w-0">
                                    <Link href={`/product/${product.id}`}>
                                        <h3 className="font-semibold text-gray-800 hover:text-blue-600 truncate">{product.name}</h3>
                                    </Link>
                                    <p className="text-sm text-gray-500 capitalize mt-0.5">{product.category}</p>

                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-lg font-bold text-gray-900">₹{product.discountedPrice}</span>
                                        {product.originalPrice > product.discountedPrice && (
                                            <>
                                                <span className="text-sm text-gray-400 line-through">₹{product.originalPrice}</span>
                                                <span className="text-sm text-green-600 font-medium">
                                                    {Math.round((1 - product.discountedPrice / product.originalPrice) * 100)}% off
                                                </span>
                                            </>
                                        )}
                                    </div>

                                    {!product.inStock && (
                                        <span className="inline-block text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded mt-1">Out of Stock</span>
                                    )}

                                    {/* Quantity + Remove */}
                                    <div className="cart-actions flex items-center gap-4 mt-3">
                                        <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                                            <button
                                                onClick={() => quantity > 1 ? updateQuantity(cartId, quantity - 1) : removeItem(cartId)}
                                                className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 text-lg font-bold"
                                            >−</button>
                                            <span className="w-10 text-center text-sm font-semibold">{quantity}</span>
                                            <button
                                                onClick={() => quantity < 10 && updateQuantity(cartId, quantity + 1)}
                                                className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 text-lg font-bold"
                                            >+</button>
                                        </div>
                                        <button
                                            onClick={() => removeItem(cartId)}
                                            className="text-sm text-red-500 hover:text-red-700 font-medium"
                                        >Remove</button>
                                        <Link href={`/product/${product.id}`}
                                            className="text-sm text-blue-500 hover:text-blue-700 font-medium">
                                            View Details
                                        </Link>
                                    </div>
                                </div>

                                {/* Item Total */}
                                <div className="cart-total text-right flex-shrink-0">
                                    <p className="font-bold text-gray-900">₹{(product.discountedPrice * quantity).toLocaleString()}</p>
                                </div>
                            </div>
                        ))}

                        {/* Clear Cart */}
                        <button
                            onClick={clearCart}
                            className="text-sm text-gray-400 hover:text-red-500 transition"
                        >
                            🗑 Clear entire cart
                        </button>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:w-80 space-y-4">
                        {/* Savings Banner */}
                        {totalSavings > 0 && (
                            <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
                                <p className="text-green-700 font-semibold text-sm">
                                    🎉 You're saving ₹{totalSavings.toLocaleString()} on this order!
                                </p>
                            </div>
                        )}

                        <div className="bg-white rounded-xl shadow-sm p-6 sticky top-4">
                            <h2 className="font-bold text-gray-700 uppercase text-sm tracking-wide mb-4">Price Details</h2>

                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between text-gray-600">
                                    <span>Price ({totalItems} items)</span>
                                    <span>₹{(totalPrice + totalSavings).toLocaleString()}</span>
                                </div>
                                {totalSavings > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span>Discount</span>
                                        <span>− ₹{totalSavings.toLocaleString()}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-gray-600">
                                    <span>Delivery Charges</span>
                                    <span className="text-green-600 font-medium">FREE</span>
                                </div>
                                <div className="border-t pt-3 flex justify-between font-bold text-gray-900 text-base">
                                    <span>Total Amount</span>
                                    <span>₹{totalPrice.toLocaleString()}</span>
                                </div>
                            </div>

                            <button
                                onClick={() => router.push('/checkout')}
                                className="w-full mt-6 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition text-base"
                            >
                                Place Order
                            </button>

                            <Link href="/" className="block text-center mt-3 text-blue-600 text-sm hover:underline">
                                Continue Shopping
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
