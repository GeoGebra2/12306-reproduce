import request from 'supertest';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import app from '../src/index';
import db from '../src/database/init_db';

describe('Order Management API', () => {
  let userId;
  let passengerId;
  let orderId;

  // Setup User and Passenger
  beforeAll(async () => {
    // Wait for DB
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Register User
    const userRes = await request(app).post('/api/auth/register').send({
      username: 'order_test_user_' + Date.now(),
      password: 'password123',
      idType: '1',
      idCard: '11010119900101' + Math.floor(Math.random() * 1000),
      realName: 'Order User',
      phone: '13800138000',
      userType: '1'
    });
    userId = userRes.body.id;

    // Add Passenger
    const passRes = await request(app)
        .post('/api/passengers')
        .set('x-user-id', userId)
        .send({
            name: 'Order Passenger',
            idType: '1',
            idCard: '110101199001011234',
            phone: '13900139000',
            type: '成人'
        });
    passengerId = passRes.body.id;
  });

  afterAll(async () => {
    // Cleanup
    if (userId) {
        await new Promise((resolve) => {
            db.run('DELETE FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE user_id = ?)', [userId], () => {
                db.run('DELETE FROM orders WHERE user_id = ?', [userId], () => {
                    db.run('DELETE FROM passengers WHERE user_id = ?', [userId], () => {
                        db.run('DELETE FROM users WHERE id = ?', [userId], resolve);
                    });
                });
            });
        });
    }
  });

  it('POST /api/orders should create an order', async () => {
    const orderData = {
        trainNumber: 'G1',
        departureDate: '2023-10-01',
        fromStation: '北京南',
        toStation: '上海虹桥',
        startTime: '08:00',
        endTime: '12:00',
        tickets: [
            {
                passengerId: passengerId,
                seatType: '二等座',
                price: 553.0
            }
        ]
    };

    const res = await request(app)
        .post('/api/orders')
        .set('x-user-id', userId)
        .send(orderData);
    
    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.status).toBe('Unpaid');
    orderId = res.body.id;
  });

  it('GET /api/orders should list orders', async () => {
    const res = await request(app)
        .get('/api/orders')
        .set('x-user-id', userId);
    
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].status).toBe('Unpaid');
    expect(res.body[0].items).toBeDefined();
    expect(res.body[0].items.length).toBe(1);
  });

  it('POST /api/orders/:id/pay should pay order', async () => {
    const res = await request(app)
        .post(`/api/orders/${orderId}/pay`)
        .set('x-user-id', userId);
    
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('Paid');

    // Verify
    const check = await request(app).get('/api/orders').set('x-user-id', userId);
    const order = check.body.find(o => o.id === orderId);
    expect(order.status).toBe('Paid');
  });

  it('POST /api/orders/:id/cancel should cancel order', async () => {
    // Create another order to cancel
    const orderData = {
        trainNumber: 'G2',
        departureDate: '2023-10-02',
        fromStation: '上海虹桥',
        toStation: '北京南',
        startTime: '14:00',
        endTime: '18:00',
        tickets: [{ passengerId, seatType: '一等座', price: 900 }]
    };
    const createRes = await request(app).post('/api/orders').set('x-user-id', userId).send(orderData);
    const cancelId = createRes.body.id;

    const res = await request(app)
        .post(`/api/orders/${cancelId}/cancel`)
        .set('x-user-id', userId);
    
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('Cancelled');

    // Verify
    const check = await request(app).get('/api/orders').set('x-user-id', userId);
    const order = check.body.find(o => o.id === cancelId);
    expect(order.status).toBe('Cancelled');
  });
});
