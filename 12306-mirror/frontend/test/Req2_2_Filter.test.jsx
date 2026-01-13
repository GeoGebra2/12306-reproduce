import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import FilterPanel from '../src/pages/components/FilterPanel';

describe('REQ-2-2-2: FilterPanel Component', () => {
    it('renders all filter categories and options', () => {
        const handleChange = vi.fn();
        render(<FilterPanel onChange={handleChange} />);

        expect(screen.getByText('车次类型：')).toBeInTheDocument();
        expect(screen.getByText('GC-高铁/城际')).toBeInTheDocument();
        expect(screen.getByText('K-快速')).toBeInTheDocument();

        expect(screen.getByText('车次席别：')).toBeInTheDocument();
        expect(screen.getByText('商务座')).toBeInTheDocument();
        expect(screen.getByText('硬座')).toBeInTheDocument();
    });

    it('toggles train type selection and calls onChange', () => {
        const handleChange = vi.fn();
        render(<FilterPanel onChange={handleChange} />);

        const gType = screen.getByLabelText('GC-高铁/城际');
        
        // Select 'G'
        fireEvent.click(gType);
        expect(gType).toBeChecked();
        expect(handleChange).toHaveBeenCalledWith(expect.objectContaining({
            trainTypes: ['G'],
            seatTypes: []
        }));

        // Deselect 'G'
        fireEvent.click(gType);
        expect(gType).not.toBeChecked();
        expect(handleChange).toHaveBeenCalledWith(expect.objectContaining({
            trainTypes: [],
            seatTypes: []
        }));
    });

    it('toggles seat type selection and calls onChange', () => {
        const handleChange = vi.fn();
        render(<FilterPanel onChange={handleChange} />);

        const seat = screen.getByLabelText('一等座');
        
        // Select '一等座'
        fireEvent.click(seat);
        expect(seat).toBeChecked();
        expect(handleChange).toHaveBeenCalledWith(expect.objectContaining({
            trainTypes: [],
            seatTypes: ['一等座']
        }));
    });

    it('resets to "All" when clicking "全部" button', () => {
        const handleChange = vi.fn();
        render(<FilterPanel onChange={handleChange} />);

        const gType = screen.getByLabelText('GC-高铁/城际');
        fireEvent.click(gType);
        
        const allButtons = screen.getAllByText('全部');
        const trainTypeAll = allButtons[0]; // First one is for train types

        fireEvent.click(trainTypeAll);
        expect(gType).not.toBeChecked();
        expect(handleChange).toHaveBeenCalledWith(expect.objectContaining({
            trainTypes: [],
            seatTypes: []
        }));
    });
});
