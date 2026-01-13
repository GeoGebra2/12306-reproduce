import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import QuickSearchPanel from '../src/pages/components/QuickSearchPanel';

describe('REQ-2-1 UI: Quick Search Panel', () => {
    it('renders all inputs and buttons', () => {
        render(<QuickSearchPanel />);
        expect(screen.getByPlaceholderText(/出发地/)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/目的地/)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /查询/ })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Swap Stations/i })).toBeInTheDocument();
    });

    it('swaps stations when swap button is clicked', () => {
        render(<QuickSearchPanel />);
        const fromInput = screen.getByPlaceholderText(/出发地/);
        const toInput = screen.getByPlaceholderText(/目的地/);
        const swapBtn = screen.getByRole('button', { name: /Swap Stations/i });

        fireEvent.change(fromInput, { target: { value: 'Beijing' } });
        fireEvent.change(toInput, { target: { value: 'Shanghai' } });

        expect(fromInput.value).toBe('Beijing');
        expect(toInput.value).toBe('Shanghai');

        fireEvent.click(swapBtn);

        expect(fromInput.value).toBe('Shanghai');
        expect(toInput.value).toBe('Beijing');
    });
});
