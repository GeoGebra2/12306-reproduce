import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import axios from 'axios';
import CateringVendorPage from '../src/pages/CateringVendorPage';

vi.mock('axios');
vi.mock('../src/components/Navbar', () => ({ default: () => <div data-testid="navbar">Navbar</div> }));
vi.mock('../src/components/HeaderBrandSearch', () => ({ default: () => <div data-testid="brand-search">BrandSearch</div> }));

describe('CateringVendorPage', () => {
  const mockBrand = { id: 1, name: 'KFC', logo_url: 'kfc.png' };
  const mockItems = [
    { id: 101, name: 'Burger', price: 20, image_url: 'burger.jpg', brand_id: 1 },
    { id: 102, name: 'Fries', price: 10, image_url: 'fries.jpg', brand_id: 1 }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders vendor info and items correctly', async () => {
    axios.get.mockImplementation((url) => {
      if (url === '/api/catering/brands') return Promise.resolve({ data: { success: true, data: [mockBrand] } });
      if (url.includes('/api/catering/items')) return Promise.resolve({ data: { success: true, data: mockItems } });
      return Promise.reject(new Error('Not found'));
    });

    render(
      <MemoryRouter initialEntries={['/catering/vendor/1']}>
        <Routes>
          <Route path="/catering/vendor/:id" element={<CateringVendorPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('KFC')).toBeInTheDocument();
      expect(screen.getByText('Burger')).toBeInTheDocument();
      expect(screen.getByText('Fries')).toBeInTheDocument();
    });
  });

  it('adds items to cart and checks out', async () => {
    axios.get.mockImplementation((url) => {
      if (url === '/api/catering/brands') return Promise.resolve({ data: { success: true, data: [mockBrand] } });
      if (url.includes('/api/catering/items')) return Promise.resolve({ data: { success: true, data: mockItems } });
      return Promise.reject(new Error('Not found'));
    });

    axios.post.mockResolvedValue({ data: { success: true, data: { orderId: 123 } } });
    window.alert = vi.fn();

    render(
      <MemoryRouter initialEntries={['/catering/vendor/1']}>
        <Routes>
          <Route path="/catering/vendor/:id" element={<CateringVendorPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => screen.getByText('Burger'));

    // Add to cart
    const addBtns = screen.getAllByText('+');
    fireEvent.click(addBtns[0]); // Add Burger

    // Check cart (assuming cart shows quantity)
    // This depends on implementation detail, let's assume a "Checkout" button appears or updates
    
    const checkoutBtn = screen.getByRole('button', { name: /去结算/i });
    fireEvent.click(checkoutBtn);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('/api/catering/orders', expect.objectContaining({
        items: [{ id: 101, quantity: 1 }]
      }), expect.anything());
      expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('123'));
    });
  });
});
