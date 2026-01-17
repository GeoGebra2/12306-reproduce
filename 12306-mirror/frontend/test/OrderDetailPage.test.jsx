
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import OrderDetailPage from '../src/pages/OrderDetailPage';

// Mock axios
vi.mock('axios');

const mockOrder = {
  id: 1,
  status: 'Paid',
  total_price: 100,
  train_number: 'G123',
  departure: 'Beijing',
  arrival: 'Shanghai',
  departure_time: '2023-01-01 10:00',
  items: [
    { id: 1, passenger_name: 'Alice', seat_type: '二等座', price: 100 }
  ]
};

describe('OrderDetailPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('user', JSON.stringify({ id: 123, username: 'testuser' }));
    // Mock window.alert
    vi.spyOn(window, 'alert').mockImplementation(() => {});
  });

  it('renders order details correctly', async () => {
    axios.get.mockResolvedValue({ data: { success: true, data: mockOrder } });

    render(
      <MemoryRouter initialEntries={['/order-detail/1']}>
        <Routes>
          <Route path="/order-detail/:orderId" element={<OrderDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/订单号：1/)).toBeInTheDocument();
      expect(screen.getAllByText('已支付')[0]).toBeInTheDocument();
      expect(screen.getByText('G123')).toBeInTheDocument();
      expect(screen.getByText('Alice')).toBeInTheDocument();
    });
  });

  it('shows Refund button for Paid order', async () => {
    axios.get.mockResolvedValue({ data: { success: true, data: mockOrder } });

    render(
      <MemoryRouter initialEntries={['/order-detail/1']}>
        <Routes>
          <Route path="/order-detail/:orderId" element={<OrderDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /退票/ })).toBeInTheDocument();
    });
  });

  it('handles Refund action', async () => {
    axios.get.mockResolvedValue({ data: { success: true, data: mockOrder } });
    axios.post.mockResolvedValue({ data: { success: true } });
    
    // Mock window.confirm
    const confirmSpy = vi.spyOn(window, 'confirm');
    confirmSpy.mockImplementation(() => true);
    
    render(
      <MemoryRouter initialEntries={['/order-detail/1']}>
        <Routes>
          <Route path="/order-detail/:orderId" element={<OrderDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    const refundBtn = await waitFor(() => screen.getByRole('button', { name: /退票/ }));
    fireEvent.click(refundBtn);
    
    expect(confirmSpy).toHaveBeenCalled();
    await waitFor(() => {
        expect(axios.post).toHaveBeenCalled();
        const callArgs = axios.post.mock.calls[0];
        expect(callArgs[0]).toBe('/api/orders/1/refund');
    });
  });
});
