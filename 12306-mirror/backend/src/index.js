const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./database/init_db');
const authRoutes = require('./routes/auth');
const ticketRoutes = require('./routes/tickets');
const userRoutes = require('./routes/users');
const passengerRoutes = require('./routes/passengers');
const orderRoutes = require('./routes/orders');
const cateringRoutes = require('./routes/catering');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/users', userRoutes);
app.use('/api/passengers', passengerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/catering', cateringRoutes);

app.get('/', (req, res) => {
  res.json({ code: 200, message: 'Backend Ready' });
});

 
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Backend listening at http://localhost:${port}`);
  });
}

module.exports = app;
