const pool = require('../config/db');
const { formatProduct, slugify } = require('../helpers/productHelper');

const getProducts = async (req, res) => {
    try {
        const { category, subcategory, limit, search } = req.query;
        let query = 'SELECT * FROM products WHERE 1=1';
        const values = [];

        if (category && category !== 'all') {
            values.push(category.toLowerCase().trim());
            query += ` AND LOWER(category) = $${values.length}`;
        }

        if (subcategory && subcategory !== 'null' && subcategory !== 'undefined' && subcategory !== '') {
            values.push(subcategory.toLowerCase().trim());
            query += ` AND LOWER(sub_category) = $${values.length}`;
        }

        if (search && search.trim()) {
            values.push(`%${search.trim()}%`);
            query += ` AND (name ILIKE $${values.length} OR category ILIKE $${values.length} OR sub_category ILIKE $${values.length} OR short_description ILIKE $${values.length})`;
        }

        query += ' ORDER BY id DESC';

        if (limit && !isNaN(parseInt(limit))) {
            values.push(parseInt(limit));
            query += ` LIMIT $${values.length}`;
        }

        const result = await pool.query(query, values);
        res.json(result.rows.map(formatProduct));
    } catch (err) {
        console.error('GET /api/products Error:', err);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
};

const getProductById = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM products WHERE id = $1', [parseInt(req.params.id)]);
        if (result.rows.length === 0)
            return res.status(404).json({ error: 'Product not found' });
        const itemResult = await pool.query(
            `SELECT cp.quantity, p.*
             FROM combo_products cp
             JOIN products p ON p.id = cp.product_id
             WHERE cp.combo_id = $1
             ORDER BY p.id`,
            [parseInt(req.params.id)]
        );
        const product = formatProduct(result.rows[0]);
        res.json({
            ...product,
            isCombo: itemResult.rows.length > 0,
            comboItems: itemResult.rows.map((row) => ({ ...formatProduct(row), quantity: row.quantity })),
        });
    } catch (err) {
        console.error('GET /api/product-detail Error:', err);
        res.status(500).json({ error: 'Database error' });
    }
};

const addProduct = async (req, res) => {
    const {
        name, category, originalPrice, discountedPrice,
        images, shortDescription, fullDescription, inStock,
    } = req.body;
    const subcategory = req.body.subcategory || req.body.subCategory || req.body.sub_category;
    const firstReview = Array.isArray(req.body.reviews) ? req.body.reviews[0] : null;
    const reviewerName = req.body.reviewerName || firstReview?.reviewerName;
    const rating = req.body.rating || firstReview?.rating;
    const reviewText = req.body.reviewText || firstReview?.text;

    if (!name || !category)
        return res.status(400).json({ error: 'Product name and category are required' });

    try {
        const finalSub = slugify(subcategory || 'general');
        const oPrice = parseFloat(originalPrice) || 0;
        const dPrice = parseFloat(discountedPrice) || oPrice;
        const imageList = Array.isArray(images) ? images.filter(Boolean) : [];

        const result = await pool.query(
            `INSERT INTO products
             (name, category, sub_category, original_price, discounted_price, images,
              short_description, full_description, in_stock,
              reviewer_name, reviewer_rating, reviewer_review, created_at)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,NOW()) RETURNING *`,
            [
                name,
                category.toLowerCase(),
                finalSub,
                oPrice,
                dPrice,
                JSON.stringify(imageList),
                shortDescription || '',
                fullDescription || shortDescription || '',
                inStock ?? true,
                reviewerName || '',
                parseInt(rating) || 0,
                reviewText || '',
            ]
        );

        res.status(201).json(formatProduct(result.rows[0]));
    } catch (err) {
        console.error('POST /api/products Error:', err);
        res.status(500).json({ error: 'Failed to add product' });
    }
};

const updateProduct = async (req, res) => {
    const { id } = req.params;
    const { name, originalPrice, discountedPrice, inStock } = req.body;

    try {
        const result = await pool.query(
            `UPDATE products
             SET name = $1, original_price = $2, discounted_price = $3, in_stock = $4
             WHERE id = $5 RETURNING *`,
            [name, parseFloat(originalPrice), parseFloat(discountedPrice), inStock, id]
        );

        if (result.rows.length === 0)
            return res.status(404).json({ error: 'Product not found' });

        res.json(formatProduct(result.rows[0]));
    } catch (err) {
        console.error('PUT /api/products Error:', err);
        res.status(500).json({ error: 'Update failed' });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const result = await pool.query(
            'DELETE FROM products WHERE id = $1 RETURNING id',
            [req.params.id]
        );

        if (result.rows.length === 0)
            return res.status(404).json({ error: 'Product not found' });

        res.json({ success: true, message: 'Product deleted' });
    } catch (err) {
        console.error('DELETE /api/products Error:', err);
        res.status(500).json({ error: 'Delete failed' });
    }
};

const addToCart = async (req, res) => {
    const { product_name, price = 0 } = req.body;
    try {
        await pool.query(
            `INSERT INTO orders (user_name, total_amount, items_count, status, created_at)
             VALUES ($1, $2, $3, 'pending', NOW())`,
            [product_name || 'Unknown Product', parseFloat(price), 1]
        );
        res.status(201).json({ success: true, message: 'Product added to cart successfully!' });
    } catch (err) {
        console.error('Cart Error:', err.message);
        res.status(500).json({ error: 'Failed to add to cart' });
    }
};

const getOrders = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM orders ORDER BY id DESC');
        res.json(result.rows);
    } catch (err) {
        console.error('GET /api/orders Error:', err);
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getProducts, getProductById, addProduct, updateProduct, deleteProduct, addToCart, getOrders };
