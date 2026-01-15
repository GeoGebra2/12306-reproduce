import request from 'supertest';
import { describe, it, expect, beforeAll } from 'vitest';
import app from '../src/index';
import db from '../src/database/init_db';

describe('Users API', () => {
  let userId;
  let authToken; // We might need auth token if we implement auth middleware later. For now, assuming open or mocked auth logic? 
  // Wait, the requirements say "REQ-1-2:SCE-1 (Logged in)". 
  // The current implementation might store session or just rely on simple ID passing for prototype?
  // Looking at auth.js, it returns { id, username ... }. 
  // We probably need to simulate a logged-in state. 
  // Since we haven't implemented JWT or session middleware yet, we might need to pass userId in header or body for now, 
  // OR we should implement a simple middleware. 
  // For TDD, let's assume we pass a header `x-user-id` for simplicity if auth middleware isn't strictly defined yet, 
  // or just use session if we added it. 
  // Checking package.json... no express-session or jsonwebtoken.
  // So likely we need to pass user context somehow. 
  // Let's check auth.js again. It just returns success.
  // I will implement a simple middleware in `index.js` later that reads `x-user-id` for testing purposes, 
  // or simply rely on endpoint taking `userId` parameter for this phase if security isn't the primary focus of this TDD step.
  // However, "Personal Center" implies "My" data. 
  // Let's use `x-user-id` header for identifying the current user in these tests.

  const testUser = {
    username: 'testuser_center',
    password: 'password123',
    idCard: '110101199001015555',
    realName: 'Test Center User',
    phone: '13800138555'
  };

  beforeAll(async () => {
    // Wait for DB
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Register test user
    const res = await request(app).post('/api/auth/register').send({
        ...testUser,
        idType: '1',
        userType: 'passenger'
    });
    // If 409, try login
    if (res.status === 200) {
        userId = res.body.id;
    } else {
        const loginRes = await request(app).post('/api/auth/login').send({
            username: testUser.username,
            password: testUser.password
        });
        userId = loginRes.body.id;
    }
  });

  it('GET /api/users/info should return user info', async () => {
    const res = await request(app)
        .get('/api/users/info')
        .set('x-user-id', userId);
    
    expect(res.status).toBe(200);
    expect(res.body.username).toBe(testUser.username);
    expect(res.body.real_name).toBe(testUser.realName);
  });

  it('POST /api/users/passengers should add a passenger', async () => {
    const passenger = {
        name: 'Passenger 1',
        type: '成人',
        idType: '1',
        idCard: '110101199001016666',
        phone: '13900139666'
    };

    const res = await request(app)
        .post('/api/users/passengers')
        .set('x-user-id', userId)
        .send(passenger);

    expect(res.status).toBe(200); // Or 201
    expect(res.body.id).toBeDefined();
  });

  it('GET /api/users/passengers should list passengers', async () => {
    const res = await request(app)
        .get('/api/users/passengers')
        .set('x-user-id', userId);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].name).toBe('Passenger 1');
  });

  it('DELETE /api/users/passengers/:id should remove passenger', async () => {
    // First get list to find ID
    const listRes = await request(app)
        .get('/api/users/passengers')
        .set('x-user-id', userId);
    
    const passengerId = listRes.body[0].id;

    const delRes = await request(app)
        .delete(`/api/users/passengers/${passengerId}`)
        .set('x-user-id', userId);
    
    expect(delRes.status).toBe(200);

    // Verify removed
    const verifyRes = await request(app)
        .get('/api/users/passengers')
        .set('x-user-id', userId);
    
    expect(verifyRes.body.find(p => p.id === passengerId)).toBeUndefined();
  });
});
