import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import BrandSearch from '../components/HeaderBrandSearch';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './CateringVendorPage.css';

const CateringVendorPage = () => {
  const { id } = useParams();
  const [vendor, setVendor] = useState(null);
  const [items, setItems] = useState([]);
  const [cart, setCart] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [brandsRes, itemsRes] = await Promise.all([
          axios.get('/api/catering/brands'),
          axios.get(`/api/catering/items?brand_id=${id}`)
        ]);

        if (brandsRes.data.success) {
          const foundVendor = brandsRes.data.data.find(b => b.id === parseInt(id));
          setVendor(foundVendor);
        }
        if (itemsRes.data.success) {
          setItems(itemsRes.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch vendor data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

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
      const item = items.find(i => i.id === parseInt(itemId));
      return total + (item ? item.price * qty : 0);
    }, 0);
  };

  const handleCheckout = async () => {
    const orderItems = Object.entries(cart).map(([itemId, quantity]) => ({
      id: parseInt(itemId),
      quantity
    }));

    if (orderItems.length === 0) return;

    try {
      const res = await axios.post('/api/catering/orders', { items: orderItems }, {
        headers: { 'x-user-id': '1' }
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

  if (loading) return <div>Loading...</div>;
  if (!vendor) return <div>Vendor not found</div>;

  return (
    <div className="catering-vendor-container">
      <BrandSearch />
      <Navbar />
      
      <div className="catering-vendor-content">
        {/* Left: Vendor Info */}
        <div className="vendor-info-card">
          <img src={vendor.logo_url} alt={vendor.name} className="vendor-logo-large" />
          <h2>{vendor.name}</h2>
          <p>评分: 4.8</p>
          <p>月售: 1000+</p>
          <p className="vendor-notice">配送说明: 列车到站后30分钟内送达</p>
        </div>

        {/* Middle: Menu */}
        <div className="vendor-menu-section">
          <div className="section-title">热销商品</div>
          <div className="food-list">
            {items.map(item => (
              <div key={item.id} className="food-item-card">
                <img src={item.image_url} alt={item.name} className="food-img" onError={(e) => { e.target.src = 'https://via.placeholder.com/100'; }} />
                <div className="food-info">
                  <div className="food-name">{item.name}</div>
                  <div className="food-price">¥{item.price}</div>
                  <button className="add-btn" onClick={() => addToCart(item)}>+</button>
                </div>
              </div>
            ))}
            {items.length === 0 && <p>暂无商品</p>}
          </div>
        </div>

        {/* Right: Cart */}
        <div className="cart-sidebar">
          <div className="cart-title">购物车</div>
          <div className="cart-items">
            {Object.entries(cart).map(([itemId, qty]) => {
              const item = items.find(i => i.id === parseInt(itemId));
              if (!item) return null;
              return (
                <div key={itemId} className="cart-item">
                  <span>{item.name}</span>
                  <div className="cart-controls">
                    <button onClick={() => removeFromCart(item)}>-</button>
                    <span>{qty}</span>
                    <button onClick={() => addToCart(item)}>+</button>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="cart-footer">
            <div className="total-price">¥{calculateTotal()}</div>
            <button className="checkout-btn" onClick={handleCheckout} disabled={Object.keys(cart).length === 0}>
              去结算
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CateringVendorPage;
