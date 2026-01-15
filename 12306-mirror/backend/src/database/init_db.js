const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(process.cwd(), 'database.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    db.serialize(() => {
      db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT,
        id_type TEXT,
        id_card TEXT UNIQUE,
        real_name TEXT,
        phone TEXT,
        type TEXT DEFAULT 'passenger'
      )`);

      // Create stations table
      db.run(`CREATE TABLE IF NOT EXISTS stations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE,
        pinyin TEXT,
        initial TEXT
      )`);

      // Create trains table
      db.run(`CREATE TABLE IF NOT EXISTS trains (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        train_number TEXT UNIQUE,
        type TEXT
      )`);

      // Create train_station_mapping table
      db.run(`CREATE TABLE IF NOT EXISTS train_station_mapping (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        train_id INTEGER,
        station_id INTEGER,
        arrival_time TEXT,
        departure_time TEXT,
        stop_order INTEGER,
        FOREIGN KEY(train_id) REFERENCES trains(id),
        FOREIGN KEY(station_id) REFERENCES stations(id)
      )`);

      // Create passengers table (REQ-3-2)
      db.run(`CREATE TABLE IF NOT EXISTS passengers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        name TEXT,
        type TEXT DEFAULT '成人',
        id_type TEXT DEFAULT '1',
        id_card TEXT,
        phone TEXT,
        FOREIGN KEY(user_id) REFERENCES users(id)
      )`);

      // Create orders table (REQ-4)
      db.run(`CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        status TEXT DEFAULT 'Unpaid', -- Unpaid, Paid, Cancelled
        total_price REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
      )`);

      // Create order_items table (REQ-4)
      db.run(`CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER,
        passenger_id INTEGER,
        passenger_name TEXT,
        train_number TEXT,
        departure_date TEXT,
        from_station TEXT,
        to_station TEXT,
        start_time TEXT,
        end_time TEXT,
        seat_type TEXT,
        price REAL,
        FOREIGN KEY(order_id) REFERENCES orders(id)
      )`);

      // Create catering_brands table (REQ-5)
      db.run(`CREATE TABLE IF NOT EXISTS catering_brands (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        logo_url TEXT
      )`);

      // Create catering_items table (REQ-5)
      db.run(`CREATE TABLE IF NOT EXISTS catering_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        price REAL,
        type TEXT, -- 'self' or 'brand'
        brand_id INTEGER,
        image_url TEXT,
        FOREIGN KEY(brand_id) REFERENCES catering_brands(id)
      )`);

      // Create catering_orders table (REQ-5)
      db.run(`CREATE TABLE IF NOT EXISTS catering_orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        status TEXT DEFAULT 'Created', -- Created, Paid
        total_price REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
      )`);

      // Create catering_order_items table (REQ-5)
      db.run(`CREATE TABLE IF NOT EXISTS catering_order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER,
        item_id INTEGER,
        quantity INTEGER,
        price REAL,
        FOREIGN KEY(order_id) REFERENCES catering_orders(id),
        FOREIGN KEY(item_id) REFERENCES catering_items(id)
      )`);

      // Seed data
      db.get("SELECT count(*) as count FROM stations", (err, row) => {
        if (!err && row && row.count === 0) {
            console.log('Seeding stations...');
            const stmt = db.prepare("INSERT INTO stations (name, pinyin, initial) VALUES (?, ?, ?)");
            const stations = [
                ['北京南', 'beijingnan', 'B'],
                ['上海虹桥', 'shanghaihongqiao', 'S'],
                ['南京南', 'nanjingnan', 'N'],
                ['济南西', 'jinanxi', 'J'],
                ['天津南', 'tianjinnan', 'T']
            ];
            stations.forEach(s => stmt.run(s));
            stmt.finalize();
        }
      });

      db.get("SELECT count(*) as count FROM trains", (err, row) => {
        if (!err && row && row.count === 0) {
            console.log('Seeding trains...');
            const stmt = db.prepare("INSERT INTO trains (train_number, type) VALUES (?, ?)");
            const trains = [
                ['G1', 'G'],
                ['G2', 'G'],
                ['G101', 'G']
            ];
            trains.forEach(t => stmt.run(t));
            stmt.finalize(() => {
                // Seed mappings after trains are inserted
                db.get("SELECT count(*) as count FROM train_station_mapping", (err, row) => {
                    if (!err && row && row.count === 0) {
                        console.log('Seeding train mappings...');
                        // Assume IDs: G1=1, BeijingNan=1, ShanghaiHongqiao=2
                        // We should lookup IDs ideally, but for seeding simplicity we might rely on order or lookup.
                        // Let's use subqueries to be safe.
                        const insertMapping = db.prepare(`
                            INSERT INTO train_station_mapping (train_id, station_id, arrival_time, departure_time, stop_order)
                            SELECT t.id, s.id, ?, ?, ?
                            FROM trains t, stations s
                            WHERE t.train_number = ? AND s.name = ?
                        `);
                        
                        const mappings = [
                            // G1: 北京南 -> 上海虹桥
                            ['09:00', '09:00', 1, 'G1', '北京南'],
                            ['13:00', '13:00', 2, 'G1', '上海虹桥'],
                            // G2: 上海虹桥 -> 北京南
                            ['14:00', '14:00', 1, 'G2', '上海虹桥'],
                            ['18:00', '18:00', 2, 'G2', '北京南']
                        ];
                        
                        mappings.forEach(m => insertMapping.run(m));
                        insertMapping.finalize();
                    }
                });
            });
        }
      });

      // Seed catering data
      db.get("SELECT count(*) as count FROM catering_brands", (err, row) => {
        if (!err && row && row.count === 0) {
            console.log('Seeding catering data...');
            const brandStmt = db.prepare("INSERT INTO catering_brands (name, logo_url) VALUES (?, ?)");
            const brands = [
                ['永和大王', '/assets/profile-and-catering/Food-永和大王.jpg'],
                ['老娘舅', '/assets/profile-and-catering/Food-老娘舅.jpg'],
                ['麦当劳', '/assets/profile-and-catering/Food-麦当劳.jpg'],
                ['康师傅', '/assets/profile-and-catering/Food-康师傅.jpg'],
                ['德克士', '/assets/profile-and-catering/Food-德克士.jpg'],
                ['真功夫', '/assets/profile-and-catering/Food-真功夫.jpg']
            ];
            brands.forEach(b => brandStmt.run(b));
            brandStmt.finalize(() => {
                // Insert items
                // Self-operated
                const items = [
                    ['冷链盒饭A', 15, 'self', null, '/assets/profile-and-catering/Food-列车自营商品-15元.jpg'],
                    ['冷链盒饭B', 30, 'self', null, '/assets/profile-and-catering/Food-列车自营商品-30元.jpg'],
                    ['冷链盒饭C', 40, 'self', null, '/assets/profile-and-catering/Food-列车自营商品-40元.jpg']
                ];
                const itemStmt = db.prepare("INSERT INTO catering_items (name, price, type, brand_id, image_url) VALUES (?, ?, ?, ?, ?)");
                items.forEach(i => itemStmt.run(i));
                itemStmt.finalize();
                
                // Brand Items using subqueries
                const brandItemStmt = db.prepare(`
                    INSERT INTO catering_items (name, price, type, brand_id, image_url) 
                    SELECT ?, ?, 'brand', id, ? FROM catering_brands WHERE name = ?
                `);
                
                const brandItems = [
                    ['香芋派', 8, '/assets/profile-and-catering/麦当劳-香芋派.jpg', '麦当劳'],
                    ['鸡牛双堡双人餐', 68, '/assets/profile-and-catering/麦当劳-鸡牛双堡双人餐乘运款.jpg', '麦当劳'],
                    ['新台式卤肉饭', 35, '/assets/profile-and-catering/老娘舅-新台式卤肉饭.jpg', '老娘舅'],
                    ['经典脆爽双鸡堡套餐', 32, '/assets/profile-and-catering/德克士-经典脆爽双鸡堡套餐.jpg', '德克士']
                ];
                
                brandItems.forEach(bi => brandItemStmt.run(bi));
                brandItemStmt.finalize();
            });
        }
      });
    });
  }
});

module.exports = db;
