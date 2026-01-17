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
    if (status === 'History') {
      query += " AND (status = 'Cancelled' OR status = 'Completed')";
    } else {
      query += ' AND status = ?';
      params.push(status);
    }
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

// POST /api/orders
// Create a new order
router.post('/', requireAuth, (req, res) => {
  console.log('Received Order Request:', req.body);
  const { train_number, departure, arrival, departure_time, arrival_time, passengers } = req.body;
  
  if (!passengers || passengers.length === 0) {
    console.error('Order creation failed: No passengers');
    return res.status(400).json({ success: false, message: 'No passengers provided' });
  }

  // Calculate total price (Mock logic)
  let totalPrice = 0;
  passengers.forEach(p => {
    if (p.seat_type === '商务座') totalPrice += 300;
    else if (p.seat_type === '一等座') totalPrice += 200;
    else totalPrice += 100; // Second class default
  });

  const insertOrderSql = `INSERT INTO orders (user_id, status, total_price) VALUES (?, ?, ?)`;
  
  db.run(insertOrderSql, [req.userId, 'Unpaid', totalPrice], function(err) {
    if (err) {
      console.error('Order insert failed:', err);
      return res.status(500).json({ success: false, message: 'Failed to create order' });
    }
    
    const orderId = this.lastID;
    console.log('Order created with ID:', orderId);

    const insertItemSql = `INSERT INTO order_items 
      (order_id, passenger_id, passenger_name, train_number, departure, arrival, departure_time, seat_type, price) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const stmt = db.prepare(insertItemSql);
    let errorOccurred = false;

    passengers.forEach(p => {
      let price = 100;
      if (p.seat_type === '商务座') price = 300;
      else if (p.seat_type === '一等座') price = 200;

      stmt.run(
        orderId, 
        p.id || 0, // passenger_id might be null if manually entered
        p.name, 
        train_number, 
        departure, 
        arrival, 
        departure_time, 
        p.seat_type, 
        price,
        (err) => {
          if (err) {
            console.error('Order item insert failed:', err);
            errorOccurred = true;
          }
        }
      );
    });

    stmt.finalize(() => {
      if (errorOccurred) {
        return res.status(500).json({ success: false, message: 'Failed to create order items' });
      }
      res.json({ success: true, orderId: orderId });
    });
  });
});

// POST /api/orders/:orderId/cancel
// Cancel an order
router.post('/:orderId/cancel', requireAuth, (req, res) => {
  const { orderId } = req.params;
  
  db.get('SELECT * FROM orders WHERE id = ? AND user_id = ?', [orderId, req.userId], (err, order) => {
    if (err) return res.status(500).json({ success: false, message: 'Database error' });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    
    if (order.status !== 'Unpaid') {
      return res.status(400).json({ success: false, message: 'Only unpaid orders can be cancelled' });
    }
    
    db.run('UPDATE orders SET status = ? WHERE id = ?', ['Cancelled', orderId], (err) => {
      if (err) return res.status(500).json({ success: false, message: 'Failed to cancel order' });
      res.json({ success: true, message: 'Order cancelled successfully' });
    });
  });
});

// GET /api/orders/:orderId
router.get('/:orderId', requireAuth, (req, res) => {
  const { orderId } = req.params;
  db.get('SELECT * FROM orders WHERE id = ? AND user_id = ?', [orderId, req.userId], (err, order) => {
    if (err) return res.status(500).json({ success: false, message: 'Database error' });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    
    db.all('SELECT * FROM order_items WHERE order_id = ?', [orderId], (err, items) => {
      if (err) return res.status(500).json({ success: false, message: 'Database error' });
      
      // Enrich order with common info from first item
      if (items.length > 0) {
        order.train_number = items[0].train_number;
        order.departure = items[0].departure;
        order.arrival = items[0].arrival;
        order.departure_time = items[0].departure_time;
      }
      
      res.json({ success: true, data: { ...order, items } });
    });
  });
});

// POST /api/orders/:orderId/pay
router.post('/:orderId/pay', requireAuth, (req, res) => {
  const { orderId } = req.params;
  db.get('SELECT * FROM orders WHERE id = ? AND user_id = ?', [orderId, req.userId], (err, order) => {
    if (err) return res.status(500).json({ success: false, message: 'Database error' });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    
    if (order.status !== 'Unpaid') {
      if (order.status === 'Paid') return res.json({ success: true, message: 'Order already paid' });
      return res.status(400).json({ success: false, message: 'Order status invalid for payment' });
    }
    
    db.run('UPDATE orders SET status = ? WHERE id = ?', ['Paid', orderId], (err) => {
      if (err) return res.status(500).json({ success: false, message: 'Failed to pay order' });
      res.json({ success: true, message: 'Payment successful' });
    });
  });
});

module.exports = router;
