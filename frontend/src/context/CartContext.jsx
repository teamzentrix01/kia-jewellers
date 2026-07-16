'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartApi } from '@/lib/api';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [cartOpen, setCartOpen] = useState(false);

    const fetchCart = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            setLoading(true);
            const data = await cartApi.get();
            setItems(data.items || []);
        } catch (err) {
            console.error('Cart fetch error:', err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchCart(); }, [fetchCart]);

    const addToCart = async (product_id, quantity = 1) => {
        try {
            await cartApi.add(product_id, quantity);
            await fetchCart();
            setCartOpen(true);
            return { success: true };
        } catch (err) {
            return { success: false, error: err.message };
        }
    };

    const updateQuantity = async (cartId, quantity) => {
        try {
            await cartApi.update(cartId, quantity);
            await fetchCart();
        } catch (err) {
            console.error(err.message);
        }
    };

    const removeItem = async (cartId) => {
        try {
            await cartApi.remove(cartId);
            setItems(prev => prev.filter(i => i.cartId !== cartId));
        } catch (err) {
            console.error(err.message);
        }
    };

    // const clearCart = async () => {
    //    setItems([]);
    // try {
    //     await cartApi.clear();
    // } catch (err) {
    //     console.error(err.message);
    // }
    // };

    const clearCart = async () => {
        try {
            await cartApi.clear();
            setItems([]);
        } catch (err) {
            console.error(err.message);
        }
    };

    const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
    const totalPrice = items.reduce((sum, i) => sum + (i.product.discountedPrice * i.quantity), 0);
    const totalSavings = items.reduce((sum, i) => sum + ((i.product.originalPrice - i.product.discountedPrice) * i.quantity), 0);

    return (
        <CartContext.Provider value={{
            items, loading, cartOpen, setCartOpen,
            addToCart, updateQuantity, removeItem, clearCart,
            fetchCart, totalItems, totalPrice, totalSavings,
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error('useCart must be used within CartProvider');
    return ctx;
};
