import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import OrderList from '../src/components/Order/OrderList';

vi.mock('axios');

describe('OrderList Cancel Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock user in localStorage
    Storage.prototype.getItem = vi.fn(() => JSON.stringify({ id: 1, name: 'Test User' }));
    // Mock window.confirm
    window.confirm = vi.fn(() => true);
    // Mock alert
    window.alert = vi.fn();
  });

  it('cancels an order successfully', async () => {
    const mockOrders = [
      {
        id: 101,
        status: 'Unpaid',
        total_price: 100,
        created_at: new Date().toISOString(),
        items: [{ train_number: 'G1', departure: 'A', arrival: 'B', passenger_name: 'P1', seat_type: '二等座' }]
      }
    ];

    // First call: get orders
    axios.get.mockResolvedValueOnce({ data: { success: true, data: mockOrders } });
    
    // Second call: cancel order
    axios.post.mockResolvedValueOnce({ data: { success: true } });
    
    // Third call: refresh orders (empty list)
    axios.get.mockResolvedValueOnce({ data: { success: true, data: [] } });

    render(<OrderList />);

    // Wait for orders to load
    await waitFor(() => {
      expect(screen.getByText('G1')).toBeInTheDocument();
    });

    // Click Cancel
    const cancelBtn = screen.getByText('取消订单');
    fireEvent.click(cancelBtn);

    // Verify confirm dialog
    expect(window.confirm).toHaveBeenCalledWith('确定要取消该订单吗？');

    // Verify API call
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('/api/orders/101/cancel', {}, expect.objectContaining({
        headers: { 'x-user-id': 1 }
      }));
    });

    // Verify success alert
    await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith('订单取消成功');
    });

    // Verify refresh
    await waitFor(() => {
       // Since we mocked the second GET to return empty list, "暂无订单" should appear
       expect(screen.getByText('暂无订单')).toBeInTheDocument();
    });
  });
});
