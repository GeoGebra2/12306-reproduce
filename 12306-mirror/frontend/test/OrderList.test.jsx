import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import OrderList from '../src/components/Order/OrderList';

vi.mock('axios');

describe('OrderList Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('user', JSON.stringify({ id: 1, name: 'Test User' }));
  });

  it('renders tabs and initial empty state', async () => {
    axios.get.mockResolvedValue({ data: { success: true, data: [] } });

    render(<OrderList />);

    expect(screen.getByText('未完成订单')).toBeInTheDocument();
    expect(screen.getByText('未出行订单')).toBeInTheDocument();
    expect(screen.getByText('历史订单')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('暂无订单')).toBeInTheDocument();
    });
  });

  it('renders orders when data is returned', async () => {
    const mockOrders = [
      {
        id: 101,
        status: 'Unpaid',
        total_price: 150.0,
        created_at: '2023-01-01T12:00:00Z',
        items: [
          {
            train_number: 'G1',
            departure: 'Beijing',
            arrival: 'Shanghai',
            passenger_name: 'Zhang San',
            seat_type: 'Second Class'
          }
        ]
      }
    ];

    axios.get.mockResolvedValue({ data: { success: true, data: mockOrders } });

    render(<OrderList />);

    await waitFor(() => {
      expect(screen.getByText('订单号: 101')).toBeInTheDocument();
      expect(screen.getByText('G1')).toBeInTheDocument();
      expect(screen.getByText('Zhang San | Second Class')).toBeInTheDocument();
      expect(screen.getByText('等待支付')).toBeInTheDocument();
      expect(screen.getByText('¥150')).toBeInTheDocument();
    });
  });

  it('switches tabs and fetches data', async () => {
    axios.get.mockResolvedValue({ data: { success: true, data: [] } });

    render(<OrderList />);

    const paidTab = screen.getByText('未出行订单');
    fireEvent.click(paidTab);

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('/api/orders', expect.objectContaining({
        params: { status: 'Paid' }
      }));
    });
  });
});
