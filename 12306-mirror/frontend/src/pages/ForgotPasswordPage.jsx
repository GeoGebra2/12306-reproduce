import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HeaderBrandSearch from '../components/HeaderBrandSearch';
import Navbar from '../components/Navbar';
import axios from 'axios';
import './ForgotPasswordPage.css';

const ForgotPasswordPage = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [account, setAccount] = useState('');
    const [code, setCode] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [userInfo, setUserInfo] = useState(null);

    const handleVerifyAccount = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const res = await axios.post('/api/users/forgot/check-user', { account });
            if (res.data.success) {
                setUserInfo(res.data);
                setStep(2);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'User not found');
        }
    };

    const handleVerifyCode = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const res = await axios.post('/api/users/forgot/verify-code', { code });
            if (res.data.success) {
                setStep(3);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid code');
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        try {
            const res = await axios.post('/api/users/forgot/reset-password', { account, newPassword: password });
            if (res.data.success) {
                setStep(4);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password');
        }
    };

    return (
        <div className="forgot-password-page" data-testid="forgot-password-page">
            <HeaderBrandSearch />
            <Navbar />
            <div className="forgot-content">
                <div className="forgot-box">
                    <h2 className="forgot-title">找回密码</h2>
                    
                    {/* Progress Steps */}
                    <div className="steps-indicator">
                        <div className={`step ${step >= 1 ? 'active' : ''}`}>1. 填写账号</div>
                        <div className={`step ${step >= 2 ? 'active' : ''}`}>2. 验证身份</div>
                        <div className={`step ${step >= 3 ? 'active' : ''}`}>3. 重置密码</div>
                        <div className={`step ${step >= 4 ? 'active' : ''}`}>4. 完成</div>
                    </div>

                    <div className="step-content">
                        {step === 1 && (
                            <form onSubmit={handleVerifyAccount}>
                                <div className="form-group">
                                    <input 
                                        type="text" 
                                        className="forgot-input"
                                        placeholder="用户名/邮箱/手机号"
                                        value={account}
                                        onChange={(e) => setAccount(e.target.value)}
                                        required
                                    />
                                </div>
                                <button type="submit" className="forgot-btn">下一步</button>
                            </form>
                        )}

                        {step === 2 && (
                            <form onSubmit={handleVerifyCode}>
                                <p className="info-text">验证码已发送至: {userInfo?.phone}</p>
                                <div className="form-group">
                                    <input 
                                        type="text" 
                                        className="forgot-input"
                                        placeholder="请输入验证码"
                                        value={code}
                                        onChange={(e) => setCode(e.target.value)}
                                        required
                                    />
                                </div>
                                <button type="submit" className="forgot-btn">下一步</button>
                            </form>
                        )}

                        {step === 3 && (
                            <form onSubmit={handleResetPassword}>
                                <div className="form-group">
                                    <input 
                                        type="password" 
                                        className="forgot-input"
                                        placeholder="输入新密码"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <input 
                                        type="password" 
                                        className="forgot-input"
                                        placeholder="确认新密码"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                <button type="submit" className="forgot-btn">确定</button>
                            </form>
                        )}

                        {step === 4 && (
                            <div className="success-content">
                                <p className="success-text">密码重置成功！</p>
                                <button onClick={() => navigate('/login')} className="forgot-btn">立即登录</button>
                            </div>
                        )}
                        
                        {error && <div className="error-message">{error}</div>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
