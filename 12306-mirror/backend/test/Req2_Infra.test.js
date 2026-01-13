import { describe, it, expect, beforeAll } from 'vitest';
import db from '../src/database/init_db';

describe('REQ-2 Infrastructure: Ticket Search Model', () => {
    
    // Helper to wait for DB operations
    const waitForDb = (ms) => new Promise(r => setTimeout(r, ms));

    beforeAll(async () => {
        // Wait for potential seeding to finish
        await waitForDb(2000);
    });

    it('should have stations table with seeded data', async () => {
        return new Promise((resolve, reject) => {
            db.get("SELECT count(*) as count FROM stations", (err, row) => {
                if(err) reject(err);
                try {
                    expect(row.count).toBeGreaterThanOrEqual(5); // At least 5 stations seeded
                    resolve();
                } catch (e) {
                    reject(e);
                }
            });
        });
    });
    
     it('should have trains table with seeded data', async () => {
         return new Promise((resolve, reject) => {
             db.get("SELECT count(*) as count FROM trains", (err, row) => {
                if(err) reject(err);
                try {
                    expect(row.count).toBeGreaterThanOrEqual(2); // At least 2 trains
                    resolve();
                } catch (e) {
                    reject(e);
                }
            });
         });
    });

    it('should have train_station_mapping with seeded data', async () => {
        return new Promise((resolve, reject) => {
            db.get("SELECT count(*) as count FROM train_station_mapping", (err, row) => {
               if(err) reject(err);
               try {
                   expect(row.count).toBeGreaterThan(0); 
                   resolve();
               } catch (e) {
                   reject(e);
               }
           });
        });
   });
});
