import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import './TrainList.css';

const TrainList = ({ fromStation, toStation, date, filters = { trainTypes: [], seatTypes: [] } }) => {
    const [trains, setTrains] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTrains = async () => {
            if (!fromStation || !toStation || !date) return;
            
            setLoading(true);
            setError(null);
            try {
                // TODO: Replace with actual API call
                const response = await axios.get('/api/trains', {
                    params: { from: fromStation, to: toStation, date }
                });
                setTrains(response.data);
            } catch (err) {
                console.error("Failed to fetch trains", err);
                setError("查询失败，请稍后重试");
            } finally {
                setLoading(false);
            }
        };

        fetchTrains();
    }, [fromStation, toStation, date]);

    // Client-side filtering
    const filteredTrains = trains.filter(train => {
        // Filter by Train Type (G, D, Z, T, K)
        if (filters.trainTypes.length > 0) {
            const typeCode = train.trainNumber.charAt(0);
            // Map 'G', 'D', 'Z', 'T', 'K' directly. For others, check logic.
            // Assuming trainTypes contains ['G', 'D', 'Z', 'T', 'K', 'QT']
            const isMatch = filters.trainTypes.some(type => {
                if (type === 'QT') {
                    return !['G', 'D', 'Z', 'T', 'K'].includes(typeCode);
                }
                return typeCode === type;
            });
            if (!isMatch) return false;
        }

        // Filter by Seat Type
        if (filters.seatTypes.length > 0) {
            // Check if train has any of the selected seat types available (or existing)
            const hasSeat = filters.seatTypes.some(seat => {
                return train.tickets && train.tickets[seat];
            });
            if (!hasSeat) return false;
        }

        return true;
    });

    if (loading) return <div className="train-list-loading">正在查询车次...</div>;
    if (error) return <div className="train-list-error">{error}</div>;
    if (filteredTrains.length === 0) return <div className="train-list-empty">未找到符合条件的车次</div>;

    return (
        <div className="train-list">
            {filteredTrains.map((train) => (
                <div key={train.trainNumber} className="train-item" role="article">
                    <div className="train-station-col">
                        <div className="train-code">{train.trainNumber}</div>
                        <div className="station-route">
                            <div className="station-from">
                                <span className="station-name">{train.fromStation}</span>
                                <span className="time">{train.departureTime}</span>
                            </div>
                            <div className="station-arrow">
                                <span className="duration">{train.duration}</span>
                                <span className="arrow">→</span>
                            </div>
                            <div className="station-to">
                                <span className="station-name">{train.toStation}</span>
                                <span className="time">{train.arrivalTime}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="ticket-price-col">
                        {Object.entries(train.tickets || {}).map(([seatType, info]) => (
                            <div key={seatType} className="ticket-cell">
                                <span className="seat-name">{seatType}</span>
                                <span className="seat-price">¥{info.price}</span>
                                <span className={`seat-count ${info.count === 0 ? 'no-ticket' : ''}`}>
                                    {info.count > 0 ? (info.count > 20 ? '有' : `${info.count}张`) : '无'}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="train-action-col">
                        <button className="book-btn">预订</button>
                    </div>
                </div>
            ))}
        </div>
    );
};

TrainList.propTypes = {
    fromStation: PropTypes.string,
    toStation: PropTypes.string,
    date: PropTypes.string,
    filters: PropTypes.shape({
        trainTypes: PropTypes.arrayOf(PropTypes.string),
        seatTypes: PropTypes.arrayOf(PropTypes.string)
    })
};

TrainList.defaultProps = {
    filters: { trainTypes: [], seatTypes: [] }
};

export default TrainList;
