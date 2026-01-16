import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import HeaderBrandSearch from '../components/HeaderBrandSearch';
import Navbar from '../components/Navbar';
import '../components/components.css';
import './LoginPage.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('/api/users/login', {
        username: formData.username,
        password: formData.password
      });

      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page" data-testid="login-page">
      <HeaderBrandSearch />
      <Navbar />
      
      <div className="login-content">
        <div className="login-banner">
            {/* Placeholder for carousel or banner image */}
            <div className="banner-placeholder">
                <p>扫码登录 / 账号登录</p>
            </div>
        </div>
        
        <div className="login-box">
          <div className="login-tabs">
            <div className="tab active">账号登录</div>
            <div className="tab">扫码登录</div>
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="用户名/邮箱/手机号"
                className="login-input"
                required
              />
            </div>

            <div className="form-group">
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="密码"
                className="login-input"
                required
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="login-btn" disabled={loading}>
                {loading ? '登录中...' : '立即登录'}
              </button>
            </div>
            
            <div className="login-links">
                <a href="/register">注册账户</a> | <a href="/forgot-password">忘记密码?</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
