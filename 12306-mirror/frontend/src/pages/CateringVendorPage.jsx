import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import './CateringVendorPage.css';

const CateringVendorPage = () => {
    const { id } = useParams();
    const [brand, setBrand] = useState(null);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch all brands to find current one (Optimization: API should support single brand fetch)
                const brandsRes = await axios.get('/api/catering/brands');
                const currentBrand = brandsRes.data.find(b => b.id === parseInt(id));
                setBrand(currentBrand);

                // Fetch items for this brand
                const itemsRes = await axios.get(`/api/catering/items?type=brand&brand_id=${id}`);
                setItems(itemsRes.data);
            } catch (err) {
                console.error('Failed to fetch vendor data', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (loading) return <div>加载中...</div>;
    if (!brand) return <div>品牌不存在</div>;

    return (
        <div className="catering-vendor-page">
            <div className="vendor-header">
                <div className="vendor-info">
                    <img src={brand.logo_url} alt={brand.name} className="vendor-logo" />
                    <h1>{brand.name}</h1>
                </div>
            </div>

            <div className="vendor-content">
                <h2>商品列表</h2>
                <div className="item-grid">
                    {items.length === 0 ? (
                        <p>该品牌暂无商品</p>
                    ) : (
                        items.map(item => (
                            <div key={item.id} className="food-card">
                                <div className="food-img-placeholder">
                                    <img src={item.image_url} alt={item.name} />
                                </div>
                                <div className="food-info">
                                    <h4>{item.name}</h4>
                                    <div className="price">¥{item.price}</div>
                                    <div className="actions">
                                        <button className="add-btn" onClick={() => alert('请在订餐页添加购物车')}>
                                            仅展示
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="cooperation-info">
                    <h3>合作说明</h3>
                    <p>本服务由 {brand.name} 提供，食品安全由商家负责。</p>
                    <Link to="/catering/book" className="back-link">返回订餐页</Link>
                </div>
            </div>
        </div>
    );
};

export default CateringVendorPage;
