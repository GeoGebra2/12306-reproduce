import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import TrainListPage from './pages/TrainListPage';
import ProfilePage from './pages/ProfilePage';
import BookingPage from './pages/BookingPage';
import PayOrderPage from './pages/PayOrderPage';
import OrderDetailPage from './pages/OrderDetailPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/search" element={<TrainListPage />} />
      <Route path="/booking" element={<BookingPage />} />
      <Route path="/pay-order/:orderId" element={<PayOrderPage />} />
      <Route path="/order-detail/:orderId" element={<OrderDetailPage />} />
      <Route path="/profile/*" element={<ProfilePage />} />
    </Routes>
  );
}

export default App;
