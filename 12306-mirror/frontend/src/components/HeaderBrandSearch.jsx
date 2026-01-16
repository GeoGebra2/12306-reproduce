import React from 'react';
import { Link } from 'react-router-dom';

const HeaderBrandSearch = () => {
  return (
    <div className="header-brand-search" data-testid="header-brand-search">
      <div className="brand-container">
        <img src="/assets/home-train/铁路12306-512x512.png" alt="Logo" className="logo" />
        <div className="brand-text">
          <div className="brand-title">中国铁路12306</div>
          <div className="brand-subtitle">12306 CHINA RAILWAY</div>
        </div>
      </div>
      <div className="search-container">
        <input type="text" placeholder="搜索车票、 餐饮、 常旅客、 相关规章" className="search-input" />
        <button className="search-btn">Q</button>
      </div>
      <div className="header-links">
        <a href="#">无障碍</a> | <a href="#">敬老版</a> | <a href="#">English</a> | <Link to="/profile">我的12306</Link> | 
        <Link to="/login" className="login-link">登录</Link> / <Link to="/register" className="register-link">注册</Link>
      </div>
    </div>
  );
};

export default HeaderBrandSearch;
