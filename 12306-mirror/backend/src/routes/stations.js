const express = require('express');
const router = express.Router();
const stationService = require('../services/stationService');

router.get('/', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.json([]);
    }
    const stations = await stationService.searchStations(q);
    res.json(stations);
  } catch (err) {
    console.error('Station Search Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
