import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TrainFilterBar from '../src/components/TrainList/TrainFilterBar';

describe('TrainFilterBar Component', () => {
    const mockTrains = [
        { 
            id: 1, 
            train_number: 'G101', 
            from_station_name: 'Beijing Nan', 
            to_station_name: 'Shanghai Hongqiao',
            tickets: [{ seat_type: '二等座' }, { seat_type: '一等座' }, { seat_type: '商务座' }]
        },
        { 
            id: 2, 
            train_number: 'D701', 
            from_station_name: 'Beijing', 
            to_station_name: 'Shanghai',
            tickets: [{ seat_type: '二等卧' }]
        },
        { 
            id: 3, 
            train_number: 'Z1', 
            from_station_name: 'Beijing', 
            to_station_name: 'Shanghai',
            tickets: [{ seat_type: '硬卧' }]
        }
    ];

    it('renders train type filters', () => {
        render(<TrainFilterBar trains={mockTrains} onFilterChange={vi.fn()} />);
        expect(screen.getByLabelText(/GC-高铁\/城际/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/D-动车/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Z-直达/i)).toBeInTheDocument();
    });

    it('filters trains by seat type correctly', () => {
        const handleFilterChange = vi.fn();
        render(<TrainFilterBar trains={mockTrains} onFilterChange={handleFilterChange} />);

        // Select "商务座" (Business Class) - Should match G trains
        const businessCheckbox = screen.getByLabelText(/商务座/i);
        fireEvent.click(businessCheckbox);

        const lastCallArgs = handleFilterChange.mock.calls[handleFilterChange.mock.calls.length - 1];
        const filteredTrains = lastCallArgs[0];
        
        // G101 should be present (High Speed has Business Class)
        // K555 should NOT be present
        expect(filteredTrains.some(t => t.train_number === 'G101')).toBe(true);
        expect(filteredTrains.some(t => t.train_number === 'K555')).toBe(false);
    });

    it('renders dynamic station filters based on trains', () => {
        render(<TrainFilterBar trains={mockTrains} onFilterChange={vi.fn()} />);
        // Departure stations
        expect(screen.getByLabelText('Beijing Nan')).toBeInTheDocument();
        expect(screen.getByLabelText('Beijing')).toBeInTheDocument();
        // Arrival stations
        expect(screen.getByLabelText('Shanghai Hongqiao')).toBeInTheDocument();
        expect(screen.getByLabelText('Shanghai')).toBeInTheDocument();
    });

    it('filters trains by type correctly', () => {
        const handleFilterChange = vi.fn();
        render(<TrainFilterBar trains={mockTrains} onFilterChange={handleFilterChange} />);

        // Select 'G' type (G101)
        const gCheckbox = screen.getByLabelText(/GC-高铁\/城际/i);
        fireEvent.click(gCheckbox);

        // Check the last call
        const lastCallArgs = handleFilterChange.mock.calls[handleFilterChange.mock.calls.length - 1];
        const filteredTrains = lastCallArgs[0];
        
        expect(filteredTrains).toHaveLength(1);
        expect(filteredTrains[0].train_number).toBe('G101');
    });

    it('filters trains by station correctly', () => {
        const handleFilterChange = vi.fn();
        render(<TrainFilterBar trains={mockTrains} onFilterChange={handleFilterChange} />);

        // Select 'Beijing Nan' departure
        const depCheckbox = screen.getByLabelText('Beijing Nan');
        fireEvent.click(depCheckbox);

        const lastCallArgs = handleFilterChange.mock.calls[handleFilterChange.mock.calls.length - 1];
        const filteredTrains = lastCallArgs[0];
        
        expect(filteredTrains).toHaveLength(1);
        expect(filteredTrains[0].train_number).toBe('G101');
    });

    it('filters by multiple criteria (AND logic for different categories, OR logic within category)', () => {
        // This logic might vary. Usually:
        // (Type A OR Type B) AND (Station X OR Station Y)
        
        const handleFilterChange = vi.fn();
        render(<TrainFilterBar trains={mockTrains} onFilterChange={handleFilterChange} />);

        // Select G and D types
        fireEvent.click(screen.getByLabelText(/GC-高铁\/城际/i));
        fireEvent.click(screen.getByLabelText(/D-动车/i));

        // Expect G101 and D701
        let lastCall = handleFilterChange.mock.calls[handleFilterChange.mock.calls.length - 1][0];
        expect(lastCall.map(t => t.train_number)).toContain('G101');
        expect(lastCall.map(t => t.train_number)).toContain('D701');
        expect(lastCall).toHaveLength(2);
        
        // Now also select departure 'Beijing' (matches D701 and Z1, but Z1 is not in Type selection)
        // If we select types G and D, Z1 is excluded.
        // If we select Dep 'Beijing', it matches D701 and Z1.
        // Result should be intersection: D701.
        
        fireEvent.click(screen.getByLabelText('Beijing'));
        
        lastCall = handleFilterChange.mock.calls[handleFilterChange.mock.calls.length - 1][0];
        expect(lastCall).toHaveLength(1);
        expect(lastCall[0].train_number).toBe('D701');
    });
});
