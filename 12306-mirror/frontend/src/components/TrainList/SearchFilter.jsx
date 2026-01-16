import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './TrainList.css';

const SearchFilter = ({ from, to, date }) => {
    const navigate = useNavigate();
    
    // Local state for inputs
    const [searchParams, setSearchParams] = useState({
        fromStation: from || '',
        toStation: to || '',
        date: date || ''
    });

    // Update local state when props change (e.g. from URL)
    useEffect(() => {
        setSearchParams({
            fromStation: from || '',
            toStation: to || '',
            date: date || ''
        });
    }, [from, to, date]);

    const [suggestions, setSuggestions] = useState([]);
    const [activeField, setActiveField] = useState(null);
    const wrapperRef = useRef(null);

    // Close suggestions when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setActiveField(null);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);

    const fetchSuggestions = async (query) => {
        try {
            const response = await axios.get('/api/stations', { params: { q: query || '' } });
            setSuggestions(response.data);
        } catch (error) {
            console.error('Error fetching stations:', error);
        }
    };

    const handleFocus = (e) => {
        const { name, value } = e.target;
        setActiveField(name);
        fetchSuggestions(value);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSearchParams(prev => ({
            ...prev,
            [name]: value
        }));

        if (name === 'fromStation' || name === 'toStation') {
            setActiveField(name);
            fetchSuggestions(value);
        }
    };

    const handleSelectStation = (stationName) => {
        if (activeField) {
            setSearchParams(prev => ({
                ...prev,
                [activeField]: stationName
            }));
            setActiveField(null);
            setSuggestions([]);
        }
    };

    const handleSwap = () => {
        setSearchParams(prev => ({
            ...prev,
            fromStation: prev.toStation,
            toStation: prev.fromStation
        }));
    };

    const handleSearch = () => {
        const { fromStation, toStation, date } = searchParams;
        navigate(`/search?from=${encodeURIComponent(fromStation)}&to=${encodeURIComponent(toStation)}&date=${date}`, { replace: true });
    };

    const SuggestionsList = ({ suggestions, onSelect }) => (
        <ul className="suggestions-list" style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 100, // Higher z-index for filter bar dropdown
            backgroundColor: 'white',
            border: '1px solid #ccc',
            listStyle: 'none',
            padding: 0,
            margin: 0,
            maxHeight: '200px',
            overflowY: 'auto'
        }}>
            {suggestions.map(station => (
                <li 
                    key={station.id || station.code} 
                    onClick={() => onSelect(station.name)}
                    style={{ padding: '8px', cursor: 'pointer', borderBottom: '1px solid #eee', color: '#333' }}
                >
                    {station.name}
                </li>
            ))}
        </ul>
    );

    return (
        <div className="search-filter" ref={wrapperRef}>
            <div className="filter-input-group" style={{ position: 'relative', display: 'inline-block', marginRight: '10px' }}>
                <input 
                    type="text" 
                    name="fromStation"
                    placeholder="出发地" 
                    value={searchParams.fromStation}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    autoComplete="off"
                    className="filter-input"
                />
                {activeField === 'fromStation' && suggestions.length > 0 && (
                    <SuggestionsList suggestions={suggestions} onSelect={handleSelectStation} />
                )}
            </div>

            <button className="filter-swap-btn" onClick={handleSwap} style={{ marginRight: '10px' }}>↔</button>

            <div className="filter-input-group" style={{ position: 'relative', display: 'inline-block', marginRight: '10px' }}>
                <input 
                    type="text" 
                    name="toStation"
                    placeholder="目的地" 
                    value={searchParams.toStation}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    autoComplete="off"
                    className="filter-input"
                />
                {activeField === 'toStation' && suggestions.length > 0 && (
                    <SuggestionsList suggestions={suggestions} onSelect={handleSelectStation} />
                )}
            </div>

            <input 
                type="date" 
                name="date"
                value={searchParams.date}
                onChange={handleChange}
                className="filter-input"
                style={{ marginRight: '10px' }}
            />

            <button className="filter-search-btn" onClick={handleSearch}>查询</button>
        </div>
    );
};

export default SearchFilter;
