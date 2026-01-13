import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import TicketSearchPage from '../src/pages/TicketSearchPage';
import SearchQueryBar from '../src/pages/components/SearchQueryBar';

describe('REQ-2-2-1: Search Query Bar on Ticket List Page', () => {
  
  it('renders correctly with initial URL parameters', () => {
    render(
      <MemoryRouter initialEntries={['/search?from=北京&to=上海&date=2024-01-01']}>
        <Routes>
            <Route path="/search" element={<TicketSearchPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByPlaceholderText('出发地')).toHaveValue('北京');
    expect(screen.getByPlaceholderText('目的地')).toHaveValue('上海');
    // Date input value check might depend on implementation details, checking value prop
    const dateInput = screen.getAllByRole('textbox')[2]; // Assuming 3rd input is date
    expect(dateInput).toHaveValue('2024-01-01');
  });

  it('updates URL when search button is clicked', async () => {
    // Mock window.location or useNavigate is tricky in MemoryRouter, 
    // but we can check if the component state updates or if it tries to navigate.
    // However, since SearchQueryBar uses setSearchParams, we can test it in isolation or integration.
    // Integration test with MemoryRouter is better.
    
    // We can spy on history but MemoryRouter doesn't expose it easily.
    // Instead, we can render a dummy component to display current location.
    
    const LocationDisplay = () => {
        const params = new URLSearchParams(window.location.search);
        // This won't work with MemoryRouter as it doesn't update window.location
        // We need useLocation from react-router-dom
        return null;
    };
    
    // Better approach: Test the component logic by user interaction
    let testLocation;
    
    const TestWrapper = () => {
        const { search } = require('react-router-dom').useLocation();
        testLocation = search;
        return <TicketSearchPage />;
    };

    render(
      <MemoryRouter initialEntries={['/search']}>
        <Routes>
            <Route path="/search" element={<TestWrapper />} />
        </Routes>
      </MemoryRouter>
    );

    // Fill inputs
    fireEvent.change(screen.getByPlaceholderText('出发地'), { target: { value: '南京' } });
    fireEvent.change(screen.getByPlaceholderText('目的地'), { target: { value: '杭州' } });
    
    // Click Search
    fireEvent.click(screen.getByText('查询'));

    await waitFor(() => {
        expect(decodeURIComponent(testLocation)).toContain('from=南京');
        expect(decodeURIComponent(testLocation)).toContain('to=杭州');
    });
  });
});
