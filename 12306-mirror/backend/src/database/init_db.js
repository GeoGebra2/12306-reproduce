const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../../database.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    initTables();
  }
});

function initTables() {
  db.serialize(() => {
    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT,
      id_type TEXT,
      id_card TEXT,
      real_name TEXT,
      phone TEXT,
      email TEXT,
      type TEXT
    )`);

    // Stations table
    db.run(`CREATE TABLE IF NOT EXISTS stations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE,
      code TEXT UNIQUE,
      city_name TEXT,
      pinyin TEXT
    )`);

    // Trains table
    db.run(`CREATE TABLE IF NOT EXISTS trains (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      train_number TEXT UNIQUE,
      start_station TEXT,
      end_station TEXT,
      start_time TEXT,
      end_time TEXT,
      duration TEXT
    )`);

    // Train Station Mapping (Stopovers)
    db.run(`CREATE TABLE IF NOT EXISTS train_station_mapping (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      train_id INTEGER,
      station_name TEXT,
      arrival_time TEXT,
      departure_time TEXT,
      stop_order INTEGER,
      FOREIGN KEY(train_id) REFERENCES trains(id)
    )`);

    // Passengers table
    db.run(`CREATE TABLE IF NOT EXISTS passengers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      name TEXT,
      id_type TEXT,
      id_card TEXT,
      phone TEXT,
      type TEXT,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )`);

    // Addresses table
    db.run(`CREATE TABLE IF NOT EXISTS addresses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      receiver_name TEXT,
      phone TEXT,
      province TEXT,
      city TEXT,
      district TEXT,
      detail_address TEXT,
      is_default INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )`);

    // Orders table
    db.run(`CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      status TEXT, -- 'Unpaid', 'Paid', 'Cancelled'
      total_price REAL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )`);

    // Order Items table (Tickets snapshot)
    db.run(`CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER,
      passenger_id INTEGER,
      passenger_name TEXT,
      train_number TEXT,
      departure TEXT,
      arrival TEXT,
      departure_time TEXT,
      seat_type TEXT,
      price REAL,
      FOREIGN KEY(order_id) REFERENCES orders(id)
    )`);

    // Catering Brands table
    db.run(`CREATE TABLE IF NOT EXISTS catering_brands (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE,
      logo_url TEXT
    )`);

    // Catering Items table
    db.run(`CREATE TABLE IF NOT EXISTS catering_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      price REAL,
      type TEXT, -- 'SELF_OPERATED', 'BRAND'
      brand_id INTEGER,
      image_url TEXT,
      FOREIGN KEY(brand_id) REFERENCES catering_brands(id)
    )`);

    // Catering Orders table
    db.run(`CREATE TABLE IF NOT EXISTS catering_orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      status TEXT, -- 'Pending', 'Paid', 'Cancelled'
      total_price REAL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )`);

    // Catering Order Items table
    db.run(`CREATE TABLE IF NOT EXISTS catering_order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER,
      item_id INTEGER,
      item_name TEXT,
      price REAL,
      quantity INTEGER,
      FOREIGN KEY(order_id) REFERENCES catering_orders(id),
      FOREIGN KEY(item_id) REFERENCES catering_items(id)
    )`);
    
    seedData();
  });
}

function seedData() {
  // Seed Catering Brands
  const brands = [
    { name: '永和大王', logo_url: './assets/profile-and-catering/Food-永和大王.jpg' },
    { name: '老娘舅', logo_url: './assets/profile-and-catering/Food-老娘舅.jpg' },
    { name: '麦当劳', logo_url: './assets/profile-and-catering/Food-麦当劳.jpg' },
    { name: '康师傅', logo_url: './assets/profile-and-catering/Food-康师傅.jpg' },
    { name: '德克士', logo_url: './assets/profile-and-catering/Food-德克士.jpg' },
    { name: '真功夫', logo_url: './assets/profile-and-catering/Food-真功夫.jpg' }
  ];
  
  const brandStmt = db.prepare("INSERT OR IGNORE INTO catering_brands (name, logo_url) VALUES (?, ?)");
  brands.forEach(b => {
    brandStmt.run(b.name, b.logo_url);
  });
  brandStmt.finalize();

  // Seed Self-Operated Items
   const selfItems = [
     { name: '列车自营商品-15元', price: 15, type: 'SELF_OPERATED', image_url: './assets/profile-and-catering/Food-列车自营商品-15元.jpg' },
     { name: '列车自营商品-30元', price: 30, type: 'SELF_OPERATED', image_url: './assets/profile-and-catering/Food-列车自营商品-30元.jpg' },
     { name: '列车自营商品-40元', price: 40, type: 'SELF_OPERATED', image_url: './assets/profile-and-catering/Food-列车自营商品-40元.jpg' }
   ];
 
   db.serialize(() => {
     const itemStmt = db.prepare("INSERT INTO catering_items (name, price, type, image_url) SELECT ?, ?, ?, ? WHERE NOT EXISTS (SELECT 1 FROM catering_items WHERE name = ?)");
     selfItems.forEach(i => {
       itemStmt.run(i.name, i.price, i.type, i.image_url, i.name);
     });
     itemStmt.finalize();
   });

  // Seed Stations
  const stations = [
    { name: '北京南', code: 'VNP', city: '北京' },
    { name: '北京', code: 'BJP', city: '北京' },
    { name: '北京北', code: 'VAP', city: '北京' },
    { name: '上海南', code: 'SNH', city: '上海' },
    { name: '上海', code: 'SHH', city: '上海' },
    { name: '上海虹桥', code: 'AOH', city: '上海' },
    { name: '南京南', code: 'NKH', city: '南京' },
    { name: '南京东', code: 'NDH', city: '南京' }
  ];
  
  const stmt = db.prepare("INSERT OR IGNORE INTO stations (name, code, city_name) VALUES (?, ?, ?)");
  stations.forEach(s => {
    stmt.run(s.name, s.code, s.city);
  });
  stmt.finalize();

  // Seed Trains
  // We need 42 trains total.
  // Beijing -> Shanghai (7)
  // Shanghai -> Beijing (7)
  // Beijing -> Nanjing (7)
  // Nanjing -> Beijing (7)
  // Shanghai -> Nanjing (7)
  // Nanjing -> Shanghai (7)
  
  const routes = [
    { start: '北京南', end: '上海虹桥', prefix: 'G', startNum: 1, count: 7 },
    { start: '上海虹桥', end: '北京南', prefix: 'G', startNum: 2, count: 7 },
    { start: '北京南', end: '南京南', prefix: 'G', startNum: 15, count: 7 },
    { start: '南京南', end: '北京南', prefix: 'G', startNum: 16, count: 7 },
    { start: '上海虹桥', end: '南京南', prefix: 'G', startNum: 29, count: 7 },
    { start: '南京南', end: '上海虹桥', prefix: 'G', startNum: 30, count: 7 }
  ];

  const trainStmt = db.prepare(`INSERT OR IGNORE INTO trains (train_number, start_station, end_station, start_time, end_time, duration) VALUES (?, ?, ?, ?, ?, ?)`);

  routes.forEach(route => {
    for (let i = 0; i < route.count; i++) {
      const num = route.startNum + (i * 2); 
      const trainNum = `${route.prefix}${num}`;
      const startTime = '08:00';
      const endTime = '12:00';
      const duration = '4h';
      
      trainStmt.run(trainNum, route.start, route.end, startTime, endTime, duration);
    }
  });
  trainStmt.finalize((err) => {
      if(err) console.error("Error seeding trains", err);
      else console.log("Database tables and seed data initialized.");
  });
}

module.exports = db;
