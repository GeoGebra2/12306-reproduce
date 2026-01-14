import { describe, it, expect } from 'vitest';
import db from '../src/database/init_db';

describe('Database Initialization', () => {
  it('should create users table', async () => {
    return new Promise((resolve, reject) => {
      // Give it a moment to initialize
      setTimeout(() => {
        db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='users';", (err, row) => {
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

  it('should have correct columns in users table', async () => {
     return new Promise((resolve, reject) => {
      db.all("PRAGMA table_info(users);", (err, rows) => {
        if (err) reject(err);
        try {
          const columns = rows.map(r => r.name);
          expect(columns).toContain('id');
          expect(columns).toContain('username');
          expect(columns).toContain('password');
          expect(columns).toContain('id_type');
          expect(columns).toContain('id_card');
          expect(columns).toContain('real_name');
          expect(columns).toContain('phone');
          expect(columns).toContain('type');
          resolve();
        } catch (e) {
          reject(e);
        }
      });
    });
  });
});
