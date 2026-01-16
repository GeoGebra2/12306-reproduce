import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import ProfileInfo from '../src/components/Profile/ProfileInfo';

// Mock axios
vi.mock('axios');

describe('ProfileInfo Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders loading state initially', () => {
    localStorage.setItem('user', JSON.stringify({ id: 1 }));
    // Return a promise that never resolves immediately to show loading
    axios.get.mockReturnValue(new Promise(() => {}));
    
    render(<ProfileInfo />);
    expect(screen.getByText(/加载中/i)).toBeInTheDocument();
  });

  it('fetches and displays user information', async () => {
    const mockUser = {
      id: 1,
      username: 'testuser',
      real_name: '张三',
      phone: '13800138000',
      email: 'test@example.com',
      type: 'ADULT'
    };

    localStorage.setItem('user', JSON.stringify({ id: 1 }));
    axios.get.mockResolvedValue({ 
      data: { 
        success: true, 
        user: mockUser 
      } 
    });

    render(<ProfileInfo />);

    await waitFor(() => {
      expect(screen.getByText('张三')).toBeInTheDocument();
      expect(screen.getByText('testuser')).toBeInTheDocument();
      expect(screen.getByText('13800138000')).toBeInTheDocument();
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });

    expect(axios.get).toHaveBeenCalledWith('/api/users/profile', {
      headers: { 'x-user-id': 1 }
    });
  });

  it('handles error when fetch fails', async () => {
    localStorage.setItem('user', JSON.stringify({ id: 1 }));
    axios.get.mockRejectedValue(new Error('Network Error'));

    render(<ProfileInfo />);

    await waitFor(() => {
      expect(screen.getByText(/获取用户信息失败/i)).toBeInTheDocument();
    });
  });

  it('redirects or shows message if no user logged in', () => {
    // localStorage is empty
    render(<ProfileInfo />);
    expect(screen.getByText(/请先登录/i)).toBeInTheDocument();
  });
});
