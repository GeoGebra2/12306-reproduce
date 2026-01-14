import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './RegisterPage.css';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    realName: '',
    idType: '1',
    idCard: '',
    userType: 'passenger',
    phone: '',
    email: '',
    agreed: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.agreed) return;

    try {
      const response = await axios.post('/api/auth/register', formData);

      if (response.status === 200) {
        // Registration successful
        alert('注册成功！');
        navigate('/login');
      }
    } catch (error) {
      console.error('Registration error:', error);
      const msg = error.response?.data?.message || '注册过程中发生错误，请稍后重试';
      alert(`注册失败: ${msg}`);
    }
  };

  return (
    <div id="register_page" className="register-page">
      {/* Header */}
      <header className="register-header">
         <div className="brand-logo">
            <img src="/assets/home-train/铁路12306-512x512.png" alt="Logo" />
            <div className="brand-text">
                <h1>中国铁路12306</h1>
                <span>12306 CHINA RAILWAY</span>
            </div>
        </div>
        <div className="header-right">
             <span>已有账号？<Link to="/login">直接登录</Link></span>
        </div>
      </header>

      {/* Main Content */}
      <main className="register-main">
        <div className="register-container">
            <div className="register-title">
                <h2>账户注册</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="register-form">
                {/* Username */}
                <div className="form-item">
                    <label>用户名：</label>
                    <input 
                        type="text" 
                        name="username" 
                        placeholder="字母、数字或“_”，6-30位"
                        value={formData.username}
                        onChange={handleChange}
                    />
                </div>

                {/* Password */}
                <div className="form-item">
                    <label>密码：</label>
                    <input 
                        type="password" 
                        name="password" 
                        placeholder="6-20位字母、数字或符号"
                        value={formData.password}
                        onChange={handleChange}
                    />
                </div>

                {/* Confirm Password */}
                <div className="form-item">
                    <label>确认密码：</label>
                    <input 
                        type="password" 
                        name="confirmPassword" 
                        placeholder="再次输入密码"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                    />
                </div>

                {/* Real Name */}
                <div className="form-item">
                    <label>姓名：</label>
                    <input 
                        type="text" 
                        name="realName" 
                        placeholder="请输入姓名"
                        value={formData.realName}
                        onChange={handleChange}
                    />
                </div>

                {/* ID Type */}
                <div className="form-item">
                    <label>证件类型：</label>
                    <select name="idType" value={formData.idType} onChange={handleChange}>
                        <option value="1">中国居民身份证</option>
                        <option value="2">港澳居民来往内地通行证</option>
                        <option value="3">台湾居民来往大陆通行证</option>
                        <option value="B">护照</option>
                    </select>
                </div>

                {/* ID Card */}
                <div className="form-item">
                    <label>证件号码：</label>
                    <input 
                        type="text" 
                        name="idCard" 
                        placeholder="请输入您的证件号码"
                        value={formData.idCard}
                        onChange={handleChange}
                    />
                </div>

                 {/* User Type */}
                 <div className="form-item">
                    <label>旅客类型：</label>
                    <select name="userType" value={formData.userType} onChange={handleChange}>
                        <option value="passenger">成人</option>
                        <option value="child">儿童</option>
                        <option value="student">学生</option>
                        <option value="soldier">残疾军人</option>
                    </select>
                </div>

                {/* Phone */}
                <div className="form-item">
                    <label>手机号码：</label>
                    <input 
                        type="text" 
                        name="phone" 
                        placeholder="请输入您的手机号码"
                        value={formData.phone}
                        onChange={handleChange}
                    />
                </div>

                 {/* Email */}
                 <div className="form-item">
                    <label>邮箱：</label>
                    <input 
                        type="email" 
                        name="email" 
                        placeholder="请正确填写邮箱地址"
                        value={formData.email}
                        onChange={handleChange}
                    />
                </div>

                {/* Agreement */}
                <div className="form-item agreement">
                    <label>
                        <input 
                            type="checkbox" 
                            name="agreed"
                            checked={formData.agreed}
                            onChange={handleChange}
                        />
                        我已阅读并同意 <a href="#">《中国铁路客户服务中心网站服务条款》</a>
                    </label>
                </div>

                {/* Submit Button */}
                <div className="form-item submit-btn">
                    <button type="submit" disabled={!formData.agreed}>下一步</button>
                </div>
            </form>
        </div>
      </main>
    </div>
  );
};

export default RegisterPage;
