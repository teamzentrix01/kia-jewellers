require("dotenv").config();
const bcrypt = require("bcryptjs");
const pool = require("../config/db");

const categories = [
  ["Rings","rings","Fine Jewellery"],["Earrings","earrings","Fine Jewellery"],["Necklaces","necklaces","Fine Jewellery"],
  ["Bangles","bangles","Fine Jewellery"],["Bracelets","bracelets","Fine Jewellery"],["Pendants","pendants","Fine Jewellery"],
  ["Kundan","kundan","Bridal"],["Polki","polki","Bridal"],["Temple Jewellery","temple-jewellery","Bridal"],
  ["Bridal Sets","bridal","Bridal"],["Maang Tikka","maang-tikka","Bridal"],["Men's Jewellery","mens-jewellery","Gifting"],
  ["New Arrivals","new-arrivals","Fine Jewellery"],["Bestsellers","bestsellers","Fine Jewellery"],
  ["Gifts Under ₹5,000","under-5000","Gifting"],["Anniversary Gifts","anniversary","Gifting"]
];
const products = [
  ["Aarvi Diamond Band","fine jewellery","rings",18900,15600,"https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=900&q=90"],
  ["Noor Emerald Drops","fine jewellery","earrings",9800,7450,"https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=900&q=90"],
  ["Celestial Polki Necklace","bridal","necklaces",22900,18900,"https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=900&q=90"],
  ["Meher Gold Bangle","fine jewellery","bangles",12600,9800,"https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=900&q=90"],
  ["Ziya Pearl Bracelet","fine jewellery","bracelets",7200,5900,"https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=900&q=90"],
  ["Ruhani Kundan Choker","bridal","kundan",28500,24900,"https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=900&q=90"],
  ["Heritage Polki Haar","bridal","polki",42000,37900,"https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=900&q=90"],
  ["Devi Temple Jhumkas","bridal","temple-jewellery",14900,12600,"https://images.unsplash.com/photo-1635767798638-3e25273a8236?w=900&q=90"],
  ["Saanvi Bridal Set","bridal","bridal",68900,59900,"https://images.unsplash.com/photo-1619119069152-a2b331eb392a?w=900&q=90"],
  ["Ira Solitaire Pendant","fine jewellery","pendants",11500,9900,"https://images.unsplash.com/photo-1599459183200-59c7687a0275?w=900&q=90"],
  ["Veer Signet Ring","gifting","mens-jewellery",8900,7500,"https://images.unsplash.com/photo-1603561596112-db1d18b38902?w=900&q=90"],
  ["Aashi Petite Hoops","gifting","under-5000",4900,3990,"https://images.unsplash.com/photo-1630019852942-f89202989a59?w=900&q=90"]
];

async function seed(){
  const client=await pool.connect();
  try{
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY, name VARCHAR(255), email VARCHAR(255) UNIQUE NOT NULL,
        password TEXT NOT NULL, role VARCHAR(30) DEFAULT 'user', created_at TIMESTAMP DEFAULT NOW(),
        reset_token TEXT, reset_token_expiry TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY, name VARCHAR(255) NOT NULL, slug VARCHAR(255) UNIQUE NOT NULL,
        group_label VARCHAR(100) NOT NULL, image_url TEXT DEFAULT '', sort_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true, created_at TIMESTAMP DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY, name VARCHAR(255) NOT NULL, category VARCHAR(100), sub_category VARCHAR(100),
        original_price NUMERIC(10,2), discounted_price NUMERIC(10,2), images TEXT,
        short_description TEXT, full_description TEXT, in_stock BOOLEAN DEFAULT true,
        reviewer_name VARCHAR(255), reviewer_rating INTEGER, reviewer_review TEXT,
        rating NUMERIC(3,1) DEFAULT 4.5, fabric VARCHAR(255), created_at TIMESTAMP DEFAULT NOW()
      );
      ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(30);
      CREATE TABLE IF NOT EXISTS addresses (
        id SERIAL PRIMARY KEY, user_id INTEGER REFERENCES users(id) ON DELETE CASCADE, name VARCHAR(255), phone VARCHAR(30),
        pincode VARCHAR(20), locality VARCHAR(255), address TEXT, city VARCHAR(100), state VARCHAR(100),
        address_type VARCHAR(50), is_default BOOLEAN DEFAULT false, created_at TIMESTAMP DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS cart (
        id SERIAL PRIMARY KEY, user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id) ON DELETE CASCADE, quantity INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT NOW(), UNIQUE(user_id,product_id)
      );
      ALTER TABLE cart ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();
      CREATE TABLE IF NOT EXISTS wishlist (
        id SERIAL PRIMARY KEY, user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id) ON DELETE CASCADE, created_at TIMESTAMP DEFAULT NOW(), UNIQUE(user_id,product_id)
      );
      ALTER TABLE wishlist ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY, user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        address_id INTEGER REFERENCES addresses(id) ON DELETE SET NULL, user_name VARCHAR(255),
        total_amount NUMERIC(12,2) DEFAULT 0, items_count INTEGER DEFAULT 0, status VARCHAR(40) DEFAULT 'pending',
        payment_status VARCHAR(40) DEFAULT 'pending', payment_method VARCHAR(80), product_ids TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    await client.query("BEGIN");
    const hash=await bcrypt.hash("KIA@123",10);
    const existing=await client.query("SELECT id FROM users WHERE email=$1",["admin@kiajewellers.in"]);
    if(existing.rows.length) await client.query("UPDATE users SET name=$1,password=$2,role='admin' WHERE email=$3",["KIA Admin",hash,"admin@kiajewellers.in"]);
    else await client.query("INSERT INTO users(name,email,password,role,created_at) VALUES($1,$2,$3,'admin',NOW())",["KIA Admin","admin@kiajewellers.in",hash]);
    await client.query("UPDATE categories SET is_active=false");
    for(let i=0;i<categories.length;i++){
      const [name,slug,group]=categories[i];
      const found=await client.query("SELECT id FROM categories WHERE slug=$1",[slug]);
      if(found.rows.length) await client.query("UPDATE categories SET name=$1,group_label=$2,is_active=true,sort_order=$3 WHERE slug=$4",[name,group,i,slug]);
      else await client.query("INSERT INTO categories(name,slug,group_label,image_url,sort_order,is_active,created_at) VALUES($1,$2,$3,'',$4,true,NOW())",[name,slug,group,i]);
    }
    for(const [name,category,sub,original,price,image] of products){
      const found=await client.query("SELECT id FROM products WHERE name=$1",[name]);
      if(!found.rows.length) await client.query(`INSERT INTO products(name,category,sub_category,original_price,discounted_price,images,short_description,full_description,in_stock,reviewer_name,reviewer_rating,reviewer_review,created_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8,true,'KIA Client',5,'Beautiful craftsmanship and finish.',NOW())`,[name,category,sub,original,price,JSON.stringify([image]),"Handcrafted with certified materials.","A modern heirloom shaped by Indian artistry, finished by hand and delivered with a certificate of authenticity."]);
    }
    await client.query("COMMIT");
    console.log(`Seeded ${categories.length} jewellery categories, ${products.length} products and admin account.`);
  }catch(error){await client.query("ROLLBACK");throw error}finally{client.release();await pool.end()}
}
seed().catch(error=>{console.error(error);process.exit(1)});
