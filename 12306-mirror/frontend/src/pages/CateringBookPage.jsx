import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './CateringBookPage.css';

const CateringBookPage = () => {
    const [items, setItems] = useState([]);
    const [brands, setBrands] = useState([]);
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [itemsRes, brandsRes] = await Promise.all([
                    axios.get('/api/catering/items'),
                    axios.get('/api/catering/brands')
                ]);
                setItems(itemsRes.data);
                setBrands(brandsRes.data);
            } catch (err) {
                console.error('Failed to fetch catering data', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const addToCart = (item) => {
        setCart(prev => {
            const existing = prev.find(i => i.id === item.id);
            if (existing) {
                return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, { ...item, quantity: 1 }];
        });
    };

    const removeFromCart = (itemId) => {
        setCart(prev => prev.filter(i => i.id !== itemId));
    };

    const updateQuantity = (itemId, delta) => {
        setCart(prev => {
            return prev.map(i => {
                if (i.id === itemId) {
                    const newQ = i.quantity + delta;
                    if (newQ <= 0) return null;
                    return { ...i, quantity: newQ };
                }
                return i;
            }).filter(Boolean);
        });
    };

    const handleCheckout = async () => {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            alert('请先登录');
            return;
        }
        if (cart.length === 0) return;

        try {
            await axios.post('/api/catering/orders', {
                items: cart.map(i => ({ id: i.id, quantity: i.quantity, price: i.price }))
            }, {
                headers: { 'x-user-id': userId }
            });
            alert('下单成功！');
            setCart([]);
        } catch (err) {
            alert('下单失败');
            console.error(err);
        }
    };

    const selfItems = items.filter(i => i.type === 'self');
    const brandItems = items.filter(i => i.type === 'brand');

    const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    if (loading) return <div>加载中...</div>;

    return (
        <div className="catering-book-page">
            <div className="layout-container">
                {/* Left: Train Info */}
                <div className="left-panel">
                    <div className="train-card">
                        <h3>G1 次</h3>
                        <div className="route">北京南 &rarr; 上海虹桥</div>
                        <div className="date">2023-10-01</div>
                    </div>
                    <div className="steps">
                        <div className="step active">1. 选择餐品</div>
                        <div className="step">2. 确认订单</div>
                        <div className="step">3. 支付</div>
                    </div>
                </div>

                {/* Middle: Items */}
                <div className="middle-panel">
                    <section className="section-self">
                        <h2>自营冷链餐</h2>
                        <div className="item-grid">
                            {selfItems.map(item => (
                                <div key={item.id} className="food-card">
                                    <div className="food-img-placeholder">
                                        <img src={item.image_url} alt={item.name} />
                                    </div>
                                    <div className="food-info">
                                        <h4>{item.name}</h4>
                                        <div className="price">¥{item.price}</div>
                                        <button onClick={() => addToCart(item)} className="add-btn">+</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="section-brands">
                        <h2>品牌餐饮</h2>
                        <div className="brand-list">
                            {brands.map(brand => (
                                <Link key={brand.id} to={`/catering/vendor/${brand.id}`} className="brand-card">
                                    <img src={brand.logo_url} alt={brand.name} />
                                    <span>{brand.name}</span>
                                </Link>
                            ))}
                        </div>
                        <div className="item-grid">
                            {brandItems.map(item => (
                                <div key={item.id} className="food-card">
                                    <div className="food-img-placeholder">
                                        <img src={item.image_url} alt={item.name} />
                                    </div>
                                    <div className="food-info">
                                        <h4>{item.name}</h4>
                                        <div className="price">¥{item.price}</div>
                                        <button onClick={() => addToCart(item)} className="add-btn">+</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Right: Cart */}
                <div className="right-panel">
                    <div className="cart-card">
                        <h3>购物车</h3>
                        {cart.length === 0 ? (
                            <p className="empty-cart">购物车是空的</p>
                        ) : (
                            <div className="cart-items">
                                {cart.map(item => (
                                    <div key={item.id} className="cart-item">
                                        <div className="name">{item.name}</div>
                                        <div className="controls">
                                            <button onClick={() => updateQuantity(item.id, -1)}>-</button>
                                            <span>{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.id, 1)}>+</button>
                                        </div>
                                        <div className="price">¥{item.price * item.quantity}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="cart-footer">
                            <div className="total">合计: ¥{totalPrice}</div>
                            <button className="checkout-btn" disabled={cart.length === 0} onClick={handleCheckout}>
                                去结算
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CateringBookPage;
