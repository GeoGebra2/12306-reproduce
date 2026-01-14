const { expect } = require('chai');
// Use the db instance from init_db which triggers the initialization
const db = require('../src/database/init_db');

describe('REQ-2: Database Initialization (Ticket Module)', () => {
  
  // No need to create/close connection manually if we use the singleton
  // But we might want to wait a bit to ensure async init is done, 
  // or just rely on sqlite3's internal queueing (since we use the same db instance).
  
  // SQLite3 requests are serialized on the same connection. 
  // So if we queue our tests after the init code runs, it should be fine.

  it('should have stations table', (done) => {
    db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='stations'", (err, row) => {
      if (err) done(err);
      expect(row).to.not.be.undefined;
      done();
    });
  });

  it('should have trains table', (done) => {
    db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='trains'", (err, row) => {
      if (err) done(err);
      expect(row).to.not.be.undefined;
      done();
    });
  });

  it('should have train_station_mapping table', (done) => {
    db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='train_station_mapping'", (err, row) => {
      if (err) done(err);
      expect(row).to.not.be.undefined;
      done();
    });
  });

  it('should have seed data for stations', (done) => {
    // Retry a few times if seeding is slow? 
    // Or just assume it's queued.
    db.get("SELECT count(*) as count FROM stations", (err, row) => {
      if (err) done(err);
      try {
        expect(row.count).to.be.greaterThan(0);
        done();
      } catch (e) {
        done(e);
      }
    });
  });

  it('should have seed data for trains', (done) => {
    db.get("SELECT count(*) as count FROM trains", (err, row) => {
      if (err) done(err);
      try {
        expect(row.count).to.be.greaterThan(0);
        done();
      } catch (e) {
        done(e);
      }
    });
  });
});
