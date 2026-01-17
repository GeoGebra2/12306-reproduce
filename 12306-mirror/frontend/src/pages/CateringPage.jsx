import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import BrandSearch from '../components/HeaderBrandSearch';
import './CateringPage.css';

const CateringPage = () => {
  return (
    <div className="catering-container">
      <BrandSearch />
      <Navbar />
      
      {/* Brand Info Section (REQ-5-1: Top shows 12306 Logo) */}
      <div className="catering-brand-section">
        <img 
          src="/assets/profile-and-catering/铁路12306-512x512.png"
          alt="12306 Logo" 
          className="catering-12306-logo"
          onError={(e) => { e.target.src = 'https://via.placeholder.com/60x60?text=12306'; }} 
        />
      </div>

      {/* Hero Section */}
      <div className="catering-hero">
        <div className="catering-hero-overlay">
          <h1 className="catering-hero-title">餐饮•特产</h1>
          <p className="catering-hero-subtitle">尽享旅途美食</p>
          
          <Link to="/catering/book" className="catering-hero-btn">
            开始订餐
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CateringPage;
