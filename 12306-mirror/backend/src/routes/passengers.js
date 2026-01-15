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

// GET /api/passengers - List passengers for current user
router.get('/', authenticate, (req, res) => {
    const sql = "SELECT * FROM passengers WHERE user_id = ?";
    db.all(sql, [req.userId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// POST /api/passengers - Add passenger
router.post('/', authenticate, (req, res) => {
    const { name, type, idType, idCard, phone } = req.body;
    if (!name || !idCard || !phone) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const sql = `INSERT INTO passengers (user_id, name, type, id_type, id_card, phone) 
                 VALUES (?, ?, ?, ?, ?, ?)`;
    const params = [req.userId, name, type || '成人', idType || '1', idCard, phone];

    db.run(sql, params, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({
            id: this.lastID,
            user_id: req.userId,
            name, type, idType, idCard, phone
        });
    });
});

// DELETE /api/passengers/:id - Delete passenger
router.delete('/:id', authenticate, (req, res) => {
    const { id } = req.params;
    const sql = "DELETE FROM passengers WHERE id = ? AND user_id = ?";
    db.run(sql, [id, req.userId], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'Passenger not found or not authorized' });
        res.json({ message: 'Deleted successfully' });
    });
});

module.exports = router;
