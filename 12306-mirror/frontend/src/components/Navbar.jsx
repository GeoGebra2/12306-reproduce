import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const navItems = [
    '首页', '车票', '团购服务', '会员服务', '站车服务', '商旅服务', '出行指南', '信息查询'
  ];

  return (
    <nav className="navbar" data-testid="navbar">
      <ul className="nav-list">
        {navItems.map((item, index) => (
          <li key={index} className={`nav-item ${item === '首页' ? 'active' : ''}`}>
            <Link to="/">{item}</Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Navbar;
