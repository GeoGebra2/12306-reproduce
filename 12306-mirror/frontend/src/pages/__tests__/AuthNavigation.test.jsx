import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import App from '../../App';

describe('Auth Navigation', () => {
  it('navigates to login page when login button is clicked', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    // Find the login link/button
    // Note: It might be just text '登录' initially
    const loginBtn = screen.getByText('登录');
    fireEvent.click(loginBtn);

    // Should navigate to Login Page
    expect(screen.getByText('用户登录')).toBeInTheDocument();
  });

  it('navigates to register page when register button is clicked', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    const registerBtn = screen.getByText('注册');
    fireEvent.click(registerBtn);

    expect(screen.getByText('用户注册')).toBeInTheDocument();
  });
});
