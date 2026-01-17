import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AddressList.css';

const AddressList = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAddress, setNewAddress] = useState({
    receiver_name: '',
    phone: '',
    province: '',
    city: '',
    district: '',
    detail_address: ''
  });

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : {};
      const userId = user.id || '1';
      
      const response = await axios.get('/api/addresses', {
        headers: { 'x-user-id': userId }
      });
      if (response.data.success) {
        setAddresses(response.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch addresses', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setNewAddress({
      receiver_name: '',
      phone: '',
      province: '',
      city: '',
      district: '',
      detail_address: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAddress(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : {};
      const userId = user.id || '1';

      const response = await axios.post('/api/addresses', newAddress, {
        headers: { 'x-user-id': userId }
      });

      if (response.data.success) {
        fetchAddresses();
        handleCloseModal();
      } else {
        alert(response.data.message || '保存失败');
      }
    } catch (err) {
      console.error(err);
      alert('保存失败');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('确定要删除该地址吗？')) return;
    
    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : {};
      const userId = user.id || '1';

      await axios.delete(`/api/addresses/${id}`, {
        headers: { 'x-user-id': userId }
      });
      fetchAddresses();
    } catch (err) {
      console.error(err);
      alert('删除失败');
    }
  };

  return (
    <div className="address-list-container">
      <div className="address-header">
        <h2>常用地址管理</h2>
        <button className="add-address-btn" onClick={handleAddClick}>新增地址</button>
      </div>
      
      {loading ? (
        <div className="loading">加载中...</div>
      ) : addresses.length === 0 ? (
        <div className="empty-state">暂无常用地址</div>
      ) : (
        <table className="address-table">
          <thead>
            <tr>
              <th>收件人</th>
              <th>手机号</th>
              <th>所在地区</th>
              <th>详细地址</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {addresses.map(addr => (
              <tr key={addr.id}>
                <td>{addr.receiver_name}</td>
                <td>{addr.phone}</td>
                <td>{`${addr.province} ${addr.city} ${addr.district}`}</td>
                <td>{addr.detail_address}</td>
                <td>
                  <button className="delete-btn" onClick={() => handleDelete(addr.id)}>删除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>新增地址</h3>
            <div className="form-group">
              <label>收件人</label>
              <input name="receiver_name" value={newAddress.receiver_name} onChange={handleInputChange} placeholder="请填写收件人姓名" />
            </div>
            <div className="form-group">
              <label>手机号</label>
              <input name="phone" value={newAddress.phone} onChange={handleInputChange} placeholder="请填写手机号码" />
            </div>
            <div className="form-group">
              <label>所在地区</label>
              <div className="area-inputs">
                <input name="province" value={newAddress.province} onChange={handleInputChange} placeholder="省" />
                <input name="city" value={newAddress.city} onChange={handleInputChange} placeholder="市" />
                <input name="district" value={newAddress.district} onChange={handleInputChange} placeholder="区" />
              </div>
            </div>
            <div className="form-group">
              <label>详细地址</label>
              <input name="detail_address" value={newAddress.detail_address} onChange={handleInputChange} placeholder="街道门牌信息" />
            </div>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={handleCloseModal}>取消</button>
              <button className="save-btn" onClick={handleSave}>保存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressList;
