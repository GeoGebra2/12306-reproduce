import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import LoginPage from '../src/pages/LoginPage';

// Mock axios
vi.mock('axios');

describe('LoginPage Integration', () => {
  it('renders login form fields', () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    expect(screen.getByPlaceholderText(/用户名\/邮箱\/手机号/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/密码/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /立即登录/i })).toBeInTheDocument();
  });

  it('submits login form and redirects', async () => {
    axios.post.mockResolvedValue({ 
      data: { 
        success: true, 
        token: 'fake-jwt-token',
        user: { username: 'testuser' } 
      } 
    });
    
    // Spy on localStorage
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
    
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    // Fill form
    fireEvent.change(screen.getByPlaceholderText(/用户名\/邮箱\/手机号/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByPlaceholderText(/密码/i), { target: { value: 'password123' } });

    // Submit
    fireEvent.click(screen.getByRole('button', { name: /立即登录/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(expect.stringContaining('/api/users/login'), {
        username: 'testuser',
        password: 'password123'
      });
      expect(setItemSpy).toHaveBeenCalledWith('token', 'fake-jwt-token');
      expect(setItemSpy).toHaveBeenCalledWith('user', expect.any(String));
    });
  });
});
