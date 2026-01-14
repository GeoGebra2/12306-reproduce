import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import app from '../../../../backend/src/index'; 
import db from '../../../../backend/src/database/init_db'; 
import ForgotPasswordPage from '../ForgotPasswordPage';

let server;
let lastApiResponse = null; 

describe('Forgot Password Flow: Step 3 (Reset Password)', () => {
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
      if (error.response) {
        lastApiResponse = error.response.data;
      }
      return Promise.reject(error);
    });
  });

  afterAll((done) => server?.close(done));

  beforeEach(async () => {
    lastApiResponse = null;
    await new Promise((resolve) => db.run("DELETE FROM users", resolve));
    // Register a user for testing
    await axios.post('/api/auth/register', {
        username: 'step3user',
        password: 'oldpassword',
        idType: '1',
        idCard: '110101199001013333',
        realName: 'Step3 User',
        phone: '13900139003',
        userType: 'passenger'
    });
  });

  // Helper to get to Step 3
  const goToStep3 = async () => {
    render(<BrowserRouter><ForgotPasswordPage /></BrowserRouter>);
    
    // Step 1
    const input = screen.getByPlaceholderText(/账号\/手机号/);
    fireEvent.change(input, { target: { value: 'step3user' } });
    fireEvent.click(screen.getByRole('button', { name: /下一步/ }));
    await waitFor(() => expect(screen.getByPlaceholderText(/请输入验证码/)).toBeInTheDocument());
    
    // Step 2
    const codeInput = screen.getByPlaceholderText(/请输入验证码/);
    fireEvent.change(codeInput, { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: /下一步/ }));
    await waitFor(() => expect(screen.getByText(/重置密码 \(Step 3\)/)).toBeInTheDocument());
  };

  it('renders step 3 form correctly', async () => {
    await goToStep3();
    expect(screen.getByPlaceholderText(/请输入新密码/)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/请确认新密码/)).toBeInTheDocument();
  });

  it('shows error if passwords do not match', async () => {
    await goToStep3();
    
    fireEvent.change(screen.getByPlaceholderText(/请输入新密码/), { target: { value: 'newpass1' } });
    fireEvent.change(screen.getByPlaceholderText(/请确认新密码/), { target: { value: 'newpass2' } });
    fireEvent.click(screen.getByRole('button', { name: /确定/ }));
    
    await waitFor(() => {
      expect(screen.getByText(/两次输入的密码不一致/)).toBeInTheDocument();
    });
  });

  it('resets password successfully and goes to step 4', async () => {
    await goToStep3();
    
    fireEvent.change(screen.getByPlaceholderText(/请输入新密码/), { target: { value: 'newpassword123' } });
    fireEvent.change(screen.getByPlaceholderText(/请确认新密码/), { target: { value: 'newpassword123' } });
    fireEvent.click(screen.getByRole('button', { name: /确定/ }));
    
    await waitFor(() => {
      expect(lastApiResponse).not.toBeNull();
      expect(lastApiResponse.success).toBe(true);
      
      // Check for Step 4
      expect(screen.getByRole('heading', { name: /重置成功/ })).toBeInTheDocument();
      expect(screen.getByText(/立即登录/)).toBeInTheDocument();
    });
  });
});
