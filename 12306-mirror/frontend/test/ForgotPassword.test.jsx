
/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import ForgotPasswordPage from '../src/pages/ForgotPasswordPage';

// Mock axios
vi.mock('axios');

describe('ForgotPasswordPage Flow', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('completes the full flow: check -> verify -> reset', async () => {
        // Mock API responses for the full flow
        axios.post.mockImplementation((url) => {
            if (url.includes('check-user')) return Promise.resolve({ data: { success: true, phone: '138****8888' } });
            if (url.includes('verify-code')) return Promise.resolve({ data: { success: true } });
            if (url.includes('reset-password')) return Promise.resolve({ data: { success: true } });
            return Promise.reject(new Error(`Unknown URL: ${url}`));
        });

        render(
            <BrowserRouter>
                <ForgotPasswordPage />
            </BrowserRouter>
        );

        // Step 1 -> Step 2
        fireEvent.change(screen.getByPlaceholderText('用户名/邮箱/手机号'), { target: { value: 'testuser' } });
        fireEvent.click(screen.getByText('下一步'));
        await waitFor(() => {
            expect(screen.getByText('2. 验证身份')).toHaveClass('active');
            expect(screen.getByText('验证码已发送至: 138****8888')).toBeInTheDocument();
        });

        // Step 2 -> Step 3
        fireEvent.change(screen.getByPlaceholderText('请输入验证码'), { target: { value: '123456' } });
        fireEvent.click(screen.getByText('下一步'));
        await waitFor(() => {
            expect(screen.getByText('3. 重置密码')).toHaveClass('active');
        });

        // Step 3 -> Step 4
        fireEvent.change(screen.getByPlaceholderText('输入新密码'), { target: { value: 'newpass123' } });
        fireEvent.change(screen.getByPlaceholderText('确认新密码'), { target: { value: 'newpass123' } });
        fireEvent.click(screen.getByText('确定'));

        await waitFor(() => {
            expect(screen.getByText('4. 完成')).toHaveClass('active');
            expect(screen.getByText('密码重置成功！')).toBeInTheDocument();
        });
    });

    it('renders step 1 initially', () => {
        render(
            <BrowserRouter>
                <ForgotPasswordPage />
            </BrowserRouter>
        );

        expect(screen.getByTestId('forgot-password-page')).toBeInTheDocument();
        expect(screen.getByText('1. 填写账号')).toHaveClass('active');
        expect(screen.getByPlaceholderText('用户名/邮箱/手机号')).toBeInTheDocument();
    });

    it('advances to step 2 on valid account', async () => {
        axios.post.mockResolvedValue({ data: { success: true, phone: '138****8888' } });

        render(
            <BrowserRouter>
                <ForgotPasswordPage />
            </BrowserRouter>
        );

        fireEvent.change(screen.getByPlaceholderText('用户名/邮箱/手机号'), { target: { value: 'testuser' } });
        fireEvent.click(screen.getByText('下一步'));

        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith('/api/users/forgot/check-user', { account: 'testuser' });
            expect(screen.getByText('2. 验证身份')).toHaveClass('active');
            expect(screen.getByText('验证码已发送至: 138****8888')).toBeInTheDocument();
        });
    });

    it('shows error on invalid account', async () => {
        axios.post.mockRejectedValue({ response: { data: { message: 'User not found' } } });

        render(
            <BrowserRouter>
                <ForgotPasswordPage />
            </BrowserRouter>
        );

        fireEvent.change(screen.getByPlaceholderText('用户名/邮箱/手机号'), { target: { value: 'invalid' } });
        fireEvent.click(screen.getByText('下一步'));

        await waitFor(() => {
            expect(screen.getByText('User not found')).toBeInTheDocument();
        });
    });
});
