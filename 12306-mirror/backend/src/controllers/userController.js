const db = require('../database/init_db');

exports.register = (req, res) => {
  const { username, password, id_type, id_card, real_name, phone, user_type, email } = req.body;

  // Basic validation (can be expanded)
  if (!username || !password || !id_card || !real_name || !phone) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  const sql = `INSERT INTO users (username, password, id_type, id_card, real_name, phone, type) VALUES (?, ?, ?, ?, ?, ?, ?)`;
  const params = [username, password, id_type, id_card, real_name, phone, user_type || 'ADULT'];

  db.run(sql, params, function(err) {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(409).json({ success: false, message: 'Username already exists' });
      }
      return res.status(500).json({ success: false, message: err.message });
    }
    res.status(201).json({ success: true, message: 'User registered successfully', userId: this.lastID });
  });
};
