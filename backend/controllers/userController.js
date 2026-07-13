const pool = require('../config/db');
const bcrypt = require('bcryptjs');

const getProfile = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, email, name, phone, created_at FROM users WHERE id = $1',
            [req.user.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
};

const updateProfile = async (req, res) => {
    const { name, phone, email, password } = req.body;
    try {
        // Check email conflict
        if (email) {
            const existing = await pool.query(
                'SELECT id FROM users WHERE LOWER(email) = LOWER($1) AND id <> $2',
                [email, req.user.id]
            );
            if (existing.rows.length > 0)
                return res.status(400).json({ error: 'Email already in use' });
        }

        let query, values;
        if (password && password.trim().length >= 6) {
            const hashed = await bcrypt.hash(password, 10);
            query = `UPDATE users SET name=$1, phone=$2, email=$3, password=$4
                     WHERE id=$5 RETURNING id, email, name, phone, created_at`;
            values = [name, phone, email, hashed, req.user.id];
        } else {
            query = `UPDATE users SET name=$1, phone=$2, email=$3
                     WHERE id=$4 RETURNING id, email, name, phone, created_at`;
            values = [name, phone, email, req.user.id];
        }

        const result = await pool.query(query, values);
        res.json(result.rows[0]);
    } catch (err) {
        console.error('PUT /api/user/profile Error:', err.message);
        res.status(500).json({ error: 'Failed to update profile' });
    }
};

const getUserOrders = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT o.*, a.address, a.city, a.state, a.pincode
             FROM orders o
             LEFT JOIN addresses a ON o.address_id = a.id
             WHERE o.user_id = $1
             ORDER BY o.created_at DESC`,
            [req.user.id]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
};

module.exports = { getProfile, updateProfile, getUserOrders };