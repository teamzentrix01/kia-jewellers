'use client';
import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';

export default function AddToCartButton({ productId, inStock = true }) {
    const { addToCart } = useCart();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [added, setAdded] = useState(false);

    const handleAdd = async () => {
        const token = localStorage.getItem('token');
        if (!token) { router.push('/login'); return; }
        if (!inStock) return;

        setLoading(true);
        const result = await addToCart(productId);
        setLoading(false);

        if (result.success) {
            setAdded(true);
            setTimeout(() => setAdded(false), 2000);
        } else {
            alert(result.error || 'Failed to add to cart');
        }
    };

    if (!inStock) return (
        <button disabled className="w-full bg-gray-200 text-gray-400 py-3 rounded-lg font-semibold cursor-not-allowed">
            Out of Stock
        </button>
    );

    return (
        <button
            onClick={handleAdd}
            disabled={loading || added}
            className={`w-full py-3 rounded-lg font-semibold transition text-white ${
                added ? 'bg-green-500' : loading ? 'bg-gray-400' : 'bg-orange-500 hover:bg-orange-600'
            }`}
        >
            {added ? '✅ Added to Cart!' : loading ? 'Adding...' : '🛒 Add to Cart'}
        </button>
    );
}