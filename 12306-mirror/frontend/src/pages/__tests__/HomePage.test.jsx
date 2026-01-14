import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import HomePage from '../HomePage';
import React from 'react';

describe('ROOT:SCE-0 HomePage', () => {
    it('renders the home page structure correctly', () => {
        render(<BrowserRouter><HomePage /></BrowserRouter>);

        // 1. Top Brand
        expect(screen.getByText('中国铁路12306')).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/搜索车票/)).toBeInTheDocument();
        expect(screen.getByText('登录')).toBeInTheDocument();
        expect(screen.getByText('注册')).toBeInTheDocument();

        // 2. Navbar
        expect(screen.getByText('首页')).toBeInTheDocument();
        expect(screen.getByText('车票', { selector: '.navbar li' })).toBeInTheDocument();
        
        // 4. Booking Form
        expect(screen.getByText('车票', { selector: '.booking-sidebar .active' })).toBeInTheDocument();
        expect(screen.getByText('单程')).toBeInTheDocument();
        expect(screen.getAllByPlaceholderText(/简拼\/全拼\/汉字/)).toHaveLength(2); // 出发地 & 目的地
        expect(screen.getByRole('button', { name: /查询车票/i })).toBeInTheDocument();

        // 5. Hero Services
        expect(screen.getByText('重点旅客预约')).toBeInTheDocument();
        
        // 7. Notice
        expect(screen.getByText('最新发布')).toBeInTheDocument();
    });
});
