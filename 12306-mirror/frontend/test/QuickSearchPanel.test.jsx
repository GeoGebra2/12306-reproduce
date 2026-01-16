/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import BookingForm from '../src/components/BookingForm';
import axios from 'axios';

// Mock axios
vi.mock('axios');

describe('Quick Search Panel (BookingForm)', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders all required input fields and button', () => {
    render(
      <BrowserRouter>
        <BookingForm />
      </BrowserRouter>
    );
    
    expect(screen.getByPlaceholderText(/出发地/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/目的地/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /查询车票/i })).toBeInTheDocument();
    const dateInput = document.querySelector('input[type="date"]');
    expect(dateInput).toBeInTheDocument();
  });

  it('allows entering search criteria', () => {
    render(
      <BrowserRouter>
        <BookingForm />
      </BrowserRouter>
    );
    
    const fromInput = screen.getByPlaceholderText(/出发地/i);
    const toInput = screen.getByPlaceholderText(/目的地/i);
    const dateInput = document.querySelector('input[type="date"]');
    
    fireEvent.change(fromInput, { target: { value: 'Beijing' } });
    fireEvent.change(toInput, { target: { value: 'Shanghai' } });
    fireEvent.change(dateInput, { target: { value: '2023-10-01' } });
    
    expect(fromInput.value).toBe('Beijing');
    expect(toInput.value).toBe('Shanghai');
    expect(dateInput.value).toBe('2023-10-01');
  });

  it('swaps stations when swap button is clicked', () => {
    render(
      <BrowserRouter>
        <BookingForm />
      </BrowserRouter>
    );
    
    const fromInput = screen.getByPlaceholderText(/出发地/i);
    const toInput = screen.getByPlaceholderText(/目的地/i);
    const swapBtn = screen.getByRole('button', { name: /↔/i });
    
    fireEvent.change(fromInput, { target: { value: 'Beijing' } });
    fireEvent.change(toInput, { target: { value: 'Shanghai' } });
    
    fireEvent.click(swapBtn);
    
    expect(fromInput.value).toBe('Shanghai');
    expect(toInput.value).toBe('Beijing');
  });

  it('shows autocomplete suggestions when typing in From station', async () => {
    const mockStations = [
      { id: 1, name: '北京南', code: 'VNP' },
      { id: 2, name: '北京', code: 'BJP' }
    ];
    axios.get.mockResolvedValue({ data: mockStations });

    render(
      <BrowserRouter>
        <BookingForm />
      </BrowserRouter>
    );

    const fromInput = screen.getByPlaceholderText(/出发地/i);
    fireEvent.change(fromInput, { target: { value: 'Bei' } });

    // Wait for API call
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('/api/stations', { params: { q: 'Bei' } });
    });

    // Check if suggestions are displayed
    expect(await screen.findByText('北京南')).toBeInTheDocument();
    expect(await screen.findByText('北京')).toBeInTheDocument();

    // Select a suggestion
    fireEvent.click(screen.getByText('北京南'));

    // Check if input is updated
    expect(fromInput.value).toBe('北京南');
    // Suggestions should disappear
    expect(screen.queryByText('北京')).not.toBeInTheDocument();
  });

  it('shows hot stations (all stations) when input is focused', async () => {
    const mockStations = [
      { id: 1, name: '北京南', code: 'VNP' },
      { id: 2, name: '上海虹桥', code: 'AOH' }
    ];
    axios.get.mockResolvedValue({ data: mockStations });

    render(
      <BrowserRouter>
        <BookingForm />
      </BrowserRouter>
    );

    const fromInput = screen.getByPlaceholderText(/出发地/i);
    fireEvent.focus(fromInput);

    // Wait for API call (empty query)
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('/api/stations', { params: { q: '' } });
    });

    // Check if hot stations are displayed
    expect(await screen.findByText('北京南')).toBeInTheDocument();
    expect(await screen.findByText('上海虹桥')).toBeInTheDocument();
  });
});
