const request = require('supertest');
const app = require('../src/index');
const db = require('../src/database/init_db');

describe('Address API', () => {
  let server;
  const testUser = { id: 1, name: 'Test User' };

  beforeAll(async () => {
    // Ensure DB is initialized
    await new Promise((resolve, reject) => {
      db.serialize(() => {
        // Clean up addresses
        db.run('DELETE FROM addresses', (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    });
  });

  afterAll(() => {
    // No cleanup needed
  });

  describe('GET /api/addresses', () => {
    it('should return 200 and a list of addresses', async () => {
      const res = await request(app)
        .get('/api/addresses')
        .set('x-user-id', testUser.id);
      
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body.data)).toBeTruthy();
    });
  });

  describe('POST /api/addresses', () => {
    it('should create a new address', async () => {
      const newAddress = {
        receiver_name: '张三',
        phone: '13800138000',
        province: '北京市',
        city: '北京市',
        district: '海淀区',
        detail_address: '中关村大街1号'
      };

      const res = await request(app)
        .post('/api/addresses')
        .set('x-user-id', testUser.id)
        .send(newAddress);

      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBeTruthy();
      expect(res.body.data.receiver_name).toEqual(newAddress.receiver_name);
    });
  });

  describe('DELETE /api/addresses/:id', () => {
    it('should delete an address', async () => {
      // First create one
      const createRes = await request(app)
        .post('/api/addresses')
        .set('x-user-id', testUser.id)
        .send({
          receiver_name: '李四',
          phone: '13900139000',
          province: '上海市',
          city: '上海市',
          district: '浦东新区',
          detail_address: '陆家嘴环路1号'
        });
      
      const addressId = createRes.body.data.id;

      const deleteRes = await request(app)
        .delete(`/api/addresses/${addressId}`)
        .set('x-user-id', testUser.id);

      expect(deleteRes.statusCode).toEqual(200);
      expect(deleteRes.body.success).toBeTruthy();
    });
  });
});
