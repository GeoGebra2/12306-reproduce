import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/index.js';
import db from '../src/database/init_db.js';

describe('Order Payment API', () => {
  let server;
  let authToken;
  let userId;
  let orderId;

  beforeAll(async () => {
    // Start server on random port
    server = await new Promise(resolve => {
      const s = app.listen(0, () => resolve(s));
    });
  });

  afterAll((done) => {
    server.close(done);
  });

  beforeEach(async () => {
    // Reset DB
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM orders', (err) => err ? reject(err) : resolve());
    });
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM users', (err) => err ? reject(err) : resolve());
    });
    
    // Register user
    const regRes = await request(app).post('/api/users/register').send({
      username: 'paytestuser',
      password: 'password123',
      id_card: '110101199001011234',
      phone: '13800138000',
      real_name: 'Pay Tester',
      type: '成人'
    });
    userId = regRes.body.userId;
    
    // Login
    const loginRes = await request(app).post('/api/users/login').send({
      username: 'paytestuser',
      password: 'password123'
    });
    authToken = loginRes.body.token; // In this mock, we might rely on x-user-id header or similar if no token used
    
    // Create an order
    const orderRes = await request(app)
      .post('/api/orders')
      .set('x-user-id', userId)
      .send({
        train_number: 'G101',
        departure: 'Beijing',
        arrival: 'Shanghai',
        departure_time: '08:00',
        arrival_time: '12:00',
        passengers: [{ name: 'P1', id_card: '123', seat_type: '二等座' }]
      });
    orderId = orderRes.body.orderId;
  });

  it('should pay an unpaid order successfully', async () => {
    const res = await request(app)
      .post(`/api/orders/${orderId}/pay`)
      .set('x-user-id', userId);
      
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify DB
    const order = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM orders WHERE id = ?', [orderId], (err, row) => err ? reject(err) : resolve(row));
    });
    expect(order.status).toBe('Paid');
  });

  it('should return 404 for non-existent order', async () => {
    const res = await request(app)
      .post('/api/orders/99999/pay')
      .set('x-user-id', userId);
      
    expect(res.status).toBe(404);
  });
});
