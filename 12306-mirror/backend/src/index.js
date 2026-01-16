const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

 
const userRoutes = require('./routes/users');

app.use(cors());
app.use(bodyParser.json());

app.use('/api/users', userRoutes);

 
require('./database/init_db');

 
app.get('/', (req, res) => {
  res.json({ code: 200, message: 'Backend Ready' });
});

 
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Backend listening at http://localhost:${port}`);
  });
}

module.exports = app;
