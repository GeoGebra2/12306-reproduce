import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import CateringBookPage from '../src/pages/CateringBookPage';
import axios from 'axios';

// Mock components
vi.mock('../src/components/Navbar', () => ({
  default: () => <div data-testid="navbar">Navbar</div>
}));
vi.mock('../src/components/HeaderBrandSearch', () => ({
  default: () => <div data-testid="brand-search">BrandSearch</div>
}));

// Mock axios
vi.mock('axios');

describe('CateringBookPage', () => {
  const mockItems = {
    data: {
      success: true,
      data: [
        { id: 1, name: 'Item 1', price: 15, image_url: 'img1.jpg', type: 'SELF_OPERATED' },
        { id: 2, name: 'Item 2', price: 30, image_url: 'img2.jpg', type: 'SELF_OPERATED' }
      ]
    }
  };

  const mockBrands = {
    data: {
      success: true,
      data: [
        { id: 1, name: 'Brand A', logo_url: 'logo1.jpg' },
        { id: 2, name: 'Brand B', logo_url: 'logo2.jpg' }
      ]
    }
  };

  beforeEach(() => {
    vi.resetAllMocks();
    axios.get.mockImplementation((url) => {
      if (url.includes('/items')) return Promise.resolve(mockItems);
      if (url.includes('/brands')) return Promise.resolve(mockBrands);
      return Promise.reject(new Error('Unknown URL'));
    });
  });

  it('renders correctly and fetches data', async () => {
    render(
      <BrowserRouter>
        <CateringBookPage />
      </BrowserRouter>
    );

    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByTestId('brand-search')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Brand A')).toBeInTheDocument();
    });

    expect(screen.getByText('¥15')).toBeInTheDocument();
  });

  it('adds items to cart and calculates total', async () => {
    render(
      <BrowserRouter>
        <CateringBookPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Item 1')).toBeInTheDocument();
    });

    // Add Item 1 to cart
    const addBtns = screen.getAllByText('加入购物车');
    fireEvent.click(addBtns[0]); // Add first item (Item 1, price 15)

    await waitFor(() => {
      expect(screen.getByText('总计: ¥15')).toBeInTheDocument();
    });

    // Add Item 1 again
    const plusBtn = screen.getByText('+');
    fireEvent.click(plusBtn);

    await waitFor(() => {
      expect(screen.getByText('总计: ¥30')).toBeInTheDocument();
    });
  });

  it('submits order successfully', async () => {
    axios.post.mockResolvedValue({
      data: { success: true, data: { orderId: 123 } }
    });
    
    // Mock window.alert
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});

    render(
      <BrowserRouter>
        <CateringBookPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Item 1')).toBeInTheDocument();
    });

    // Add to cart
    fireEvent.click(screen.getAllByText('加入购物车')[0]);

    // Checkout
    const checkoutBtn = screen.getByText('去结算');
    fireEvent.click(checkoutBtn);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        '/api/catering/orders',
        { items: [{ id: 1, quantity: 1 }] },
        expect.objectContaining({ headers: { 'x-user-id': '1' } })
      );
      expect(alertMock).toHaveBeenCalledWith(expect.stringContaining('下单成功'));
    });
  });
});