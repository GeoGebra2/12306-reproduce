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

          it('should check if user exists (check-user)', async () => {
            // 1. Register
            await request(app)
              .post('/api/auth/register')
              .send({
                username: 'checkuser',
                password: 'password123',
                idType: '1',
                idCard: '110101199001017777',
                realName: 'Check User',
                phone: '13900139007',
                userType: 'passenger'
              });

            // 2. Check existing user
            const res = await request(app)
              .post('/api/auth/check-user')
              .send({ username: 'checkuser' });
            
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('exists', true);
            expect(res.body).toHaveProperty('userId');

            // 3. Check non-existing user
            const res2 = await request(app)
              .post('/api/auth/check-user')
              .send({ username: 'nobody' });
            
            expect(res2.status).toBe(404);
            expect(res2.body).toHaveProperty('message', 'User not found');
          });

          it('should verify SMS code (verify-code)', async () => {
            // 1. Verify correct code
            const res = await request(app)
              .post('/api/auth/verify-code')
              .send({ username: 'checkuser', code: '123456' });
            
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('verified', true);

            // 2. Verify wrong code
            const res2 = await request(app)
              .post('/api/auth/verify-code')
              .send({ username: 'checkuser', code: '000000' });
            
            expect(res2.status).toBe(400);
            expect(res2.body).toHaveProperty('message', '验证码错误');
          });

          it('should reset password successfully', async () => {
            // 0. Register user first (since beforeEach clears DB)
            await request(app)
              .post('/api/auth/register')
              .send({
                username: 'resetuser',
                password: 'password123',
                idType: '1',
                idCard: '110101199001016666',
                realName: 'Reset User',
                phone: '13900139006',
                userType: 'passenger'
              });

            // 1. Reset password
            const res = await request(app)
              .post('/api/auth/reset-password')
              .send({ username: 'resetuser', newPassword: 'newpassword123' });
            
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('success', true);

            // 2. Login with OLD password (should fail)
            const resLoginOld = await request(app)
              .post('/api/auth/login')
              .send({ username: 'resetuser', password: 'password123' });
            
            expect(resLoginOld.status).toBe(401);

            // 3. Login with NEW password (should success)
            const resLoginNew = await request(app)
              .post('/api/auth/login')
              .send({ username: 'resetuser', password: 'newpassword123' });
            
            expect(resLoginNew.status).toBe(200);
          });
        });
