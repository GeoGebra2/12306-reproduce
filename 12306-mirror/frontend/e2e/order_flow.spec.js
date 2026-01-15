import { test, expect } from '@playwright/test';

test.describe('Order Flow', () => {
  let username;
  let password = 'Password123';

  test.beforeEach(async ({ page, request }) => {
    username = `user_order_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    const idCard = `11010119900101${Math.floor(Math.random() * 1000)}`;
    const phone = `138${Math.floor(Math.random() * 100000000)}`;

    // Register
    const res = await request.post('http://localhost:3000/api/auth/register', {
      data: {
        username,
        password,
        idType: '1',
        idCard,
        realName: 'Order Test User',
        phone,
        userType: '1'
      }
    });
    expect(res.ok()).toBeTruthy();

    // Login
    await page.goto('/login');
    await page.fill('input[name="username"]', username);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/');
  });

  test('should book a ticket and create an order', async ({ page }) => {
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));

    // 1. Add a passenger first (Prerequisite)
    await page.goto('/center');
    await page.click('text=乘车人');
    await page.click('button.add-btn');
    
    const pName = 'Order Passenger';
    const pIdCard = `11010119900101${Math.floor(Math.random() * 1000)}`;
    const pPhone = '13912345678';
    
    await page.fill('input[name="name"]', pName);
    await page.fill('input[name="idCard"]', pIdCard);
    await page.fill('input[name="phone"]', pPhone);
    await page.click('.add-form button[type="submit"]');
    
    // Verify passenger added
    await expect(page.locator('.passenger-table')).toContainText(pName);

    // 2. Search for tickets
    await page.goto('/tickets?from=北京南&to=上海虹桥&date=2023-10-01');
    
    // 3. Select a ticket (G1)
    const trainItem = page.locator('.ticket-item').filter({ hasText: 'G1' });
    await expect(trainItem).toBeVisible();
    
    // 4. Click Book
    await trainItem.locator('.book-btn').click();
    
    // Debug URL
    await page.waitForTimeout(1000);
    console.log('Current URL:', page.url());
    
    // Check if we are at /order
    if (page.url().includes('/order')) {
        console.log('Successfully navigated to /order');
    } else {
        console.log('Failed to navigate to /order, current:', page.url());
    }

    // 5. Verify on Order Create Page
    // Note: URL might be /order but title should be correct
    await expect(page.locator('.order-header h1')).toHaveText('订单填写');
    
    // Verify train info
    await expect(page.locator('.train-no')).toHaveText('G1');
    
    // 6. Select Passenger
    const passengerItem = page.locator('.passenger-item').filter({ hasText: pName });
    await expect(passengerItem).toBeVisible();
    await passengerItem.click();
    
    // Verify selected style
    await expect(passengerItem).toHaveClass(/selected/);
    
    // 7. Submit Order
    // Handle alert
    page.once('dialog', async dialog => {
        console.log('Dialog message (Submit):', dialog.message());
        expect(dialog.message()).toContain('订单提交成功');
        await dialog.accept();
    });
    
    await page.click('.submit-btn');
    
    // 8. Verify redirection (to /center or order list)
    // We set it to navigate to /center temporarily
    await expect(page).toHaveURL('/center');

    const localStorageUserId = await page.evaluate(() => localStorage.getItem('userId'));
    console.log('Test userId in localStorage:', localStorageUserId);

    // 9. Verify Order List
    await page.click('text=订单管理');
    
    // Debug: Check if OrderList is present
    const orderListVisible = await page.isVisible('.order-list-component');
    console.log('OrderList component visible:', orderListVisible);

    await expect(page.locator('.order-card')).toBeVisible();
    await expect(page.locator('.train-no')).toHaveText('G1');
    await expect(page.locator('.order-status')).toHaveText('未支付');

    // 10. Pay Order
    await page.click('.btn-pay');
    
    // Should navigate to Pay Order Page
    await expect(page).toHaveURL(/\/pay-order\/\d+/);
    
    // Verify Pay Order Page elements
    await expect(page.locator('.pay-banner')).toBeVisible();
    await expect(page.locator('.pay-actions button')).toHaveText('立即支付');
    
    // Setup dialog handler for success message
    page.once('dialog', async dialog => {
        const msg = dialog.message();
        console.log('Dialog message (Pay):', msg);
        if (msg.includes('支付成功')) {
            await dialog.accept();
        }
    });

    // Click "Immediate Pay"
    await page.click('.pay-actions button');
    
    // Wait for redirect back to center
    await expect(page).toHaveURL('/center', { timeout: 15000 });
    
    // Verify status update in list
    // Note: We need to click "Order Management" again because activeTab might reset
    await page.click('text=订单管理');
    
    await page.click('text=未出行');
    await expect(page.locator('.order-card')).toBeVisible();
    await expect(page.locator('.order-status')).toHaveText('已支付');

    await page.click('text=未支付');
    await expect(page.locator('.order-card')).not.toBeVisible();
  });

  test('should book a ticket and cancel an order', async ({ page }) => {
    // 1. Add a passenger first (Prerequisite)
    await page.goto('/center');
    await page.click('text=乘车人');
    await page.click('button.add-btn');
    
    const pName = 'Order Passenger';
    const pIdCard = `11010119900101${Math.floor(Math.random() * 1000)}`;
    const pPhone = '13912345678';
    
    await page.fill('input[name="name"]', pName);
    await page.fill('input[name="idCard"]', pIdCard);
    await page.fill('input[name="phone"]', pPhone);
    await page.click('.add-form button[type="submit"]');
    
    // Verify passenger added
    await expect(page.locator('.passenger-table')).toContainText(pName);

    // 2. Book Logic
    await page.goto('/tickets?from=北京南&to=上海虹桥&date=2023-10-01');
    const trainItem = page.locator('.ticket-item').filter({ hasText: 'G1' });
    await trainItem.locator('.book-btn').click();
    
    // Select passenger (Assume one exists from previous test or we add one if needed)
    // Actually, let's check if passenger list is empty.
    // But to be robust, let's just use the first available passenger.
    
    // Wait for passenger list to load
    await page.waitForSelector('.passenger-item');
    const passengerItem = page.locator('.passenger-item').first();
    await passengerItem.click();
    
    // Submit
    page.once('dialog', async dialog => {
        await dialog.accept();
    });
    await page.click('.submit-btn');
    await expect(page).toHaveURL('/center');
    
    // Go to Order List
    await page.click('text=订单管理');
    await expect(page.locator('.order-card').first()).toBeVisible();
    
    // Filter to Unpaid (should be default but good to check)
    await page.click('text=未支付');
    
    // Find the Cancel button
    const cancelBtn = page.locator('.btn-cancel').first();
    await expect(cancelBtn).toBeVisible();
    
    // Click Cancel
    // Handle both confirmation and success alert
    let dialogCount = 0;
    page.on('dialog', async dialog => {
        console.log(`Dialog ${dialogCount}: ${dialog.message()}`);
        await dialog.accept();
        dialogCount++;
    });
    
    await cancelBtn.click();
    
    // Wait for status update
    // After cancel, it should disappear from "Unpaid" tab or show as Cancelled?
    // OrderList.jsx re-fetches orders.
    // If filter is 'unpaid', it should disappear.
    
    // Wait for UI update.
    await expect(page.locator('.order-card')).not.toBeVisible();
    
    // Check "Cancelled" tab
    await page.click('text=已取消/历史');
    await expect(page.locator('.order-card').first()).toBeVisible();
    const status = await page.locator('.order-status').first().textContent();
    expect(status).toContain('已取消');
  });
});
