const pool = require('../config/db');

// GET /api/categories — public
const getCategories = async (req, res) => {
    try {
        const { group } = req.query;
        let query = 'SELECT * FROM categories WHERE is_active = true';
        const values = [];
        if (group) { values.push(group); query += ` AND LOWER(group_label) = LOWER($1)`; }
        query += ' ORDER BY group_label, sort_order ASC';
        const result = await pool.query(query, values);
        res.json(result.rows);
    } catch (err) {
        console.error('GET /api/categories Error:', err.message);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
};

// GET /api/admin/categories — admin: all including inactive
const getAllCategories = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM categories ORDER BY group_label, sort_order ASC');
        res.json(result.rows);
    } catch (err) {
        console.error('GET /api/admin/categories Error:', err.message);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
};

// POST /api/admin/categories
const addCategory = async (req, res) => {
    const { name, slug, group_label, image_url, sort_order = 0 } = req.body;
    if (!name || !slug || !group_label)
        return res.status(400).json({ error: 'name, slug, group_label required' });
    try {
        const result = await pool.query(
            `INSERT INTO categories (name, slug, group_label, image_url, sort_order, is_active, created_at)
             VALUES ($1, $2, $3, $4, $5, true, NOW()) RETURNING *`,
            [name, slug, group_label, image_url || '', sort_order]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('POST /api/admin/categories Error:', err.message);
        res.status(500).json({ error: 'Failed to add category' });
    }
};

// PUT /api/admin/categories/:id
const updateCategory = async (req, res) => {
    const { name, slug, group_label, image_url, sort_order, is_active } = req.body;
    try {
        const result = await pool.query(
            `UPDATE categories SET name=$1, slug=$2, group_label=$3, image_url=$4, sort_order=$5, is_active=$6
             WHERE id=$7 RETURNING *`,
            [name, slug, group_label, image_url || '', sort_order ?? 0, is_active ?? true, req.params.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Category not found' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error('PUT /api/admin/categories Error:', err.message);
        res.status(500).json({ error: 'Failed to update category' });
    }
};

// DELETE /api/admin/categories/:id
const deleteCategory = async (req, res) => {
    try {
        const result = await pool.query('DELETE FROM categories WHERE id=$1 RETURNING id', [req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Category not found' });
        res.json({ success: true });
    } catch (err) {
        console.error('DELETE /api/admin/categories Error:', err.message);
        res.status(500).json({ error: 'Failed to delete category' });
    }
};

module.exports = { getCategories, getAllCategories, addCategory, updateCategory, deleteCategory };