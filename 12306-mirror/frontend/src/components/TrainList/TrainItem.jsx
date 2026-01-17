import React from 'react';
import { useNavigate } from 'react-router-dom';
import './TrainList.css';

const TrainItem = ({ train, date }) => {
    const navigate = useNavigate();

    const handleBook = () => {
        navigate('/booking', { state: { train, date } });
    };

    return (
        <div className="train-item" role="listitem">
            <div className="train-col train-number">{train.train_number}</div>
            <div className="train-col stations-info">
                <div>{train.start_station}</div>
                <div>{train.end_station}</div>
            </div>
            <div className="train-col time-info">
                <div className="start-time">{train.start_time}</div>
                <div className="end-time">{train.end_time}</div>
            </div>
            <div className="train-col duration">{train.duration}</div>
            <div className="train-col seat-list">
                {train.tickets && train.tickets.length > 0 ? (
                    train.tickets.map((ticket, index) => (
                        <div key={index} className="seat-type">
                            <span className="seat-name">{ticket.seat_type}</span>
                            <span className="seat-price">¥{ticket.price}</span>
                            <span className={`seat-count ${ticket.count === 0 ? 'no-ticket' : ''}`}>
                                {ticket.count > 0 ? '有' : '无'}
                            </span>
                        </div>
                    ))
                ) : (
                    <div className="seat-type">暂无余票信息</div>
                )}
            </div>
            <div className="train-col">
                <button className="btn-book" onClick={handleBook}>预订</button>
            </div>
        </div>
    );
};

export default TrainItem;