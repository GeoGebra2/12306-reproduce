/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter, MemoryRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import SearchFilter from '../src/components/TrainList/SearchFilter';
import axios from 'axios';

// Mock axios
vi.mock('axios');

// Mock useNavigate to verify replace: true
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate
    };
});

describe('SearchFilter Component (REQ-2-2-1)', () => {
    beforeEach(() => {
        vi.resetAllMocks();
        axios.get.mockResolvedValue({ data: [] });
    });

    it('renders with initial values from props', () => {
        render(
            <MemoryRouter>
                <SearchFilter from="Beijing" to="Shanghai" date="2023-10-01" />
            </MemoryRouter>
        );

        expect(screen.getByPlaceholderText(/出发地/i).value).toBe('Beijing');
        expect(screen.getByPlaceholderText(/目的地/i).value).toBe('Shanghai');
        expect(document.querySelector('input[type="date"]').value).toBe('2023-10-01');
    });

    it('updates inputs when user types', () => {
        render(
            <MemoryRouter>
                <SearchFilter from="Beijing" to="Shanghai" date="2023-10-01" />
            </MemoryRouter>
        );

        const fromInput = screen.getByPlaceholderText(/出发地/i);
        fireEvent.change(fromInput, { target: { value: 'Nanjing' } });
        expect(fromInput.value).toBe('Nanjing');
    });

    it('shows autocomplete suggestions on focus (City Selection Layer)', async () => {
        const mockStations = [
            { id: 1, name: '北京南', code: 'VNP' },
            { id: 2, name: '上海虹桥', code: 'AOH' }
        ];
        axios.get.mockResolvedValue({ data: mockStations });

        render(
            <MemoryRouter>
                <SearchFilter from="" to="" date="" />
            </MemoryRouter>
        );

        const fromInput = screen.getByPlaceholderText(/出发地/i);
        fireEvent.focus(fromInput);

        await waitFor(() => {
            expect(axios.get).toHaveBeenCalledWith('/api/stations', { params: { q: '' } });
        });

        expect(await screen.findByText('北京南')).toBeInTheDocument();
        expect(await screen.findByText('上海虹桥')).toBeInTheDocument();
    });

    it('navigates with replace=true when search button is clicked', async () => {
        render(
            <MemoryRouter>
                <SearchFilter from="Beijing" to="Shanghai" date="2023-10-01" />
            </MemoryRouter>
        );

        const fromInput = screen.getByPlaceholderText(/出发地/i);
        fireEvent.change(fromInput, { target: { value: 'Nanjing' } });

        const searchBtn = screen.getByRole('button', { name: /查询/i });
        fireEvent.click(searchBtn);

        expect(mockNavigate).toHaveBeenCalledWith(
            expect.stringContaining('/search?from=Nanjing&to=Shanghai&date=2023-10-01'),
            { replace: true }
        );
    });
});
