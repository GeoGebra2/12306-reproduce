import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import ForgotPasswordPage from '../ForgotPasswordPage';
import LoginPage from '../LoginPage';

describe('Forgot Password Flow Infrastructure', () => {
  it('renders forgot password page correctly', () => {
    render(
      <BrowserRouter>
        <ForgotPasswordPage />
      </BrowserRouter>
    );
    // Use regex to match partial text
    expect(screen.getByText('找回密码', { selector: '.page-title' })).toBeInTheDocument();
    expect(screen.getByText(/Step 1/)).toBeInTheDocument();
  });

  it('navigates from login to forgot password', () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );
    const link = screen.getByText('忘记密码？');
    expect(link).toHaveAttribute('href', '/forgot-password');
  });
});
