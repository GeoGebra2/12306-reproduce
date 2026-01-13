import React, { useState } from 'react';
import './QuickSearchPanel.css';

const QuickSearchPanel = () => {
  const [searchParams, setSearchParams] = useState({
    fromStation: '',
    toStation: '',
    date: new Date().toISOString().split('T')[0]
  });

  const handleSwap = () => {
    setSearchParams(prev => ({
      ...prev,
      fromStation: prev.toStation,
      toStation: prev.fromStation
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearch = () => {
    console.log('Search params:', searchParams);
    // TODO: Implement search navigation
  };

  return (
    <div className="quick-search-panel">
      <div className="station-inputs">
        <div className="input-group">
            <label htmlFor="fromStation" className="sr-only">出发地</label>
            <input 
                type="text" 
                id="fromStation"
                name="fromStation" 
                placeholder="出发地" 
                value={searchParams.fromStation}
                onChange={handleChange}
                className="station-input"
            />
        </div>
        <button className="swap-btn" onClick={handleSwap} aria-label="Swap Stations">
           ↔
        </button>
        <div className="input-group">
            <label htmlFor="toStation" className="sr-only">目的地</label>
            <input 
                type="text" 
                id="toStation"
                name="toStation" 
                placeholder="目的地" 
                value={searchParams.toStation}
                onChange={handleChange}
                className="station-input"
            />
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
