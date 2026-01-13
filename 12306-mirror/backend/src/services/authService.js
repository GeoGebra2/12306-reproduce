const db = require('../database/init_db');

const AuthService = {
  // 注册新用户
  async register(userData) {
    const { username, password, real_name, id_type, id_card, phone, email, type } = userData;

    // Basic Validation
    if (!username || !password || !id_card || !real_name) {
      throw new Error('Missing required fields');
    }

    return new Promise((resolve, reject) => {
      const sql = `INSERT INTO users (username, password, real_name, id_type, id_card, phone, email, type) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
      const params = [username, password, real_name, id_type, id_card, phone, email, type];

      db.run(sql, params, function(err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            reject(new Error('Username or ID Card already exists'));
          } else {
            reject(err);
          }
        } else {
          resolve({ 
            success: true, 
            user: { id: this.lastID, username, real_name } 
          });
        }
      });
    });
  },

  // 用户登录
  async login(username, password) {
    if (!username || !password) {
      throw new Error('Username and password are required');
    }

    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM users WHERE username = ? OR email = ? OR phone = ?`;
      db.get(sql, [username, username, username], (err, row) => {
        if (err) {
          reject(err);
        } else if (!row) {
          reject(new Error('User not found'));
        } else {
          if (row.password === password) {
            resolve({
              success: true,
              user: {
                id: row.id,
                username: row.username,
                real_name: row.real_name,
                type: row.type
              }
            });
          } else {
            reject(new Error('Invalid password'));
          }
        }
      });
    });
  }
};

module.exports = AuthService;
