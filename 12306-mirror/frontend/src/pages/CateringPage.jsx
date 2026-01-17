import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import BrandSearch from '../components/HeaderBrandSearch';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './CateringPage.css';

const CateringPage = () => {
  const [brands, setBrands] = useState([]);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await axios.get('/api/catering/brands');
        if (res.data.success) {
          setBrands(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch brands', err);
      }
    };
    fetchBrands();
  }, []);

  return (
    <div className="catering-container">
      <BrandSearch />
      <Navbar />
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
            开始订餐 (自营)
          </Link>
        </div>
      </div>

      {/* Brands Section */}
      <div className="catering-brands-grid-section">
        <h2>品牌推荐</h2>
        <div className="catering-brands-grid">
          {brands.map(brand => (
            <Link to={`/catering/vendor/${brand.id}`} key={brand.id} className="brand-card">
              <img 
                src={brand.logo_url} 
                alt={brand.name} 
                onError={(e) => { e.target.src = 'https://via.placeholder.com/100?text=' + brand.name; }}
              />
              <span>{brand.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CateringPage;
