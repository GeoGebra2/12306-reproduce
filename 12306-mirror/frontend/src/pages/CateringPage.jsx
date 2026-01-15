import React from 'react';
import { Link } from 'react-router-dom';
import './CateringPage.css';

const CateringPage = () => {
  return (
    <div className="catering-page">
      <div className="catering-header-logo">
          <img src="/assets/profile-and-catering/铁路12306-512x512.png" alt="12306 Logo" />
          <span>餐饮 · 特产</span>
      </div>

      <div className="catering-hero">
        <div className="hero-content">
          <h1>餐饮特产</h1>
          <p>纵享旅途美食 体验舌尖上的中国</p>
          <div className="catering-search">
             <input type="text" placeholder="输入车次查询，如 G1" />
             <Link to="/catering/book" className="search-btn">查询</Link>
          </div>
        </div>
      </div>
      
      <div className="catering-features">
         <div className="feature-card">
             <h3>自营冷链餐</h3>
             <p>15元起，安全卫生，口味丰富</p>
         </div>
         <div className="feature-card">
             <h3>品牌餐饮</h3>
             <p>麦当劳、肯德基等知名品牌入驻</p>
         </div>
         <div className="feature-card">
             <h3>特产预订</h3>
             <p>沿途特产，送礼佳品</p>
         </div>
      </div>
    </div>
  );
};

export default CateringPage;
