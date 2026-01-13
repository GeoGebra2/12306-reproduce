import React, { useState, useEffect } from 'react';
import './DatePicker.css';

const DatePicker = ({ onSelect, onClose }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Helper to get days in month
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Helper to get day of week for 1st of month (0-6, 0=Sunday)
  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const generateMonthData = (year, month) => {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const days = [];

    // Padding for empty cells before 1st day
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const formatDate = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const handleDayClick = (date) => {
    if (date) {
      onSelect(formatDate(date));
    }
  };

  const renderMonth = (offset) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1);
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = generateMonthData(year, month);

    return (
      <div className="month-panel">
        <div className="month-header">
          {year}年{month + 1}月
        </div>
        <div className="week-header">
            <span>日</span><span>一</span><span>二</span><span>三</span><span>四</span><span>五</span><span>六</span>
        </div>
        <div className="days-grid">
          {days.map((d, index) => (
            <div 
              key={index} 
              className={`day-cell ${d ? 'valid-day' : 'empty-day'}`}
              onClick={() => d && handleDayClick(d)}
            >
              {d ? d.getDate() : ''}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="date-picker-container" role="dialog" aria-label="日期选择器">
       {/* Close overlay or button could be added, but relying on outside click logic in parent is better. 
           For now, just the picker. */}
       <div className="date-picker-months">
           {renderMonth(0)}
           {renderMonth(1)}
       </div>
    </div>
  );
};

export default DatePicker;
