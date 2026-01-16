
import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/index';

describe('Station Search API', () => {
  it('GET /api/stations returns all stations when no query provided', async () => {
    const res = await request(app).get('/api/stations');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    // Based on init_db.js, we have at least 8 stations
    expect(res.body.length).toBeGreaterThanOrEqual(8);
    expect(res.body[0]).toHaveProperty('name');
    expect(res.body[0]).toHaveProperty('code');
  });

  it('GET /api/stations?q=Beijing returns filtered stations', async () => {
    const res = await request(app).get('/api/stations?q=北京');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    // Should contain "北京", "北京南", "北京北"
    expect(res.body.some(s => s.name === '北京')).toBe(true);
    expect(res.body.some(s => s.name === '上海')).toBe(false);
  });
});
