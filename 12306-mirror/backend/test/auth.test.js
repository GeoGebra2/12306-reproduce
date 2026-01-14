import request from 'supertest';
import { describe, it, expect, beforeEach } from 'vitest';
import app from '../src/index';
import db from '../src/database/init_db';

describe('Auth API', () => {
  beforeEach(async () => {
    await new Promise((resolve, reject) => {
      db.run("DELETE FROM users", (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  });

  it('should register a new user successfully', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        password: 'password123',
        idType: '1',
        idCard: '110101199001011234',
        realName: 'Test User',
        phone: '13800138000',
        userType: 'passenger'
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id');
    expect(res.body.username).toBe('testuser');
  });

  it('should fail if username already exists', async () => {
    // Create first user
    await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        password: 'password123',
        idType: '1',
        idCard: '110101199001011234',
        realName: 'Test User',
        phone: '13800138000',
        userType: 'passenger'
      });

    // Try to create same user again
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        password: 'password123',
        idType: '1',
        idCard: '110101199001015678', // Different ID
        realName: 'Test User 2',
        phone: '13800138001',
        userType: 'passenger'
      });

    expect(res.status).toBe(409);
    expect(res.body.message).toMatch(/exists/);
  });
});
