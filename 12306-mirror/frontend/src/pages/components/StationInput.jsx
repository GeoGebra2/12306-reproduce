import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './StationInput.css';

const StationInput = ({ label, value, onChange, placeholder, name }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef(null);

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const handleInputChange = (e) => {
    const newVal = e.target.value;
    onChange(newVal);
    if (!newVal) fetchHotStations();
    else fetchStations(newVal);
    setShowSuggestions(true);
  };

  const handleFocus = () => {
    setShowSuggestions(true);
    if (!value) fetchHotStations();
    else fetchStations(value);
  };

  const handleSelect = (stationName) => {
    onChange(stationName);
    setShowSuggestions(false);
  };

  return (
    <div className="station-input-group" ref={wrapperRef}>
      <label htmlFor={name} className="sr-only">{label}</label>
      <input 
        type="text" 
        id={name}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={handleInputChange}
        onFocus={handleFocus}
        autoComplete="off"
        className="station-input-field"
      />
      {showSuggestions && suggestions.length > 0 && (
        <ul className="station-suggestions-list">
          {suggestions.map(s => (
            <li key={s.id} onClick={() => handleSelect(s.name)}>
              {s.name} ({s.code})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default StationInput;
