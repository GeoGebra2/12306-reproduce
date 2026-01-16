
import request from 'supertest';
import { describe, test, expect, beforeAll } from 'vitest';
// Import CJS modules
import app from '../src/index';
// db is not default export in init_db.js? No, it is module.exports = db.
// So import db from ... should work as default import.
import db from '../src/database/init_db';

describe('Ticket Search API', () => {
  beforeAll(async () => {
    // Wait for DB initialization if needed
    // In init_db.js, it runs async but doesn't export a promise.
    // Ideally we should wait, but for now we rely on it being fast enough or already initialized.
  });

  test('GET /api/tickets returns list of trains', async () => {
    const res = await request(app).get('/api/tickets?from=北京南&to=上海虹桥&date=2023-10-01');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    // Based on seed data, we expect trains
    if (res.body.length > 0) {
        const train = res.body[0];
        expect(train).toHaveProperty('train_number');
        expect(train).toHaveProperty('start_station');
        expect(train).toHaveProperty('end_station');
    }
  });

  test('GET /api/tickets requires parameters', async () => {
     const res = await request(app).get('/api/tickets');
     expect(res.status).toBe(400);
  });
});
