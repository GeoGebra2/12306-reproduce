import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './QuickSearchPanel.css';

const QuickSearchPanel = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useState({
    fromStation: '',
    toStation: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [suggestions, setSuggestions] = useState([]);
  const [activeField, setActiveField] = useState(null);

  const handleSwap = () => {
    setSearchParams(prev => ({
      ...prev,
      fromStation: prev.toStation,
      toStation: prev.fromStation
    }));
  };

  const fetchStations = async (query) => {
    if (!query) {
      setSuggestions([]);
      return;
    }
    try {
      const res = await axios.get(`/api/stations?q=${encodeURIComponent(query)}`);
      setSuggestions(res.data);
    } catch (err) {
      console.error("Failed to fetch stations", err);
    }
  };

  const fetchHotStations = async () => {
    try {
      const res = await axios.get('/api/stations/hot');
      setSuggestions(res.data);
    } catch (err) {
      console.error("Failed to fetch hot stations", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (name === 'fromStation' || name === 'toStation') {
        setActiveField(name);
        if (!value) fetchHotStations();
        else fetchStations(value);
    }
  };

  const handleSelect = (stationName) => {
    if (activeField) {
        setSearchParams(prev => ({
            ...prev,
            [activeField]: stationName
        }));
        setSuggestions([]);
        setActiveField(null);
    }
  };

  const handleSearch = () => {
    const { fromStation, toStation, date } = searchParams;
    navigate(`/ticket-list?from=${encodeURIComponent(fromStation)}&to=${encodeURIComponent(toStation)}&date=${encodeURIComponent(date)}`);
  };

  return (
    <div className="quick-search-panel">
      <div className="station-inputs">
        <div className="input-group" style={{position: 'relative'}}>
            <label htmlFor="fromStation" className="sr-only">出发地</label>
            <input 
                type="text" 
                id="fromStation"
                name="fromStation" 
                placeholder="出发地" 
                value={searchParams.fromStation}
                onChange={handleChange}
                onFocus={() => {
                    setActiveField('fromStation');
                    if (!searchParams.fromStation) fetchHotStations();
                }}
                autoComplete="off"
                className="station-input"
            />
            {activeField === 'fromStation' && suggestions.length > 0 && (
                <ul className="suggestions-list">
                    {suggestions.map(s => (
                        <li key={s.id} onClick={() => handleSelect(s.name)}>
                            {s.name} ({s.code})
                        </li>
                    ))}
                </ul>
            )}
        </div>
        <button className="swap-btn" onClick={handleSwap} aria-label="Swap Stations">
           ↔
        </button>
        <div className="input-group" style={{position: 'relative'}}>
            <label htmlFor="toStation" className="sr-only">目的地</label>
            <input 
                type="text" 
                id="toStation"
                name="toStation" 
                placeholder="目的地" 
                value={searchParams.toStation}
                onChange={handleChange}
                onFocus={() => {
                    setActiveField('toStation');
                    if (!searchParams.toStation) fetchHotStations();
                }}
                autoComplete="off"
                className="station-input"
            />
             {activeField === 'toStation' && suggestions.length > 0 && (
                <ul className="suggestions-list">
                    {suggestions.map(s => (
                        <li key={s.id} onClick={() => handleSelect(s.name)}>
                            {s.name} ({s.code})
                        </li>
                    ))}
                </ul>
            )}
        </div>
      </div>
      
      <div className="date-input-group">
         <label htmlFor="date" className="sr-only">出发日期</label>
         <input 
            type="date" 
            id="date"
            name="date" 
            value={searchParams.date}
            onChange={handleChange}
            className="date-input"
         />
      </div>

      <div className="search-action">
        <button className="search-btn" onClick={handleSearch}>查询</button>
      </div>
    </div>
  );
};

export default QuickSearchPanel;
