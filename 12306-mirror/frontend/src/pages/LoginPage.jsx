import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './LoginPage.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/auth/login', formData);
      if (response.status === 200) {
        // Save user info for session simulation
        if (response.data.id) {
          localStorage.setItem('userId', response.data.id);
          localStorage.setItem('username', response.data.username);
        }
        alert('登录成功！');
        navigate('/');
      }
    } catch (error) {
      console.error('Login error:', error);
      const msg = error.response?.data?.message || '登录失败，请检查用户名或密码';
      alert(msg);
    }
  };

  return (
    <div id="login_page" className="login-page">
      <header className="login-header">
         <div className="brand-logo">
            <img src="/assets/home-train/铁路12306-512x512.png" alt="Logo" />
            <div className="brand-text">
                <h1>中国铁路12306</h1>
                <span>12306 CHINA RAILWAY</span>
            </div>
        </div>
      </header>

      <main className="login-main">
        <div className="login-container">
            <div className="login-box">
                <h2>用户登录</h2>
                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-item">
                        <label>用户名：</label>
                        <input 
                            type="text" 
                            name="username" 
                            placeholder="用户名/邮箱/手机号"
                            value={formData.username}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-item">
                        <label>密码：</label>
                        <input 
                            type="password" 
                            name="password" 
                            placeholder="请输入密码"
                            value={formData.password}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-item submit-btn">
                        <button type="submit">立即登录</button>
                    </div>
                    <div className="form-footer">
                            <Link to="/register">注册账号</Link> | <Link to="/forgot-password">忘记密码？</Link>
                        </div>
                </form>
            </div>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;
