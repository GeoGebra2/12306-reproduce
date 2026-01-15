import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import TicketListPage from './pages/TicketListPage';
import PersonalCenterPage from './pages/PersonalCenterPage';
import OrderCreatePage from './pages/OrderCreatePage';
import PayOrderPage from './pages/PayOrderPage';
import CateringPage from './pages/CateringPage';
import CateringBookPage from './pages/CateringBookPage';
import CateringVendorPage from './pages/CateringVendorPage';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/tickets" element={<TicketListPage />} />
        <Route path="/center" element={<PersonalCenterPage />} />
        <Route path="/order" element={<OrderCreatePage />} />
        <Route path="/pay-order/:orderId" element={<PayOrderPage />} />
        <Route path="/catering" element={<CateringPage />} />
        <Route path="/catering/book" element={<CateringBookPage />} />
        <Route path="/catering/vendor/:id" element={<CateringVendorPage />} />
      </Routes>
    </div>
  );
}
export default App;
