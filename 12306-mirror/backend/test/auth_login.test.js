import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/index';
import db from '../src/database/init_db';
import bcrypt from 'bcryptjs';

describe('User Login API', () => {
  beforeEach(async () => {
    // Clean up users table
    await new Promise((resolve) => {
        db.run("DELETE FROM users WHERE username = 'loginuser'", resolve);
    });
    
    // Create a user with hashed password
    const hashedPassword = await bcrypt.hash('password123', 10);
    await new Promise((resolve) => {
        db.run(`INSERT INTO users (username, password, id_type, id_card, real_name, phone, type) 
                VALUES ('loginuser', '${hashedPassword}', '1', '110101199001015678', 'Login User', '13900139001', 'ADULT')`, resolve);
    });
  });

  it('should login successfully with correct credentials', async () => {
    const res = await request(app)
      .post('/api/users/login')
      .send({
        username: 'loginuser',
        password: 'password123'
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toHaveProperty('username', 'loginuser');
  });

  it('should fail with incorrect password', async () => {
    const res = await request(app)
      .post('/api/users/login')
      .send({
        username: 'loginuser',
        password: 'wrongpassword'
      });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('success', false);
  });

  it('should fail with non-existent user', async () => {
    const res = await request(app)
      .post('/api/users/login')
      .send({
        username: 'nonexistent',
        password: 'password123'
      });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('success', false);
  });
});
