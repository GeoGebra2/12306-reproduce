import React from 'react';

const PromoGrid = () => {
  const promos = [
    "/assets/home-train/abanner01.jpg",
    "/assets/home-train/abanner02.jpg",
    "/assets/home-train/abanner03.jpg",
    "/assets/home-train/abanner04.jpg"
  ];

  return (
    <div className="promo-grid" data-testid="promo-grid">
      {promos.map((src, index) => (
        <div key={index} className="promo-item">
          <img src={src} alt={`Promo ${index}`} />
        </div>
      ))}
    </div>
  );
};

export default PromoGrid;
