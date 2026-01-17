import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const request = require('supertest');
const app = require('../src/index');
const db = require('../src/database/init_db');

describe('Booking API', () => {
  const testUser = { id: 1, name: 'Test User' };

  beforeAll(async () => {
    await new Promise((resolve) => {
      db.serialize(() => {
        db.run('DELETE FROM orders');
        db.run('DELETE FROM order_items', resolve);
      });
    });
  });

  it('should create an order successfully', async () => {
    const orderData = {
      train_number: 'G1',
      departure: 'Beijing',
      arrival: 'Shanghai',
      departure_time: '09:00',
      arrival_time: '13:00',
      passengers: [
        {
          id: 10,
          name: 'Passenger A',
          id_type: '身份证',
          id_card: '110101199001011234',
          seat_type: '二等座'
        }
      ]
    };

    const res = await request(app)
      .post('/api/orders')
      .set('x-user-id', testUser.id)
      .send(orderData);

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBeTruthy();
    expect(res.body.orderId).toBeDefined();

    // Verify DB
    await new Promise((resolve, reject) => {
      db.get('SELECT * FROM orders WHERE id = ?', [res.body.orderId], (err, row) => {
        if (err) reject(err);
        expect(row).toBeDefined();
        expect(row.status).toEqual('Unpaid');
        resolve();
      });
    });

    await new Promise((resolve, reject) => {
        db.all('SELECT * FROM order_items WHERE order_id = ?', [res.body.orderId], (err, rows) => {
            if (err) reject(err);
            expect(rows.length).toEqual(1);
            expect(rows[0].train_number).toEqual('G1');
            expect(rows[0].passenger_name).toEqual('Passenger A');
            resolve();
        });
    });
  });
});
