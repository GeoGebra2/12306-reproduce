
/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import HomePage from '../src/pages/HomePage';

describe('Auth Entry Points (HomePage)', () => {
  it('should render Login and Register links in the header', () => {
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );

    const loginLink = screen.getByText('登录');
    const registerLink = screen.getByText('注册');

    expect(loginLink).toBeInTheDocument();
    expect(registerLink).toBeInTheDocument();

    expect(loginLink.closest('a')).toHaveAttribute('href', '/login');
    expect(registerLink.closest('a')).toHaveAttribute('href', '/register');
  });
});
