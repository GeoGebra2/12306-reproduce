const express = require('express');
const router = express.Router();
const db = require('../database/init_db');

const authenticate = (req, res, next) => {
    const userId = req.headers['x-user-id'];
    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    req.userId = userId;
    next();
};

// GET /api/orders - List orders for current user
router.get('/', authenticate, (req, res) => {
    const sql = "SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC";
    db.all(sql, [req.userId], (err, orders) => {
        if (err) return res.status(500).json({ error: err.message });
        
        if (orders.length === 0) return res.json([]);

        // Get items for all orders
        // Simplified: Fetch all items for this user's orders
        const orderIds = orders.map(o => o.id).join(',');
        const itemSql = `SELECT * FROM order_items WHERE order_id IN (${orderIds})`;
        
        db.all(itemSql, [], (err, items) => {
            if (err) return res.status(500).json({ error: err.message });
            
            // Map items to orders
            const result = orders.map(order => ({
                ...order,
                items: items.filter(item => item.order_id === order.id)
            }));
            
            res.json(result);
        });
    });
});

// POST /api/orders - Create order
router.post('/', authenticate, (req, res) => {
    const { trainNumber, departureDate, fromStation, toStation, startTime, endTime, tickets } = req.body;
    
    if (!trainNumber || !tickets || tickets.length === 0) {
        return res.status(400).json({ error: 'Missing order details' });
    }

    const totalPrice = tickets.reduce((sum, t) => sum + (t.price || 0), 0);
    
    // 1. Create Order
    const orderSql = `INSERT INTO orders (user_id, total_price, status) VALUES (?, ?, 'Unpaid')`;
    
    db.run(orderSql, [req.userId, totalPrice], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        
        const orderId = this.lastID;
        
        // 2. Create Items
        // Note: SQLite node driver doesn't support bulk insert easily or transaction block in async style easily without nesting.
        // We will just do sequential inserts for prototype.
        
        const itemSql = `INSERT INTO order_items (
            order_id, passenger_id, passenger_name, train_number, departure_date, 
            from_station, to_station, start_time, end_time, seat_type, price
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        // We need to fetch passenger names if not provided, but usually frontend provides IDs.
        // Let's assume we need to look them up or frontend sends snapshot.
        // Test sends passengerId. We should look up name.
        
        // Helper to insert item
        const insertItem = (ticket) => {
            return new Promise((resolve, reject) => {
                // Look up passenger name first
                db.get("SELECT name FROM passengers WHERE id = ?", [ticket.passengerId], (err, row) => {
                    const pName = row ? row.name : 'Unknown';
                    
                    db.run(itemSql, [
                        orderId, ticket.passengerId, pName, trainNumber, departureDate,
                        fromStation, toStation, startTime, endTime, ticket.seatType, ticket.price
                    ], (err) => {
                        if (err) reject(err);
                        else resolve();
                    });
                });
            });
        };

        Promise.all(tickets.map(insertItem))
            .then(() => {
                res.status(201).json({ id: orderId, status: 'Unpaid', totalPrice });
            })
            .catch(err => {
                res.status(500).json({ error: 'Failed to create order items: ' + err.message });
            });
    });
});

// GET /api/orders/:id - Get specific order details
router.get('/:id', authenticate, (req, res) => {
    const orderId = req.params.id;
    
    const sql = "SELECT * FROM orders WHERE id = ? AND user_id = ?";
    db.get(sql, [orderId, req.userId], (err, order) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!order) return res.status(404).json({ error: 'Order not found' });

        const itemSql = "SELECT * FROM order_items WHERE order_id = ?";
        db.all(itemSql, [orderId], (err, items) => {
            if (err) return res.status(500).json({ error: err.message });
            
            res.json({
                ...order,
                items
            });
        });
    });
});

// POST /api/orders/:id/pay
router.post('/:id/pay', authenticate, (req, res) => {
    const { id } = req.params;
    // Check ownership
    db.get("SELECT id FROM orders WHERE id = ? AND user_id = ?", [id, req.userId], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'Order not found' });

        db.run("UPDATE orders SET status = 'Paid' WHERE id = ?", [id], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ status: 'Paid' });
        });
    });
});

// POST /api/orders/:id/cancel
router.post('/:id/cancel', authenticate, (req, res) => {
    const { id } = req.params;
    // Check ownership
    db.get("SELECT id FROM orders WHERE id = ? AND user_id = ?", [id, req.userId], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'Order not found' });

        db.run("UPDATE orders SET status = 'Cancelled' WHERE id = ?", [id], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ status: 'Cancelled' });
        });
    });
});

module.exports = router;
