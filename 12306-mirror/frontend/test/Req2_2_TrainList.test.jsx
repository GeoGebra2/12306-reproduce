import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeAll, afterEach } from 'vitest';
import axios from 'axios';
import TrainList from '../src/pages/components/TrainList';

// Mock axios
vi.mock('axios');

const mockTrains = [
    {
        trainNumber: 'G1',
        fromStation: '北京南',
        toStation: '上海虹桥',
        departureTime: '09:00',
        arrivalTime: '13:30',
        duration: '04:30',
        tickets: {
            '商务座': { price: 1000, count: 5 },
            '二等座': { price: 500, count: 100 }
        }
    },
    {
        trainNumber: 'K505',
        fromStation: '北京西',
        toStation: '上海',
        departureTime: '10:00',
        arrivalTime: '20:00',
        duration: '10:00',
        tickets: {
            '硬卧': { price: 300, count: 0 },
            '硬座': { price: 150, count: 20 }
        }
    }
];

describe('REQ-2-2-3: TrainList Component', () => {
    afterEach(() => {
        vi.clearAllMocks();
    });

    it('shows loading state initially', () => {
        axios.get.mockImplementation(() => new Promise(() => {})); // Never resolves
        render(<TrainList fromStation="北京" toStation="上海" date="2024-01-01" />);
        expect(screen.getByText('正在查询车次...')).toBeInTheDocument();
    });

    it('renders train list after successful fetch', async () => {
        axios.get.mockResolvedValue({ data: mockTrains });
        
        render(<TrainList fromStation="北京" toStation="上海" date="2024-01-01" />);

        await waitFor(() => {
            expect(screen.getByText('G1')).toBeInTheDocument();
            expect(screen.getByText('K505')).toBeInTheDocument();
        });

        // Check details
        expect(screen.getByText('09:00')).toBeInTheDocument();
        expect(screen.getByText('13:30')).toBeInTheDocument();
        expect(screen.getByText('¥1000')).toBeInTheDocument();
        expect(screen.getByText('有')).toBeInTheDocument(); // > 20
        expect(screen.getByText('无')).toBeInTheDocument(); // count 0
    });

    it('filters trains by type', async () => {
        axios.get.mockResolvedValue({ data: mockTrains });
        
        // Filter only 'G' (High Speed)
        render(<TrainList 
            fromStation="北京" 
            toStation="上海" 
            date="2024-01-01" 
            filters={{ trainTypes: ['G'], seatTypes: [] }}
        />);

        await waitFor(() => {
            expect(screen.getByText('G1')).toBeInTheDocument();
            expect(screen.queryByText('K505')).not.toBeInTheDocument();
        });
    });

    it('filters trains by seat type', async () => {
        axios.get.mockResolvedValue({ data: mockTrains });
        
        // Filter only '硬卧' (Hard Sleeper) - only K505 has it
        render(<TrainList 
            fromStation="北京" 
            toStation="上海" 
            date="2024-01-01" 
            filters={{ trainTypes: [], seatTypes: ['硬卧'] }}
        />);

        await waitFor(() => {
            expect(screen.queryByText('G1')).not.toBeInTheDocument();
            expect(screen.getByText('K505')).toBeInTheDocument();
        });
    });

    it('shows empty state when no trains match', async () => {
        axios.get.mockResolvedValue({ data: [] });
        render(<TrainList fromStation="北京" toStation="上海" date="2024-01-01" />);

        await waitFor(() => {
            expect(screen.getByText('未找到符合条件的车次')).toBeInTheDocument();
        });
    });

    it('shows error message on fetch failure', async () => {
        axios.get.mockRejectedValue(new Error('Network Error'));
        render(<TrainList fromStation="北京" toStation="上海" date="2024-01-01" />);

        await waitFor(() => {
            expect(screen.getByText('查询失败，请稍后重试')).toBeInTheDocument();
        });
    });
});
