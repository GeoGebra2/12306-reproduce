import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Profile.css';

const ProfileInfo = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
          setError('请先登录');
          setLoading(false);
          return;
        }

        const { id } = JSON.parse(storedUser);
        const response = await axios.get('/api/users/profile', {
          headers: { 'x-user-id': id }
        });

        if (response.data.success) {
          setUser(response.data.user);
        }
      } catch (err) {
        setError('获取用户信息失败，请稍后重试');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) return <div className="profile-loading">加载中...</div>;
  if (error) return <div className="profile-error">{error}</div>;

  return (
    <div className="profile-info-container">
      <h2 className="profile-title">个人信息</h2>
      
      {user && (
        <div className="info-card">
          <div className="info-row">
            <span className="info-label">用户名：</span>
            <span className="info-value">{user.username}</span>
          </div>
          <div className="info-row">
            <span className="info-label">姓名：</span>
            <span className="info-value">{user.real_name}</span>
          </div>
          <div className="info-row">
            <span className="info-label">证件类型：</span>
            <span className="info-value">中国居民身份证</span>
          </div>
          <div className="info-row">
            <span className="info-label">手机号：</span>
            <span className="info-value">{user.phone}</span>
          </div>
          <div className="info-row">
            <span className="info-label">邮箱：</span>
            <span className="info-value">{user.email || '未绑定'}</span>
          </div>
          <div className="info-row">
            <span className="info-label">旅客类型：</span>
            <span className="info-value">{user.type === 'ADULT' ? '成人' : '学生'}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileInfo;
