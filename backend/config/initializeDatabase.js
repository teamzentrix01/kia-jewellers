const pool = require('./db');

async function initializeDatabase() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS combo_products (
            combo_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
            product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
            quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
            PRIMARY KEY (combo_id, product_id),
            CHECK (combo_id <> product_id)
        )
    `);
}

module.exports = initializeDatabase;
