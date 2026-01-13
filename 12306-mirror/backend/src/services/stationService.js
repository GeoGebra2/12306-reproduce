const db = require('../database/init_db');

const stationService = {
  searchStations: async (query) => {
    if (!query) return [];
    
    return new Promise((resolve, reject) => {
      // Search by name (contains) or pinyin (starts with or contains)
      const sql = `
        SELECT * FROM stations 
        WHERE name LIKE ? 
        OR pinyin LIKE ? 
        OR code LIKE ?
        LIMIT 10
      `;
      const searchPattern = `%${query}%`;
      const pinyinPattern = `${query}%`; // Pinyin usually match prefix
      
      db.all(sql, [searchPattern, searchPattern, searchPattern], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }
};

module.exports = stationService;
