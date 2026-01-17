const express = require('express');
const router = express.Router();
const db = require('../database/init_db');

// GET /api/catering/brands
router.get('/brands', (req, res) => {
  db.all('SELECT * FROM catering_brands', (err, rows) => {
    if (err) {
      console.error('Error fetching brands:', err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    res.json({ success: true, data: rows });
  });
});

// GET /api/catering/items
router.get('/items', (req, res) => {
  const { type, brand_id } = req.query;
  let sql = 'SELECT * FROM catering_items WHERE 1=1';
  const params = [];

  if (type) {
    sql += ' AND type = ?';
    params.push(type);
  }

  if (brand_id) {
    sql += ' AND brand_id = ?';
    params.push(brand_id);
  }

  db.all(sql, params, (err, rows) => {
    if (err) {
      console.error('Error fetching items:', err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    res.json({ success: true, data: rows });
  });
});

module.exports = router;
