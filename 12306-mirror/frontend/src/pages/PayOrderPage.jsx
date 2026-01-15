import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const PayOrderPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPayModal, setShowPayModal] = useState(false);
  const [payStatus, setPayStatus] = useState('processing'); // processing, success, failed

  useEffect(() => {
    const fetchOrder = async () => {
      const userId = localStorage.getItem('userId');
      try {
        const res = await axios.get(`/api/orders/${orderId}`, {
          headers: { 'x-user-id': userId }
        });
        setOrder(res.data);
      } catch (err) {
        console.error('Failed to fetch order', err);
        alert('无法加载订单信息');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  const handlePay = async () => {
    setShowPayModal(true);
    setPayStatus('processing');
    
    // Simulate payment delay
    setTimeout(async () => {
      const userId = localStorage.getItem('userId');
      try {
        await axios.post(`/api/orders/${orderId}/pay`, {}, {
          headers: { 'x-user-id': userId }
        });
        setPayStatus('success');
        setTimeout(() => {
          alert('支付成功');
          navigate('/center'); // Return to personal center order list
        }, 1500);
      } catch (err) {
        console.error('Payment failed', err);
        setPayStatus('failed');
      }
    }, 2000);
  };

  if (loading) return <div>Loading...</div>;
  if (!order) return <div>Order not found</div>;

  // Extract common info from first item (train info is same for all items in one order usually)
  const firstItem = order.items[0] || {};

  return (
    <div className="pay-order-page" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* 1. Top Tip Banner */}
      <div className="pay-banner" style={{ 
        border: '1px solid #3399FF', 
        padding: '15px', 
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        background: '#fff'
      }}>
        <div style={{ 
          width: '28px', height: '28px', borderRadius: '50%', background: '#e6f7ff', 
          marginRight: '10px', textAlign: 'center', lineHeight: '28px', color: '#3399FF' 
        }}>!</div>
        <div>
          席位已锁定，请在 <span style={{ color: '#ff8c00', fontWeight: 'bold', fontSize: '18px' }}>30:00</span> 分钟内进行支付，完成购票。
        </div>
      </div>

      {/* 2. Order Info & Passenger Table */}
      <div className="pay-cards" style={{ border: '1px solid #3399FF', borderRadius: '4px', background: '#fff' }}>
        <div className="card-header" style={{ 
          padding: '10px 20px', 
          background: 'linear-gradient(to right, #3399FF, #50aaff)', 
          color: 'white',
          fontWeight: 'bold'
        }}>
          订单信息: {order.id}
        </div>
        
        <div className="card-body" style={{ padding: '20px' }}>
          <div className="train-info" style={{ marginBottom: '20px', fontSize: '16px' }}>
            <strong>{firstItem.train_number}</strong> 
            <span style={{ margin: '0 10px' }}>{firstItem.from_station}</span> &rarr; <span style={{ margin: '0 10px' }}>{firstItem.to_station}</span>
            <span style={{ marginLeft: '20px' }}>{firstItem.departure_date} {firstItem.start_time} 开</span>
          </div>

          <div className="passenger-table-container" style={{ border: '1px solid #e6f0fc', borderRadius: '6px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: '#f5f5f5', height: '40px' }}>
                <tr>
                  <th style={{ textAlign: 'left', padding: '0 10px' }}>序号</th>
                  <th style={{ textAlign: 'left', padding: '0 10px' }}>姓名</th>
                  <th style={{ textAlign: 'left', padding: '0 10px' }}>证件类型</th>
                  <th style={{ textAlign: 'left', padding: '0 10px' }}>证件号码</th>
                  <th style={{ textAlign: 'left', padding: '0 10px' }}>票种</th>
                  <th style={{ textAlign: 'left', padding: '0 10px' }}>席别</th>
                  <th style={{ textAlign: 'left', padding: '0 10px' }}>车厢/席位</th>
                  <th style={{ textAlign: 'right', padding: '0 10px' }}>票价(元)</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #eee', height: '38px' }}>
                    <td style={{ padding: '0 10px' }}>{index + 1}</td>
                    <td style={{ padding: '0 10px', fontWeight: 'bold' }}>{item.passenger_name}</td>
                    <td style={{ padding: '0 10px' }}>中国居民身份证</td>
                    <td style={{ padding: '0 10px' }}>****</td>
                    <td style={{ padding: '0 10px' }}>成人票</td>
                    <td style={{ padding: '0 10px' }}>{item.seat_type}</td>
                    <td style={{ padding: '0 10px' }}>--</td>
                    <td style={{ padding: '0 10px', textAlign: 'right', color: '#ff4d4f', fontWeight: 'bold' }}>{item.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 3. Actions */}
      <div className="pay-actions" style={{ marginTop: '20px', textAlign: 'right', padding: '20px', background: '#fff', border: '1px solid #ddd' }}>
        <div style={{ marginBottom: '15px' }}>
          应付金额：<span style={{ fontSize: '24px', color: '#de8920', fontWeight: 'bold' }}>{order.total_price}元</span>
        </div>
        <button 
          onClick={handlePay}
          style={{ 
            background: '#fa8c16', 
            color: 'white', 
            border: 'none', 
            padding: '10px 40px', 
            borderRadius: '4px',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          立即支付
        </button>
      </div>

      {/* 4. Payment Modal */}
      {showPayModal && (
        <div className="modal-overlay" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div className="modal-content" style={{
            background: 'white', padding: '30px', borderRadius: '8px', width: '500px', textAlign: 'center'
          }}>
            <h3>正在支付...</h3>
            {payStatus === 'processing' && (
              <div style={{ margin: '20px 0', fontSize: '18px', color: '#3399FF' }}>Processing...</div>
            )}
            {payStatus === 'success' && (
              <div style={{ margin: '20px 0', fontSize: '18px', color: 'green' }}>✔ 支付成功!</div>
            )}
            {payStatus === 'failed' && (
              <div style={{ margin: '20px 0', fontSize: '18px', color: 'red' }}>✘ 支付失败</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PayOrderPage;
