import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const request = require('supertest');
const app = require('../src/index');
const db = require('../src/database/init_db');

describe('Orders API', () => {
  const testUser = { id: 1, name: 'Test User' };

  beforeAll(async () => {
    // Ensure DB is initialized
    await new Promise((resolve, reject) => {
      db.serialize(() => {
        db.run('DELETE FROM orders');
        db.run('DELETE FROM order_items', (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    });
  });

  describe('GET /api/orders', () => {
    it('should return 200 and empty list initially', async () => {
      const res = await request(app)
        .get('/api/orders')
        .set('x-user-id', testUser.id);
      
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBeTruthy();
      expect(Array.isArray(res.body.data)).toBeTruthy();
      expect(res.body.data.length).toEqual(0);
    });

    it('should return orders after insertion', async () => {
        // Manually insert an order
        await new Promise((resolve) => {
            db.run("INSERT INTO orders (user_id, status, total_price) VALUES (?, ?, ?)", [1, 'Unpaid', 100], function(err) {
                const orderId = this.lastID;
                db.run("INSERT INTO order_items (order_id, train_number) VALUES (?, ?)", [orderId, 'G1'], resolve);
            });
        });

        const res = await request(app)
            .get('/api/orders')
            .set('x-user-id', testUser.id);
        
        expect(res.statusCode).toEqual(200);
        expect(res.body.data.length).toBeGreaterThan(0);
        expect(res.body.data[0].items.length).toBeGreaterThan(0);
    });
  });
});
