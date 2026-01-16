
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const BookingForm = () => {
  const [searchParams, setSearchParams] = useState({
    fromStation: '',
    toStation: '',
    date: '',
    isStudent: false,
    isHighSpeed: false
  });
  
  const [suggestions, setSuggestions] = useState([]);
  const [activeField, setActiveField] = useState(null); // 'fromStation' or 'toStation'
  const wrapperRef = useRef(null);

  const navigate = useNavigate();

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

  const handleSwap = () => {
    setSearchParams(prev => ({
      ...prev,
      fromStation: prev.toStation,
      toStation: prev.fromStation
    }));
  };

  const fetchSuggestions = async (query) => {
    if (!query) {
      setSuggestions([]);
      return;
    }
    try {
      const response = await axios.get('/api/stations', { params: { q: query } });
      setSuggestions(response.data);
    } catch (error) {
      console.error('Error fetching stations:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSearchParams(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
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

  const handleSearch = () => {
    // Navigate to results page with params
    // For now just log or do nothing as results page not implemented
    console.log('Search:', searchParams);
    // navigate('/tickets', { state: searchParams });
  };

  return (
    <div className="booking-form-container" data-testid="booking-form">
      <div className="booking-sidebar">
        <div className="sidebar-item active">车票</div>
        <div className="sidebar-item">常用查询</div>
        <div className="sidebar-item">订餐</div>
      </div>
      <div className="booking-panel">
        <div className="ticket-types">
          <span className="type active">单程</span>
          <span className="type">往返</span>
          <span className="type">中转换乘</span>
          <span className="type disabled">退改签</span>
        </div>
        <div className="form-fields">
          <div className="form-row" ref={wrapperRef} style={{ position: 'relative' }}>
            <div className="input-group" style={{ position: 'relative' }}>
                <input 
                type="text" 
                name="fromStation"
                placeholder="出发地" 
                className="station-input" 
                value={searchParams.fromStation}
                onChange={handleChange}
                onFocus={() => setActiveField('fromStation')}
                autoComplete="off"
                />
                {activeField === 'fromStation' && suggestions.length > 0 && (
                <ul className="suggestions-list" style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    zIndex: 10,
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
                        onClick={() => handleSelectStation(station.name)}
                        style={{ padding: '8px', cursor: 'pointer', borderBottom: '1px solid #eee' }}
                    >
                        {station.name}
                    </li>
                    ))}
                </ul>
                )}
            </div>
            
            <button className="swap-btn" onClick={handleSwap}>↔</button>
            
            <div className="input-group" style={{ position: 'relative' }}>
                <input 
                type="text" 
                name="toStation"
                placeholder="目的地" 
                className="station-input" 
                value={searchParams.toStation}
                onChange={handleChange}
                onFocus={() => setActiveField('toStation')}
                autoComplete="off"
                />
                 {activeField === 'toStation' && suggestions.length > 0 && (
                <ul className="suggestions-list" style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    zIndex: 10,
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
                        onClick={() => handleSelectStation(station.name)}
                        style={{ padding: '8px', cursor: 'pointer', borderBottom: '1px solid #eee' }}
                    >
                        {station.name}
                    </li>
                    ))}
                </ul>
                )}
            </div>
          </div>
          <div className="form-row">
            <input 
              type="date" 
              name="date"
              className="date-input" 
              value={searchParams.date}
              onChange={handleChange}
            />
          </div>
          <div className="form-row">
            <div className="passenger-type">
              <label>
                <input 
                  type="checkbox" 
                  name="isStudent"
                  checked={searchParams.isStudent}
                  onChange={handleChange}
                /> 学生
              </label>
              <label>
                <input 
                  type="checkbox" 
                  name="isHighSpeed"
                  checked={searchParams.isHighSpeed}
                  onChange={handleChange}
                /> 高铁/动车
              </label>
            </div>
          </div>
          <button className="query-btn" onClick={handleSearch}>查询车票</button>
        </div>
      </div>
    </div>
  );
};

export default BookingForm;
