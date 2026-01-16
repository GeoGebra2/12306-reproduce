import React from 'react';
import Navbar from '../Navbar';
import HeaderBrandSearch from '../HeaderBrandSearch';
import Sidebar from './Sidebar';
import './Profile.css';

const ProfileLayout = ({ children }) => {
  return (
    <div className="profile-layout">
      <HeaderBrandSearch />
      <Navbar />
      <div className="profile-container">
        <Sidebar />
        <div className="profile-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default ProfileLayout;
