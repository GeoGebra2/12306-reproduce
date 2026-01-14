import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
  return (
    <div className="home-page">
      {/* 1. Top Brand & Search */}
      <header id="brand_search" className="brand-search">
        <div className="brand-logo">
            <img src="/assets/home-train/铁路12306-512x512.png" alt="Logo" />
            <div className="brand-text">
                <h1>中国铁路12306</h1>
                <span>12306 CHINA RAILWAY</span>
            </div>
        </div>
        <div className="search-bar">
            <input type="text" placeholder="搜索车票、 餐饮、 常旅客、 相关规章" />
            <div className="search-btn">Q</div>
        </div>
        <div className="header-links">
            <a href="#">无障碍</a>
            <span>|</span>
            <a href="#">敬老版</a>
            <span>|</span>
            <a href="#">English</a>
            <span>|</span>
            <a href="#">我的12306</a>
            <span>|</span>
            <Link to="/login" className="login-btn">登录</Link>
            <Link to="/register" className="register-btn">注册</Link>
        </div>
      </header>

      {/* 2. Navbar */}
      <nav id="navbar" className="navbar">
          <div className="nav-content">
            <ul>
                <li className="active">首页</li>
                <li>车票</li>
                <li>团购服务</li>
                <li>会员服务</li>
                <li>站车服务</li>
                <li>商旅服务</li>
                <li>出行指南</li>
                <li>信息查询</li>
            </ul>
          </div>
      </nav>

      {/* 3. Carousel */}
      <section id="carousel" className="carousel">
          <div className="carousel-slide">
             <img src="/assets/home-train/Carousel_1.jpg" alt="Carousel 1" />
          </div>
      </section>

      {/* 4. Booking Form Panel */}
      <div id="booking_form" className="booking-form-container">
          <div className="booking-sidebar">
              <div className="active">车票</div>
              <div>常用查询</div>
              <div>订餐</div>
              <div>计次·定期票</div>
          </div>
          <div className="booking-panel">
              <div className="ticket-types">
                  <span className="active">单程</span>
                  <span>往返</span>
                  <span>中转换乘</span>
                  <span className="disabled">退改签</span>
              </div>
              <form>
                  <div className="form-row">
                      <div className="form-group from-station">
                          <label>出发地</label>
                          <input type="text" placeholder="简拼/全拼/汉字" />
                      </div>
                      <div className="exchange-icon">⇋</div>
                      <div className="form-group to-station">
                          <label>目的地</label>
                          <input type="text" placeholder="简拼/全拼/汉字" />
                      </div>
                  </div>
                  <div className="form-group date-input">
                      <label>出发日</label>
                      <input type="date" />
                  </div>
                  <div className="form-group student-check">
                      <label><input type="checkbox" /> 学生优惠票</label>
                      <label><input type="checkbox" /> 高铁动卧</label>
                  </div>
                  <button type="submit" className="query-btn">查询车票</button>
              </form>
          </div>
      </div>

      {/* 5. Hero Services */}
      <section id="hero_services" className="hero-services">
          <div className="service-btn">重点旅客预约</div>
          <div className="service-btn">遗失物品查找</div>
          <div className="service-btn">约车服务</div>
          <div className="service-btn">便民托运</div>
          <div className="service-btn">共享汽车</div>
          <div className="service-btn">车站引导</div>
          <div className="service-btn">站车风采</div>
          <div className="service-btn">用户反馈</div>
      </section>

      {/* 6. Promo Grid */}
      <section id="promo_grid" className="promo-grid">
          <div className="promo-item"><img src="/assets/home-train/abanner01.jpg" alt="Promo 1" /></div>
          <div className="promo-item"><img src="/assets/home-train/abanner02.jpg" alt="Promo 2" /></div>
          <div className="promo-item"><img src="/assets/home-train/abanner03.jpg" alt="Promo 3" /></div>
          <div className="promo-item"><img src="/assets/home-train/abanner04.jpg" alt="Promo 4" /></div>
      </section>

      {/* 7. Notice Tab */}
      <section id="notice_tab" className="notice-tab">
          <div className="notice-headers">
              <span className="active">最新发布</span>
              <span>常见问题</span>
              <span>信用信息</span>
          </div>
          <div className="notice-content">
              <ul>
                  <li>关于调整互联网、电话订票起售时间的公告</li>
                  <li>中国铁路上海局集团有限公司关于2023年...</li>
                  <li>铁路部门推出“铁路畅行”常旅客会员服务</li>
              </ul>
          </div>
      </section>
      
      <footer className="footer">
          <div className="footer-links">
             <p>版权所有 © 2008-2023 中国铁道科学研究院集团有限公司</p>
             <p>京ICP备05021553号 | 京公网安备11010802038392号</p>
          </div>
      </footer>
    </div>
  );
};

export default HomePage;
