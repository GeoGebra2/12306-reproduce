import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import app from '../../../../backend/src/index'; 
import db from '../../../../backend/src/database/init_db'; 
import ForgotPasswordPage from '../ForgotPasswordPage';

let server;
let lastApiResponse = null;

describe('Forgot Password Flow: Step 2', () => {
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
                    VALUES ('step2user', 'password123', '1', '123456789012345678', 'Step2 User', '13800000000', 'passenger')`, 
            (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    });
  });

  // Helper to get to Step 2
  const goToStep2 = async () => {
    render(<BrowserRouter><ForgotPasswordPage /></BrowserRouter>);
    const input = screen.getByPlaceholderText(/账号\/手机号/);
    fireEvent.change(input, { target: { value: 'step2user' } });
    const btn = screen.getByRole('button', { name: /下一步/ });
    fireEvent.click(btn);
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/请输入验证码/)).toBeInTheDocument();
    });
  };

  it('renders step 2 form correctly', async () => {
    await goToStep2();
    expect(screen.getByText(/短信验证/)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/请输入验证码/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /下一步/ })).toBeInTheDocument();
  });

  it('proceeds to step 3 when code is correct', async () => {
    await goToStep2();
    
    const input = screen.getByPlaceholderText(/请输入验证码/);
    fireEvent.change(input, { target: { value: '123456' } });
    
    const btn = screen.getByRole('button', { name: /下一步/ });
    fireEvent.click(btn);

    await waitFor(() => {
      expect(lastApiResponse).not.toBeNull();
      expect(lastApiResponse.verified).toBe(true);
      
      // Should show Step 3
      expect(screen.getByText(/Step 3/)).toBeInTheDocument();
    });
  });

  it('shows error when code is incorrect', async () => {
    await goToStep2();
    
    const input = screen.getByPlaceholderText(/请输入验证码/);
    fireEvent.change(input, { target: { value: '000000' } });
    
    const btn = screen.getByRole('button', { name: /下一步/ });
    fireEvent.click(btn);

    await waitFor(() => {
      expect(lastApiResponse).not.toBeNull();
      expect(lastApiResponse.message).toBe('验证码错误');
      
      expect(screen.getByText(/验证码错误/)).toBeInTheDocument();
      // Should remain on Step 2
      expect(screen.getByText(/Step 2/)).toBeInTheDocument();
    });
  });
});
