'use client';
import { useState } from 'react';
import { wishlistApi } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function WishlistButton({ productId }) {
    const router = useRouter();
    const [wishlisted, setWishlisted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleToggle = async () => {
        const token = localStorage.getItem('token');
        if (!token) { router.push('/login'); return; }

        setLoading(true);
        try {
            const res = await wishlistApi.toggle(productId);
            setWishlisted(res.wishlisted);
        } catch (err) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleToggle}
            disabled={loading}
            className={`p-2 rounded-full border transition ${
                wishlisted ? 'bg-red-50 border-red-300 text-red-500' : 'bg-white border-gray-200 text-gray-400 hover:text-red-400'
            }`}
            title={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
            {wishlisted ? '❤️' : '🤍'}
        </button>
    );
}