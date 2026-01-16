import React from 'react';
import HeaderBrandSearch from '../components/HeaderBrandSearch';
import Navbar from '../components/Navbar';
import Carousel from '../components/Carousel';
import BookingForm from '../components/BookingForm';
import HeroServices from '../components/HeroServices';
import PromoGrid from '../components/PromoGrid';
import NoticeTab from '../components/NoticeTab';
import './HomePage.css';
import '../components/components.css';

const HomePage = () => {
  return (
    <div className="home-page" data-testid="home-page">
      <HeaderBrandSearch />
      <Navbar />
      <div className="main-visual">
        <Carousel />
        <BookingForm />
      </div>
      <HeroServices />
      <PromoGrid />
      <NoticeTab />
    </div>
  );
};

export default HomePage;
