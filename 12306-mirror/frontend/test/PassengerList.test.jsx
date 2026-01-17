// @vitest-environment jsdom
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import PassengerList from '../src/components/Profile/PassengerList';
import axios from 'axios';

vi.mock('axios');

describe('PassengerList Component', () => {
    const mockPassengers = [
        { id: 1, name: '张三', id_type: '身份证', id_card: '110101199001011234', phone: '13800138000', type: '成人' },
        { id: 2, name: '李四', id_type: '护照', id_card: 'G12345678', phone: '13900139000', type: '学生' }
    ];

    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('renders passenger list correctly', async () => {
        axios.get.mockResolvedValue({ data: { success: true, data: mockPassengers } });

        render(<PassengerList />);

        expect(screen.getByText('常用联系人')).toBeInTheDocument();
        // expect(screen.getByText('加载中...')).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByText('张三')).toBeInTheDocument();
            expect(screen.getByText('李四')).toBeInTheDocument();
        });

        expect(screen.getByText('110101199001011234')).toBeInTheDocument();
        expect(screen.getByText('G12345678')).toBeInTheDocument();
        expect(screen.getByText('成人')).toBeInTheDocument();
        expect(screen.getByText('学生')).toBeInTheDocument();
    });

    it('handles empty list', async () => {
        axios.get.mockResolvedValue({ data: { success: true, data: [] } });

        render(<PassengerList />);

        await waitFor(() => {
            expect(screen.getByText('暂无联系人')).toBeInTheDocument();
        });
    });
    
    it('handles API error', async () => {
        axios.get.mockRejectedValue(new Error('Network error'));
        
        render(<PassengerList />);
        
        await waitFor(() => {
             expect(screen.getByText(/获取乘车人列表失败/i)).toBeInTheDocument();
        });
    });
});
