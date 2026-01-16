import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProfileLayout from '../components/Profile/ProfileLayout';
import ProfileInfo from '../components/Profile/ProfileInfo';

const ProfilePage = () => {
  return (
    <ProfileLayout>
      <Routes>
        <Route path="/" element={<Navigate to="info" replace />} />
        <Route path="info" element={<ProfileInfo />} />
        <Route path="passengers" element={<div>常用联系人页面 (开发中)</div>} />
        <Route path="orders" element={<div>订单中心页面 (开发中)</div>} />
        <Route path="*" element={<div>功能开发中...</div>} />
      </Routes>
    </ProfileLayout>
  );
};

export default ProfilePage;
