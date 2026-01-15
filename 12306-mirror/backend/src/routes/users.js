const express = require('express');
const router = express.Router();
const db = require('../database/init_db');

// Middleware to get current user from header
const authenticate = (req, res, next) => {
    const userId = req.headers['x-user-id'];
    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    req.userId = userId;
    next();
};

// GET /api/users/me
router.get('/me', authenticate, (req, res) => {
    const sql = "SELECT id, username, real_name, phone, type, id_card FROM users WHERE id = ?";
    db.get(sql, [req.userId], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'User not found' });
        res.json(row);
    });
});

module.exports = router;
