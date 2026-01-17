import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import BrandSearch from '../components/HeaderBrandSearch';
import './CateringBookPage.css';
import axios from 'axios';

const CateringBookPage = () => {
  const [selfItems, setSelfItems] = useState([]);
  const [brands, setBrands] = useState([]);
  const [cart, setCart] = useState({}); // { itemId: quantity }
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [itemsRes, brandsRes] = await Promise.all([
          axios.get('/api/catering/items?type=SELF_OPERATED'),
          axios.get('/api/catering/brands')
        ]);
        if (itemsRes.data.success) setSelfItems(itemsRes.data.data);
        if (brandsRes.data.success) setBrands(brandsRes.data.data);
      } catch (err) {
        console.error('Failed to fetch catering data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const addToCart = (item) => {
    setCart(prev => ({
      ...prev,
      [item.id]: (prev[item.id] || 0) + 1
    }));
  };

  const removeFromCart = (item) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[item.id] > 1) {
        newCart[item.id]--;
      } else {
        delete newCart[item.id];
      }
      return newCart;
    });
  };

  const calculateTotal = () => {
    return Object.entries(cart).reduce((total, [itemId, qty]) => {
      const item = selfItems.find(i => i.id === parseInt(itemId));
      return total + (item ? item.price * qty : 0);
    }, 0);
  };

  const handleCheckout = async () => {
    const items = Object.entries(cart).map(([id, quantity]) => ({
      id: parseInt(id),
      quantity
    }));

    if (items.length === 0) return;

    try {
      const res = await axios.post('/api/catering/orders', { items }, {
        headers: { 'x-user-id': '1' } // Mock User ID
      });
      if (res.data.success) {
        alert(`下单成功！订单号: ${res.data.data.orderId}`);
        setCart({});
      }
    } catch (err) {
      alert('下单失败');
      console.error(err);
    }
  };

  return (
    <div className="catering-book-container">
      <BrandSearch />
      <Navbar />
      
      <div className="catering-book-content">
        {/* Left: Train Info (Mock) */}
        <div className="train-info-card">
          <div className="train-info-header">G1 北京南 → 上海虹桥</div>
          <p>发车时间: 09:00</p>
          <p>座位: 05车 12A号</p>
          <div style={{marginTop: '20px', fontSize: '12px', color: '#666'}}>
            <p>配送站点: 南京南</p>
            <p>预计送达: 10:30</p>
          </div>
        </div>

        {/* Middle: Menu */}
        <div className="menu-section">
          <div className="self-operated-section">
            <div className="section-title">列车自营</div>
            <div className="food-list">
              {selfItems.map(item => (
                <div key={item.id} className="food-item">
                  <img 
                    src={item.image_url} 
                    alt={item.name} 
                    className="food-img"
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/200x150?text=Food'; }}
                  />
                  <div className="food-details">
                    <div className="food-name">{item.name}</div>
                    <div className="food-price">¥{item.price}</div>
                    <div className="food-action">
                      {cart[item.id] ? (
                        <div style={{display: 'flex', alignItems: 'center', gap: '5px'}}>
                          <button onClick={() => removeFromCart(item)} className="btn-add" style={{backgroundColor: '#ccc'}}>-</button>
                          <span>{cart[item.id]}</span>
                          <button onClick={() => addToCart(item)} className="btn-add">+</button>
                        </div>
                      ) : (
                        <button onClick={() => addToCart(item)} className="btn-add">加入购物车</button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="brands-section">
            <div className="section-title">沿途外卖</div>
            <div className="brands-grid">
              {brands.map(brand => (
                <div key={brand.id} className="brand-item">
                  <img 
                    src={brand.logo_url} 
                    alt={brand.name} 
                    className="brand-logo"
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/80x80?text=Brand'; }}
                  />
                  <div>{brand.name}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Cart Summary */}
        <div className="cart-summary">
          <div className="section-title">购物车</div>
          {Object.keys(cart).length === 0 ? (
            <p style={{color: '#999', textAlign: 'center'}}>购物车是空的</p>
          ) : (
            <div>
              {Object.entries(cart).map(([itemId, qty]) => {
                const item = selfItems.find(i => i.id === parseInt(itemId));
                if (!item) return null;
                return (
                  <div key={itemId} style={{display: 'flex', justifyContent: 'space-between', marginBottom: '10px'}}>
                    <span style={{flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{item.name}</span>
                    <span>x{qty}</span>
                    <span>¥{item.price * qty}</span>
                  </div>
                );
              })}
              <div className="cart-total">
                总计: ¥{calculateTotal()}
              </div>
              <button onClick={handleCheckout} className="btn-checkout">去结算</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CateringBookPage;