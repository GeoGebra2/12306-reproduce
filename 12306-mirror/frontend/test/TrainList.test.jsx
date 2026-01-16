/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import TrainListPage from '../src/pages/TrainListPage';

// Mock axios
vi.mock('axios');

describe('TrainListPage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders loading state initially', () => {
    axios.get.mockReturnValue(new Promise(() => {})); // Never resolves
    render(
      <MemoryRouter initialEntries={['/search?from=北京南&to=上海虹桥&date=2023-10-01']}>
        <Routes>
            <Route path="/search" element={<TrainListPage />} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
  });

  it('fetches and renders trains', async () => {
    const mockTrains = [
      {
        id: 1,
        train_number: 'G1',
        start_station: '北京南',
        end_station: '上海虹桥',
        start_time: '08:00',
        end_time: '12:00',
        duration: '4h'
      }
    ];
    axios.get.mockResolvedValue({ data: mockTrains });

    render(
      <MemoryRouter initialEntries={['/search?from=北京南&to=上海虹桥&date=2023-10-01']}>
         <Routes>
            <Route path="/search" element={<TrainListPage />} />
        </Routes>
      </MemoryRouter>
    );

    // Verify API call
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('/api/tickets', {
        params: { from: '北京南', to: '上海虹桥', date: '2023-10-01' }
      });
    });

    // Verify Render
    expect(await screen.findByText('G1')).toBeInTheDocument();
    expect(screen.getAllByText('北京南').length).toBeGreaterThan(0);
    expect(screen.getAllByText('上海虹桥').length).toBeGreaterThan(0);
  });

  it('renders empty state when no trains found', async () => {
    axios.get.mockResolvedValue({ data: [] });

    render(
      <MemoryRouter initialEntries={['/search?from=北京南&to=上海虹桥&date=2023-10-01']}>
         <Routes>
            <Route path="/search" element={<TrainListPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText(/没有找到符合条件的车次/i)).toBeInTheDocument();
  });
});
