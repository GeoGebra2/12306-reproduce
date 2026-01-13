import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import QuickSearchPanel from '../src/pages/components/QuickSearchPanel';

describe('REQ-2-1-3: Date Selection', () => {
    
    beforeEach(() => {
        // Mock Date to ensure deterministic tests, but keep timers real for waitFor
        vi.useFakeTimers({ toFake: ['Date'] });
        const date = new Date(2023, 0, 1); // Jan 1, 2023
        vi.setSystemTime(date);
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('opens date picker on input click and displays current and next month', async () => {
        render(
            <BrowserRouter>
                <QuickSearchPanel />
            </BrowserRouter>
        );

        const dateInput = screen.getByLabelText(/出发日期/i);
        
        // Initial state: just an input
        expect(screen.queryByRole('dialog', { name: /日期选择器/i })).not.toBeInTheDocument();

        // Action: Click input
        // Note: For custom date picker, we might need a readonly input or a div mimicking input.
        // If it's a native date input, click might not trigger our custom popup unless we change the type or add onClick.
        fireEvent.click(dateInput);

        // Expectation: Date picker shows up
        // We expect the DatePicker component to have role="dialog" and aria-label="日期选择器"
        await waitFor(() => {
            expect(screen.getByRole('dialog', { name: /日期选择器/i })).toBeInTheDocument();
        });

        // Check for months (Jan 2023 and Feb 2023)
        expect(screen.getByText(/2023年1月/)).toBeInTheDocument();
        expect(screen.getByText(/2023年2月/)).toBeInTheDocument();
    });

    it('updates input value when a date is selected', async () => {
        render(
            <BrowserRouter>
                <QuickSearchPanel />
            </BrowserRouter>
        );

        const dateInput = screen.getByLabelText(/出发日期/i);
        fireEvent.click(dateInput);

        // Wait for picker
        const picker = await screen.findByRole('dialog', { name: /日期选择器/i });
        
        // Select a date, e.g., Jan 15
        // We assume the implementation will render days with some accessible text or role
        // For now, let's assume we can find it by text "15" within the current month container
        // This part relies on implementation details we will build.
        // We'll search for a button/element with text "15".
        const dayButton = screen.getAllByText('15')[0]; 
        fireEvent.click(dayButton);

        // Expectation: Picker closes and input updates
        await waitFor(() => {
            expect(screen.queryByRole('dialog', { name: /日期选择器/i })).not.toBeInTheDocument();
        });

        // Check input value - expected format YYYY-MM-DD
        expect(dateInput.value).toBe('2023-01-15');
    });
});
