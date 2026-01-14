import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import app from '../../../../backend/src/index'; 
import db from '../../../../backend/src/database/init_db'; 
import ForgotPasswordPage from '../ForgotPasswordPage';

let server;
let lastApiResponse = null;

describe('Forgot Password Flow: Step 1', () => {
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

  beforeEach(async () => {
    lastApiResponse = null;
    await new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run("DELETE FROM users");
            db.run(`INSERT INTO users (username, password, id_type, id_card, real_name, phone, type) 
                    VALUES ('existinguser', 'password123', '1', '123456789012345678', 'Existing User', '13800000000', 'passenger')`, 
            (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    });
  });

  it('renders step 1 form correctly', () => {
    render(<BrowserRouter><ForgotPasswordPage /></BrowserRouter>);
    expect(screen.getByPlaceholderText(/账号\/手机号/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /下一步/ })).toBeInTheDocument();
  });

  it('proceeds to step 2 when user exists', async () => {
    render(<BrowserRouter><ForgotPasswordPage /></BrowserRouter>);
    
    const input = screen.getByPlaceholderText(/账号\/手机号/);
    fireEvent.change(input, { target: { value: 'existinguser' } });
    
    const btn = screen.getByRole('button', { name: /下一步/ });
    fireEvent.click(btn);

    await waitFor(() => {
      // Check API called
      expect(lastApiResponse).not.toBeNull();
      expect(lastApiResponse.exists).toBe(true);
      
      // Check UI update (Step 2 content should appear, Step 1 should disappear or update)
      // Assuming Step 2 has some unique text, or we check Step indicator
      expect(screen.getByText(/Step 2/)).toBeInTheDocument();
    });
  });

  it('shows error when user does not exist', async () => {
    render(<BrowserRouter><ForgotPasswordPage /></BrowserRouter>);
    
    const input = screen.getByPlaceholderText(/账号\/手机号/);
    fireEvent.change(input, { target: { value: 'nonexistent' } });
    
    const btn = screen.getByRole('button', { name: /下一步/ });
    fireEvent.click(btn);

    await waitFor(() => {
      expect(lastApiResponse).not.toBeNull();
      expect(lastApiResponse.message).toBe('User not found');
      
      // Check error message in UI
      expect(screen.getByText(/用户不存在/)).toBeInTheDocument();
      // Should remain on Step 1 (look for the heading "填写账号")
      expect(screen.getByRole('heading', { name: /填写账号/ })).toBeInTheDocument();
    });
  });
});
