import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import HeaderBrandSearch from '../components/HeaderBrandSearch';
import Navbar from '../components/Navbar';
import '../components/components.css'; // Reuse existing styles if applicable, or add new ones
import './RegisterPage.css';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    id_type: '1',
    id_card: '',
    real_name: '',
    phone: '',
    user_type: 'ADULT',
    email: ''
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

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/api/users/register', {
        username: formData.username,
        password: formData.password,
        id_type: formData.id_type,
        id_card: formData.id_card,
        real_name: formData.real_name,
        phone: formData.phone,
        user_type: formData.user_type,
        email: formData.email
      });

      if (response.data.success) {
        alert('Registration successful! Redirecting to login...');
        navigate('/login');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page" data-testid="register-page">
      <HeaderBrandSearch />
      <Navbar />
      
      <div className="register-content">
        <div className="register-box">
          <h2>账户注册</h2>
          {error && <div className="error-message">{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username">用户名</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="用户名设置成功后不可修改"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">密码</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="6-20位字母、数字或符号"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">确认密码</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="再次输入密码"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="real_name">姓名</label>
              <input
                type="text"
                id="real_name"
                name="real_name"
                value={formData.real_name}
                onChange={handleChange}
                placeholder="请输入姓名"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="id_type">证件类型</label>
              <select
                id="id_type"
                name="id_type"
                value={formData.id_type}
                onChange={handleChange}
              >
                <option value="1">中国居民身份证</option>
                <option value="C">港澳居民来往内地通行证</option>
                <option value="G">台湾居民来往大陆通行证</option>
                <option value="B">护照</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="id_card">证件号码</label>
              <input
                type="text"
                id="id_card"
                name="id_card"
                value={formData.id_card}
                onChange={handleChange}
                placeholder="请输入证件号码"
                required
              />
            </div>

             <div className="form-group">
              <label htmlFor="user_type">旅客类型</label>
              <select
                id="user_type"
                name="user_type"
                value={formData.user_type}
                onChange={handleChange}
              >
                <option value="ADULT">成人</option>
                <option value="CHILD">儿童</option>
                <option value="STUDENT">学生</option>
                <option value="DISABILITY">残疾军人、伤残人民警察</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="phone">手机号码</label>
              <input
                type="text"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="请输入手机号码"
                required
              />
            </div>
            
            <div className="form-group">
               <label htmlFor="email">邮箱 (选填)</label>
                <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="请输入邮箱"
              />
            </div>

            <div className="form-check">
              <input type="checkbox" id="agree" required />
              <label htmlFor="agree">我已阅读并同意《中国铁路客户服务中心网站服务条款》</label>
            </div>

            <div className="form-actions">
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? '提交中...' : '下一步'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
