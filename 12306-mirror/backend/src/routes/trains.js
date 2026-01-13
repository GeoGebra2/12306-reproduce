const express = require('express');
const router = express.Router();

// Mock data
const mockTrains = [
    {
        trainNumber: 'G1',
        fromStation: '北京南',
        toStation: '上海虹桥',
        departureTime: '09:00',
        arrivalTime: '13:30',
        duration: '04:30',
        tickets: {
            '商务座': { price: 2398, count: 5 },
            '一等座': { price: 1098, count: 12 },
            '二等座': { price: 668, count: 99 }
        }
    },
    {
        trainNumber: 'G3',
        fromStation: '北京南',
        toStation: '上海虹桥',
        departureTime: '10:00',
        arrivalTime: '14:30',
        duration: '04:30',
        tickets: {
            '商务座': { price: 2398, count: 0 },
            '一等座': { price: 1098, count: 2 },
            '二等座': { price: 668, count: 15 }
        }
    },
    {
        trainNumber: 'G101',
        fromStation: '北京南',
        toStation: '上海虹桥',
        departureTime: '12:30',
        arrivalTime: '18:10',
        duration: '05:40',
        tickets: {
            '商务座': { price: 1998, count: 10 },
            '一等座': { price: 998, count: 50 },
            '二等座': { price: 598, count: 200 }
        }
    },
    {
        trainNumber: 'D701',
        fromStation: '北京',
        toStation: '上海',
        departureTime: '19:30',
        arrivalTime: '07:30',
        duration: '12:00',
        tickets: {
            '软卧': { price: 600, count: 8 },
            '硬卧': { price: 400, count: 20 },
            '硬座': { price: 200, count: 0 }
        }
    },
    {
        trainNumber: 'K505',
        fromStation: '北京西',
        toStation: '上海',
        departureTime: '15:00',
        arrivalTime: '10:00',
        duration: '19:00',
        tickets: {
            '硬卧': { price: 320, count: 0 },
            '硬座': { price: 180, count: 50 },
            '无座': { price: 180, count: 20 }
        }
    }
];

// GET /api/trains
router.get('/', (req, res) => {
    const { from, to, date } = req.query;

    if (!from || !to || !date) {
        return res.status(400).json({ error: 'Missing required parameters: from, to, date' });
    }

    // In a real app, we would query the database based on these params.
    // For now, we return the mock data, optionally filtering by station names loosely if we wanted.
    // Let's just return all mock trains to simulate a successful search for any route.
    // Or we could return empty if from/to doesn't match roughly.
    
    // Simple simulation: always return data with a slight delay
    setTimeout(() => {
        res.json(mockTrains);
    }, 500);
});

module.exports = router;
