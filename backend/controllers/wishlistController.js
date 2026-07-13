const pool = require('../config/db');
const { formatProduct } = require('../helpers/productHelper');

const getWishlist = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT w.id, w.created_at,
                    p.id as product_id, p.name, p.category, p.sub_category,
                    p.original_price, p.discounted_price, p.images, p.in_stock
             FROM wishlist w
             JOIN products p ON w.product_id = p.id
             WHERE w.user_id = $1 ORDER BY w.created_at DESC`,
            [req.user.id]
        );

        const items = result.rows.map(row => ({
            wishlistId: row.id,
            product: formatProduct({
                id: row.product_id, name: row.name,
                category: row.category, sub_category: row.sub_category,
                original_price: row.original_price,
                discounted_price: row.discounted_price,
                images: row.images, in_stock: row.in_stock,
            }),
        }));

        res.json({ items, total: items.length });
    } catch (err) {
        console.error('GET /api/wishlist Error:', err.message);
        res.status(500).json({ error: 'Failed to fetch wishlist' });
    }
};

const toggleWishlist = async (req, res) => {
    const { product_id } = req.body;
    if (!product_id) return res.status(400).json({ error: 'product_id is required' });

    try {
        const existing = await pool.query(
            'SELECT id FROM wishlist WHERE user_id = $1 AND product_id = $2',
            [req.user.id, product_id]
        );

        if (existing.rows.length > 0) {
            await pool.query('DELETE FROM wishlist WHERE id = $1', [existing.rows[0].id]);
            return res.json({ success: true, wishlisted: false, message: 'Removed from wishlist' });
        }

        await pool.query(
            'INSERT INTO wishlist (user_id, product_id) VALUES ($1, $2)',
            [req.user.id, product_id]
        );
        res.status(201).json({ success: true, wishlisted: true, message: 'Added to wishlist' });
    } catch (err) {
        console.error('POST /api/wishlist Error:', err.message);
        res.status(500).json({ error: 'Failed to toggle wishlist' });
    }
};

const removeFromWishlist = async (req, res) => {
    try {
        const result = await pool.query(
            'DELETE FROM wishlist WHERE id = $1 AND user_id = $2 RETURNING id',
            [req.params.id, req.user.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Item not found' });
        res.json({ success: true, message: 'Removed from wishlist' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to remove' });
    }
};

module.exports = { getWishlist, toggleWishlist, removeFromWishlist };