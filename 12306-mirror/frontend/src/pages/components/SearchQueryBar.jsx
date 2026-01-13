import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import DatePicker from './DatePicker';
import StationInput from './StationInput';
import './SearchQueryBar.css';

const SearchQueryBar = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    fromStation: searchParams.get('from') || '',
    toStation: searchParams.get('to') || '',
    date: searchParams.get('date') || new Date().toISOString().split('T')[0]
  });
  
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Sync with URL params if they change externally
  useEffect(() => {
    setFormData({
        fromStation: searchParams.get('from') || '',
        toStation: searchParams.get('to') || '',
        date: searchParams.get('date') || new Date().toISOString().split('T')[0]
    });
  }, [searchParams]);

  const handleSearch = () => {
    // Update URL params
    setSearchParams({
        from: formData.fromStation,
        to: formData.toStation,
        date: formData.date
    });
  };

  const handleSwap = () => {
    setFormData(prev => ({
        ...prev,
        fromStation: prev.toStation,
        toStation: prev.fromStation
    }));
  };

  return (
    <div className="search-query-bar">
      <div className="bar-input-group">
        <StationInput 
            name="fromStation"
            label="出发地"
            placeholder="出发地"
            value={formData.fromStation}
            onChange={(val) => setFormData(prev => ({ ...prev, fromStation: val }))}
        />
      </div>
      <div className="exchange-icon" onClick={handleSwap}>↔</div>
      <div className="bar-input-group">
        <StationInput 
            name="toStation"
            label="目的地"
            placeholder="目的地"
            value={formData.toStation}
            onChange={(val) => setFormData(prev => ({ ...prev, toStation: val }))}
        />
      </div>
      <div className="bar-input-group date-group">
        <input 
            type="text" 
            value={formData.date}
            readOnly
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="bar-input date-input"
        />
        {showDatePicker && (
            <div className="bar-datepicker-wrapper">
                <DatePicker 
                    onSelect={(date) => {
                        setFormData(prev => ({ ...prev, date }));
                        setShowDatePicker(false);
                    }}
                    onClose={() => setShowDatePicker(false)}
                />
            </div>
        )}
      </div>
      <button className="bar-search-btn" onClick={handleSearch}>查询</button>
    </div>
  );
};

export default SearchQueryBar;
