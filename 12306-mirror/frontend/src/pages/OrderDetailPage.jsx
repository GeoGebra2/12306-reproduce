
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import HeaderBrandSearch from '../components/HeaderBrandSearch';
import './OrderDetailPage.css';

const OrderDetailPage = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchOrder = async () => {
        try {
            const userStr = localStorage.getItem('user');
            const user = userStr ? JSON.parse(userStr) : {};
            const userId = user.id;

            const res = await axios.get(`/api/orders/${orderId}`, {
                headers: { 'x-user-id': userId }
            });
            if (res.data.success) {
                setOrder(res.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch order', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrder();
    }, [orderId]);

    const handlePay = () => {
        navigate(`/pay-order/${orderId}`);
    };

    const handleCancel = async () => {
        if (!window.confirm('确定要取消订单吗？')) return;
        try {
            const userStr = localStorage.getItem('user');
            const user = userStr ? JSON.parse(userStr) : {};
            const userId = user.id;
            
            await axios.post(`/api/orders/${orderId}/cancel`, {}, {
                headers: { 'x-user-id': userId }
            });
            alert('订单已取消');
            fetchOrder();
        } catch (error) {
            alert('取消失败');
        }
    };

    const handleRefund = async () => {
        if (!window.confirm('确定要退票吗？')) return;
        try {
            const userStr = localStorage.getItem('user');
            const user = userStr ? JSON.parse(userStr) : {};
            const userId = user.id;

            await axios.post(`/api/orders/${orderId}/refund`, {}, {
                headers: { 'x-user-id': userId }
            });
            alert('退票成功');
            fetchOrder();
        } catch (error) {
            alert('退票失败');
        }
    };

    const getStatusText = (status) => {
        const map = {
            'Unpaid': '待支付',
            'Paid': '已支付',
            'Refunded': '已退票',
            'Cancelled': '已取消',
            'Completed': '已完成'
        };
        return map[status] || status;
    };

    const getStatusClass = (status) => {
        const map = {
            'Unpaid': 'status-unpaid',
            'Paid': 'status-paid',
            'Refunded': 'status-refunded',
            'Cancelled': 'status-cancelled'
        };
        return map[status] || '';
    };

    if (loading) return <div>Loading...</div>;
    if (!order) return <div>订单不存在</div>;

    return (
        <div>
            <HeaderBrandSearch />
            <Navbar />
            <div className="order-detail-container">
                <div className="order-header">
                    <h2>订单详情</h2>
                    <span>订单号：{order.id}</span>
                </div>
                <div className="order-info-card">
                    <div className="train-info-row">
                        <span className="station-name departure">{order.departure}</span>
                        <span>→</span>
                        <span className="station-name">{order.arrival}</span>
                        <span className="train-number">{order.train_number}</span>
                        <span>{order.departure_time}</span>
                        <span className={`status-text ${getStatusClass(order.status)}`}>
                            {getStatusText(order.status)}
                        </span>
                    </div>

                    <table className="passenger-table">
                        <thead>
                            <tr>
                                <th>序号</th>
                                <th>姓名</th>
                                <th>证件类型</th>
                                <th>证件号</th>
                                <th>席别</th>
                                <th>票价</th>
                                <th>订单状态</th>
                            </tr>
                        </thead>
                        <tbody>
                            {order.items && order.items.map((item, index) => (
                                <tr key={item.id || index}>
                                    <td>{index + 1}</td>
                                    <td>{item.passenger_name}</td>
                                    <td>中国居民身份证</td>
                                    <td>****</td>
                                    <td>{item.seat_type}</td>
                                    <td>¥{item.price}</td>
                                    <td className={getStatusClass(order.status)}>
                                        {getStatusText(order.status)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="action-bar">
                        {order.status === 'Unpaid' && (
                            <>
                                <button className="btn-action btn-danger" onClick={handleCancel}>取消订单</button>
                                <button className="btn-action btn-primary" onClick={handlePay}>立即支付</button>
                            </>
                        )}
                        {order.status === 'Paid' && (
                            <>
                                <button className="btn-action btn-secondary">改签</button>
                                <button className="btn-action btn-danger" onClick={handleRefund}>退票</button>
                            </>
                        )}
                        {(order.status === 'Cancelled' || order.status === 'Refunded') && (
                            <button className="btn-action btn-primary" onClick={() => navigate('/')}>重新购票</button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailPage;
