import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Profile.css';

const PassengerList = () => {
  const [passengers, setPassengers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPassengers();
  }, []);

  const fetchPassengers = async () => {
    try {
      setLoading(true);
      // In a real app, x-user-id would come from auth context/storage
      const userId = localStorage.getItem('userId') || '1';
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

  const handleDelete = async (id) => {
    if (!window.confirm('确定要删除该乘车人吗？')) return;
    
    try {
      const userId = localStorage.getItem('userId') || '1';
      await axios.delete(`/api/passengers/${id}`, {
        headers: { 'x-user-id': userId }
      });
      // Refresh list
      fetchPassengers();
    } catch (err) {
      alert('删除失败');
    }
  };

  return (
    <div className="passenger-list-container" data-testid="passenger-list">
      <h2>常用联系人</h2>
      
      <div className="passenger-actions">
        <button className="add-passenger-btn" onClick={() => alert('Add feature coming soon')}>
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
                      <button className="delete-btn" onClick={() => handleDelete(p.id)}>删除</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default PassengerList;
