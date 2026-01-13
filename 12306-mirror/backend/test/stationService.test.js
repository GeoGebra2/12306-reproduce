import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import db from '../src/database/db';
import stationService from '../src/services/stationService';

describe('Station Service', () => {
  beforeEach(async () => {
    await db.run('DELETE FROM stations');
    await db.run(`INSERT INTO stations (name, code, pinyin) VALUES 
      ('北京南', 'VNP', 'beijingnan'),
      ('上海虹桥', 'AOH', 'shanghaihongqiao'),
      ('天津南', 'TIP', 'tianjinnan')
    `);
  });

  it('should search stations by name', async () => {
    const results = await stationService.searchStations('北京');
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('北京南');
  });

  it('should search stations by pinyin', async () => {
    const results = await stationService.searchStations('shanghai');
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('上海虹桥');
  });

  it('should search stations by partial pinyin', async () => {
    const results = await stationService.searchStations('tian');
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('天津南');
  });

  it('should return empty array if no match', async () => {
    const results = await stationService.searchStations('xyz');
    expect(results).toHaveLength(0);
  });
});
