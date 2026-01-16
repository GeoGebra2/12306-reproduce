const db = require('../database/init_db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const SECRET_KEY = 'your_secret_key'; // In production, use environment variable

exports.register = async (req, res) => {
  const { username, password, id_type, id_card, real_name, phone, user_type, email } = req.body;

  // Basic validation
  if (!username || !password || !id_card || !real_name || !phone) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = `INSERT INTO users (username, password, id_type, id_card, real_name, phone, email, type) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    const params = [username, hashedPassword, id_type, id_card, real_name, phone, email, user_type || 'ADULT'];

    db.run(sql, params, function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(409).json({ success: false, message: 'Username already exists' });
        }
        return res.status(500).json({ success: false, message: err.message });
      }
      res.status(201).json({ success: true, message: 'User registered successfully', userId: this.lastID });
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.login = (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }

  // Allow login by username, email, or phone
  // Assuming username for now, or check all fields
  const sql = `SELECT * FROM users WHERE username = ? OR phone = ?`;
  
  db.get(sql, [username, username], async (err, user) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    try {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });

      const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '1h' });
      
      res.status(200).json({ 
        success: true, 
        message: 'Login successful', 
        token,
        user: { 
          id: user.id, 
          username: user.username, 
          real_name: user.real_name 
        } 
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  });
};

exports.checkUserExists = (req, res) => {
  const { account } = req.body;
  if (!account) return res.status(400).json({ success: false, message: 'Account is required' });

  const sql = `SELECT * FROM users WHERE username = ? OR phone = ?`;
  db.get(sql, [account, account], (err, user) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
    // Mask phone
    const maskedPhone = user.phone ? user.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') : 'Unknown';
    
    res.json({ success: true, phone: maskedPhone });
  });
};

exports.verifyCode = (req, res) => {
  const { code } = req.body;
  // Mock verification
  if (code === '123456') {
    res.json({ success: true });
  } else {
    res.status(400).json({ success: false, message: 'Invalid code' });
  }
};

exports.resetPassword = async (req, res) => {
  const { account, newPassword } = req.body;
  if (!account || !newPassword) return res.status(400).json({ success: false, message: 'Missing fields' });
  
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  const sql = `UPDATE users SET password = ? WHERE username = ? OR phone = ?`;
  
  db.run(sql, [hashedPassword, account, account], function(err) {
    if (err) return res.status(500).json({ success: false, message: err.message });
    if (this.changes === 0) return res.status(404).json({ success: false, message: 'User not found' });
    
    res.json({ success: true, message: 'Password reset successfully' });
  });
};

exports.getUserProfile = (req, res) => {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const sql = `SELECT id, username, real_name, phone, email, type FROM users WHERE id = ?`;
  db.get(sql, [userId], (err, user) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
    res.json({ success: true, user });
  });
};

