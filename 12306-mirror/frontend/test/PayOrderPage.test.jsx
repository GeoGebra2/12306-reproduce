import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import axios from 'axios';
import PayOrderPage from '../src/pages/PayOrderPage';

// Mock axios
vi.mock('axios');

// Mock child components to avoid complex rendering
vi.mock('../src/components/HeaderBrandSearch', () => ({
  default: () => <div data-testid="header-brand-search">Header</div>
}));
vi.mock('../src/components/Navbar', () => ({
  default: () => <div data-testid="navbar">Navbar</div>
}));

describe('PayOrderPage', () => {
  const mockOrder = {
    id: 123,
    train_number: 'G101',
    departure: 'Beijing',
    arrival: 'Shanghai',
    departure_time: '08:00',
    arrival_time: '12:00',
    total_price: 300,
    status: 'Unpaid',
    created_at: new Date().toISOString(),
    items: [
      { passenger_name: 'TestUser', seat_type: '二等座', price: 100, passenger_id_card: '123456' }
    ]
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders order details correctly', async () => {
    axios.get.mockResolvedValue({ data: { success: true, data: mockOrder } });

    render(
      <MemoryRouter initialEntries={['/pay-order/123']}>
        <Routes>
          <Route path="/pay-order/:orderId" element={<PayOrderPage />} />
        </Routes>
      </MemoryRouter>
    );

    // Should fetch order
    await waitFor(() => expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/api/orders/123'), expect.any(Object)));

    // Check order info
    expect(screen.getByText('G101')).toBeInTheDocument();
    expect(screen.getByText('Beijing -> Shanghai')).toBeInTheDocument();
    
    // Check price
    expect(screen.getByText('¥300')).toBeInTheDocument();
    
    // Check passenger
    expect(screen.getByText('TestUser')).toBeInTheDocument();
  });

  it('opens modal and handles payment correctly', async () => {
    axios.get.mockResolvedValue({ data: { success: true, data: mockOrder } });
    axios.post.mockResolvedValue({ data: { success: true } });

    render(
      <MemoryRouter initialEntries={['/pay-order/123']}>
        <Routes>
          <Route path="/pay-order/:orderId" element={<PayOrderPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText('G101')).toBeInTheDocument());

    // Click Pay button
    const payBtn = screen.getByRole('button', { name: /立即支付/i });
    fireEvent.click(payBtn);

    // Check Modal appears
    expect(screen.getByText(/请扫码支付/i)).toBeInTheDocument();
    
    // Click "Simulate Pay Success" button
    const simPayBtn = screen.getByRole('button', { name: /模拟支付成功/i });
    fireEvent.click(simPayBtn);

    // Should call API
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        '/api/orders/123/pay', 
        {}, 
        expect.any(Object)
      );
    });
    
    // Should show success alert (mock alert?)
    // In JSDOM alert is not implemented, we can mock it or just rely on API call
  });
});
