
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/index.js';
import db from '../src/database/init_db.js';

describe('Order Refund API', () => {
  let token;
  let orderId;

  beforeAll(async () => {
    // Wait for DB init
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Register and Login
    const timestamp = Date.now();
    const regRes = await request(app).post('/api/users/register').send({
      username: `testuser_${timestamp}`,
      password: 'password123',
      confirmPassword: 'password123',
      real_name: 'Test User',
      id_card: '110101199001011234',
      phone: '13800138000',
      email: `test_${timestamp}@example.com`,
      type: '成人'
    });
    console.log('Register Res:', regRes.body);

    const loginRes = await request(app).post('/api/users/login').send({
      username: `testuser_${timestamp}`,
      password: 'password123'
    });
    console.log('Login Res:', loginRes.body);
    token = loginRes.body.token;

    // Create Order
    const orderRes = await request(app).post('/api/orders')
      .set('x-user-id', token)
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

  it('should not refund an unpaid order', async () => {
    const res = await request(app).post(`/api/orders/${orderId}/refund`)
      .set('x-user-id', token);
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/Only paid orders/);
  });

  it('should refund a paid order successfully', async () => {
    // Pay first
    await request(app).post(`/api/orders/${orderId}/pay`)
      .set('x-user-id', token);
    
    // Refund
    const res = await request(app).post(`/api/orders/${orderId}/refund`)
      .set('x-user-id', token);
    
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    
    // Verify status
    const checkRes = await request(app).get(`/api/orders/${orderId}`)
      .set('x-user-id', token);
    expect(checkRes.body.data.status).toBe('Refunded');
  });
});
