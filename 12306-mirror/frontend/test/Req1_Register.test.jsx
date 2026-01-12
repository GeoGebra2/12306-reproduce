import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';

import app from '../../backend/src/index'; 
import db from '../../backend/src/database/init_db'; 
import RegisterPage from '../src/pages/RegisterPage';

let server;
let lastApiResponse = null; 

describe('REQ-1-1: User Registration', () => {

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
      lastApiResponse = error.response?.data;
      return Promise.reject(error);
    });
  });

  afterAll((done) => server?.close(done));

  beforeEach(async () => {
    lastApiResponse = null;
    vi.stubGlobal('location', { href: 'http://localhost/', assign: vi.fn() });
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM users', (err) => err ? reject(err) : resolve());
    });
  });

  // Level 1: UI Rendering
  it('renders registration form correctly', () => {
    render(<BrowserRouter><RegisterPage /></BrowserRouter>);
    expect(screen.getByLabelText(/用户名/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^密码/)).toBeInTheDocument();
    expect(screen.getByLabelText(/确认密码/)).toBeInTheDocument();
    expect(screen.getByLabelText(/姓名/)).toBeInTheDocument();
    expect(screen.getByLabelText(/证件号码/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /下一步/i })).toBeInTheDocument();
  });

  // Level 2: Interaction & Backend Integration
  it('registers a new user successfully', async () => {
    render(<BrowserRouter><RegisterPage /></BrowserRouter>);

    // Fill Form
    fireEvent.change(screen.getByLabelText(/用户名/), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/^密码/), { target: { value: 'Password123' } });
    fireEvent.change(screen.getByLabelText(/确认密码/), { target: { value: 'Password123' } });
    fireEvent.change(screen.getByLabelText(/姓名/), { target: { value: '张三' } });
    fireEvent.change(screen.getByLabelText(/证件号码/), { target: { value: '110101199001011234' } });
    fireEvent.change(screen.getByLabelText(/手机号码/), { target: { value: '13800138000' } });
    fireEvent.click(screen.getByLabelText(/我已阅读/));

    // Submit
    fireEvent.click(screen.getByRole('button', { name: /下一步/i }));

    // Verify
    await waitFor(async () => {
      // 1. API Response
      expect(lastApiResponse).toBeTruthy();
      // Should be success (depending on implementation, but let's expect success property or user object)
      // The service currently throws Error('Not Implemented'), so this will fail, which is correct for RED state.
      expect(lastApiResponse.success).toBe(true);

      // 2. Database
      const user = await new Promise((resolve, reject) => {
        db.get('SELECT * FROM users WHERE username = ?', ['testuser'], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });
      expect(user).toBeTruthy();
      expect(user.real_name).toBe('张三');
    });
  });
});
