import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import HomePage from './HomePage';

describe('HomePage', () => {
  it('renders home page layout correctly', () => {
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );

    // Check Header
    expect(screen.getByRole('img', { name: /12306 Logo/i })).toBeInTheDocument();
    expect(screen.getByText(/我的12306/i)).toBeInTheDocument();
    expect(screen.getByText(/登录/i)).toBeInTheDocument();
    expect(screen.getByText(/注册/i)).toBeInTheDocument();

    // Check Navigation
    expect(screen.getByText(/首页/i)).toBeInTheDocument();
    expect(screen.getByText(/车票/i)).toBeInTheDocument();
    expect(screen.getByText(/团购服务/i)).toBeInTheDocument();
    
    // Check Banner
    expect(screen.getByText(/Banner Carousel/i)).toBeInTheDocument();
    
    // Check Quick Search Placeholder
    expect(screen.getByText(/Quick Search Panel/i)).toBeInTheDocument();
    
    // Check Footer
    expect(screen.getByText(/2024 12306-Mirror/i)).toBeInTheDocument();
  });
});
