import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import app from '../../backend/src/index';
import db from '../../backend/src/database/init_db';
import ForgotPasswordPage from '../src/pages/ForgotPasswordPage';

let server;
let lastApiResponse = null;

describe('Full-Stack Integration: Forgot Password Flow', () => {
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
    await new Promise((resolve, reject) => {
        db.run('DELETE FROM users', (err) => err ? reject(err) : resolve());
    });
    // Seed a user
    await new Promise((resolve, reject) => {
        db.run(`INSERT INTO users (username, password, id_type, id_card, real_name, phone, type) 
                VALUES ('forgot_user', 'old_pass', '1', '123456789012345678', 'Test User', '13800138000', 'ADULT')`, 
                (err) => err ? reject(err) : resolve());
    });
  });

  it('completes the full password reset flow', async () => {
    render(
      <BrowserRouter>
        <ForgotPasswordPage />
      </BrowserRouter>
    );

    // Step 1: Verify User
    expect(screen.getByText(/找回密码/i)).toBeInTheDocument();
    const userInput = screen.getByPlaceholderText(/用户名\/邮箱\/手机号/i);
    fireEvent.change(userInput, { target: { value: 'forgot_user' } });
    fireEvent.click(screen.getByRole('button', { name: /下一步/i }));

    // Wait for Step 2: Verify Code (Mocked)
    await waitFor(() => {
      expect(screen.getByText(/验证身份/i)).toBeInTheDocument();
      // Verify backend data is displayed (Masked phone: 138****8000)
      expect(screen.getByText(/138\*\*\*\*8000/)).toBeInTheDocument();
    });
    
    // Simulate entering code
    const codeInput = screen.getByPlaceholderText(/请输入验证码/i);
    fireEvent.change(codeInput, { target: { value: '123456' } }); // Assume 123456 is magic code
    fireEvent.click(screen.getByRole('button', { name: /下一步/i }));

    // Wait for Step 3: Reset Password
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/^输入新密码/i)).toBeInTheDocument();
    });

    const passInput = screen.getByPlaceholderText(/^输入新密码/i);
    const confirmInput = screen.getByPlaceholderText(/^确认新密码/i);
    fireEvent.change(passInput, { target: { value: 'new_secure_pass' } });
    fireEvent.change(confirmInput, { target: { value: 'new_secure_pass' } });
    fireEvent.click(screen.getByRole('button', { name: /确定/i }));

    // Wait for Step 4: Completion
    await waitFor(() => {
      expect(screen.getByText(/密码重置成功/i)).toBeInTheDocument();
    });

    // Verify DB update
    await new Promise((resolve, reject) => {
        db.get("SELECT password FROM users WHERE username = 'forgot_user'", (err, row) => {
            if (err) reject(err);
            try {
                expect(row.password).not.toBe('old_pass');
                expect(row.password).not.toBe('new_secure_pass');
                expect(row.password).toMatch(/^\$2b\$/); // Bcrypt prefix
                resolve();
            } catch (e) {
                reject(e);
            }
        });
    });
  });
});
