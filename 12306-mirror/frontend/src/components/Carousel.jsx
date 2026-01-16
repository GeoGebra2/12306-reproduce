import React, { useState, useEffect } from 'react';

const Carousel = () => {
  const images = [
    "/assets/home-train/Carousel_1.jpg",
    "/assets/home-train/Carousel_2.jpg",
    "/assets/home-train/Carousel_3.jpg",
    "/assets/home-train/Carousel_4.jpg",
    "/assets/home-train/Carousel_5.jpg",
    "/assets/home-train/Carousel_6.jpg"
  ];
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="carousel" data-testid="carousel">
      {images.map((img, index) => (
        <img 
          key={index} 
          src={img} 
          alt={`Slide ${index}`} 
          className={`carousel-img ${index === currentIndex ? 'active' : ''}`}
          style={{ display: index === currentIndex ? 'block' : 'none' }}
        />
      ))}
    </div>
  );
};

export default Carousel;
