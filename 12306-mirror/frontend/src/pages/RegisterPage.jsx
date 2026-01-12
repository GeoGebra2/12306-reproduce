import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
    email: '',
    phonePrefix: '+86',
    phone: '',
    type: '1',
    agreement: false
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleRegister = async () => {
    if (!formData.agreement) {
      alert('请同意服务条款');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      alert('两次密码输入不一致');
      return;
    }

    try {
      const response = await axios.post('/api/auth/register', {
        username: formData.username,
        password: formData.password,
        real_name: formData.realName,
        id_type: formData.idType,
        id_card: formData.idCard,
        phone: formData.phone,
        type: formData.type,
        email: formData.email
      });

      if (response.status === 201) {
        // alert('注册成功'); // Removed alert to avoid blocking tests or UI
        console.log('注册成功');
        navigate('/login');
      }
    } catch (error) {
      console.error('注册失败', error);
      // alert('注册失败');
    }
  };

  return (
    <div className="register-page">
      <div className="register-header">
        <h2>账户注册</h2>
      </div>
      <div className="register-content">
        <form className="register-form">
          {/* 基本信息 */}
          <div className="form-group">
            <label htmlFor="username">用户名</label>
            <input 
              type="text" 
              id="username" 
              name="username" 
              placeholder="用户名设置成功后不可修改" 
              value={formData.username}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">密码</label>
            <input 
              type="password" 
              id="password" 
              name="password" 
              placeholder="6-20位字母、数字或符号" 
              value={formData.password}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">确认密码</label>
            <input 
              type="password" 
              id="confirmPassword" 
              name="confirmPassword" 
              placeholder="再次输入密码" 
              value={formData.confirmPassword}
              onChange={handleInputChange}
            />
          </div>

          {/* 详细信息 */}
          <div className="form-group">
            <label htmlFor="realName">姓名</label>
            <input 
              type="text" 
              id="realName" 
              name="realName" 
              placeholder="请输入姓名" 
              value={formData.realName}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="idType">证件类型</label>
            <select 
              id="idType" 
              name="idType" 
              value={formData.idType}
              onChange={handleInputChange}
            >
              <option value="1">中国居民身份证</option>
              <option value="2">港澳居民来往内地通行证</option>
              <option value="3">台湾居民来往大陆通行证</option>
              <option value="B">护照</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="idCard">证件号码</label>
            <input 
              type="text" 
              id="idCard" 
              name="idCard" 
              placeholder="请输入证件号码" 
              value={formData.idCard}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">邮箱</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              placeholder="请正确填写邮箱地址" 
              value={formData.email}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="phone">手机号码</label>
            <div className="phone-input-group">
              <select 
                name="phonePrefix" 
                value={formData.phonePrefix}
                onChange={handleInputChange}
              >
                <option value="+86">+86</option>
              </select>
              <input 
                type="text" 
                id="phone" 
                name="phone" 
                placeholder="请输入手机号码" 
                value={formData.phone}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="type">旅客类型</label>
            <select 
              id="type" 
              name="type" 
              value={formData.type}
              onChange={handleInputChange}
            >
              <option value="1">成人</option>
              <option value="2">儿童</option>
              <option value="3">学生</option>
              <option value="4">残疾军人、伤残人民警察</option>
            </select>
          </div>

          {/* 协议 */}
          <div className="form-group agreement-group">
            <input 
              type="checkbox" 
              id="agreement" 
              name="agreement" 
              checked={formData.agreement}
              onChange={handleInputChange}
            />
            <label htmlFor="agreement">我已阅读并同意《中国铁路客户服务中心网站服务条款》</label>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-submit" onClick={handleRegister}>下一步</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
