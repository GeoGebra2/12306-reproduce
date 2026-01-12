import React from 'react';
import './HomePage.css';

const HomePage = () => {
  return (
    <div className="home-page">
      <header className="header">
        <div className="header-content">
          <div className="logo-container">
            <img src="/logo.png" alt="12306 Logo" className="logo" />
          </div>
          <div className="header-right">
             <div className="search-bar">
                <input type="text" placeholder="搜索车票/餐饮/常旅客/相关规章" />
                <button>搜索</button>
             </div>
             <div className="user-actions">
                <a href="/center">我的12306</a>
                <a href="/login">登录</a>
                <a href="/register">注册</a>
             </div>
          </div>
        </div>
      </header>
      
      <nav className="nav-bar">
        <ul>
          <li>首页</li>
          <li>车票</li>
          <li>团购服务</li>
          <li>会员服务</li>
          <li>站车服务</li>
          <li>商旅服务</li>
          <li>出行指南</li>
          <li>信息查询</li>
        </ul>
      </nav>

      <main className="main-content">
        <div className="banner-section">
           <div className="banner-placeholder">Banner Carousel</div>
        </div>
        
        <div className="quick-search-panel-container">
           <div className="quick-search-placeholder">Quick Search Panel (To be implemented in REQ-2)</div>
        </div>
      </main>

      <footer className="footer">
        <p>© 2024 12306-Mirror. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default HomePage;
