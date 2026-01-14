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
            stmt.finalize();
        }
      });
    });
  }
});

module.exports = db;
