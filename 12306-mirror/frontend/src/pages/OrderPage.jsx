import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './OrderPage.css';

const OrderPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { train, date } = location.state || {};

    const [passengers, setPassengers] = useState([]);
    const [selectedPassengers, setSelectedPassengers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    useEffect(() => {
        if (!train) {
            // If accessed directly without train info, redirect back to home
            navigate('/');
            return;
        }
        fetchPassengers();
    }, [train, navigate]);

    const fetchPassengers = async () => {
        try {
            const userStr = localStorage.getItem('user');
            const user = userStr ? JSON.parse(userStr) : {};
            const userId = user.id || '1';

            const res = await axios.get('/api/passengers', {
                headers: { 'x-user-id': userId }
            });
            if (res.data.success) {
                setPassengers(res.data.data);
            }
        } catch (err) {
            console.error('Failed to fetch passengers', err);
        }
    };

    const togglePassenger = (passenger) => {
        const exists = selectedPassengers.find(p => p.id === passenger.id);
        if (exists) {
            setSelectedPassengers(selectedPassengers.filter(p => p.id !== passenger.id));
        } else {
            // Default seat type to Second Class
            setSelectedPassengers([...selectedPassengers, { ...passenger, seat_type: '二等座' }]);
        }
    };

    const handleSeatChange = (id, seatType) => {
        setSelectedPassengers(selectedPassengers.map(p => 
            p.id === id ? { ...p, seat_type: seatType } : p
        ));
    };

    const calculateTotalPrice = () => {
        return selectedPassengers.reduce((total, p) => {
            const ticket = train.tickets && train.tickets.find(t => t.seat_type === p.seat_type);
            const price = ticket ? ticket.price : 0;
            return total + price;
        }, 0);
    };

    const handlePreSubmit = () => {
        if (selectedPassengers.length === 0) return;
        setShowConfirmModal(true);
    };

    const handleConfirmSubmit = async () => {
        setSubmitting(true);
        try {
            const userStr = localStorage.getItem('user');
            const user = userStr ? JSON.parse(userStr) : {};
            const userId = user.id || '1';

            const payload = {
                train_number: train.train_number,
                departure: train.start_station,
                arrival: train.end_station,
                departure_time: train.start_time,
                arrival_time: train.end_time,
                passengers: selectedPassengers
            };

            const res = await axios.post('/api/orders', payload, {
                headers: { 'x-user-id': userId }
            });

            if (res.data.success) {
                navigate(`/pay-order/${res.data.data.id}`);
            }
        } catch (err) {
            console.error('Failed to create order', err);
            alert('订单创建失败');
        } finally {
            setSubmitting(false);
            setShowConfirmModal(false);
        }
    };

    if (!train) return null;

    return (
        <div className="booking-container">
            <div className="train-info-card">
                <div className="train-route">
                    {train.start_station} 
                    <span className="train-number">{train.train_number}</span> 
                    {train.end_station}
                </div>
                <div className="train-time">
                    {date} {train.start_time} - {train.end_time}
                </div>
            </div>

            <div className="passenger-selection">
                <div className="section-title">选择乘车人</div>
                <button className="add-passenger-btn" style={{display:'none'}}>添加乘车人</button> {/* Hidden for now, just trigger */}
                <div className="passenger-list">
                    {passengers.map(p => (
                        <div 
                            key={p.id} 
                            className={`passenger-item ${selectedPassengers.find(sp => sp.id === p.id) ? 'selected' : ''}`}
                            onClick={() => togglePassenger(p)}
                        >
                            <input 
                                type="checkbox" 
                                checked={!!selectedPassengers.find(sp => sp.id === p.id)} 
                                readOnly 
                            />
                            {p.name}
                        </div>
                    ))}
                    {passengers.length === 0 && <div>暂无常用联系人，请去个人中心添加</div>}
                </div>
            </div>

            {selectedPassengers.length > 0 && (
                <table className="selected-passengers-table">
                    <thead>
                        <tr>
                            <th>姓名</th>
                            <th>证件类型</th>
                            <th>证件号码</th>
                            <th>手机号</th>
                            <th>席别</th>
                            <th>票种</th>
                        </tr>
                    </thead>
                    <tbody>
                        {selectedPassengers.map(p => (
                            <tr key={p.id}>
                                <td>{p.name}</td>
                                <td>{p.id_type}</td>
                                <td>{p.id_card}</td>
                                <td>{p.phone}</td>
                                <td>
                                    <select 
                                        value={p.seat_type} 
                                        onChange={(e) => handleSeatChange(p.id, e.target.value)}
                                    >
                                        <option value="二等座">二等座</option>
                                        <option value="一等座">一等座</option>
                                        <option value="商务座">商务座</option>
                                    </select>
                                </td>
                                <td>{p.type || '成人'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            <div className="submit-section">
                <button 
                    className="submit-btn" 
                    disabled={selectedPassengers.length === 0 || submitting}
                    onClick={handlePreSubmit}
                >
                    {submitting ? '提交中...' : '提交订单'}
                </button>
            </div>

            {showConfirmModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">订单确认</div>
                        <div className="modal-body">
                            <div className="modal-row">
                                <span>车次：</span>
                                <span>{train.train_number} ({train.start_station} - {train.end_station})</span>
                            </div>
                            <div className="modal-row">
                                <span>出发时间：</span>
                                <span>{date} {train.start_time}</span>
                            </div>
                            <div style={{marginTop: '16px', borderTop: '1px solid #eee', paddingTop: '8px'}}>
                                <strong>乘车人：</strong>
                                {selectedPassengers.map(p => (
                                    <div key={p.id} className="modal-row" style={{fontSize: '14px', color: '#666'}}>
                                        <span>{p.name} ({p.seat_type})</span>
                                        <span>¥{train.tickets.find(t => t.seat_type === p.seat_type)?.price}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="modal-total">
                                总价：¥{calculateTotalPrice()}
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={() => setShowConfirmModal(false)}>取消</button>
                            <button className="btn-confirm" onClick={handleConfirmSubmit} disabled={submitting}>
                                {submitting ? '处理中...' : '确认提交'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderPage;
