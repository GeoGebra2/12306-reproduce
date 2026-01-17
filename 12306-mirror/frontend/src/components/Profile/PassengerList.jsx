import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Profile.css';

const PassengerList = () => {
  const [passengers, setPassengers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [passengerToDelete, setPassengerToDelete] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    id_type: '中国居民身份证',
    id_card: '',
    phone: '',
    type: '成人'
  });

  useEffect(() => {
    fetchPassengers();
  }, []);

  const fetchPassengers = async () => {
    try {
      setLoading(true);
      // In a real app, x-user-id would come from auth context/storage
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : {};
      const userId = user.id || '1';
      const response = await axios.get('/api/passengers', {
        headers: { 'x-user-id': userId }
      });
      if (response.data.success) {
        setPassengers(response.data.data);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError('获取乘车人列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id) => {
    setPassengerToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!passengerToDelete) return;
    
    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : {};
      const userId = user.id || '1';
      await axios.delete(`/api/passengers/${passengerToDelete}`, {
        headers: { 'x-user-id': userId }
      });
      // Refresh list
      setShowDeleteModal(false);
      setPassengerToDelete(null);
      fetchPassengers();
    } catch (err) {
      alert('删除失败');
      setShowDeleteModal(false);
    }
  };

  const handleAddClick = () => {
    setFormData({
        name: '',
        id_type: '中国居民身份证',
        id_card: '',
        phone: '',
        type: '成人'
    });
    setShowAddModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!formData.name || !formData.id_card || !formData.phone) {
        alert('请填写完整信息');
        return;
    }

    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : {};
      const userId = user.id || '1';
      
      const response = await axios.post('/api/passengers', formData, {
        headers: { 'x-user-id': userId }
      });

      if (response.data.success) {
        setShowAddModal(false);
        fetchPassengers();
      } else {
        alert(response.data.message || '添加失败');
      }
    } catch (err) {
      alert('添加失败');
    }
  };

  return (
    <div className="passenger-list-container" data-testid="passenger-list">
      <h2>常用联系人</h2>
      
      <div className="passenger-actions">
        <button className="add-passenger-btn" onClick={handleAddClick}>
          + 添加乘车人
        </button>
      </div>

      {loading && <p>加载中...</p>}
      {error && <p className="error-message">{error}</p>}
      
      {!loading && !error && (
        <div className="passenger-grid">
          {passengers.length === 0 ? (
            <p>暂无联系人</p>
          ) : (
            <table className="passenger-table">
              <thead>
                <tr>
                  <th>姓名</th>
                  <th>证件类型</th>
                  <th>证件号码</th>
                  <th>手机号</th>
                  <th>旅客类型</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {passengers.map((p) => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td>{p.id_type}</td>
                    <td>{p.id_card}</td>
                    <td>{p.phone}</td>
                    <td>{p.type}</td>
                    <td>
                      <button className="delete-btn" onClick={() => handleDeleteClick(p.id)}>删除</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {showDeleteModal && (
        <div className="modal-overlay">
            <div className="modal-content delete-modal">
                <div className="modal-header">
                    <h3>确认删除</h3>
                    <button className="close-btn" onClick={() => setShowDeleteModal(false)}>×</button>
                </div>
                <div className="modal-body">
                    <p>确定要删除该乘车人吗？</p>
                </div>
                <div className="modal-footer">
                    <button className="cancel-btn" onClick={() => setShowDeleteModal(false)}>取消</button>
                    <button className="save-btn delete-confirm-btn" onClick={confirmDelete}>确定</button>
                </div>
            </div>
        </div>
      )}

      {showAddModal && (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h3>添加乘车人</h3>
                    <button className="close-btn" onClick={() => setShowAddModal(false)}>×</button>
                </div>
                <div className="modal-body">
                    <h4>基本信息</h4>
                    <div className="form-group">
                        <label>姓名</label>
                        <input 
                            type="text" 
                            name="name" 
                            placeholder="请输入姓名" 
                            value={formData.name} 
                            onChange={handleInputChange} 
                        />
                    </div>
                    <div className="form-group">
                        <label>证件类型</label>
                        <select name="id_type" value={formData.id_type} onChange={handleInputChange}>
                            <option value="中国居民身份证">中国居民身份证</option>
                            <option value="港澳居民来往内地通行证">港澳居民来往内地通行证</option>
                            <option value="台湾居民来往大陆通行证">台湾居民来往大陆通行证</option>
                            <option value="护照">护照</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>证件号码</label>
                        <input 
                            type="text" 
                            name="id_card" 
                            placeholder="请输入证件号码" 
                            value={formData.id_card} 
                            onChange={handleInputChange} 
                        />
                    </div>
                    <div className="form-group">
                        <label>手机号</label>
                        <input 
                            type="text" 
                            name="phone" 
                            placeholder="请输入手机号" 
                            value={formData.phone} 
                            onChange={handleInputChange} 
                        />
                    </div>
                    <div className="form-group">
                        <label>旅客类型</label>
                        <select name="type" value={formData.type} onChange={handleInputChange}>
                            <option value="成人">成人</option>
                            <option value="儿童">儿童</option>
                            <option value="学生">学生</option>
                            <option value="残疾军人">残疾军人</option>
                        </select>
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="cancel-btn" onClick={() => setShowAddModal(false)}>取消</button>
                    <button className="save-btn" onClick={handleSave}>保存</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default PassengerList;
