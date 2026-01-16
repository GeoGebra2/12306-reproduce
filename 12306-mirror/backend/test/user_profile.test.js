import request from 'supertest';
import app from '../src/index';
import db from '../src/database/init_db';
import { describe, it, expect, beforeEach } from 'vitest';

describe('User Profile API', () => {
  beforeEach(async () => {
    // Clean and seed users table
    await new Promise(resolve => db.run('DELETE FROM users', resolve));
    await new Promise(resolve => {
      db.run(
        `INSERT INTO users (id, username, password, real_name, phone, email, id_type, id_card) 
         VALUES (1, 'testuser', 'hashed_pass', '张三', '13800138000', 'test@example.com', '身份证', '110101199001011234')`,
        resolve
      );
    });
  });

  it('GET /api/users/profile - should return user profile data with x-user-id header', async () => {
    const response = await request(app)
      .get('/api/users/profile')
      .set('x-user-id', '1');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.user).toMatchObject({
      username: 'testuser',
      real_name: '张三',
      phone: '13800138000',
      email: 'test@example.com'
    });
    // Password should not be returned
    expect(response.body.user.password).toBeUndefined();
  });

  it('GET /api/users/profile - should return 401 if x-user-id is missing', async () => {
    const response = await request(app).get('/api/users/profile');
    expect(response.status).toBe(401);
  });
});
