import React, { useState, useEffect } from 'react';
import './FilterPanel.css';

const TRAIN_TYPES = [
    { label: 'GC-高铁/城际', value: 'G' },
    { label: 'D-动车', value: 'D' },
    { label: 'Z-直达', value: 'Z' },
    { label: 'T-特快', value: 'T' },
    { label: 'K-快速', value: 'K' },
    { label: '其他', value: 'QT' }
];

const SEAT_TYPES = [
    '商务座', '一等座', '二等座', '特等座', '软卧', '硬卧', '软座', '硬座', '无座'
];

const FilterPanel = ({ onChange }) => {
    const [trainTypes, setTrainTypes] = useState([]);
    const [seatTypes, setSeatTypes] = useState([]);

    // Notify parent whenever filters change
    useEffect(() => {
        onChange({ trainTypes, seatTypes });
    }, [trainTypes, seatTypes, onChange]);

    const toggleTrainType = (value) => {
        setTrainTypes(prev => 
            prev.includes(value) 
                ? prev.filter(t => t !== value)
                : [...prev, value]
        );
    };

    const toggleSeatType = (value) => {
        setSeatTypes(prev => 
            prev.includes(value) 
                ? prev.filter(s => s !== value)
                : [...prev, value]
        );
    };

    return (
        <div className="filter-panel">
            <div className="filter-row">
                <span className="filter-label">车次类型：</span>
                <div className="filter-options" role="group" aria-label="车次类型">
                    <button 
                        className={`filter-btn ${trainTypes.length === 0 ? 'active' : ''}`}
                        onClick={() => setTrainTypes([])}
                    >
                        全部
                    </button>
                    {TRAIN_TYPES.map(type => (
                        <label key={type.value} className={`checkbox-label ${trainTypes.includes(type.value) ? 'checked' : ''}`}>
                            <input 
                                type="checkbox" 
                                value={type.value}
                                checked={trainTypes.includes(type.value)}
                                onChange={() => toggleTrainType(type.value)}
                            />
                            {type.label}
                        </label>
                    ))}
                </div>
            </div>

            <div className="filter-row">
                <span className="filter-label">车次席别：</span>
                <div className="filter-options" role="group" aria-label="车次席别">
                    <button 
                        className={`filter-btn ${seatTypes.length === 0 ? 'active' : ''}`}
                        onClick={() => setSeatTypes([])}
                    >
                        全部
                    </button>
                    {SEAT_TYPES.map(seat => (
                        <label key={seat} className={`checkbox-label ${seatTypes.includes(seat) ? 'checked' : ''}`}>
                            <input 
                                type="checkbox" 
                                value={seat}
                                checked={seatTypes.includes(seat)}
                                onChange={() => toggleSeatType(seat)}
                            />
                            {seat}
                        </label>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FilterPanel;
