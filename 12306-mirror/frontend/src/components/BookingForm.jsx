import React from 'react';

const BookingForm = () => {
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
          <div className="form-row">
            <input type="text" placeholder="出发地" className="station-input" />
            <button className="swap-btn">↔</button>
            <input type="text" placeholder="目的地" className="station-input" />
          </div>
          <div className="form-row">
            <input type="date" className="date-input" />
          </div>
          <div className="form-row">
            <div className="passenger-type">
              <label><input type="checkbox" /> 学生</label>
              <label><input type="checkbox" /> 高铁/动车</label>
            </div>
          </div>
          <button className="query-btn">查询车票</button>
        </div>
      </div>
    </div>
  );
};

export default BookingForm;
