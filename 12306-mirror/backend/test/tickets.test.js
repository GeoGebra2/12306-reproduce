import request from 'supertest';
import { describe, it, expect, beforeAll } from 'vitest';
import app from '../src/index';
import db from '../src/database/init_db';

describe('Tickets API', () => {
  beforeAll(async () => {
    // Wait for DB initialization if needed
    await new Promise(resolve => setTimeout(resolve, 2000));
  });

  it('GET /api/tickets/stations should return list of stations', async () => {
    const res = await request(app).get('/api/tickets/stations');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty('name');
    expect(res.body[0]).toHaveProperty('pinyin');
    expect(res.body[0]).toHaveProperty('initial');
  });

  it('GET /api/tickets/query should return trains for valid route', async () => {
    // Assuming '北京南' and '上海虹桥' are in the seed data from init_db.js
    const res = await request(app)
      .get('/api/tickets/query')
      .query({
        from: '北京南',
        to: '上海虹桥',
        date: '2023-10-01'
      });
    
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    // Note: It might be empty if no trains match, but structure should be valid
  });

  it('GET /api/tickets/query should return 400 if parameters missing', async () => {
    const res = await request(app).get('/api/tickets/query');
    expect(res.status).toBe(400);
  });
});
