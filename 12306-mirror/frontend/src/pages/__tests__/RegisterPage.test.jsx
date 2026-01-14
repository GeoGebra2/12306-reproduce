import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';

// [IMPORTS] 
import app from '../../../../backend/src/index'; 
import db from '../../../../backend/src/database/init_db'; 
import RegisterPage from '../RegisterPage'; 

// [GLOBALS] 
let server;
let lastApiResponse = null; 

describe('Full-Stack Integration: <RegisterPage />', () => {

  // ================= 1. Lifecycle: Server & Network Spy =================
  beforeAll(async () => {
    // 启动真实后端 (Port 0 = Random Port)
    server = await new Promise(resolve => {
      const s = app.listen(0, () => resolve(s));
    });
    const port = server.address().port;
    
    // 配置 Axios 指向该测试服务器
    axios.defaults.baseURL = `http://localhost:${port}`;
    
    // [CRITICAL] 安装透明拦截器，捕获真实响应数据
    axios.interceptors.response.use((response) => {
      lastApiResponse = response.data; 
      return response; 
    }, (error) => {
        lastApiResponse = error.response ? error.response.data : null;
        return Promise.reject(error);
    });
  });

  afterAll((done) => {
      if (server) {
          server.close(done);
      } else {
          done();
      }
  });

  // ================= 2. Lifecycle: Data Seeding & Mocks =================
  beforeEach(async () => {
    lastApiResponse = null; 
    
    // Mock window.location 
    vi.stubGlobal('location', { href: 'http://localhost/', assign: vi.fn() });
    
    // [Database Seeding] 
    await new Promise((resolve, reject) => {
        db.run("DELETE FROM users", (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
  });

  // ================= 3. Test Cases: 3-Layer Validation =================
  
  // Layer 1: 基本渲染测试
  it('renders register form correctly', () => {
    render(<BrowserRouter><RegisterPage /></BrowserRouter>);
    expect(screen.getByText('账户注册')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/字母、数字或“_”/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /下一步/i })).toBeInTheDocument();
  });

  // Layer 2 & 3: 交互、数据正确性、UI响应
  it('submits form and registers user successfully', async () => {
    render(<BrowserRouter><RegisterPage /></BrowserRouter>);

    // A. Fill Form
    fireEvent.change(screen.getByPlaceholderText(/字母、数字或“_”/), { target: { value: 'integration_user' } });
    fireEvent.change(screen.getByPlaceholderText(/6-20位字母、数字或符号/), { target: { value: 'password123' } });
    fireEvent.change(screen.getByPlaceholderText(/再次输入密码/), { target: { value: 'password123' } });
    fireEvent.change(screen.getByPlaceholderText(/请输入姓名/), { target: { value: 'Integration User' } });
    fireEvent.change(screen.getByPlaceholderText(/请输入您的证件号码/), { target: { value: '110101199001015678' } });
    fireEvent.change(screen.getByPlaceholderText(/请输入您的手机号码/), { target: { value: '13900139000' } });
    
    // Check Agreement
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    
    // Click Submit
    const submitBtn = screen.getByRole('button', { name: /下一步/i });
    expect(submitBtn).not.toBeDisabled();
    fireEvent.click(submitBtn);

    // B. Wait & Verify
    await waitFor(() => {
      // Check 1: Data Correctness (后端返回了什么？)
      expect(lastApiResponse).not.toBeNull();
      // Since backend is not implemented yet, it returns 501. 
      // Once implemented, it should return user object.
      // We expect this test to FAIL initially or pass with 501 if we asserted that.
      // But TDD requires us to write the EXPECTED behavior.
      expect(lastApiResponse).toHaveProperty('username', 'integration_user');

      // Check 2: UI/State Side Effects
      // expect(window.location.href).toContain('/login'); // Assuming redirect to login
    });
  });
});
