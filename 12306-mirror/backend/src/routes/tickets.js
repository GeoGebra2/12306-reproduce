const express = require('express');
const router = express.Router();
const db = require('../database/init_db');

router.get('/', (req, res) => {
    const { from, to, date } = req.query;

    if (!from || !to) {
        return res.status(400).json({ error: 'Missing from/to parameters' });
    }

    // Basic query matching start/end stations
    // In a real system, we would check if the train stops at 'from' and 'to' and 'from' is before 'to'
    // For this simple seed data, we just check trains table start_station/end_station
    // OR verify if the train has a schedule (train_station_mapping) that covers this route.
    
    // Simplest implementation for seed data:
    const sql = `
        SELECT * FROM trains 
        WHERE start_station = ? AND end_station = ?
    `;
    
    db.all(sql, [from, to], (err, rows) => {
        if (err) {
            console.error('Error querying trains:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(rows);
    });
});

module.exports = router;