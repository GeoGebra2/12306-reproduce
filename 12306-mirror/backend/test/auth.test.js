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

  it('should login successfully with correct credentials', async () => {
    // 1. Register a user
    await request(app)
      .post('/api/auth/register')
      .send({
        username: 'loginuser',
        password: 'password123',
        idType: '1',
        idCard: '110101199001019999',
        realName: 'Login User',
        phone: '13900139000',
        userType: 'passenger'
      });

    // 2. Login
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'loginuser',
        password: 'password123'
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id');
    expect(res.body.username).toBe('loginuser');
  });

  it('should fail login with incorrect password', async () => {
    // 1. Register
    await request(app)
      .post('/api/auth/register')
      .send({
        username: 'loginuser2',
        password: 'password123',
        idType: '1',
        idCard: '110101199001018888',
        realName: 'Login User 2',
        phone: '13900139002',
        userType: 'passenger'
      });

    // 2. Login with wrong password
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'loginuser2',
        password: 'wrongpassword'
      });

    expect(res.status).toBe(401);
  });

  it('should fail login with non-existent user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'nonexistent',
        password: 'password123'
      });

    expect(res.status).toBe(401); // Or 404, but 401 is safer for security
  });
});
