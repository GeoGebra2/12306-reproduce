const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

 
const userRoutes = require('./routes/users');
const stationRoutes = require('./routes/stations');
const ticketRoutes = require('./routes/tickets');
const passengerRoutes = require('./routes/passengers');
const addressRoutes = require('./routes/address');

app.use(cors());
app.use(bodyParser.json());

app.use('/api/users', userRoutes);
app.use('/api/stations', stationRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/passengers', passengerRoutes);
app.use('/api/addresses', addressRoutes);

 
require('./database/init_db');

 
app.get('/', (req, res) => {
  res.json({ code: 200, message: 'Backend Ready' });
});

app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ success: false, message: 'Internal Server Error', error: err.message });
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Backend listening at http://localhost:${port}`);
  });
}

module.exports = app;
