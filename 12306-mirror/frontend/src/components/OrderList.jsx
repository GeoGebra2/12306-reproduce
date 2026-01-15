import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './OrderList.css';

const OrderList = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, unpaid, paid, cancelled

    const userId = localStorage.getItem('userId');
    console.log('OrderList userId:', userId);

    const fetchOrders = async () => {
        console.log('Fetching orders for user:', userId);
        try {
            const res = await axios.get('/api/orders', {
                headers: { 'x-user-id': userId }
            });
            setOrders(res.data);
        } catch (err) {
            console.error('Failed to fetch orders', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userId) {
            fetchOrders();
        } else {
            console.log('No userId found, stopping loading');
            setLoading(false);
        }
    }, [userId]);

    const handlePay = (orderId) => {
        navigate(`/pay-order/${orderId}`);
    };

    const handleCancel = async (orderId) => {
        if (!window.confirm('确定要取消订单吗？')) return;
        try {
            await axios.post(`/api/orders/${orderId}/cancel`, {}, {
                headers: { 'x-user-id': userId }
            });
            alert('订单已取消');
            fetchOrders();
        } catch (err) {
            alert('取消失败: ' + (err.response?.data?.error || err.message));
        }
    };

    const filteredOrders = orders.filter(order => {
        if (filter === 'all') return true;
        if (filter === 'unpaid') return order.status === 'Unpaid';
        if (filter === 'paid') return order.status === 'Paid';
        if (filter === 'cancelled') return order.status === 'Cancelled';
        return true;
    });

    const getStatusText = (status) => {
        switch(status) {
            case 'Unpaid': return '未支付';
            case 'Paid': return '已支付';
            case 'Cancelled': return '已取消';
            default: return status;
        }
    };

    return (
        <div className="order-list-component">
            <div className="order-tabs">
                <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>全部订单</button>
                <button className={filter === 'unpaid' ? 'active' : ''} onClick={() => setFilter('unpaid')}>未支付</button>
                <button className={filter === 'paid' ? 'active' : ''} onClick={() => setFilter('paid')}>未出行</button>
                <button className={filter === 'cancelled' ? 'active' : ''} onClick={() => setFilter('cancelled')}>已取消/历史</button>
            </div>

            <div className="order-list-content">
                {loading ? (
                    <div>加载中...</div>
                ) : filteredOrders.length === 0 ? (
                    <div className="no-orders">暂无订单</div>
                ) : (
                    filteredOrders.map(order => (
                        <div key={order.id} className="order-card">
                            <div className="order-header">
                                <span className="order-time">订票时间: {new Date(order.created_at).toLocaleString()}</span>
                                <span className={`order-status status-${order.status.toLowerCase()}`}>
                                    {getStatusText(order.status)}
                                </span>
                            </div>
                            <div className="order-items">
                                {order.items && order.items.map(item => (
                                    <div key={item.id} className="order-item">
                                        <div className="train-info">
                                            <span className="train-no">{item.train_number}</span>
                                            <span className="route">{item.from_station} - {item.to_station}</span>
                                            <span className="date">{item.departure_date} {item.start_time}</span>
                                        </div>
                                        <div className="passenger-info">
                                            {item.passenger_name} ({item.seat_type})
                                        </div>
                                        <div className="price">¥{item.price}</div>
                                    </div>
                                ))}
                            </div>
                            <div className="order-footer">
                                <span className="total-price">总额: ¥{order.total_price}</span>
                                <div className="actions">
                                    {order.status === 'Unpaid' && (
                                        <>
                                            <button className="btn-cancel" onClick={() => handleCancel(order.id)}>取消订单</button>
                                            <button className="btn-pay" onClick={() => handlePay(order.id)}>去支付</button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default OrderList;
