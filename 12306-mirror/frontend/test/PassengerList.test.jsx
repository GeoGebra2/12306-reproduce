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

    it('opens add passenger modal and submits form', async () => {
        axios.get.mockResolvedValue({ data: { success: true, data: [] } });
        axios.post.mockResolvedValue({ data: { success: true, data: { id: 3, name: '王五', type: '成人' } } });

        render(<PassengerList />);

        // Wait for initial load
        await waitFor(() => expect(screen.getByText('暂无联系人')).toBeInTheDocument());

        // Click Add button
        fireEvent.click(screen.getByText('+ 添加乘车人'));

        // Expect modal/form to appear
        expect(screen.getByText('基本信息')).toBeInTheDocument();

        // Fill form
        fireEvent.change(screen.getByPlaceholderText('请输入姓名'), { target: { value: '王五' } });
        fireEvent.change(screen.getByPlaceholderText('请输入证件号码'), { target: { value: '110101199001015678' } });
        fireEvent.change(screen.getByPlaceholderText('请输入手机号'), { target: { value: '13700137000' } });

        // Submit
        fireEvent.click(screen.getByText('保存'));

        // Verify API call
        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith('/api/passengers', expect.objectContaining({
                name: '王五',
                id_card: '110101199001015678',
                phone: '13700137000'
            }), expect.anything());
        });
    });

    it('opens delete confirmation and deletes passenger', async () => {
        axios.get.mockResolvedValue({ data: { success: true, data: [{ id: 1, name: '张三', id_type: '身份证', id_card: '123', phone: '123', type: '成人' }] } });
        axios.delete.mockResolvedValue({ data: { success: true } });

        render(<PassengerList />);
        await waitFor(() => expect(screen.getByText('张三')).toBeInTheDocument());

        // Click delete
        fireEvent.click(screen.getByText('删除'));

        // Expect confirmation modal
        expect(screen.getByText('确认删除')).toBeInTheDocument();
        expect(screen.getByText('确定要删除该乘车人吗？')).toBeInTheDocument();

        // Click confirm
        fireEvent.click(screen.getByText('确定'));

        // Verify API call
        await waitFor(() => {
            expect(axios.delete).toHaveBeenCalledWith('/api/passengers/1', expect.anything());
        });
    });
});
