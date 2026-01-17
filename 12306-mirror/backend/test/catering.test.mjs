import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/index.js';
import db from '../src/database/init_db.js';

describe('Catering API', () => {
  let server;
  let port;
  let baseUrl;

  beforeAll(async () => {
    // Wait for DB to initialize
    await new Promise(resolve => setTimeout(resolve, 100));

    server = app.listen(0);
    port = server.address().port;
    baseUrl = `http://localhost:${port}`;
  });

  afterAll((done) => {
    server.close(done);
  });

  describe('GET /api/catering/brands', () => {
    it('should return a list of catering brands', async () => {
      const res = await request(baseUrl).get('/api/catering/brands');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0]).toHaveProperty('name');
      expect(res.body.data[0]).toHaveProperty('logo_url');
    });
  });

  describe('GET /api/catering/items', () => {
    it('should return self-operated items when type is SELF_OPERATED', async () => {
      const res = await request(baseUrl).get('/api/catering/items?type=SELF_OPERATED');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      const item = res.body.data[0];
      expect(item).toHaveProperty('name');
      expect(item).toHaveProperty('price');
      expect(item.type).toBe('SELF_OPERATED');
    });

    it('should filter items by brand_id', async () => {
      // First get a brand
      const brandsRes = await request(baseUrl).get('/api/catering/brands');
      const brand = brandsRes.body.data[0];
      
      const res = await request(baseUrl).get(`/api/catering/items?brand_id=${brand.id}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      if (res.body.data.length > 0) {
        expect(res.body.data[0].brand_id).toBe(brand.id);
      }
    });
  });

  describe('POST /api/catering/orders', () => {
    it('should create a new catering order', async () => {
      // Create a test user first or use a mock user ID
      // For this test, we'll assume auth middleware is bypassed or we provide x-user-id
      // But we need valid items.
      const itemsRes = await request(baseUrl).get('/api/catering/items?type=SELF_OPERATED');
      const item = itemsRes.body.data[0];

      const res = await request(baseUrl)
        .post('/api/catering/orders')
        .set('x-user-id', '1') // Mock user ID
        .send({
          items: [
            { id: item.id, quantity: 2 }
          ]
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Catering order created successfully');
      expect(res.body.data).toHaveProperty('orderId');
    });
  });
});
