const express = require('express');
const router = express.Router();
const db = require('../database/init_db');

// Middleware to simulate authentication
const requireAuth = (req, res, next) => {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  req.userId = userId;
  next();
};

// GET /api/addresses - List all addresses for user
router.get('/', requireAuth, (req, res) => {
  const query = 'SELECT * FROM addresses WHERE user_id = ? ORDER BY created_at DESC';
  db.all(query, [req.userId], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    res.json({ success: true, data: rows });
  });
});

// POST /api/addresses - Add new address
router.post('/', requireAuth, (req, res) => {
  const { receiver_name, phone, province, city, district, detail_address } = req.body;
  
  if (!receiver_name || !phone || !province || !city || !district || !detail_address) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  const query = `INSERT INTO addresses (user_id, receiver_name, phone, province, city, district, detail_address) VALUES (?, ?, ?, ?, ?, ?, ?)`;
  
  db.run(query, [req.userId, receiver_name, phone, province, city, district, detail_address], function(err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    res.status(201).json({
      success: true,
      data: {
        id: this.lastID,
        user_id: req.userId,
        receiver_name,
        phone,
        province,
        city,
        district,
        detail_address
      }
    });
  });
});

// DELETE /api/addresses/:id - Delete address
router.delete('/:id', requireAuth, (req, res) => {
  const addressId = req.params.id;
  const query = 'DELETE FROM addresses WHERE id = ? AND user_id = ?';
  
  db.run(query, [addressId, req.userId], function(err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ success: false, message: 'Address not found or unauthorized' });
    }
    res.json({ success: true, message: 'Address deleted' });
  });
});

module.exports = router;
