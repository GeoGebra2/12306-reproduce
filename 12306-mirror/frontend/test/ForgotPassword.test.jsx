
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
        vi.clearAllMocks();
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
