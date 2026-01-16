import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import app from '../src/index';
import db from '../src/database/init_db';

describe('User Registration API', () => {
  beforeEach(async () => {
    // Clean up users table
    await new Promise((resolve) => {
        db.run("DELETE FROM users WHERE username = 'testuser'", resolve);
    });
  });

  it('should register a new user successfully', async () => {
    const res = await request(app)
      .post('/api/users/register')
      .send({
        username: 'testuser',
        password: 'password123',
        id_type: '1',
        id_card: '110101199001011234',
        real_name: 'Test User',
        phone: '13800138000',
        user_type: 'ADULT',
        email: 'test@example.com'
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('message');
  });

  it('should fail if username already exists', async () => {
    // Insert a user first
     await new Promise((resolve) => {
        db.run(`INSERT INTO users (username, password, id_type, id_card, real_name, phone, type) 
                VALUES ('testuser', 'pwd', '1', '123', 'Name', '12345678901', 'ADULT')`, resolve);
    });

    const res = await request(app)
      .post('/api/users/register')
      .send({
        username: 'testuser',
        password: 'newpassword',
        id_type: '1',
        id_card: '110101199001019999',
        real_name: 'Test User 2',
        phone: '13900139000',
        user_type: 'ADULT'
      });

    expect(res.status).toBe(409); // Conflict
    expect(res.body).toHaveProperty('success', false);
  });
});
