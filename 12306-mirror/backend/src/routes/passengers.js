const express = require('express');
const router = express.Router();
const db = require('../database/init_db');

// Middleware to check authentication (x-user-id)
const requireAuth = (req, res, next) => {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  req.userId = userId;
  next();
};

// GET /api/passengers - List passengers
router.get('/', requireAuth, (req, res) => {
  const query = 'SELECT * FROM passengers WHERE user_id = ?';
  db.all(query, [req.userId], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    res.json({ success: true, data: rows });
  });
});

// POST /api/passengers - Add passenger
router.post('/', requireAuth, (req, res) => {
  const { name, id_type, id_card, phone, type } = req.body;
  
  if (!name || !id_card || !phone) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  const query = `INSERT INTO passengers (user_id, name, id_type, id_card, phone, type) VALUES (?, ?, ?, ?, ?, ?)`;
  
  db.run(query, [req.userId, name, id_type || '身份证', id_card, phone, type || '成人'], function(err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    res.status(201).json({
      success: true,
      data: {
        id: this.lastID,
        user_id: req.userId,
        name,
        id_type: id_type || '身份证',
        id_card,
        phone,
        type: type || '成人'
      }
    });
  });
});

// DELETE /api/passengers/:id - Delete passenger
router.delete('/:id', requireAuth, (req, res) => {
  const passengerId = req.params.id;
  
  // Ensure the passenger belongs to the user
  const query = 'DELETE FROM passengers WHERE id = ? AND user_id = ?';
  
  db.run(query, [passengerId, req.userId], function(err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ success: false, message: 'Passenger not found or unauthorized' });
    }
    res.json({ success: true, message: 'Passenger deleted' });
  });
});

module.exports = router;
