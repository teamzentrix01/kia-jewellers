const pool = require('../config/db');
const { sendOrderEmails } = require('../services/orderEmailService');

// POST /api/orders/place — user order place kare
const placeOrder = async (req, res) => {
    const { address_id, payment_method, cart_items } = req.body;

    if (!address_id || !payment_method || !cart_items?.length)
        return res.status(400).json({ error: 'Address, payment method aur cart items required hain' });

    try {
        const customerResult = await pool.query(
            'SELECT name, email, phone FROM users WHERE id = $1',
            [req.user.id]
        );
        const addressResult = await pool.query(
            `SELECT name, phone, pincode, locality, address, city, state
             FROM addresses WHERE id = $1 AND user_id = $2`,
            [address_id, req.user.id]
        );

        if (!customerResult.rows.length)
            return res.status(404).json({ error: 'Customer not found' });
        if (!addressResult.rows.length)
            return res.status(400).json({ error: 'Invalid delivery address' });

        const cartResult = await pool.query(
            `SELECT c.quantity, p.discounted_price, p.name, p.id as product_id
             FROM cart c
             JOIN products p ON c.product_id = p.id
             WHERE c.user_id = $1`,
            [req.user.id]
        );

        if (cartResult.rows.length === 0)
            return res.status(400).json({ error: 'Cart empty hai' });

        const totalAmount = cartResult.rows.reduce(
            (sum, item) => sum + (parseFloat(item.discounted_price) * item.quantity), 0
        );
        const itemsCount = cartResult.rows.reduce((sum, item) => sum + item.quantity, 0);
        const productIds = cartResult.rows.map(r => ({
            id: r.product_id,
            name: r.name,
            qty: r.quantity,
            price: r.discounted_price,
        }));

        const orderResult = await pool.query(
            `INSERT INTO orders (user_id, address_id, total_amount, items_count, status, payment_method, product_ids, created_at)
             VALUES ($1, $2, $3, $4, 'pending', $5, $6, NOW()) RETURNING *`,
            [req.user.id, address_id, totalAmount, itemsCount, payment_method, JSON.stringify(productIds)]
        );

        await pool.query('DELETE FROM cart WHERE user_id = $1', [req.user.id]);

        const order = orderResult.rows[0];
        const customer = customerResult.rows[0];
        const address = addressResult.rows[0];
        const emailStatus = await sendOrderEmails({ order, customer, address, items: productIds });

        res.status(201).json({
            success: true,
            message: 'Order place ho gaya!',
            order,
            emailStatus,
        });
    } catch (err) {
        console.error('POST /api/orders Error:', err.message);
        res.status(500).json({ error: 'Unable to place the order' });
    }
};

// GET /api/orders/all — admin: sab orders dekhe
const getAllOrders = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT o.*,
                    u.email as user_email,
                    u.name as user_name,
                    a.address, a.city, a.state, a.pincode, a.phone as delivery_phone
             FROM orders o
             LEFT JOIN users u ON o.user_id = u.id
             LEFT JOIN addresses a ON o.address_id = a.id
             ORDER BY o.created_at DESC`
        );
        res.json({ orders: result.rows });
    } catch (err) {
        console.error('GET /api/orders/all Error:', err.message);
        res.status(500).json({ error: 'Unable to fetch orders' });
    }
};

// GET /api/orders/my — user: apne orders dekhe
const getMyOrders = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT o.*,
                    a.address, a.city, a.state, a.pincode
             FROM orders o
             LEFT JOIN addresses a ON o.address_id = a.id
             WHERE o.user_id = $1
             ORDER BY o.created_at DESC`,
            [req.user.id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error('GET /api/orders/my Error:', err.message);
        res.status(500).json({ error: 'Unable to fetch orders' });
    }
};

// PUT /api/orders/:id/status — admin: order status update kare
const updateOrderStatus = async (req, res) => {
    const { status, payment_status } = req.body;
    const { id } = req.params;

    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    const validPaymentStatuses = ['pending', 'paid', 'failed', 'refunded'];

    if (status && !validStatuses.includes(status))
        return res.status(400).json({ error: 'Invalid status' });

    if (payment_status && !validPaymentStatuses.includes(payment_status))
        return res.status(400).json({ error: 'Invalid payment status' });

    try {
        let query = 'UPDATE orders SET ';
        const values = [];
        const updates = [];

        if (status) {
            values.push(status);
            updates.push(`status = $${values.length}`);
        }
        if (payment_status) {
            values.push(payment_status);
            updates.push(`payment_status = $${values.length}`);
        }

        if (updates.length === 0)
            return res.status(400).json({ error: 'Please provide at least one field to update' });

        values.push(id);
        query += updates.join(', ') + ` WHERE id = $${values.length} RETURNING *`;

        const result = await pool.query(query, values);

        if (result.rows.length === 0)
            return res.status(404).json({ error: 'Order not found' });

        res.json({ success: true, order: result.rows[0] });
    } catch (err) {
        console.error('PUT /api/orders/:id/status Error:', err.message);
        res.status(500).json({ error: 'Unable to update the order status' });
    }
};

module.exports = { placeOrder, getAllOrders, getMyOrders, updateOrderStatus };
