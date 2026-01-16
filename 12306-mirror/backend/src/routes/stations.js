const express = require('express');
const router = express.Router();
const db = require('../database/init_db');

router.get('/', (req, res) => {
  const { q } = req.query;
  let sql = 'SELECT * FROM stations';
  let params = [];

  if (q) {
    sql += ' WHERE name LIKE ? OR code LIKE ? OR city_name LIKE ?';
    const likeQ = `%${q}%`;
    params = [likeQ, likeQ, likeQ];
  }

  db.all(sql, params, (err, rows) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

module.exports = router;
