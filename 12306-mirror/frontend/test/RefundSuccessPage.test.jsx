import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import RefundSuccessPage from '../src/pages/RefundSuccessPage';

// Mock HeaderBrandSearch since it might use complex logic or context
vi.mock('../src/components/HeaderBrandSearch', () => ({
    default: () => <div data-testid="header-brand-search">Header</div>
}));

// Mock Navbar
vi.mock('../src/components/Navbar', () => ({
    default: () => <div data-testid="navbar">Navbar</div>
}));

describe('RefundSuccessPage', () => {
    it('renders error message when accessed without state', () => {
        render(
            <MemoryRouter initialEntries={['/refund-success']}>
                <Routes>
                    <Route path="/refund-success" element={<RefundSuccessPage />} />
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByText('无效的访问请求')).toBeInTheDocument();
        expect(screen.getByText('返回首页')).toBeInTheDocument();
    });

    it('renders success message and order details when accessed with state', () => {
        const state = { orderId: '12345', amount: 100 };
        render(
            <MemoryRouter initialEntries={[{ pathname: '/refund-success', state }]}>
                <Routes>
                    <Route path="/refund-success" element={<RefundSuccessPage />} />
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByText('退票申请已提交，系统正在处理中')).toBeInTheDocument();
        expect(screen.getByText('12345')).toBeInTheDocument();
        expect(screen.getByText('¥100')).toBeInTheDocument();
        expect(screen.getByText('查看订单详情')).toBeInTheDocument();
        expect(screen.getByText('返回首页')).toBeInTheDocument();
    });
});