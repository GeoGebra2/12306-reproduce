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
        
        // Enhance rows with mock ticket info
        const enhancedRows = rows.map(train => {
            return {
                ...train,
                tickets: generateMockTickets(train.train_number)
            };
        });

        res.json(enhancedRows);
    });
});

function generateMockTickets(trainNumber) {
    const type = trainNumber.charAt(0).toUpperCase();
    const tickets = [];

    if (['G', 'C'].includes(type)) {
        tickets.push({ seat_type: '商务座', price: 1748, count: Math.floor(Math.random() * 5) });
        tickets.push({ seat_type: '一等座', price: 933, count: Math.floor(Math.random() * 20) });
        tickets.push({ seat_type: '二等座', price: 553, count: Math.floor(Math.random() * 100) });
    } else if (['D'].includes(type)) {
        tickets.push({ seat_type: '一等卧', price: 370, count: Math.floor(Math.random() * 10) });
        tickets.push({ seat_type: '二等卧', price: 280, count: Math.floor(Math.random() * 20) });
        tickets.push({ seat_type: '二等座', price: 220, count: Math.floor(Math.random() * 100) });
        tickets.push({ seat_type: '无座', price: 220, count: Math.floor(Math.random() * 50) });
    } else if (['Z', 'T', 'K'].includes(type)) {
        tickets.push({ seat_type: '软卧', price: 400, count: Math.floor(Math.random() * 10) });
        tickets.push({ seat_type: '硬卧', price: 260, count: Math.floor(Math.random() * 30) });
        tickets.push({ seat_type: '硬座', price: 150, count: Math.floor(Math.random() * 100) });
        tickets.push({ seat_type: '无座', price: 150, count: Math.floor(Math.random() * 50) });
    } else {
         // Default for others
        tickets.push({ seat_type: '硬座', price: 50, count: Math.floor(Math.random() * 50) });
    }
    
    return tickets;
}

module.exports = router;