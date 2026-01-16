import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import RegisterPage from '../src/pages/RegisterPage';

describe('RegisterPage Integration', () => {
  
  it('submits registration form', async () => {
    const postSpy = vi.spyOn(axios, 'post').mockResolvedValue({
        data: { code: 200, message: 'Register success' }
    });

    render(
      <BrowserRouter>
        <RegisterPage />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText(/用户名/i), { target: { value: 'newuser' } });
    fireEvent.change(screen.getByLabelText(/^密码/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/确认密码/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/姓名/i), { target: { value: 'New User' } });
    fireEvent.change(screen.getByLabelText(/证件号码/i), { target: { value: '123456789012345678' } });
    fireEvent.change(screen.getByLabelText(/手机号码/i), { target: { value: '13800138000' } });
    
    const checkbox = screen.getByLabelText(/我已阅读并同意/i);
    fireEvent.click(checkbox);

    const submitBtn = screen.getByRole('button', { name: /注册/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
        expect(postSpy).toHaveBeenCalledWith(expect.stringContaining('/register'), expect.objectContaining({
            username: 'newuser',
            password: 'password123'
        }));
    });
    
    postSpy.mockRestore();
  });
});
