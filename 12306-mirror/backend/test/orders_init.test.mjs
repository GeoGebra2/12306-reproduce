import { describe, it, expect, beforeAll } from 'vitest';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const db = require('../src/database/init_db');

describe('Order Module Initialization', () => {
  beforeAll(async () => {
    // Wait for DB to be ready
    await new Promise(resolve => setTimeout(resolve, 100));
  });

  it('should have orders table', async () => {
    const result = await new Promise((resolve, reject) => {
      db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='orders'", (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    expect(result).toBeDefined();
    expect(result.name).toBe('orders');
  });

  it('should have order_items table', async () => {
    const result = await new Promise((resolve, reject) => {
      db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='order_items'", (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    expect(result).toBeDefined();
    expect(result.name).toBe('order_items');
  });

  it('should allow inserting an order', async () => {
    const result = await new Promise((resolve, reject) => {
      db.run("INSERT INTO orders (user_id, status, total_price) VALUES (?, ?, ?)", [1, 'Unpaid', 100.0], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });
    expect(result).toBeGreaterThan(0);
  });
});
