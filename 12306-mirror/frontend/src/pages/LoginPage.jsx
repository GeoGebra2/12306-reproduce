import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './LoginPage.css';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogin = async () => {
    if (!formData.username || !formData.password) {
      alert('请输入用户名和密码');
      return;
    }
    try {
      const response = await axios.post('/api/auth/login', formData);
      if (response.status === 200) {
        console.log('登录成功', response.data);
        // Usually we store token here, but for now just navigate
        navigate('/');
      }
    } catch (error) {
      console.error('登录失败', error);
      alert(error.response?.data?.error || '登录失败');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2 className="login-title">用户登录</h2>
        <div className="form-group">
          <label htmlFor="username">用户名/邮箱/手机号</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            placeholder="用户名/邮箱/手机号"
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">密码</label>
          <div className="password-input-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="密码"
            />
            <button 
              type="button" 
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? '隐藏' : '显示'}
            </button>
          </div>
        </div>
        <button className="login-btn" onClick={handleLogin}>立即登录</button>
        <div className="login-footer">
          <Link to="/register">注册账户</Link>
          <Link to="/forgot-password">忘记密码?</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
