import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Profile.css';

const Sidebar = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const menuItems = [
    { name: '查看个人信息', path: '/profile/info' },
    { name: '账号安全', path: '/profile/security' },
    { name: '常用联系人', path: '/profile/passengers' },
    { name: '重点旅客预约', path: '/profile/priority' },
    { name: '遗失物品查找', path: '/profile/lost-found' },
    { name: '服务查询', path: '/profile/service' },
    { name: '投诉', path: '/profile/complaint' },
    { name: '建议', path: '/profile/suggestion' },
    { name: '订单中心', path: '/profile/orders' },
  ];

  return (
    <div className="profile-sidebar">
      <div className="sidebar-header">
        个人中心
      </div>
      <ul className="sidebar-menu">
        {menuItems.map((item, index) => (
          <li key={index} className={`menu-item ${isActive(item.path) ? 'active' : ''}`}>
            <Link to={item.path}>{item.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
