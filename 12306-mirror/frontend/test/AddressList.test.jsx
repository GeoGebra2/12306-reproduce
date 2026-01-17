/**
 * @vitest-environment jsdom
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import AddressList from '../src/components/Profile/AddressList';

vi.mock('axios');

describe('AddressList Component', () => {
  const mockAddresses = [
    {
      id: 1,
      receiver_name: '王五',
      phone: '13700137000',
      province: '广东省',
      city: '广州市',
      district: '天河区',
      detail_address: '天河路1号'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock localStorage
    Storage.prototype.getItem = vi.fn(() => JSON.stringify({ id: 1, name: 'Test User' }));
    // Mock window.confirm
    window.confirm = vi.fn(() => true);
  });

  it('renders address list', async () => {
    axios.get.mockResolvedValue({ data: { success: true, data: mockAddresses } });

    render(<AddressList />);

    await waitFor(() => {
      expect(screen.getByText('王五')).toBeInTheDocument();
      expect(screen.getByText('13700137000')).toBeInTheDocument();
      expect(screen.getByText('广东省 广州市 天河区')).toBeInTheDocument();
    });
  });

  it('adds a new address', async () => {
    axios.get.mockResolvedValue({ data: { success: true, data: [] } });
    axios.post.mockResolvedValue({ data: { success: true, data: { id: 2 } } });

    render(<AddressList />);

    // Click add button
    fireEvent.click(screen.getByText('新增地址'));

    // Fill form
    fireEvent.change(screen.getByPlaceholderText('请填写收件人姓名'), { target: { value: '赵六' } });
    fireEvent.change(screen.getByPlaceholderText('请填写手机号码'), { target: { value: '13600136000' } });
    fireEvent.change(screen.getByPlaceholderText('省'), { target: { value: '浙江省' } });
    fireEvent.change(screen.getByPlaceholderText('市'), { target: { value: '杭州市' } });
    fireEvent.change(screen.getByPlaceholderText('区'), { target: { value: '西湖区' } });
    fireEvent.change(screen.getByPlaceholderText('街道门牌信息'), { target: { value: '西湖路1号' } });

    // Save
    fireEvent.click(screen.getByText('保存'));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('/api/addresses', expect.objectContaining({
        receiver_name: '赵六',
        province: '浙江省'
      }), expect.anything());
    });
  });

  it('deletes an address', async () => {
    axios.get.mockResolvedValue({ data: { success: true, data: mockAddresses } });
    axios.delete.mockResolvedValue({ data: { success: true } });

    render(<AddressList />);
    
    await waitFor(() => expect(screen.getByText('王五')).toBeInTheDocument());

    fireEvent.click(screen.getByText('删除'));

    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalledWith('/api/addresses/1', expect.anything());
    });
  });
});
