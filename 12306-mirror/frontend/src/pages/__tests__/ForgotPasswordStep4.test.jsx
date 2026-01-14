import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import ForgotPasswordPage from '../ForgotPasswordPage';
import React from 'react';

// Mock useState to start at step 4
// Since we can't easily mock useState inside the component from outside without a library or refactoring,
// we will simulate the flow to reach step 4 or refactor the component to accept initialStep prop.
// For now, let's verify the "Complete Hint Page" via the full flow or by mocking axios to succeed immediately.

// Actually, I can just modify the component to accept an initialStep prop for testing purposes, 
// or I can just rely on the existing flow test which is already good.
// Let's create a test that mocks the axios success response to quickly get to step 4.

import { fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import { vi } from 'vitest';

// Mock axios
vi.mock('axios');

describe('Forgot Password Flow: Step 4 (Complete)', () => {
  it('displays completion message and login link', async () => {
    // Mock responses for previous steps
    axios.post.mockImplementation((url) => {
      if (url.includes('check-user')) return Promise.resolve({ status: 200, data: { exists: true } });
      if (url.includes('verify-code')) return Promise.resolve({ status: 200, data: { verified: true } });
      if (url.includes('reset-password')) return Promise.resolve({ status: 200, data: { success: true } });
      return Promise.reject(new Error('not found'));
    });

    render(<BrowserRouter><ForgotPasswordPage /></BrowserRouter>);

    // Step 1
    fireEvent.change(screen.getByPlaceholderText(/账号\/手机号/), { target: { value: 'testuser' } });
    fireEvent.click(screen.getByRole('button', { name: /下一步/ }));
    await waitFor(() => expect(screen.getByPlaceholderText(/请输入验证码/)).toBeInTheDocument());

    // Step 2
    fireEvent.change(screen.getByPlaceholderText(/请输入验证码/), { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: /下一步/ }));
    await waitFor(() => expect(screen.getByPlaceholderText(/请输入新密码/)).toBeInTheDocument());

    // Step 3
    fireEvent.change(screen.getByPlaceholderText(/请输入新密码/), { target: { value: 'newpass' } });
    fireEvent.change(screen.getByPlaceholderText(/请确认新密码/), { target: { value: 'newpass' } });
    fireEvent.click(screen.getByRole('button', { name: /确定/ }));

    // Step 4 verification
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /重置成功/ })).toBeInTheDocument();
      expect(screen.getByText(/您的密码已重置成功，请使用新密码登录。/)).toBeInTheDocument();
      const loginLink = screen.getByRole('link', { name: /立即登录/ });
      expect(loginLink).toBeInTheDocument();
      expect(loginLink).toHaveAttribute('href', '/login');
    });
  });
});
