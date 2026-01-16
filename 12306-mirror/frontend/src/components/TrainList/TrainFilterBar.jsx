import React, { useState, useEffect, useMemo } from 'react';
import './TrainList.css';

const TrainFilterBar = ({ trains, onFilterChange }) => {
    const [selectedTypes, setSelectedTypes] = useState([]);
    const [selectedDepStations, setSelectedDepStations] = useState([]);
    const [selectedArrStations, setSelectedArrStations] = useState([]);
    const [selectedSeatTypes, setSelectedSeatTypes] = useState([]);

    // Derived unique stations from current trains list
    const depStations = useMemo(() => {
        const stations = new Set(trains.map(t => t.from_station_name));
        return Array.from(stations).sort();
    }, [trains]);

    const arrStations = useMemo(() => {
        const stations = new Set(trains.map(t => t.to_station_name));
        return Array.from(stations).sort();
    }, [trains]);

    const trainTypes = [
        { label: 'GC-高铁/城际', value: ['G', 'C'] },
        { label: 'D-动车', value: ['D'] },
        { label: 'Z-直达', value: ['Z'] },
        { label: 'T-特快', value: ['T'] },
        { label: 'K-快速', value: ['K'] },
        { label: 'QT-其他', value: ['OTHER'] } // Matches digits or others
    ];

    const seatTypes = [
        '商务座', '一等座', '二等座', '软卧', '硬卧', '硬座', '无座'
    ];

    const toggleSelection = (list, setList, value) => {
        if (list.includes(value)) {
            setList(list.filter(item => item !== value));
        } else {
            setList([...list, value]);
        }
    };

    const getTrainType = (trainNumber) => {
        const firstChar = trainNumber.charAt(0).toUpperCase();
        if (['G', 'C', 'D', 'Z', 'T', 'K'].includes(firstChar)) {
            return firstChar;
        }
        return 'OTHER';
    };

    useEffect(() => {
        let filtered = trains;

        // Filter by Type
        if (selectedTypes.length > 0) {
            // Flatten selected values (e.g. [['G', 'C'], ['D']] -> ['G', 'C', 'D'])
            const allowedPrefixes = selectedTypes.flat();
            filtered = filtered.filter(train => {
                const type = getTrainType(train.train_number);
                // If selectedTypes includes 'OTHER' and type is 'OTHER', match.
                // Or if allowedPrefixes includes the type char.
                
                // Handling the grouped value structure
                // selectedTypes is array of arrays like [['G','C'], ['D']]
                // We need to check if ANY of the selected groups contains the train type
                return selectedTypes.some(group => group.includes(type));
            });
        }

        // Filter by Departure Station
        if (selectedDepStations.length > 0) {
            filtered = filtered.filter(train => selectedDepStations.includes(train.from_station_name));
        }

        // Filter by Arrival Station
        if (selectedArrStations.length > 0) {
            filtered = filtered.filter(train => selectedArrStations.includes(train.to_station_name));
        }

        // Filter by Seat Type
        if (selectedSeatTypes.length > 0) {
            filtered = filtered.filter(train => 
                train.tickets && train.tickets.some(ticket => selectedSeatTypes.includes(ticket.seat_type))
            );
        }

        onFilterChange(filtered);
    }, [selectedTypes, selectedDepStations, selectedArrStations, selectedSeatTypes, trains, onFilterChange]);

    return (
        <div className="train-filter-bar">
            {/* Train Type Filter */}
            <div className="filter-row">
                <span className="filter-label">车次类型：</span>
                <div className="filter-options">
                    {trainTypes.map((type) => (
                        <label key={type.label} className="checkbox-label">
                            <input
                                type="checkbox"
                                value={type.label}
                                checked={selectedTypes.includes(type.value)}
                                onChange={() => toggleSelection(selectedTypes, setSelectedTypes, type.value)}
                            />
                            {type.label}
                        </label>
                    ))}
                </div>
            </div>

            {/* Departure Station Filter */}
            <div className="filter-row">
                <span className="filter-label">出发车站：</span>
                <div className="filter-options">
                    {depStations.map((station) => (
                        <label key={station} className="checkbox-label">
                            <input
                                type="checkbox"
                                value={station}
                                checked={selectedDepStations.includes(station)}
                                onChange={() => toggleSelection(selectedDepStations, setSelectedDepStations, station)}
                            />
                            {station}
                        </label>
                    ))}
                </div>
            </div>

            {/* Arrival Station Filter */}
            <div className="filter-row">
                <span className="filter-label">到达车站：</span>
                <div className="filter-options">
                    {arrStations.map((station) => (
                        <label key={station} className="checkbox-label">
                            <input
                                type="checkbox"
                                value={station}
                                checked={selectedArrStations.includes(station)}
                                onChange={() => toggleSelection(selectedArrStations, setSelectedArrStations, station)}
                            />
                            {station}
                        </label>
                    ))}
                </div>
            </div>

            {/* Seat Type Filter */}
            <div className="filter-row">
                <span className="filter-label">座席类型：</span>
                <div className="filter-options">
                    {seatTypes.map((type) => (
                        <label key={type} className="checkbox-label">
                            <input
                                type="checkbox"
                                value={type}
                                checked={selectedSeatTypes.includes(type)}
                                onChange={() => toggleSelection(selectedSeatTypes, setSelectedSeatTypes, type)}
                            />
                            {type}
                        </label>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TrainFilterBar;
