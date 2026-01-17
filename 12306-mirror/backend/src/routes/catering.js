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
    if (err) return res.status(500).json({ success: false, message: 'Database error' });
    res.json({ success: true, data: rows });
  });
});

// POST /api/catering/orders
router.post('/orders', (req, res) => {
  const userId = req.headers['x-user-id'];
  const { items } = req.body; // items: [{ id, quantity }]

  if (!userId) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, message: 'Invalid items' });
  }

  // Calculate total price and verify items exist
  // For simplicity, we trust client price or fetch prices. 
  // Let's fetch prices first.
  const itemIds = items.map(i => i.id);
  const placeholders = itemIds.map(() => '?').join(',');
  
  db.all(`SELECT * FROM catering_items WHERE id IN (${placeholders})`, itemIds, (err, dbItems) => {
    if (err) return res.status(500).json({ success: false, message: 'Database error' });

    let totalPrice = 0;
    const orderItems = [];

    items.forEach(item => {
      const dbItem = dbItems.find(d => d.id === item.id);
      if (dbItem) {
        totalPrice += dbItem.price * item.quantity;
        orderItems.push({
          item_id: item.id,
          item_name: dbItem.name,
          price: dbItem.price,
          quantity: item.quantity
        });
      }
    });

    // Start Transaction (using serialize)
    db.serialize(() => {
      db.run('BEGIN TRANSACTION');

      db.run(
        'INSERT INTO catering_orders (user_id, status, total_price) VALUES (?, ?, ?)',
        [userId, 'Pending', totalPrice],
        function(err) {
          if (err) {
            db.run('ROLLBACK');
            return res.status(500).json({ success: false, message: 'Failed to create order' });
          }

          const orderId = this.lastID;
          const stmt = db.prepare('INSERT INTO catering_order_items (order_id, item_id, item_name, price, quantity) VALUES (?, ?, ?, ?, ?)');

          orderItems.forEach(oi => {
            stmt.run(orderId, oi.item_id, oi.item_name, oi.price, oi.quantity);
          });

          stmt.finalize((err) => {
            if (err) {
              db.run('ROLLBACK');
              return res.status(500).json({ success: false, message: 'Failed to create order items' });
            }

            db.run('COMMIT', (err) => {
              if (err) {
                return res.status(500).json({ success: false, message: 'Failed to commit transaction' });
              }
              res.json({ success: true, message: 'Catering order created successfully', data: { orderId, totalPrice } });
            });
          });
        }
      );
    });
  });
});

module.exports = router;
