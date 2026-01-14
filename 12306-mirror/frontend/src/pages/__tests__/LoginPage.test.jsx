import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';

// [IMPORTS] 
import app from '../../../../backend/src/index'; 
import db from '../../../../backend/src/database/init_db'; 
import LoginPage from '../LoginPage'; 

// [GLOBALS] 
let server;
let lastApiResponse = null; 

describe('Full-Stack Integration: <LoginPage />', () => {

  // ================= 1. Lifecycle: Server & Network Spy =================
  beforeAll(async () => {
    server = await new Promise(resolve => {
      const s = app.listen(0, () => resolve(s));
    });
    const port = server.address().port;
    axios.defaults.baseURL = `http://localhost:${port}`;
    axios.interceptors.response.use((response) => {
      lastApiResponse = response.data; 
      return response; 
    }, (error) => {
        lastApiResponse = error.response ? error.response.data : null;
        return Promise.reject(error);
    });
  });

  afterAll((done) => server?.close(done));

  // ================= 2. Lifecycle: Data Seeding =================
  beforeEach(async () => {
    lastApiResponse = null; 
    vi.stubGlobal('location', { href: 'http://localhost/', assign: vi.fn() });
    
    // Reset DB and Seed a User
    await new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run("DELETE FROM users");
            // Seed user: password must match what backend expects (plain text for now based on register impl)
            db.run(`INSERT INTO users (username, password, id_type, id_card, real_name, phone, type) 
                    VALUES ('validuser', 'password123', '1', '123456789012345678', 'Valid User', '13800000000', 'passenger')`, 
            (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    });
  });

  // ================= 3. Test Cases =================
  
  it('renders login form correctly', () => {
    render(<BrowserRouter><LoginPage /></BrowserRouter>);
    expect(screen.getByText('用户登录')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/用户名/)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/密码/)).toBeInTheDocument();
  });

  it('submits form and logs in successfully', async () => {
    render(<BrowserRouter><LoginPage /></BrowserRouter>);

    fireEvent.change(screen.getByPlaceholderText(/用户名/), { target: { value: 'validuser' } });
    fireEvent.change(screen.getByPlaceholderText(/密码/), { target: { value: 'password123' } });
    
    const submitBtn = screen.getByRole('button', { name: /立即登录/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(lastApiResponse).not.toBeNull();
      // Expect user data in response
      expect(lastApiResponse).toHaveProperty('username', 'validuser');
    });
  });

  it('shows error on invalid credentials', async () => {
    render(<BrowserRouter><LoginPage /></BrowserRouter>);

    fireEvent.change(screen.getByPlaceholderText(/用户名/), { target: { value: 'validuser' } });
    fireEvent.change(screen.getByPlaceholderText(/密码/), { target: { value: 'wrongpass' } });
    
    const submitBtn = screen.getByRole('button', { name: /立即登录/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      // Expect 401 error message (caught by interceptor as data)
      expect(lastApiResponse).toHaveProperty('message');
    });
  });
});
