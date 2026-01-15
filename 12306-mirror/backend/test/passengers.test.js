import request from 'supertest';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
// We need to use require for CJS modules if we want to ensure correct interop or just rely on vitest magic.
// Let's stick to import as seen in tickets.test.js
import app from '../src/index'; 
import db from '../src/database/init_db';

describe('Passenger Management API', () => {
  let userId;
  let testUser = {
    username: 'test_passenger_user_' + Date.now(),
    password: 'password123',
    idType: '1',
    idCard: '11010119900101' + Math.floor(Math.random() * 1000),
    realName: 'Test User',
    phone: '13800138000',
    userType: '1'
  };

  beforeAll(async () => {
    // Wait for DB initialization
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Register a user to get an ID
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);
    
    if (res.status !== 200) {
        console.error('Registration failed:', res.body);
    }
    userId = res.body.id;
  });

  afterAll(async () => {
    // Cleanup
    if (userId) {
        await new Promise((resolve, reject) => {
             db.run('DELETE FROM passengers WHERE user_id = ?', [userId], (err) => {
                if (err) reject(err);
                else resolve();
             });
        });
        await new Promise((resolve, reject) => {
             db.run('DELETE FROM users WHERE id = ?', [userId], (err) => {
                if (err) reject(err);
                else resolve();
             });
        });
    }
  });

  describe('GET /api/users/me', () => {
    it('should return user info', async () => {
        const res = await request(app)
            .get('/api/users/me')
            .set('x-user-id', userId);
        
        expect(res.status).toBe(200);
        expect(res.body.username).toBe(testUser.username);
        expect(res.body.real_name).toBe(testUser.realName);
        expect(res.body.phone).toBe(testUser.phone);
    });

    it('should return 401 if not authenticated', async () => {
        const res = await request(app).get('/api/users/me');
        expect(res.status).toBe(401);
    });
  });

  describe('Passenger Operations', () => {
    let passengerId;
    const passengerData = {
        name: 'Passenger 1',
        type: '成人',
        idType: '1',
        idCard: '110101199001011234',
        phone: '13900139000'
    };

    it('POST /api/passengers should add a passenger', async () => {
        const res = await request(app)
            .post('/api/passengers')
            .set('x-user-id', userId)
            .send(passengerData);
        
        expect(res.status).toBe(201);
        expect(res.body.id).toBeDefined();
        passengerId = res.body.id;
    });

    it('GET /api/passengers should list passengers', async () => {
        const res = await request(app)
            .get('/api/passengers')
            .set('x-user-id', userId);
        
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
        expect(res.body[0].name).toBe(passengerData.name);
    });

    it('DELETE /api/passengers/:id should delete a passenger', async () => {
        const res = await request(app)
            .delete(`/api/passengers/${passengerId}`)
            .set('x-user-id', userId);
        
        expect(res.status).toBe(200);

        // Verify deletion
        const checkRes = await request(app)
            .get('/api/passengers')
            .set('x-user-id', userId);
        expect(checkRes.body.find(p => p.id === passengerId)).toBeUndefined();
    });
  });
});
