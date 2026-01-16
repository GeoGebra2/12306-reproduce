
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/index';

describe('Tickets Search API', () => {
  it('GET /api/tickets returns trains with ticket information', async () => {
    // Assuming we have seed data: Beijing Nan -> Shanghai Hongqiao (G1)
    const res = await request(app).get('/api/tickets?from=北京南&to=上海虹桥&date=2023-10-01');
    
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    
    const train = res.body[0];
    expect(train).toHaveProperty('train_number');
    expect(train).toHaveProperty('start_station', '北京南');
    expect(train).toHaveProperty('end_station', '上海虹桥');
    
    // Check tickets structure
    expect(train).toHaveProperty('tickets');
    expect(Array.isArray(train.tickets)).toBe(true);
    expect(train.tickets.length).toBeGreaterThan(0);
    
    const ticket = train.tickets[0];
    expect(ticket).toHaveProperty('seat_type');
    expect(ticket).toHaveProperty('price');
    expect(ticket).toHaveProperty('count');
  });

  it('GET /api/tickets returns empty array for non-existent route', async () => {
    const res = await request(app).get('/api/tickets?from=Nowhere&to=Anywhere&date=2023-10-01');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});
