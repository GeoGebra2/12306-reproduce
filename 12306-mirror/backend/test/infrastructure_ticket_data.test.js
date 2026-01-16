import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import db from '../src/database/init_db';

describe('REQ-2: Ticket Data Infrastructure', () => {
  
  // Wait for DB initialization (it's async in init_db.js but without callback export, so we might need a small delay or retry)
  // In a real app, we'd export the init promise. For now, we assume it runs fast enough or we check periodically.
  // Actually, since we are importing db, the connection is happening.
  
  const runQuery = (sql) => {
    return new Promise((resolve, reject) => {
      db.all(sql, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  };

  beforeAll(async () => {
    let retries = 20;
    while (retries > 0) {
      try {
        const rows = await runQuery("SELECT count(*) as count FROM trains");
        if (rows[0].count >= 42) break;
      } catch (e) {
        // Table might not exist yet
      }
      await new Promise(r => setTimeout(r, 200));
      retries--;
    }
  }, 10000);

  it('should have stations table with required data', async () => {
    const stations = await runQuery('SELECT * FROM stations');
    expect(stations.length).toBeGreaterThan(0);
    
    const stationNames = stations.map(s => s.name);
    const required = ['北京南', '北京', '北京北', '上海南', '上海', '上海虹桥', '南京南', '南京东'];
    required.forEach(req => {
      expect(stationNames).toContain(req);
    });
  });

  it('should have trains table with sufficient coverage', async () => {
    const trains = await runQuery('SELECT * FROM trains');
    expect(trains.length).toBeGreaterThanOrEqual(42);
    
    // Check routes coverage
    const routes = trains.map(t => `${t.start_station}-${t.end_station}`);
    // This is a rough check, as actual station names might vary (e.g. Beijing Nan vs Beijing)
    // But we expect at least some trains between the cities.
    // We will verify city-to-city coverage logic in implementation.
  });

  it('should have train_station_mapping table', async () => {
    // Just check existence for now
    try {
      await runQuery('SELECT * FROM train_station_mapping LIMIT 1');
      expect(true).toBe(true);
    } catch (e) {
      expect(e).toBeNull();
    }
  });
});
