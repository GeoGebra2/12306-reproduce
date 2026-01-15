import React, { useState, useEffect } from 'react';
import axios from 'axios';
import OrderList from '../components/OrderList';
import './PersonalCenterPage.css';

const PersonalCenterPage = () => {
    const [activeTab, setActiveTab] = useState('info');
    const [userInfo, setUserInfo] = useState(null);
    const [passengers, setPassengers] = useState([]);
    const [showAddPassenger, setShowAddPassenger] = useState(false);
    const [newPassenger, setNewPassenger] = useState({ name: '', idCard: '', phone: '', type: '成人' });
    const [loading, setLoading] = useState(false);
    
    // We need user ID. For now, let's assume we store it in localStorage after login
    // or we just fetch "my info" if the backend supports session.
    // In our backend implementation, we required `x-user-id`. 
    // We need to simulate this in frontend.
    // Realistically, we should have a context or store.
    // For this prototype, I'll fetch it from localStorage if available, or just mock it/fail if not.
    // Wait, the E2E test logs in. The backend needs to know WHO is logged in.
    // Our backend `auth.js` returns user info on login. We should save it.
    // I need to update `LoginPage.jsx` to save user ID to localStorage.
    // But for now, let's assume we can get it. 
    // Actually, `auth.js` does NOT return the ID in the body for `login`?
    // Let's check `auth.js` again.
    // `backend/test/auth.test.js` expects `res.body.id`.
    // So `LoginPage.jsx` should have access to it.
    
    const userId = localStorage.getItem('userId');
    const username = localStorage.getItem('username');

    const fetchUserInfo = async () => {
        try {
            const res = await axios.get('/api/users/me', {
                headers: { 'x-user-id': userId }
            });
            setUserInfo(res.data);
        } catch (err) {
            console.error('Failed to fetch user info', err);
        }
    };

    const fetchPassengers = async () => {
        try {
            const res = await axios.get('/api/passengers', {
                headers: { 'x-user-id': userId }
            });
            setPassengers(res.data);
        } catch (err) {
            console.error('Failed to fetch passengers', err);
        }
    };

    useEffect(() => {
        if (userId) {
            if (activeTab === 'info') fetchUserInfo();
            if (activeTab === 'passengers') fetchPassengers();
        }
    }, [userId, activeTab]);

    const handleAddPassenger = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/passengers', newPassenger, {
                headers: { 'x-user-id': userId }
            });
            setShowAddPassenger(false);
            setNewPassenger({ name: '', idCard: '', phone: '', type: '成人' });
            fetchPassengers();
        } catch (err) {
            alert('添加失败: ' + err.response?.data?.error);
        }
    };

    const handleDeletePassenger = async (id) => {
        if (!window.confirm('确定要删除该乘车人吗？')) return;
        try {
            await axios.delete(`/api/passengers/${id}`, {
                headers: { 'x-user-id': userId }
            });
            fetchPassengers();
        } catch (err) {
            alert('删除失败');
        }
    };

    return (
        <div className="personal-center-page">
            <div className="sidebar">
                <div className="sidebar-title">个人中心</div>
                <ul className="sidebar-menu">
                    <li className={activeTab === 'info' ? 'active' : ''} onClick={() => setActiveTab('info')}>
                        个人信息
                    </li>
                    <li className={activeTab === 'passengers' ? 'active' : ''} onClick={() => setActiveTab('passengers')}>
                        乘车人
                    </li>
                    <li className={activeTab === 'orders' ? 'active' : ''} onClick={() => setActiveTab('orders')}>
                        订单管理
                    </li>
                </ul>
            </div>
            
            <div className="main-panel">
                {activeTab === 'info' && userInfo && (
                    <div className="info-panel">
                        <h2>查看个人信息</h2>
                        {userInfo ? (
                            <div className="info-content">
                                <div className="info-item"><label>用户名：</label><span>{userInfo.username}</span></div>
                                <div className="info-item"><label>姓名：</label><span>{userInfo.real_name}</span></div>
                                <div className="info-item"><label>证件号码：</label><span>{userInfo.id_card}</span></div>
                                <div className="info-item"><label>手机号：</label><span>{userInfo.phone}</span></div>
                                <div className="info-item"><label>旅客类型：</label><span>成人</span></div>
                            </div>
                        ) : (
                            <div>加载中...</div>
                        )}
                    </div>
                )}

                {activeTab === 'passengers' && (
                    <div className="passenger-panel">
                        <div className="panel-header">
                            <h2>乘车人管理</h2>
                            <button className="add-btn" onClick={() => setShowAddPassenger(true)}>添加</button>
                        </div>
                        
                        {showAddPassenger && (
                            <div className="add-form">
                                <h3>添加乘车人</h3>
                                <form onSubmit={handleAddPassenger}>
                                    <input 
                                        placeholder="姓名" 
                                        value={newPassenger.name} 
                                        onChange={e => setNewPassenger({...newPassenger, name: e.target.value})} 
                                        name="name"
                                        required
                                    />
                                    <input 
                                        placeholder="证件号码" 
                                        value={newPassenger.idCard} 
                                        onChange={e => setNewPassenger({...newPassenger, idCard: e.target.value})} 
                                        name="idCard"
                                        required
                                    />
                                    <input 
                                        placeholder="手机号" 
                                        value={newPassenger.phone} 
                                        onChange={e => setNewPassenger({...newPassenger, phone: e.target.value})} 
                                        name="phone"
                                    />
                                    <div className="form-actions">
                                        <button type="submit">保存</button>
                                        <button type="button" onClick={() => setShowAddPassenger(false)}>取消</button>
                                    </div>
                                </form>
                            </div>
                        )}

                        <table className="passenger-table">
                            <thead>
                                <tr>
                                    <th>序号</th>
                                    <th>姓名</th>
                                    <th>证件类型</th>
                                    <th>证件号码</th>
                                    <th>手机号</th>
                                    <th>旅客类型</th>
                                    <th>操作</th>
                                </tr>
                            </thead>
                            <tbody>
                                {passengers.map((p, index) => (
                                    <tr key={p.id}>
                                        <td>{index + 1}</td>
                                        <td>{p.name}</td>
                                        <td>中国居民身份证</td>
                                        <td>{p.id_card}</td>
                                        <td>{p.phone}</td>
                                        <td>{p.type}</td>
                                        <td>
                                            <button className="delete-btn" onClick={() => handleDeletePassenger(p.id)}>删除</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'orders' && (
                    <div className="orders-panel">
                        <h2>我的订单</h2>
                        <OrderList />
                    </div>
                )}
            </div>
        </div>
    );
};

export default PersonalCenterPage;
