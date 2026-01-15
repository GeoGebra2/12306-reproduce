import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './OrderCreatePage.css';

const OrderCreatePage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { trainInfo } = location.state || {};
    console.log('OrderCreatePage location:', location);

    const [passengers, setPassengers] = useState([]);
    const [selectedPassengers, setSelectedPassengers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // Default seat type and price for now
    const seatType = '二等座';
    const price = 553.0; // This should come from trainInfo ideally

    useEffect(() => {
        if (!trainInfo) {
            navigate('/');
            return;
        }

        const fetchPassengers = async () => {
            try {
                // Assuming we use x-user-id header for auth as per REQ-3
                // In a real app, this would be handled by an interceptor or context
                const userId = localStorage.getItem('userId') || 'user123';
                const res = await axios.get('/api/passengers', {
                    headers: { 'x-user-id': userId }
                });
                setPassengers(res.data);
            } catch (err) {
                console.error(err);
                setError('获取乘车人列表失败');
            } finally {
                setLoading(false);
            }
        };

        fetchPassengers();
    }, [trainInfo, navigate]);

    const handlePassengerSelect = (passengerId) => {
        setSelectedPassengers(prev => {
            if (prev.includes(passengerId)) {
                return prev.filter(id => id !== passengerId);
            } else {
                return [...prev, passengerId];
            }
        });
    };

    const handleSubmit = async () => {
        if (selectedPassengers.length === 0) {
            alert('请至少选择一位乘车人');
            return;
        }

        setSubmitting(true);
        try {
            const userId = localStorage.getItem('userId') || 'user123';
            
            const tickets = selectedPassengers.map(pid => ({
                passengerId: pid,
                seatType: seatType,
                price: price
            }));

            const orderData = {
                trainNumber: trainInfo.train_number,
                departureDate: trainInfo.date,
                fromStation: trainInfo.from_station,
                toStation: trainInfo.to_station,
                startTime: trainInfo.start_time,
                endTime: trainInfo.end_time,
                tickets: tickets
            };

            const res = await axios.post('/api/orders', orderData, {
                headers: { 'x-user-id': userId }
            });

            // Navigate to order list or success page
            // For now, let's assume we go to an order list or detail page
            // Since Order List page isn't ready, maybe just alert or go home
            // But per requirements, it should go to order management page
            alert('订单提交成功！订单号: ' + res.data.id);
            navigate('/center'); // Temporary redirect
        } catch (err) {
            console.error(err);
            alert('订单提交失败: ' + (err.response?.data?.error || err.message));
        } finally {
            setSubmitting(false);
        }
    };

    if (!trainInfo) return null;

    return (
        <div className="order-create-page">
            <header className="order-header">
                <div className="header-content">
                    <h1>订单填写</h1>
                </div>
            </header>

            <div className="main-content">
                <div className="train-info-card">
                    <div className="train-header">
                        <span className="date">{trainInfo.date}</span>
                        <span className="train-no">{trainInfo.train_number}</span>
                    </div>
                    <div className="stations">
                        <div className="station start">
                            <div className="time">{trainInfo.start_time}</div>
                            <div className="name">{trainInfo.from_station}</div>
                        </div>
                        <div className="arrow">
                            <span className="duration">-----</span>
                        </div>
                        <div className="station end">
                            <div className="time">{trainInfo.end_time}</div>
                            <div className="name">{trainInfo.to_station}</div>
                        </div>
                    </div>
                    <div className="seat-info">
                        <span>{seatType}</span>
                        <span className="price">¥{price}</span>
                    </div>
                </div>

                <div className="passengers-section">
                    <h3>选择乘车人</h3>
                    {loading ? (
                        <div>加载中...</div>
                    ) : error ? (
                        <div className="error">{error}</div>
                    ) : (
                        <div className="passenger-list">
                            {passengers.length === 0 ? (
                                <div className="no-passengers">暂无乘车人，请去个人中心添加</div>
                            ) : (
                                passengers.map(p => (
                                    <div 
                                        key={p.id} 
                                        className={`passenger-item ${selectedPassengers.includes(p.id) ? 'selected' : ''}`}
                                        onClick={() => handlePassengerSelect(p.id)}
                                    >
                                        <span className="checkbox">{selectedPassengers.includes(p.id) ? '☑' : '☐'}</span>
                                        <span className="name">{p.name}</span>
                                        <span className="id-card">{p.id_card}</span>
                                        <span className="type">{p.type}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>

                <div className="action-bar">
                    <div className="total-price">
                        总计: <span className="amount">¥{selectedPassengers.length * price}</span>
                    </div>
                    <button 
                        className="submit-btn" 
                        onClick={handleSubmit}
                        disabled={submitting || selectedPassengers.length === 0}
                    >
                        {submitting ? '提交中...' : '提交订单'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderCreatePage;
