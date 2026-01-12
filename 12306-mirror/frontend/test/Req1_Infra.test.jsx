import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';

// Imports
import app from '../../backend/src/index'; 
import db from '../../backend/src/database/init_db'; 
import HomePage from '../src/pages/HomePage';
import App from '../src/App';

let server;
let lastApiResponse = null; 

describe('Full-Stack Integration: Auth Infrastructure', () => {

  // ================= 1. Lifecycle: Server & Network Spy =================
  beforeAll(async () => {
    // Start backend
    server = await new Promise(resolve => {
      const s = app.listen(0, () => resolve(s));
    });
    const port = server.address().port;
    
    // Config Axios
    axios.defaults.baseURL = `http://localhost:${port}`;
    
    // Interceptor
    axios.interceptors.response.use((response) => {
      lastApiResponse = response.data; 
      return response; 
    });
  });

  afterAll((done) => server?.close(done));

  // ================= 2. Lifecycle: Data Seeding & Mocks =================
  beforeEach(async () => {
    lastApiResponse = null; 
    
    // Mock window.location
    vi.stubGlobal('location', { href: 'http://localhost/', assign: vi.fn() });
    
    // Check if users table exists (Implicitly tested by init_db requiring no error)
    await new Promise((resolve, reject) => {
        db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='users'", (err, row) => {
            if (err) reject(err);
            if (!row) reject(new Error("Users table not created"));
            resolve();
        });
    });
  });

  // ================= 3. Test Cases =================
  
  // Layer 1: Check Database Schema (Infrastructure)
  it('should have users table with correct columns', async () => {
     const columns = await new Promise((resolve, reject) => {
         db.all("PRAGMA table_info(users)", (err, rows) => {
             if (err) reject(err);
             resolve(rows.map(r => r.name));
         });
     });
     
     expect(columns).toContain('id');
     expect(columns).toContain('username');
     expect(columns).toContain('password');
     expect(columns).toContain('id_type');
     expect(columns).toContain('id_card');
     expect(columns).toContain('real_name');
     expect(columns).toContain('phone');
     expect(columns).toContain('type');
  });

  // Layer 3: Frontend Routes & Links
  it('renders login and register links on home page', () => {
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );
    expect(screen.getByText(/登录/i).closest('a')).toHaveAttribute('href', '/login');
    expect(screen.getByText(/注册/i).closest('a')).toHaveAttribute('href', '/register');
  });

});
