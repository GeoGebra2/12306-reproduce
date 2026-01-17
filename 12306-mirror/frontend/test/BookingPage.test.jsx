import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import BookingPage from '../src/pages/BookingPage';

vi.mock('axios');

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({
      state: {
        train: {
          train_number: 'G1',
          start_station: 'Beijing',
          end_station: 'Shanghai',
          start_time: '09:00',
          end_time: '13:00'
        },
        date: '2023-10-01'
      }
    })
  };
});

describe('BookingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('user', JSON.stringify({ id: 1, name: 'Test User' }));
    
    // Mock passenger list
    axios.get.mockImplementation((url) => {
        if (url === '/api/passengers') {
            return Promise.resolve({
                data: {
                    success: true,
                    data: [
                        { id: 10, name: 'Passenger A', id_type: '身份证', id_card: '111', phone: '123' },
                        { id: 11, name: 'Passenger B', id_type: '身份证', id_card: '222', phone: '456' }
                    ]
                }
            });
        }
        return Promise.resolve({ data: {} });
    });

    axios.post.mockResolvedValue({ data: { success: true, orderId: 100 } });
  });

  it('renders train info correctly', () => {
    render(
      <MemoryRouter>
        <BookingPage />
      </MemoryRouter>
    );

    expect(screen.getByText('G1')).toBeInTheDocument();
    expect(screen.getByText(/Beijing/)).toBeInTheDocument();
    expect(screen.getByText(/Shanghai/)).toBeInTheDocument();
    expect(screen.getByText(/2023-10-01/)).toBeInTheDocument();
  });

  it('allows adding a passenger from list', async () => {
    render(
        <MemoryRouter>
          <BookingPage />
        </MemoryRouter>
    );

    // Wait for list
    await waitFor(() => {
        expect(screen.getByText('Passenger A')).toBeInTheDocument();
    });

    // Select passenger
    fireEvent.click(screen.getByText('Passenger A'));

    // Verify passenger added to form (Table appears)
    await waitFor(() => {
        // Table row should contain the name
        const rows = screen.getAllByRole('row');
        expect(rows.length).toBeGreaterThan(1); // Header + 1 row
        expect(screen.getByDisplayValue('二等座')).toBeInTheDocument();
    });
  });

  it('submits order successfully', async () => {
    render(
        <MemoryRouter>
          <BookingPage />
        </MemoryRouter>
    );

    // Select passenger
    await waitFor(() => screen.getByText('Passenger A'));
    fireEvent.click(screen.getByText('Passenger A'));

    // Submit
    const submitBtn = screen.getByText(/提交订单/i);
    fireEvent.click(submitBtn);

    await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith('/api/orders', expect.objectContaining({
            train_number: 'G1',
            passengers: expect.arrayContaining([
                expect.objectContaining({ name: 'Passenger A' })
            ])
        }), expect.anything());
        
        expect(mockNavigate).toHaveBeenCalledWith('/profile/orders');
    });
  });
});
