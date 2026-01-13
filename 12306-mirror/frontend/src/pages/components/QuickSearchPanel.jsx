import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './QuickSearchPanel.css';
import DatePicker from './DatePicker';
import StationInput from './StationInput';

const QuickSearchPanel = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useState({
    fromStation: '',
    toStation: '',
    date: new Date().toISOString().split('T')[0]
  });
  
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleSwap = () => {
    setSearchParams(prev => ({
      ...prev,
      fromStation: prev.toStation,
      toStation: prev.fromStation
    }));
  };

  const handleSearch = () => {
    const { fromStation, toStation, date } = searchParams;
    navigate(`/search?from=${encodeURIComponent(fromStation)}&to=${encodeURIComponent(toStation)}&date=${encodeURIComponent(date)}`);
  };

  return (
    <div className="quick-search-panel">
      <div className="station-inputs">
        <div className="input-group">
            <StationInput 
                name="fromStation"
                label="出发地"
                placeholder="出发地"
                value={searchParams.fromStation}
                onChange={(val) => setSearchParams(prev => ({ ...prev, fromStation: val }))}
            />
        </div>
        <button className="swap-btn" onClick={handleSwap} aria-label="Swap Stations">
           ↔
        </button>
        <div className="input-group">
            <StationInput 
                name="toStation"
                label="目的地"
                placeholder="目的地"
                value={searchParams.toStation}
                onChange={(val) => setSearchParams(prev => ({ ...prev, toStation: val }))}
            />
        </div>
      </div>
      
      <div className="date-input-group" style={{position: 'relative'}}>
         <label htmlFor="date" className="sr-only">出发日期</label>
         <input 
            type="text" 
            id="date"
            name="date" 
            value={searchParams.date}
            readOnly
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="date-input"
            placeholder="请选择日期"
         />
         {showDatePicker && (
            <DatePicker 
                onSelect={(date) => {
                    setSearchParams(prev => ({ ...prev, date }));
                    setShowDatePicker(false);
                }}
                onClose={() => setShowDatePicker(false)}
            />
         )}
      </div>

      <div className="search-action">
        <button className="search-btn" onClick={handleSearch}>查询</button>
      </div>
    </div>
  );
};

export default QuickSearchPanel;
