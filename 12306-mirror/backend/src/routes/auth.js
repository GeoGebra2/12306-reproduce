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

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Missing credentials' });
  }

  const sql = "SELECT id, username, type, real_name FROM users WHERE username = ? AND password = ?";
  db.get(sql, [username, password], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }
    
    // Login successful
    res.status(200).json(row);
  });
});

// POST /api/auth/check-user
router.post('/check-user', (req, res) => {
  const { username } = req.body;
  
  if (!username) {
    return res.status(400).json({ message: 'Username is required' });
  }

  const sql = "SELECT id, username FROM users WHERE username = ? OR phone = ?";
  // Currently we only have username/phone stored in specific columns.
  
  db.get(sql, [username, username], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (row) {
      return res.status(200).json({ exists: true, userId: row.id, username: row.username });
    } else {
      return res.status(404).json({ message: 'User not found' });
    }
  });
});

// POST /api/auth/verify-code
router.post('/verify-code', (req, res) => {
  const { username, code } = req.body;
  if (!username || !code) {
    return res.status(400).json({ message: 'Missing parameters' });
  }
  
  // Mock verification
  if (code === '123456') {
    return res.status(200).json({ verified: true });
  } else {
    return res.status(400).json({ message: '验证码错误' });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', (req, res) => {
  const { username, newPassword } = req.body;
  if (!username || !newPassword) {
    return res.status(400).json({ message: 'Missing parameters' });
  }

  const sql = "UPDATE users SET password = ? WHERE username = ?";
  db.run(sql, [newPassword, username], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ success: true });
  });
});

module.exports = router;
