import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/index.js';
import db from '../src/database/init_db.js';

describe('Order Cancellation API', () => {
  let userId = 1;
  let orderId;

  beforeAll(async () => {
    // Clean up
    await new Promise((resolve, reject) => {
        db.run('DELETE FROM orders', (err) => {
            if(err) reject(err);
            else resolve();
        });
    });

    // Create a dummy order
    await new Promise((resolve, reject) => {
        db.run(`INSERT INTO orders (user_id, status, total_price) VALUES (?, ?, ?)`, [userId, 'Unpaid', 100], function(err) {
            if(err) reject(err);
            else {
                orderId = this.lastID;
                resolve();
            }
        });
    });
  });

  it('should cancel an unpaid order successfully', async () => {
    console.log('Testing cancellation for orderId:', orderId);
    const res = await request(app)
      .post(`/api/orders/${orderId}/cancel`)
      .set('x-user-id', userId);
    
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify DB
    const order = await new Promise((resolve) => {
        db.get('SELECT * FROM orders WHERE id = ?', [orderId], (err, row) => resolve(row));
    });
    expect(order.status).toBe('Cancelled');
  });

  it('should return 404 for non-existent order', async () => {
    const res = await request(app)
      .post(`/api/orders/99999/cancel`)
      .set('x-user-id', userId);
    
    expect(res.status).toBe(404);
  });
});
