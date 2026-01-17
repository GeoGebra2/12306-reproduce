import request from 'supertest';
import app from '../src/index';
import db from '../src/database/init_db';
import { describe, it, expect, beforeEach } from 'vitest';

describe('Passenger Management API', () => {
  const userId = 1;
  
  beforeEach(async () => {
    // Clean tables
    await new Promise(resolve => db.run('DELETE FROM passengers', resolve));
    await new Promise(resolve => db.run('DELETE FROM users', resolve));
    
    // Seed User
    await new Promise(resolve => {
      db.run(
        `INSERT INTO users (id, username, password, real_name, phone, email, id_type, id_card) 
         VALUES (?, 'testuser', 'pass', 'User1', '13800000000', 'test@test.com', '身份证', '110101199001011234')`,
        [userId],
        resolve
      );
    });
  });

  it('GET /api/passengers - should return empty list initially', async () => {
    const res = await request(app)
      .get('/api/passengers')
      .set('x-user-id', userId);
    
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual([]);
  });

  it('POST /api/passengers - should add a passenger', async () => {
    const passenger = {
      name: 'Passenger1',
      id_type: '身份证',
      id_card: '110101199001015678',
      phone: '13900000000',
      type: '成人'
    };

    const res = await request(app)
      .post('/api/passengers')
      .set('x-user-id', userId)
      .send(passenger);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toMatchObject(passenger);
    expect(res.body.data.id).toBeDefined();
    
    // Verify in DB
    const rows = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM passengers WHERE user_id = ?', [userId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    expect(rows).toHaveLength(1);
    expect(rows[0].name).toBe('Passenger1');
  });

  it('DELETE /api/passengers/:id - should delete a passenger', async () => {
    // Setup: Add a passenger first
    const passengerId = await new Promise(resolve => {
      db.run(
        `INSERT INTO passengers (user_id, name, id_type, id_card, phone, type) VALUES (?, 'ToDelete', '身份证', '123', '123', '成人')`,
        [userId],
        function() { resolve(this.lastID); }
      );
    });

    const res = await request(app)
      .delete(`/api/passengers/${passengerId}`)
      .set('x-user-id', userId);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify in DB
    const rows = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM passengers WHERE id = ?', [passengerId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    expect(rows).toHaveLength(0);
  });
  
  it('should enforce x-user-id header', async () => {
     const res = await request(app).get('/api/passengers');
     expect(res.status).toBe(401);
  });
});
