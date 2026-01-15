import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import './TicketListPage.css';

const TicketListPage = () => {
    const [searchParams] = useSearchParams();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const date = searchParams.get('date');

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                const res = await axios.get('/api/tickets/query', {
                    params: { from, to, date }
                });
                setTickets(res.data);
            } catch (err) {
                console.error(err);
                setError('查询失败，请稍后重试');
            } finally {
                setLoading(false);
            }
        };

        if (from && to && date) {
            fetchTickets();
        } else {
            setLoading(false);
            setError('缺少查询参数');
        }
    }, [from, to, date]);

    return (
        <div className="ticket-list-page">
            <header className="ticket-header">
                <div className="header-content">
                    <Link to="/" className="back-btn">返回首页</Link>
                    <h1>{from} ⇀ {to} <span className="date">({date})</span></h1>
                </div>
            </header>

            <div className="main-content">
                {loading && <div className="loading">加载中...</div>}
                {error && <div className="error-message">{error}</div>}
                
                {!loading && !error && (
                    <div className="ticket-list">
                        {tickets.length === 0 ? (
                            <div className="no-tickets">未找到相关车次</div>
                        ) : (
                            tickets.map((ticket, index) => (
                                <div key={index} className="ticket-item">
                                    <div className="train-info">
                                        <span className="train-number">{ticket.train_number}</span>
                                        <span className="train-type">{ticket.type}</span>
                                    </div>
                                    <div className="station-info">
                                        <div className="station-group start">
                                            <span className="time">{ticket.start_time}</span>
                                            <span className="station">{ticket.from_station}</span>
                                        </div>
                                        <div className="route-arrow">
                                            <span className="duration">-----</span>
                                        </div>
                                        <div className="station-group end">
                                            <span className="time">{ticket.end_time}</span>
                                            <span className="station">{ticket.to_station}</span>
                                        </div>
                                    </div>
                                    <div className="seat-info">
                                        <span className="seat-type">二等座</span>
                                        <span className="price">¥553.0</span>
                                        <span className="count">有</span>
                                    </div>
                                    <div className="action-area">
                                        <Link 
                                            to="/order"
                                            state={{ 
                                                trainInfo: {
                                                    ...ticket,
                                                    date
                                                } 
                                            }}
                                            className="book-btn"
                                            style={{ display: 'inline-block', textDecoration: 'none', textAlign: 'center', lineHeight: '30px' }} // Quick fix for style
                                        >
                                            预订
                                        </Link>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TicketListPage;
