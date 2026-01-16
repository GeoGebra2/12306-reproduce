import React from 'react';
import { useNavigate } from 'react-router-dom';
import './TrainList.css';

const TrainItem = ({ train }) => {
    const navigate = useNavigate();

    const handleBook = () => {
        navigate('/order', { state: { train } });
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
            <div className="train-col">
                <div className="seat-type">二等座: 有</div>
                <div className="seat-type">一等座: 有</div>
            </div>
            <div className="train-col">
                <button className="btn-book" onClick={handleBook}>预订</button>
            </div>
        </div>
    );
};

export default TrainItem;