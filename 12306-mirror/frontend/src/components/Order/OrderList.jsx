import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import './OrderList.css';

const OrderList = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'Unpaid'); // Unpaid, Paid, Cancelled/History
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setActiveTab(searchParams.get('tab') || 'Unpaid');
  }, [searchParams]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  useEffect(() => {
    fetchOrders();
  }, [activeTab]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : {};
      const userId = user.id || '1';

      const res = await axios.get('/api/orders', {
        headers: { 'x-user-id': userId },
        params: { status: activeTab }
      });

      if (res.data.success) {
        setOrders(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch orders', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (orderId) => {
    if (!window.confirm('确定要取消该订单吗？')) return;

    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : {};
      const userId = user.id || '1';

      const res = await axios.post(`/api/orders/${orderId}/cancel`, {}, {
        headers: { 'x-user-id': userId }
      });

      if (res.data.success) {
        alert('订单取消成功');
        fetchOrders();
      }
    } catch (err) {
      console.error('Failed to cancel order', err);
      alert('取消失败');
    }
  };

  const tabs = [
    { id: 'Unpaid', label: '未完成订单' },
    { id: 'Paid', label: '未出行订单' },
    { id: 'History', label: '历史订单' }
  ];

  return (
    <div className="order-list-container">
      <div className="order-tabs">
        {tabs.map(tab => (
          <div
            key={tab.id}
            className={`tab-item ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => handleTabChange(tab.id)}
          >
            {tab.label}
          </div>
        ))}
      </div>

      <div className="order-content">
        {loading ? (
          <div>加载中...</div>
        ) : orders.length === 0 ? (
          <div className="empty-state">暂无订单</div>
        ) : (
          orders.map(order => (
            <div key={order.id} className="order-item">
              <div className="order-header">
                <span>订单日期: {new Date(order.created_at).toLocaleDateString()}</span>
                <span>订单号: {order.id}</span>
              </div>
              <div className="order-body">
                <div className="train-info">
                  {order.items && order.items.map((item, idx) => (
                    <div key={idx} className="ticket-item">
                       <span className="train-number">{item.train_number}</span>
                       <span className="station-info">{item.departure} - {item.arrival}</span>
                       <div className="ticket-info">
                         {item.passenger_name} | {item.seat_type}
                       </div>
                    </div>
                  ))}
                </div>
                <div className="order-status-info">
                   <div className="status-text">{order.status === 'Unpaid' ? '等待支付' : order.status}</div>
                   <div className="total-price">¥{order.total_price}</div>
                </div>
                <div className="order-actions">
                  {order.status === 'Unpaid' && (
                    <>
                      <button className="btn btn-primary" onClick={() => navigate(`/pay-order/${order.id}`)}>支付</button>
                      <button className="btn btn-secondary" onClick={() => handleCancel(order.id)}>取消订单</button>
                    </>
                  )}
                  <button className="btn btn-secondary">查看详情</button>
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
