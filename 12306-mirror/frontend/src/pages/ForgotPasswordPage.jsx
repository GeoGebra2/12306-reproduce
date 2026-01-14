import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './ForgotPasswordPage.css';

const ForgotPasswordPage = () => {
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleStep1Submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/check-user', { username });
      if (res.status === 200 && res.data.exists) {
        if (res.data.username) {
          setUsername(res.data.username);
        }
        setStep(2);
      }
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setError('用户不存在，请检查账号或手机号');
      } else {
        setError('系统错误，请稍后重试');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStep2Submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/verify-code', { username, code });
      if (res.status === 200 && res.data.verified) {
        setStep(3);
      }
    } catch (err) {
      if (err.response && err.response.status === 400) {
        setError(err.response.data.message || '验证码错误');
      } else {
        setError('验证失败，请稍后重试');
      }
    } finally {
      setLoading(false);
    }
  };

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleStep3Submit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (newPassword !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }
    
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/reset-password', { username, newPassword });
      if (res.status === 200 && res.data.success) {
        setStep(4);
      }
    } catch (err) {
      setError('重置密码失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="forgot_password_page" className="forgot-password-page">
      <header className="forgot-password-header">
         <div className="brand-logo">
            <img src="/assets/home-train/铁路12306-512x512.png" alt="Logo" />
            <div className="brand-text">
                <h1>中国铁路12306</h1>
                <span>12306 CHINA RAILWAY</span>
            </div>
            <div className="page-title">找回密码</div>
        </div>
      </header>
      <main className="forgot-password-main">
        <div className="forgot-password-container">
            {step === 1 && (
                <div className="step-1-container">
                    <h2>填写账号</h2>
                    <form onSubmit={handleStep1Submit} className="forgot-password-form">
                        <div className="form-item">
                            <label>账号/手机号：</label>
                            <input 
                                type="text" 
                                placeholder="请输入账号/手机号" 
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                        {error && <div className="error-message">{error}</div>}
                        <div className="form-item submit-btn">
                            <button type="submit" disabled={loading}>
                                {loading ? '验证中...' : '下一步'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
            
            {step === 2 && (
            <div className="step-2-container">
              <h2>短信验证 (Step 2)</h2>
              <p>Current User: {username}</p>
              <form onSubmit={handleStep2Submit} className="forgot-form">
                <div className="form-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="请输入验证码"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                  />
                  <small className="form-text text-muted">测试验证码: 123456</small>
                </div>
                {error && <div className="error-message">{error}</div>}
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? '验证中...' : '下一步'}
                </button>
              </form>
            </div>
          )}

          {step === 3 && (
            <div className="step-3-container">
              <h2>重置密码 (Step 3)</h2>
              <p>Current User: {username}</p>
              <form onSubmit={handleStep3Submit} className="forgot-form">
                <div className="form-group">
                  <input
                    type="password"
                    className="form-control"
                    placeholder="请输入新密码"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <input
                    type="password"
                    className="form-control"
                    placeholder="请确认新密码"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                {error && <div className="error-message">{error}</div>}
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? '提交中...' : '确定'}
                </button>
              </form>
            </div>
          )}

          {step === 4 && (
            <div className="step-4-container">
              <h2>重置成功</h2>
              <p>您的密码已重置成功，请使用新密码登录。</p>
              <Link to="/login" className="btn-primary">立即登录</Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ForgotPasswordPage;
