
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import TrainItem from '../src/components/TrainList/TrainItem';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

describe('TrainItem Component', () => {
    const mockTrain = {
        id: 1,
        train_number: 'G101',
        start_station: '北京南',
        end_station: '上海虹桥',
        start_time: '08:00',
        end_time: '13:30',
        duration: '05:30',
        tickets: [
            { seat_type: '二等座', price: 553, count: 20 },
            { seat_type: '一等座', price: 933, count: 5 },
            { seat_type: '商务座', price: 1748, count: 0 }
        ]
    };

    it('renders train basic info correctly', () => {
        render(
            <BrowserRouter>
                <TrainItem train={mockTrain} />
            </BrowserRouter>
        );

        expect(screen.getByText('G101')).toBeInTheDocument();
        expect(screen.getByText('北京南')).toBeInTheDocument();
        expect(screen.getByText('上海虹桥')).toBeInTheDocument();
        expect(screen.getByText('08:00')).toBeInTheDocument();
        expect(screen.getByText('13:30')).toBeInTheDocument();
        expect(screen.getByText('05:30')).toBeInTheDocument();
    });

    it('renders ticket info correctly', () => {
        render(
            <BrowserRouter>
                <TrainItem train={mockTrain} />
            </BrowserRouter>
        );

        // Check seat types
        expect(screen.getByText(/二等座/)).toBeInTheDocument();
        expect(screen.getByText(/一等座/)).toBeInTheDocument();
        expect(screen.getByText(/商务座/)).toBeInTheDocument();

        // Check prices
        expect(screen.getByText(/¥553/)).toBeInTheDocument();
        expect(screen.getByText(/¥933/)).toBeInTheDocument();

        // Check availability
        const availableSeats = screen.getAllByText(/有/);
        expect(availableSeats.length).toBeGreaterThanOrEqual(1);

        // Check no ticket
        expect(screen.getByText(/无/)).toBeInTheDocument();
    });

    it('navigates to order page on book click', () => {
        render(
            <BrowserRouter>
                <TrainItem train={mockTrain} />
            </BrowserRouter>
        );
        
        const bookButton = screen.getByRole('button', { name: /预订/i });
        fireEvent.click(bookButton);
        
        expect(mockNavigate).toHaveBeenCalledWith('/order', expect.objectContaining({
            state: expect.objectContaining({
                train: mockTrain
            })
        }));
    });
});
