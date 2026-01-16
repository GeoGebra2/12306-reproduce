
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import sqlite3 from 'sqlite3';
import path from 'path';

const dbPath = path.resolve(__dirname, '../database.db');

describe('Database Infrastructure: Users Table', () => {
  let db;

  beforeAll(async () => {
    return new Promise((resolve, reject) => {
      db = new sqlite3.Database(dbPath, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  });

  afterAll(() => {
    return new Promise((resolve) => {
      db.close(resolve);
    });
  });

  it('should have a users table', async () => {
    const row = await new Promise((resolve, reject) => {
      db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='users'", (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    expect(row).toBeDefined();
    expect(row.name).toBe('users');
  });

  it('should have correct columns in users table', async () => {
    const rows = await new Promise((resolve, reject) => {
      db.all("PRAGMA table_info(users)", (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    const columns = rows.map(r => r.name);
    expect(columns).toContain('username');
    expect(columns).toContain('password');
    expect(columns).toContain('id_type');
    expect(columns).toContain('id_card');
    expect(columns).toContain('real_name');
    expect(columns).toContain('phone');
    expect(columns).toContain('type');
  });
});
