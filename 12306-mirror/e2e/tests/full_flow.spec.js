const { test, expect } = require('@playwright/test');

test.describe('12306 E2E Flow', () => {
  let userId;
  const username = `testuser_${Date.now()}`;
  const password = 'password123';
  const realName = 'Test User';
  const idCard = `110101199001${String(Date.now()).slice(-6)}`; // Randomize ID Card slightly to be safe
  const phone = `13${String(Date.now()).slice(-9)}`; // Randomize Phone
  const email = `test${Date.now()}@example.com`;

  test('Complete User Journey', async ({ page, request }) => {
    // Universal dialog handler (accepts alerts and confirms)
    page.on('dialog', async dialog => {
      console.log(`Dialog message: ${dialog.message()}`);
      await dialog.accept();
    });

    page.on('console', msg => console.log(`BROWSER LOG: ${msg.text()}`));

    // --- 1. Registration ---
    console.log(`Starting Registration for ${username}...`);
    await page.goto('/register');
    await page.fill('input[name="username"]', username);
    await page.fill('input[name="password"]', password);
    await page.fill('input[name="confirmPassword"]', password);
    await page.fill('input[name="real_name"]', realName);
    await page.fill('input[name="id_card"]', idCard);
    await page.fill('input[name="phone"]', phone);
    await page.fill('input[name="email"]', email);
    
    // Check the required agreement checkbox
    await page.check('input#agree');
    
    // Capture the request to debug
    const registerPromise = page.waitForResponse(resp => resp.url().includes('/api/users/register'));
    await page.click('button[type="submit"]');
    
    const registerResponse = await registerPromise;
    console.log('Register Response Status:', registerResponse.status());
    const registerBody = await registerResponse.json();
    console.log('Register Response Body:', registerBody);

    if (!registerBody.success) {
      throw new Error(`Registration failed: ${registerBody.message}`);
    }

    // Expect redirect to login
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
    console.log('Registration Successful');

    // --- 2. Login ---
    console.log('Starting Login...');
    await page.fill('input[name="username"]', username);
    await page.fill('input[name="password"]', password);
    
    // Capture Login Response to get userId
    const loginPromise = page.waitForResponse(resp => resp.url().includes('/api/users/login') && resp.status() === 200);
    await page.click('button[type="submit"]');
    const loginResponse = await loginPromise;
    
    const loginData = await loginResponse.json();
    userId = loginData.user.id; 
    console.log('Logged in User ID:', userId);
    
    await expect(page).toHaveURL('/'); // Home
    console.log('Login Successful');
    
    // --- 3. Search Trains ---
    console.log('Starting Train Search...');
    // Ensure we are on home page
    await expect(page.locator('input[placeholder="出发地"]')).toBeVisible();

    await page.fill('input[placeholder="出发地"]', '北京南');
    await page.keyboard.press('Escape'); // Close suggestions
    
    await page.fill('input[placeholder="目的地"]', '上海虹桥');
    await page.keyboard.press('Escape');
    
    // Fill Date
    const today = new Date().toISOString().split('T')[0];
    await page.fill('input[name="date"]', today);
    
    await page.click('button:has-text("查询车票")');
    
    await expect(page).toHaveURL(/\/search/);
    await expect(page.locator('.train-list-body')).toBeVisible();
    // Verify at least one train is found
    await expect(page.locator('.train-item').first()).toBeVisible();
    console.log('Train Search Successful');
    
    // --- 4. Profile & Passenger Management ---
    console.log('Starting Passenger Management...');
    await page.goto('/profile/passengers');
    
    // Should be empty initially
    await expect(page.getByText('暂无联系人')).toBeVisible();
    
    // Add Passenger via UI (REQ-3-2-1)
    console.log('Adding Passenger via UI...');
    await page.click('button.add-passenger-btn');
    
    await expect(page.locator('.modal-content')).toBeVisible();
    await page.fill('input[name="name"]', 'Passenger One');
    await page.selectOption('select[name="id_type"]', '中国居民身份证');
    await page.fill('input[name="id_card"]', '110101199001015555');
    await page.fill('input[name="phone"]', '13900000000');
    await page.selectOption('select[name="type"]', '成人');
    
    await page.click('button:has-text("保存")');
    
    // Verify passenger appears
    await expect(page.locator('.modal-content')).not.toBeVisible();
    await expect(page.getByText('Passenger One')).toBeVisible();
    
    // KEEP Passenger for Booking Test
    console.log('Passenger Added and Kept for Booking Test');

    // --- 5. Address Management (REQ-3-3) ---
    console.log('Starting Address Management...');
    await page.goto('/profile/address');
    
    // Should be empty initially
    await expect(page.getByText('暂无常用地址')).toBeVisible();

    // Add Address
    console.log('Adding Address...');
    await page.click('button.add-address-btn');
    
    await expect(page.locator('.modal-content')).toBeVisible();
    await page.fill('input[name="receiver_name"]', 'Address Receiver');
    await page.fill('input[name="phone"]', '13800000000');
    await page.fill('input[name="province"]', 'Test Province');
    await page.fill('input[name="city"]', 'Test City');
    await page.fill('input[name="district"]', 'Test District');
    await page.fill('input[name="detail_address"]', 'Test Detail 101');
    
    await page.click('button.save-btn');
    
    // Verify address appears
    await expect(page.locator('.modal-content')).not.toBeVisible();
    await expect(page.getByText('Address Receiver')).toBeVisible();
    await expect(page.getByText('Test Province Test City Test District')).toBeVisible();

    // Delete Address
    console.log('Deleting Address...');
    await page.click('button.delete-btn');
    
    // Verify address removed
    await expect(page.getByText('暂无常用地址')).toBeVisible();
    await expect(page.getByText('Address Receiver')).not.toBeVisible();
    console.log('Address Management Successful');

    // --- 5.5. Booking Flow (REQ-4-2) ---
    console.log('Starting Booking Flow...');
    
    // Go back to search
    await page.goto('/');
    await page.fill('input[placeholder="出发地"]', '北京南');
    await page.keyboard.press('Escape');
    await page.fill('input[placeholder="目的地"]', '上海虹桥');
    await page.keyboard.press('Escape');
    const bookDate = new Date().toISOString().split('T')[0];
    await page.fill('input[name="date"]', bookDate);
    await page.click('button:has-text("查询车票")');
    
    // Click Book on the first train
    await page.waitForSelector('.train-item');
    await page.click('.train-item:first-child .btn-book');
    
    // Expect to be on booking page
    await expect(page).toHaveURL(/\/booking/);
    await expect(page.getByText('选择乘车人')).toBeVisible();
    
    // Select the passenger we added earlier (Passenger One)
    await page.click('div.passenger-item:has-text("Passenger One")');
    
    // Verify table appears
    await expect(page.locator('table.selected-passengers-table')).toBeVisible();
    
    // Submit Order
    await page.click('button.submit-btn');
    
    // Expect redirect to order list
    await expect(page).toHaveURL(/\/profile\/orders/);
    console.log('Booking Successful');

    // --- 6. Order Management (REQ-4-1) ---
    console.log('Starting Order Management...');
    // Navigate via Sidebar (Assuming we are in profile layout)
    await page.click('a[href="/profile/orders"]');
    
    // Verify Order List Page
    await expect(page.getByText('未完成订单')).toBeVisible();
    
    // Verify the new order is present (It should be in Unpaid/未完成 status)
    await expect(page.getByText('暂无订单')).not.toBeVisible();
    await expect(page.locator('.order-item')).toBeVisible();
    
    // --- 7. Cancel Order (REQ-4-3) ---
    console.log('Starting Order Cancellation...');
    
    // Note: Global dialog handler at line 14 will auto-accept confirm and alert.

    // Click Cancel Button
    await page.click('button:has-text("取消订单")');
    
    // Verify order is gone from Unpaid list (after refresh)
    await expect(page.getByText('暂无订单')).toBeVisible(); 
    
    // Verify order is in History tab
    await page.click('div.tab-item:has-text("历史订单")');
    // Ensure data loading
    await expect(page.getByText('加载中...')).not.toBeVisible();
    await expect(page.getByText('暂无订单')).not.toBeVisible();
    await expect(page.locator('.order-item')).toBeVisible();
    // Check for "Cancelled" status text.
    await expect(page.getByText('Cancelled')).toBeVisible(); 
    console.log('Order Cancellation Verified');

    // --- 8. Payment Flow (REQ-4-4) ---
    console.log('Starting Payment Flow...');

    // Book another ticket
    await page.goto('/');
    await page.fill('input[placeholder="出发地"]', '北京南');
    await page.keyboard.press('Escape');
    await page.fill('input[placeholder="目的地"]', '上海虹桥');
    await page.keyboard.press('Escape');
    await page.fill('input[name="date"]', bookDate);
    await page.click('button:has-text("查询车票")');
    
    await page.waitForSelector('.train-item');
    await page.click('.train-item:first-child .btn-book'); 
    
    // Booking Page
    await page.click('div.passenger-item:has-text("Passenger One")');
    await page.click('button.submit-btn');
    
    // Order List (Unpaid)
    await expect(page).toHaveURL(/\/profile\/orders/);
    
    // Click Pay Button
    await page.click('button:has-text("支付")');
    
    // Pay Page
    await expect(page).toHaveURL(/\/pay-order\//);
    await expect(page.getByText('席位已锁定')).toBeVisible();
    
    // Click Immediate Pay
    await page.click('button:has-text("立即支付")');
    
    // Modal
    await expect(page.getByText('请扫码支付')).toBeVisible();
    
    // Simulate Success
    await page.click('button:has-text("模拟支付成功")');
    
    // Verify Redirect to Paid/Upcoming tab
    await expect(page).toHaveURL(/tab=Paid/);
    
    // Verify Order is in Paid list
    await expect(page.getByText('暂无订单')).not.toBeVisible();
    await expect(page.getByText('Paid')).toBeVisible();

    console.log('Payment Flow Verified');

    // --- 9. Refund Flow (REQ-4-5) ---
    console.log('Starting Refund Flow...');
    
    // Click View Details
    await page.click('button:has-text("查看详情")');
    
    // Verify Order Detail Page
    await expect(page).toHaveURL(/\/order-detail\//); 
    await expect(page.getByText('订单详情')).toBeVisible();
    await expect(page.locator('.status-text', { hasText: '已支付' })).toBeVisible(); // Specific to header status
    
    // Click Refund
    await page.click('button:has-text("退票")');
    
    // Verify Refund Success Page
    // Alert is handled by dialog handler, but now we expect redirection
    await expect(page).toHaveURL(/\/refund-success/);
    await expect(page.getByText('退票申请已提交')).toBeVisible();
    await expect(page.getByText('查看订单详情')).toBeVisible();
    
    // Navigate back to Order Detail to verify status
    await page.click('button:has-text("查看订单详情")');
    await expect(page).toHaveURL(/\/order-detail\//); 
    await expect(page.locator('.status-text', { hasText: '已退票' })).toBeVisible();
    
    console.log('Refund Flow Verified');
  });
});
