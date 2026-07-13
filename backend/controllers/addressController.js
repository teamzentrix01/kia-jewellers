const pool = require('../config/db');

const getAddresses = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM addresses WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC',
            [req.user.id]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch addresses' });
    }
};

const addAddress = async (req, res) => {
    const { name, phone, pincode, locality, address, city, state, address_type, is_default } = req.body;
    if (!name || !phone || !pincode || !address || !city || !state)
        return res.status(400).json({ error: 'All fields are required' });

    try {
        // If setting as default, unset others
        if (is_default) {
            await pool.query('UPDATE addresses SET is_default = false WHERE user_id = $1', [req.user.id]);
        }

        const result = await pool.query(
            `INSERT INTO addresses (user_id, name, phone, pincode, locality, address, city, state, address_type, is_default)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
            [req.user.id, name, phone, pincode, locality || '', address, city, state, address_type || 'home', is_default || false]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('POST /api/addresses Error:', err.message);
        res.status(500).json({ error: 'Failed to add address' });
    }
};

const updateAddress = async (req, res) => {
    const { name, phone, pincode, locality, address, city, state, address_type, is_default } = req.body;
    try {
        if (is_default) {
            await pool.query('UPDATE addresses SET is_default = false WHERE user_id = $1', [req.user.id]);
        }

        const result = await pool.query(
            `UPDATE addresses SET name=$1, phone=$2, pincode=$3, locality=$4,
             address=$5, city=$6, state=$7, address_type=$8, is_default=$9
             WHERE id=$10 AND user_id=$11 RETURNING *`,
            [name, phone, pincode, locality || '', address, city, state, address_type || 'home', is_default || false, req.params.id, req.user.id]
        );

        if (result.rows.length === 0) return res.status(404).json({ error: 'Address not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update address' });
    }
};

const deleteAddress = async (req, res) => {
    try {
        const result = await pool.query(
            'DELETE FROM addresses WHERE id = $1 AND user_id = $2 RETURNING id',
            [req.params.id, req.user.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Address not found' });
        res.json({ success: true, message: 'Address deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete address' });
    }
};

module.exports = { getAddresses, addAddress, updateAddress, deleteAddress };