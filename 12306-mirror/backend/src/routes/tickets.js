const express = require('express');
const router = express.Router();
const db = require('../database/init_db');

// GET /api/tickets/stations
router.get('/stations', (req, res) => {
    db.all("SELECT * FROM stations", (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// GET /api/tickets/query
router.get('/query', (req, res) => {
    const { from, to, date } = req.query;
    console.log('Query tickets:', { from, to, date });

    if (!from || !to || !date) {
        return res.status(400).json({ error: 'Missing required parameters: from, to, date' });
    }

    // Basic validation passed.
    // Query logic:
    // Find trains that go from 'from' station to 'to' station.
    // Ensure stop_order of from < stop_order of to.
    
    const sql = `
        SELECT 
            t.train_number, 
            t.type,
            m1.departure_time as start_time,
            m2.arrival_time as end_time,
            s1.name as from_station,
            s2.name as to_station
        FROM trains t
        JOIN train_station_mapping m1 ON t.id = m1.train_id
        JOIN stations s1 ON m1.station_id = s1.id
        JOIN train_station_mapping m2 ON t.id = m2.train_id
        JOIN stations s2 ON m2.station_id = s2.id
        WHERE s1.name = ? AND s2.name = ?
          AND m1.stop_order < m2.stop_order
    `;

    db.all(sql, [from, to], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

module.exports = router;
