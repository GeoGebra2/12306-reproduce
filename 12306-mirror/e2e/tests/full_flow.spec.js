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
    
    // Delete Passenger via UI (REQ-3-2-2)
    console.log('Deleting Passenger...');
    // Find the delete button for this passenger
    await page.click('button.delete-btn');
    
    // Verify Confirmation Modal
    await expect(page.getByText('确认删除')).toBeVisible();
    await expect(page.getByText('确定要删除该乘车人吗？')).toBeVisible();
    
    // Confirm Delete
    await page.click('button.delete-confirm-btn');
    
    // Wait for delete to process and UI to update
    await expect(page.getByText('暂无联系人')).toBeVisible(); 
    await expect(page.getByText('Passenger One')).not.toBeVisible();
    console.log('Passenger Management Successful');

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

    // --- 6. Order Management (REQ-4-1) ---
    console.log('Starting Order Management...');
    // Navigate via Sidebar (Assuming we are in profile layout)
    await page.click('a[href="/profile/orders"]');
    
    // Verify Order List Page
    await expect(page.getByText('未完成订单')).toBeVisible();
    await expect(page.getByText('未出行订单')).toBeVisible();
    await expect(page.getByText('历史订单')).toBeVisible();
    await expect(page.getByText('暂无订单')).toBeVisible(); // Initially empty

    console.log('Order Management Page Verified');
  });
});
