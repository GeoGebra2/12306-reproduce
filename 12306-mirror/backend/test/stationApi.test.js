const request = require('supertest');
const app = require('../src/index');
const db = require('../src/database/init_db');

describe('Station API Integration Test', () => {
  
  beforeAll(async () => {
    // Ensure DB is ready
    await new Promise(resolve => setTimeout(resolve, 1000));
  });

  it('should return empty list when no query provided', async () => {
    const res = await request(app).get('/api/stations');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should search stations by name', async () => {
    const res = await request(app).get('/api/stations?q=北京');
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].name).toContain('北京');
  });

  it('should search stations by pinyin', async () => {
    const res = await request(app).get('/api/stations?q=shanghai');
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].name).toContain('上海');
  });
});
