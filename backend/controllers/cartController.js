const pool = require('../config/db');
const { formatProduct } = require('../helpers/productHelper');



// GET /api/cart
const getCart = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT c.id, c.quantity, c.created_at,
                    p.id as product_id, p.name, p.category, p.sub_category,
                    p.original_price, p.discounted_price, p.images, p.in_stock
             FROM cart c
             JOIN products p ON c.product_id = p.id
             WHERE c.user_id = $1
             ORDER BY c.created_at DESC`,
            [req.user.id]
        );

        const items = result.rows.map(row => ({
            cartId: row.id,
            quantity: row.quantity,
            product: formatProduct({
                id: row.product_id,
                name: row.name,
                category: row.category,
                sub_category: row.sub_category,
                original_price: row.original_price,
                discounted_price: row.discounted_price,
                images: row.images,
                in_stock: row.in_stock,
            }),
        }));

        res.json({ items, total: items.length });
    } catch (err) {
        console.error('GET /api/cart Error:', err.message);
        res.status(500).json({ error: 'Failed to fetch cart' });
    }
};

// POST /api/cart
const addToCart = async (req, res) => {
    const { product_id, quantity = 1 } = req.body;
    if (!product_id) return res.status(400).json({ error: 'product_id is required' });

    console.log('req.user:', req.user);
    console.log('product_id:', product_id);

    try {
        // Check product exists
        const product = await pool.query('SELECT id, in_stock FROM products WHERE id = $1', [product_id]);
        if (product.rows.length === 0) return res.status(404).json({ error: 'Product not found' });
        if (!product.rows[0].in_stock) return res.status(400).json({ error: 'Product is out of stock' });

        // Insert or update quantity
        const result = await pool.query(
            `INSERT INTO cart (user_id, product_id, quantity)
             VALUES ($1, $2, $3)
             ON CONFLICT (user_id, product_id)
             DO UPDATE SET quantity = cart.quantity + $3
             RETURNING *`,
            [req.user.id, product_id, quantity]
        );

        res.status(201).json({ success: true, message: 'Added to cart', cart: result.rows[0] });
    } catch (err) {
        console.error('POST /api/cart Error:', err.message);
        res.status(500).json({ error: 'Failed to add to cart' });
    }
};

// PUT /api/cart/:id  (update quantity)
const updateCartItem = async (req, res) => {
    const { quantity } = req.body;
    if (!quantity || quantity < 1) return res.status(400).json({ error: 'Valid quantity required' });

    try {
        const result = await pool.query(
            `UPDATE cart SET quantity = $1
             WHERE id = $2 AND user_id = $3 RETURNING *`,
            [quantity, req.params.id, req.user.id]
        );

        if (result.rows.length === 0) return res.status(404).json({ error: 'Cart item not found' });
        res.json({ success: true, cart: result.rows[0] });
    } catch (err) {
        console.error('PUT /api/cart Error:', err.message);
        res.status(500).json({ error: 'Failed to update cart' });
    }
};

// DELETE /api/cart/:id
const removeFromCart = async (req, res) => {
    try {
        const result = await pool.query(
            'DELETE FROM cart WHERE id = $1 AND user_id = $2 RETURNING id',
            [req.params.id, req.user.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Cart item not found' });
        res.json({ success: true, message: 'Removed from cart' });
    } catch (err) {
        console.error('DELETE /api/cart Error:', err.message);
        res.status(500).json({ error: 'Failed to remove from cart' });
    }
};

// DELETE /api/cart  (clear all)
const clearCart = async (req, res) => {
    try {
        await pool.query('DELETE FROM cart WHERE user_id = $1', [req.user.id]);
        res.json({ success: true, message: 'Cart cleared' });
    } catch (err) {
        console.error('DELETE /api/cart/all Error:', err.message);
        res.status(500).json({ error: 'Failed to clear cart' });
    }
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart };