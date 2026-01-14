const express = require('express');
const router = express.Router();
const db = require('../database/init_db');

// POST /api/auth/register
router.post('/register', (req, res) => {
  const { username, password, idType, idCard, realName, phone, userType, email } = req.body;

  // Basic validation
  if (!username || !password || !idType || !idCard || !realName || !phone || !userType) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  // Check if username already exists
  const checkSql = "SELECT id FROM users WHERE username = ?";
  db.get(checkSql, [username], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (row) {
      return res.status(409).json({ message: 'Username already exists' });
    }

    // Insert new user
    const insertSql = `INSERT INTO users (username, password, id_type, id_card, real_name, phone, type) 
                       VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const params = [username, password, idType, idCard, realName, phone, userType];

    db.run(insertSql, params, function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(200).json({
        id: this.lastID,
        username: username,
        userType: userType
      });
    });
  });
});

module.exports = router;
