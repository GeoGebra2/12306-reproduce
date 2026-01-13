import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import app from '../../backend/src/index'; 
import db from '../../backend/src/database/init_db'; 
import LoginPage from '../src/pages/LoginPage';

let server;
let lastApiResponse = null; 

describe('Full-Stack Integration: <LoginPage />', () => {

  beforeAll(async () => {
    server = await new Promise(resolve => {
      const s = app.listen(0, () => resolve(s));
    });
    const port = server.address().port;
    axios.defaults.baseURL = `http://localhost:${port}`;
    axios.interceptors.response.use((response) => {
      lastApiResponse = response.data; 
      return response; 
    });
  });

  afterAll((done) => server?.close(done));

  beforeEach(async () => {
    lastApiResponse = null; 
    vi.stubGlobal('location', { href: 'http://localhost/', assign: vi.fn() });
    vi.stubGlobal('alert', vi.fn());
    
    // Seed DB with a user
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM users', [], (err) => {
         if(err) reject(err);
         else {
             db.run(`INSERT INTO users (username, password, real_name, id_type, id_card, phone, email, type) 
                     VALUES ('testlogin', 'password123', 'Test User', '1', '123456789012345678', '13900000000', 'test@example.com', 1)`, 
                     [], (err) => err ? reject(err) : resolve());
         }
      });
    });
  });

  it('renders login form correctly', () => {
    render(<BrowserRouter><LoginPage /></BrowserRouter>);
    expect(screen.getByLabelText(/用户名/)).toBeInTheDocument();
    expect(screen.getByLabelText(/密码/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /立即登录/i })).toBeInTheDocument();
  });

  it('logs in successfully with valid credentials', async () => {
    render(<BrowserRouter><LoginPage /></BrowserRouter>);

    fireEvent.change(screen.getByLabelText(/用户名/), { target: { value: 'testlogin' } });
    fireEvent.change(screen.getByLabelText(/密码/), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /立即登录/i }));

    await waitFor(() => {
      expect(lastApiResponse).toBeTruthy();
      expect(lastApiResponse.success).toBe(true);
      expect(lastApiResponse.user).toBeDefined();
      expect(lastApiResponse.user.username).toBe('testlogin');
    });
  });

  it('shows error with invalid credentials', async () => {
    render(<BrowserRouter><LoginPage /></BrowserRouter>);

    fireEvent.change(screen.getByLabelText(/用户名/), { target: { value: 'testlogin' } });
    fireEvent.change(screen.getByLabelText(/密码/), { target: { value: 'wrongpass' } });
    fireEvent.click(screen.getByRole('button', { name: /立即登录/i }));

    await waitFor(() => {
       expect(window.alert).toHaveBeenCalled();
    });
  });
});
