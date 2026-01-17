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
    
    // Should be empty initially (or at least valid page)
    await expect(page.getByText('暂无联系人')).toBeVisible();
    
    // Seed a passenger via API
    console.log('Seeding Passenger...');
    const passengerData = {
      name: 'Passenger One',
      id_type: '身份证',
      id_card: '110101199001015555',
      phone: '13900000000',
      type: '成人'
    };
    
    const apiResponse = await request.post('/api/passengers', {
      headers: { 'x-user-id': String(userId) },
      data: passengerData
    });
    expect(apiResponse.ok()).toBeTruthy();
    
    // Reload page to see the passenger
    await page.reload();
    await expect(page.getByText('Passenger One')).toBeVisible();
    
    // Delete Passenger
    console.log('Deleting Passenger...');
    // Find the delete button for this passenger
    await page.click('button:has-text("删除")');
    
    // Wait for delete to process and UI to update
    await expect(page.getByText('暂无联系人')).toBeVisible(); 
    await expect(page.getByText('Passenger One')).not.toBeVisible();
    console.log('Passenger Management Successful');
  });
});
