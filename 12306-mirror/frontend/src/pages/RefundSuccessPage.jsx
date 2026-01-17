import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import HeaderBrandSearch from '../components/HeaderBrandSearch';
import './RefundSuccessPage.css';

const RefundSuccessPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { orderId, amount } = location.state || {};

    if (!orderId) {
        return (
            <div>
                <HeaderBrandSearch />
                <Navbar />
                <div className="refund-success-container">
                    <div className="error-message">无效的访问请求</div>
                    <button className="btn-action btn-primary" onClick={() => navigate('/')}>返回首页</button>
                </div>
            </div>
        );
    }

    return (
        <div>
            <HeaderBrandSearch />
            <Navbar />
            <div className="refund-success-container">
                <div className="success-icon">✓</div>
                <h2 className="success-title">退票申请已提交，系统正在处理中</h2>
                <p className="success-desc">预计1-7个工作日退回原支付账户</p>
                
                <div className="order-summary">
                    <div className="summary-item">
                        <span className="summary-label">订单号</span>
                        <span className="summary-value">{orderId}</span>
                    </div>
                    <div className="summary-item">
                        <span className="summary-label">退票金额</span>
                        <span className="summary-value amount">¥{amount}</span>
                    </div>
                </div>

                <div className="action-buttons">
                    <button 
                        className="btn-action btn-secondary" 
                        onClick={() => navigate(`/order-detail/${orderId}`)}
                    >
                        查看订单详情
                    </button>
                    <button 
                        className="btn-action btn-primary" 
                        onClick={() => navigate('/')}
                    >
                        返回首页
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RefundSuccessPage;