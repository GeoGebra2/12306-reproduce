import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import RegisterPage from '../src/pages/RegisterPage';

// Mock axios
vi.mock('axios');

describe('RegisterPage Integration', () => {
  it('renders registration form fields', () => {
    render(
      <BrowserRouter>
        <RegisterPage />
      </BrowserRouter>
    );

    expect(screen.getByLabelText(/用户名/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^密码/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/确认密码/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/姓名/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/证件号码/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/手机号码/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /下一步/i })).toBeInTheDocument();
  });

  it('submits form data to backend', async () => {
    axios.post.mockResolvedValue({ data: { success: true } });
    const mockNavigate = vi.fn();
    
    // We can't easily mock useNavigate inside the component without wrapping or mocking react-router-dom more deeply,
    // but for integration test, we check axios call.
    
    render(
      <BrowserRouter>
        <RegisterPage />
      </BrowserRouter>
    );

    // Fill form
    fireEvent.change(screen.getByLabelText(/用户名/i), { target: { value: 'newuser' } });
    fireEvent.change(screen.getByLabelText(/^密码/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/确认密码/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/姓名/i), { target: { value: 'New User' } });
    fireEvent.change(screen.getByLabelText(/证件号码/i), { target: { value: '110101199001011234' } });
    fireEvent.change(screen.getByLabelText(/手机号码/i), { target: { value: '13800138000' } });
    
    // Click agree checkbox (if available, assuming it is based on reqs)
    const checkbox = screen.getByLabelText(/我已阅读并同意/i);
    if (checkbox) fireEvent.click(checkbox);

    // Submit
    fireEvent.click(screen.getByRole('button', { name: /下一步/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(expect.stringContaining('/api/users/register'), expect.objectContaining({
        username: 'newuser',
        password: 'password123',
        real_name: 'New User',
        phone: '13800138000'
      }));
    });
  });
});
