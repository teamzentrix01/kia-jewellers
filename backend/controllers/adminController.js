const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const { formatProduct } = require('../helpers/productHelper');

const toNumber = (value) => Number(value || 0);

const tableExists = async (tableName) => {
    const result = await pool.query('SELECT to_regclass($1) AS table_name', [`public.${tableName}`]);
    return Boolean(result.rows[0]?.table_name);
};

const formatUser = (row) => {
    const email = row.email || '';

    return {
        id: row.id,
        email,
        role: (row.role || 'user').toLowerCase(),
        displayName: email ? email.split('@')[0] : 'Admin',
        initials: email ? email.slice(0, 2).toUpperCase() : 'AD',
        createdAt: row.created_at,
    };
};

const formatOrder = (row) => ({
    id: row.id,
    user_name: row.user_name || row.customer_name || 'Guest',
    total_amount: toNumber(row.total_amount || row.total || row.amount),
    items_count: toNumber(row.items_count || row.quantity || 1),
    status: row.status || 'pending',
    created_at: row.created_at,
});

const getAdminProfile = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, email, role, created_at FROM users WHERE id = $1',
            [req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Admin profile not found' });
        }

        res.json({ user: formatUser(result.rows[0]) });
    } catch (err) {
        console.error('GET /api/admin/profile Error:', err.message);
        res.status(500).json({ error: 'Failed to fetch admin profile' });
    }
};

const updateAdminProfile = async (req, res) => {
    const { email, password } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    try {
        const existing = await pool.query(
            'SELECT id FROM users WHERE LOWER(email) = LOWER($1) AND id <> $2',
            [email.trim(), req.user.id]
        );

        if (existing.rows.length > 0) {
            return res.status(400).json({ error: 'Email already belongs to another user' });
        }

        let result;
        if (password && password.trim().length > 0) {
            const hashed = await bcrypt.hash(password, 10);
            result = await pool.query(
                `UPDATE users
                 SET email = $1, password = $2
                 WHERE id = $3
                 RETURNING id, email, role, created_at`,
                [email.trim(), hashed, req.user.id]
            );
        } else {
            result = await pool.query(
                `UPDATE users
                 SET email = $1
                 WHERE id = $2
                 RETURNING id, email, role, created_at`,
                [email.trim(), req.user.id]
            );
        }

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Admin profile not found' });
        }

        res.json({ user: formatUser(result.rows[0]) });
    } catch (err) {
        console.error('PUT /api/admin/profile Error:', err.message);
        res.status(500).json({ error: 'Failed to update admin profile' });
    }
};

const getAdminStats = async (req, res) => {
    try {
        const productsSummary = await pool.query(`
            SELECT
                COUNT(*)::int AS total_products,
                COUNT(DISTINCT category)::int AS total_categories,
                COUNT(*) FILTER (WHERE COALESCE(in_stock, true))::int AS in_stock_products,
                COUNT(*) FILTER (WHERE COALESCE(in_stock, true) = false)::int AS out_of_stock_products
            FROM products
        `);

        const usersSummary = await pool.query(`
            SELECT
                COUNT(*)::int AS total_users,
                COUNT(*) FILTER (WHERE LOWER(COALESCE(role, 'user')) = 'admin')::int AS admin_users,
                COUNT(*) FILTER (WHERE LOWER(COALESCE(role, 'user')) <> 'admin')::int AS customers
            FROM users
        `);

        const categories = await pool.query(`
            SELECT COALESCE(category, 'general') AS category, COUNT(*)::int AS count
            FROM products
            GROUP BY COALESCE(category, 'general')
            ORDER BY count DESC, category ASC
        `);

        const recentProducts = await pool.query('SELECT * FROM products ORDER BY id DESC LIMIT 5');

        let ordersSummary = {
            total_orders: 0,
            pending_orders: 0,
            completed_orders: 0,
            total_revenue: 0,
        };
        let recentOrders = [];

        if (await tableExists('orders')) {
            const orderCounts = await pool.query(`
                SELECT
                    COUNT(*)::int AS total_orders,
                    COUNT(*) FILTER (WHERE LOWER(COALESCE(status, 'pending')) = 'pending')::int AS pending_orders,
                    COUNT(*) FILTER (WHERE LOWER(COALESCE(status, 'pending')) IN ('paid', 'completed', 'delivered'))::int AS completed_orders,
                    COALESCE(SUM(total_amount), 0)::numeric AS total_revenue
                FROM orders
            `);
            const orders = await pool.query('SELECT * FROM orders ORDER BY id DESC LIMIT 5');

            ordersSummary = {
                ...orderCounts.rows[0],
                total_revenue: toNumber(orderCounts.rows[0]?.total_revenue),
            };
            recentOrders = orders.rows.map(formatOrder);
        }

        res.json({
            summary: {
                ...productsSummary.rows[0],
                ...usersSummary.rows[0],
                ...ordersSummary,
            },
            categories: categories.rows,
            recentProducts: recentProducts.rows.map(formatProduct),
            recentOrders,
        });
    } catch (err) {
        console.error('GET /api/admin/stats Error:', err.message);
        res.status(500).json({ error: 'Failed to fetch admin dashboard data' });
    }
};

const getAdminCustomers = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT id, email, role, created_at
            FROM users
            ORDER BY id DESC
        `);

        res.json(result.rows.map(formatUser));
    } catch (err) {
        console.error('GET /api/admin/customers Error:', err.message);
        res.status(500).json({ error: 'Failed to fetch customers' });
    }
};

const getAdminOrders = async (req, res) => {
    try {
        if (!(await tableExists('orders'))) {
            return res.json([]);
        }

        const result = await pool.query('SELECT * FROM orders ORDER BY id DESC');
        res.json(result.rows.map(formatOrder));
    } catch (err) {
        console.error('GET /api/admin/orders Error:', err.message);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
};

module.exports = {
    getAdminProfile,
    updateAdminProfile,
    getAdminStats,
    getAdminCustomers,
    getAdminOrders,
};
