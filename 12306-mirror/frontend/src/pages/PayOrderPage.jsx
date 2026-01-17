import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import HeaderBrandSearch from '../components/HeaderBrandSearch';
import './PayOrderPage.css';

const PayOrderPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

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
    } catch (err) {
      console.error('Failed to fetch order', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePay = () => {
    setShowModal(true);
  };

  const confirmPay = async () => {
    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : {};
      const userId = user.id;

      const res = await axios.post(`/api/orders/${orderId}/pay`, {}, {
        headers: { 'x-user-id': userId }
      });
      
      if (res.data.success) {
        alert('支付成功');
        navigate('/profile/orders?tab=Paid'); 
      } else {
        alert(res.data.message || '支付失败');
      }
    } catch (err) {
      console.error('Payment failed', err);
      alert('支付失败');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!order) return <div>订单不存在</div>;

  return (
    <div className="pay-order-page">
      <HeaderBrandSearch />
      <Navbar />
      
      <div className="pay-container">
        {/* Banner */}
        <div className="pay-banner">
          <div className="banner-icon">🔒</div>
          <div className="banner-text">
            席位已锁定，请在 <span className="countdown">29分59秒</span> 内完成支付
          </div>
        </div>

        {/* Order Card */}
        <div className="pay-card">
          <div className="card-header">
            订单信息
          </div>
          <div className="train-info-row">
            <span className="train-number">{order.train_number}</span>
            <span className="station-info">{order.departure} -> {order.arrival}</span>
            <span className="time-info">{order.departure_time} 开</span>
            <span className="date-info">{new Date(order.created_at).toLocaleDateString()}</span>
          </div>

          {/* Passenger Table */}
          <div className="passenger-table">
            <div className="table-header">
              <span>序号</span>
              <span>姓名</span>
              <span>证件类型</span>
              <span>证件号码</span>
              <span>票种</span>
              <span>席别</span>
              <span>票价</span>
            </div>
            {order.items && order.items.map((item, index) => (
              <div key={index} className="table-row">
                <span>{index + 1}</span>
                <span>{item.passenger_name}</span>
                <span>中国居民身份证</span>
                <span>{item.passenger_id_card || '****'}</span>
                <span>成人票</span>
                <span>{item.seat_type}</span>
                <span className="price">¥{item.price}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="pay-actions">
          <div className="total-price">
            应付金额：<span className="amount">¥{order.total_price}</span>
          </div>
          <div className="buttons">
            <button className="btn btn-secondary" onClick={() => navigate(-1)}>取消支付</button>
            <button className="btn btn-primary" onClick={handlePay}>立即支付</button>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>请扫码支付</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="qr-code-placeholder">
                <div style={{width: 200, height: 200, background: '#eee', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    QR Code
                </div>
                <p style={{textAlign: 'center', marginTop: 10}}>支付宝/微信扫一扫</p>
              </div>
              <div style={{textAlign: 'center'}}>
                <button className="btn btn-success" onClick={confirmPay} style={{marginTop: 20, background: '#52c41a', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 4, cursor: 'pointer'}}>
                    模拟支付成功
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayOrderPage;
