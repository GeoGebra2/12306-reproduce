import React from 'react';

const HeroServices = () => {
  const services = [
    "重点旅客预约", "遗失物品查找", "约车服务", "便民托运", "车站引导", "站车风采", "用户反馈"
  ];

  return (
    <div className="hero-services" data-testid="hero-services">
      {services.map((service, index) => (
        <button key={index} className="service-btn">{service}</button>
      ))}
    </div>
  );
};

export default HeroServices;
