import { describe, it, expect } from 'vitest';
import db from '../src/database/init_db';

describe('Auth Infrastructure', () => {
  it('should have users table', async () => {
    return new Promise((resolve, reject) => {
      // Wait a bit for db init
      setTimeout(() => {
        db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='users'", (err, row) => {
            if (err) reject(err);
            try {
              expect(row).toBeDefined();
              expect(row.name).toBe('users');
              resolve();
            } catch (e) {
              reject(e);
            }
          });
      }, 100);
    });
  });
});
