const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.resolve(__dirname, '../../database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    initializeDatabase();
  }
});

// Helper wrapper for running queries as promises
const query = {
  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      db.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, changes: this.changes });
      });
    });
  },
  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },
  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
};

function initializeDatabase() {
  db.serialize(async () => {
    // 1. Create Users Table
    await query.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        avatar TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 2. Create Products Table
    await query.run(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        category TEXT NOT NULL,
        stock INTEGER NOT NULL,
        image_url TEXT,
        specs TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 3. Create Orders Table
    await query.run(`
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        total_amount REAL NOT NULL,
        status TEXT DEFAULT 'Pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
      )
    `);

    // 4. Create Order Items Table
    await query.run(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        price REAL NOT NULL,
        FOREIGN KEY(order_id) REFERENCES orders(id),
        FOREIGN KEY(product_id) REFERENCES products(id)
      )
    `);

    console.log('Database tables verified/created successfully.');
    await seedDatabase();
  });
}

async function seedDatabase() {
  try {
    // Check if any users exist
    const userCount = await query.get('SELECT COUNT(*) as count FROM users');
    if (userCount.count === 0) {
      console.log('Seeding default users...');
      const adminPasswordHash = bcrypt.hashSync('admin123', 10);
      const userPasswordHash = bcrypt.hashSync('user123', 10);

      await query.run(
        'INSERT INTO users (name, email, password, role, avatar) VALUES (?, ?, ?, ?, ?)',
        ['Admin User', 'admin@gadgetgalaxy.com', adminPasswordHash, 'admin', 'https://api.dicebear.com/7.x/bottts/svg?seed=admin']
      );

      await query.run(
        'INSERT INTO users (name, email, password, role, avatar) VALUES (?, ?, ?, ?, ?)',
        ['Karan Sharma', 'karan@example.com', userPasswordHash, 'user', 'https://api.dicebear.com/7.x/bottts/svg?seed=karan']
      );
      console.log('Default users seeded.');
    }

    // Check if any products exist
    const productCount = await query.get('SELECT COUNT(*) as count FROM products');
    if (productCount.count === 0) {
      console.log('Seeding default products...');
      const defaultProducts = [
        {
          name: 'Apex Blade 16 Gaming Laptop',
          description: 'Next-gen gaming rig equipped with ultra-fast liquid cooling, premium mechanical keys, and a cinematic display.',
          price: 1899.99,
          category: 'Laptops',
          stock: 12,
          image_url: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&q=80&w=600',
          specs: JSON.stringify({
            'Processor': 'Intel Core i9-14900HX',
            'Graphics': 'NVIDIA RTX 4090 (16GB)',
            'Memory': '32GB DDR5 5600MHz',
            'Storage': '2TB PCIe Gen4 SSD',
            'Display': '16" QHD+ 240Hz Mini-LED'
          })
        },
        {
          name: 'AeroGlow Pro VR System',
          description: 'Immerse yourself in virtual realities with state-of-the-art inside-out tracking and rich spatial audio design.',
          price: 599.99,
          category: 'Wearables',
          stock: 18,
          image_url: 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?auto=format&fit=crop&q=80&w=600',
          specs: JSON.stringify({
            'Resolution': '2064 x 2208 pixels per eye',
            'Refresh Rate': '90Hz / 120Hz',
            'Field of View': '110 degrees diagonal',
            'Storage': '128GB Internal',
            'Weight': '515g comfort strap'
          })
        },
        {
          name: 'Nebula-87 Mechanical Keyboard',
          description: 'Compact mechanical keyboard featuring hot-swappable linear switches and customizable RGB per-key effects.',
          price: 149.99,
          category: 'Accessories',
          stock: 35,
          image_url: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&q=80&w=600',
          specs: JSON.stringify({
            'Form Factor': 'TKL (87 Keys)',
            'Switches': 'Gateron Oil King Linear',
            'Keycaps': 'Double-shot PBT Cherry Profile',
            'Backlight': '16.8M Color Per-Key RGB',
            'Connectivity': 'Bluetooth 5.1 / 2.4Ghz / USB-C'
          })
        },
        {
          name: 'Pulse X Pro Smartwatch',
          description: 'A premium smart companion track record including dynamic sports analytics and elegant battery backup.',
          price: 249.99,
          category: 'Wearables',
          stock: 22,
          image_url: 'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?auto=format&fit=crop&q=80&w=600',
          specs: JSON.stringify({
            'Display': '1.43" Always-on AMOLED',
            'Battery Life': 'Up to 12 Days (Smart Mode)',
            'Water Resistance': '5 ATM (up to 50m)',
            'Sensors': 'Optical heart rate, SpO2, GPS',
            'Body Material': 'Titanium alloy frame'
          })
        },
        {
          name: 'SonicShield ANC Pro Headphones',
          description: 'Premium active noise-canceling wireless headphones delivering studio-grade high-fidelity sound quality.',
          price: 299.99,
          category: 'Audio',
          stock: 15,
          image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600',
          specs: JSON.stringify({
            'Drivers': '40mm Custom Dynamic',
            'Noise Cancellation': 'Hybrid Active ANC (4 Microphones)',
            'Battery Life': '40 Hours (ANC On) / 50 Hours (ANC Off)',
            'Charging': 'USB-C Quick Charge (10 mins = 5 hrs)',
            'Bluetooth Version': '5.3 Multipoint'
          })
        },
        {
          name: 'Vortex Precision Gaming Mouse',
          description: 'Featherlight wireless design engineered with pixel-perfect tracking responsiveness for esports-grade competition.',
          price: 89.99,
          category: 'Accessories',
          stock: 45,
          image_url: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&q=80&w=600',
          specs: JSON.stringify({
            'Sensor': 'Vortex Focus Pro 30K',
            'Weight': '60g Ultra-lightweight',
            'Polling Rate': 'True 4000Hz Wireless',
            'Battery Life': 'Up to 90 Hours',
            'Buttons': '5 Programmable + DPI toggle'
          })
        }
      ];

      for (const prod of defaultProducts) {
        await query.run(
          'INSERT INTO products (name, description, price, category, stock, image_url, specs) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [prod.name, prod.description, prod.price, prod.category, prod.stock, prod.image_url, prod.specs]
        );
      }
      console.log('Default products seeded.');
    }
  } catch (error) {
    console.error('Error seeding database:', error.message);
  }
}

module.exports = {
  db,
  query
};
