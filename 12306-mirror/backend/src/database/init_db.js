const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Store DB in project root
const dbPath = path.resolve(__dirname, '../../../database.db');
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
    // Users Table (REQ-1)
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT,
      id_type TEXT,
      id_card TEXT UNIQUE,
      real_name TEXT,
      phone TEXT,
      email TEXT,
      type TEXT
    )`);

    // Stations Table (REQ-2)
    db.run(`CREATE TABLE IF NOT EXISTS stations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      code TEXT UNIQUE NOT NULL,
      pinyin TEXT,
      hot INTEGER DEFAULT 0
    )`);

    // Trains Table (REQ-2)
    db.run(`CREATE TABLE IF NOT EXISTS trains (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      train_number TEXT UNIQUE NOT NULL,
      type TEXT NOT NULL
    )`);

    // Train Station Mapping (REQ-2)
    db.run(`CREATE TABLE IF NOT EXISTS train_station_mapping (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      train_id INTEGER NOT NULL,
      station_id INTEGER NOT NULL,
      station_order INTEGER NOT NULL,
      arrival_time TEXT,
      departure_time TEXT,
      stop_duration INTEGER,
      FOREIGN KEY (train_id) REFERENCES trains(id),
      FOREIGN KEY (station_id) REFERENCES stations(id)
    )`);

    seedData();
  });
}

function seedData() {
  db.get("SELECT count(*) as count FROM stations", (err, row) => {
    if (err) return;
    if (row && row.count === 0) {
      console.log("Seeding initial data...");
      const stations = [
        ['北京南', 'VNP', 'beijingnan', 1],
        ['上海虹桥', 'AOH', 'shanghaihongqiao', 1],
        ['南京南', 'NKH', 'nanjingnan', 0],
        ['济南西', 'JGK', 'jinanxi', 0],
        ['天津南', 'TIP', 'tianjinnan', 0],
        ['广州南', 'IZQ', 'guangzhounan', 1],
        ['深圳北', 'IOQ', 'shenzhenbei', 1],
        ['成都东', 'ICW', 'chengdudong', 1],
        ['杭州东', 'HGH', 'hangzhoudong', 1],
        ['武汉', 'WHN', 'wuhan', 1]
      ];
      const stmt = db.prepare("INSERT INTO stations (name, code, pinyin, hot) VALUES (?, ?, ?, ?)");
      stations.forEach(s => stmt.run(s));
      stmt.finalize();
      
      const trains = [
         ['G101', 'G'],
         ['G102', 'G']
      ];
      const stmtTrain = db.prepare("INSERT INTO trains (train_number, type) VALUES (?, ?)");
      trains.forEach(t => stmtTrain.run(t));
      stmtTrain.finalize();
      
      // Seed Mapping
      setTimeout(() => {
          db.serialize(() => {
            // G101: Beijing Nan -> Shanghai Hongqiao
            const mappings = [
                ['G101', '北京南', 1, null, '08:00', 0],
                ['G101', '天津南', 2, '08:30', '08:32', 2],
                ['G101', '济南西', 3, '09:30', '09:32', 2],
                ['G101', '南京南', 4, '11:30', '11:32', 2],
                ['G101', '上海虹桥', 5, '13:00', null, 0]
            ];
            
            mappings.forEach(m => {
                 db.run(`INSERT INTO train_station_mapping (train_id, station_id, station_order, arrival_time, departure_time, stop_duration)
                  SELECT t.id, s.id, ?, ?, ?, ? FROM trains t, stations s WHERE t.train_number=? AND s.name=?`, 
                  [m[2], m[3], m[4], m[5], m[0], m[1]]);
            });
          });
      }, 1000);
    }
  });
}

module.exports = db;
