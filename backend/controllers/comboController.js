const pool = require('../config/db');
const { formatProduct } = require('../helpers/productHelper');

const comboItemsQuery = `
    SELECT cp.combo_id, cp.quantity, p.*
    FROM combo_products cp
    JOIN products p ON p.id = cp.product_id
    WHERE cp.combo_id = ANY($1::int[])
    ORDER BY cp.combo_id, p.id
`;

function attachItems(combos, itemRows) {
    const itemsByCombo = new Map();
    itemRows.forEach((row) => {
        const item = { ...formatProduct(row), quantity: row.quantity };
        itemsByCombo.set(row.combo_id, [...(itemsByCombo.get(row.combo_id) || []), item]);
    });

    return combos.map((row) => ({
        ...formatProduct(row),
        isCombo: true,
        comboItems: itemsByCombo.get(row.id) || [],
    }));
}

const getCombos = async (req, res) => {
    try {
        const combosResult = await pool.query(`
            SELECT p.*
            FROM products p
            WHERE EXISTS (SELECT 1 FROM combo_products cp WHERE cp.combo_id = p.id)
            ORDER BY p.id DESC
        `);
        if (!combosResult.rows.length) return res.json([]);

        const ids = combosResult.rows.map((row) => row.id);
        const itemsResult = await pool.query(comboItemsQuery, [ids]);
        res.json(attachItems(combosResult.rows, itemsResult.rows));
    } catch (err) {
        console.error('GET /api/combos Error:', err);
        res.status(500).json({ error: 'Failed to fetch combos' });
    }
};

const getComboCandidates = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT p.*
            FROM products p
            WHERE NOT EXISTS (SELECT 1 FROM combo_products cp WHERE cp.combo_id = p.id)
            ORDER BY p.name ASC, p.id DESC
        `);
        res.json(result.rows.map(formatProduct));
    } catch (err) {
        console.error('GET /api/combo-candidates Error:', err);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
};

const createCombo = async (req, res) => {
    const {
        name, originalPrice, discountedPrice, images,
        shortDescription, fullDescription, inStock = true, items,
    } = req.body;
    const normalizedItems = Array.isArray(items)
        ? items.map((item) => ({
            productId: Number(item.productId),
            quantity: Math.max(1, Number.parseInt(item.quantity, 10) || 1),
        }))
        : [];
    const uniqueIds = [...new Set(normalizedItems.map((item) => item.productId).filter(Number.isInteger))];

    if (!name?.trim()) return res.status(400).json({ error: 'Combo name is required' });
    if (uniqueIds.length < 2) return res.status(400).json({ error: 'Select at least two different products' });

    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const productsResult = await client.query(
            `SELECT p.id FROM products p
             WHERE p.id = ANY($1::int[])
               AND NOT EXISTS (SELECT 1 FROM combo_products cp WHERE cp.combo_id = p.id)`,
            [uniqueIds]
        );
        if (productsResult.rows.length !== uniqueIds.length) {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: 'One or more selected products are invalid' });
        }

        const oPrice = Number.parseFloat(originalPrice) || 0;
        const dPrice = Number.parseFloat(discountedPrice) || oPrice;
        if (oPrice < 0 || dPrice < 0 || dPrice > oPrice) {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: 'Enter valid combo prices; sale price cannot exceed original price' });
        }

        const comboResult = await client.query(
            `INSERT INTO products
             (name, category, sub_category, original_price, discounted_price, images,
              short_description, full_description, in_stock, created_at)
             VALUES ($1, 'gifting', 'combos', $2, $3, $4, $5, $6, $7, NOW()) RETURNING *`,
            [
                name.trim(), oPrice, dPrice,
                JSON.stringify(Array.isArray(images) ? images.filter(Boolean) : []),
                shortDescription || '', fullDescription || shortDescription || '', Boolean(inStock),
            ]
        );
        const combo = comboResult.rows[0];
        for (const productId of uniqueIds) {
            const item = normalizedItems.find((current) => current.productId === productId);
            await client.query(
                'INSERT INTO combo_products (combo_id, product_id, quantity) VALUES ($1, $2, $3)',
                [combo.id, productId, item.quantity]
            );
        }
        await client.query('COMMIT');

        const itemResult = await pool.query(comboItemsQuery, [[combo.id]]);
        res.status(201).json(attachItems([combo], itemResult.rows)[0]);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('POST /api/combos Error:', err);
        res.status(500).json({ error: 'Failed to create combo' });
    } finally {
        client.release();
    }
};

module.exports = { getCombos, getComboCandidates, createCombo, attachItems, comboItemsQuery };
