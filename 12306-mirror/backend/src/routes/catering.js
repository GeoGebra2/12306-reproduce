const express = require('express');
const router = express.Router();
const db = require('../database/init_db');

// Middleware to authenticate
const authenticate = (req, res, next) => {
    const userId = req.headers['x-user-id'];
    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    req.userId = userId;
    next();
};

// GET /api/catering/brands
router.get('/brands', (req, res) => {
    db.all("SELECT * FROM catering_brands", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// GET /api/catering/items
// Query params: type (self/brand), brand_id
router.get('/items', (req, res) => {
    const { type, brand_id } = req.query;
    let sql = "SELECT * FROM catering_items WHERE 1=1";
    const params = [];

    if (type) {
        sql += " AND type = ?";
        params.push(type);
    }
    if (brand_id) {
        sql += " AND brand_id = ?";
        params.push(brand_id);
    }

    db.all(sql, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// POST /api/catering/orders
router.post('/orders', authenticate, (req, res) => {
    const { items } = req.body; // items: [{ id, quantity, price }]
    
    if (!items || items.length === 0) {
        return res.status(400).json({ error: 'No items provided' });
    }

    const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const orderSql = "INSERT INTO catering_orders (user_id, total_price, status) VALUES (?, ?, 'Created')";
    
    db.run(orderSql, [req.userId, totalPrice], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        
        const orderId = this.lastID;
        const itemSql = "INSERT INTO catering_order_items (order_id, item_id, quantity, price) VALUES (?, ?, ?, ?)";
        
        // Sequential insert for simplicity
        const insertPromises = items.map(item => {
            return new Promise((resolve, reject) => {
                db.run(itemSql, [orderId, item.id, item.quantity, item.price], (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
        });

        Promise.all(insertPromises)
            .then(() => {
                res.status(201).json({ id: orderId, status: 'Created', totalPrice });
            })
            .catch(err => {
                res.status(500).json({ error: 'Failed to create order items' });
            });
    });
});

module.exports = router;
