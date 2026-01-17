const express = require('express');
const router = express.Router();
const db = require('../database/init_db');

const requireAuth = (req, res, next) => {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  req.userId = userId;
  next();
};

// GET /api/orders
// Query params: status (0: Unpaid, 1: Paid/Upcoming, 2: Historical/Completed/Cancelled) - aligning with 12306 tabs
// For now, we just return all or filter by status string if provided.
router.get('/', requireAuth, (req, res) => {
  const { status } = req.query;
  let query = 'SELECT * FROM orders WHERE user_id = ?';
  const params = [req.userId];

  if (status) {
    query += ' AND status = ?';
    params.push(status);
  }
  
  query += ' ORDER BY created_at DESC';

  db.all(query, params, (err, orders) => {
    if (err) return res.status(500).json({ success: false, message: 'Database error' });
    
    // For each order, get items. This is N+1 but simple for now. 
    // Or we can use a JOIN or separate query.
    // Let's do a separate query or promise.all
    
    if (orders.length === 0) {
      return res.json({ success: true, data: [] });
    }

    const orderPromises = orders.map(order => {
      return new Promise((resolve, reject) => {
        db.all('SELECT * FROM order_items WHERE order_id = ?', [order.id], (err, items) => {
          if (err) resolve({ ...order, items: [] });
          else resolve({ ...order, items });
        });
      });
    });

    Promise.all(orderPromises).then(results => {
      res.json({ success: true, data: results });
    });
  });
});

module.exports = router;
