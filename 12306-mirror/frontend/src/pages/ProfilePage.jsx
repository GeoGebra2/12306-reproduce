import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProfileLayout from '../components/Profile/ProfileLayout';
import ProfileInfo from '../components/Profile/ProfileInfo';
import PassengerList from '../components/Profile/PassengerList';
import AddressList from '../components/Profile/AddressList';
import OrderList from '../components/Order/OrderList';

const ProfilePage = () => {
  return (
    <ProfileLayout>
      <Routes>
        <Route path="/" element={<Navigate to="info" replace />} />
        <Route path="info" element={<ProfileInfo />} />
        <Route path="passengers" element={<PassengerList />} />
        <Route path="address" element={<AddressList />} />
        <Route path="orders" element={<OrderList />} />
        <Route path="*" element={<div>功能开发中...</div>} />
      </Routes>
    </ProfileLayout>
  );
};

export default ProfilePage;
