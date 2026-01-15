import { test, expect } from '@playwright/test';

test.describe('Personal Center', () => {
  const username = `user_${Date.now()}`;
  const password = 'Password123';
  const idCard = `11010119900101${Math.floor(Math.random() * 1000)}`;
  const phone = `138${Math.floor(Math.random() * 100000000)}`;

  test.beforeAll(async ({ request }) => {
    // Register via API for speed
    const res = await request.post('http://localhost:3000/api/auth/register', {
      data: {
        username,
        password,
        idType: '1',
        idCard,
        realName: 'Test User',
        phone,
        userType: '1'
      }
    });
    expect(res.ok()).toBeTruthy();
  });

  test.beforeEach(async ({ page }) => {
    // Login via UI
    await page.goto('/login');
    await page.fill('input[name="username"]', username);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/');
  });

  test('should display user info', async ({ page }) => {
    await page.goto('/center');
    
    // Check Sidebar
    await expect(page.locator('.sidebar-menu')).toContainText('个人信息');
    await expect(page.locator('.sidebar-menu')).toContainText('乘车人');

    // Check Info Panel
    await page.click('text=个人信息');
    await expect(page.locator('.info-panel')).toBeVisible();
    await expect(page.locator('.info-item', { hasText: '用户名' })).toContainText(username);
    await expect(page.locator('.info-item', { hasText: '姓名' })).toContainText('Test User');
    await expect(page.locator('.info-item', { hasText: '手机号' })).toContainText(phone);
  });

  test('should manage passengers', async ({ page }) => {
    await page.goto('/center');
    await page.click('text=乘车人');

    // Check empty state or table
    await expect(page.locator('.passenger-panel')).toBeVisible();

    // Add Passenger
    await page.click('button.add-btn');
    await expect(page.locator('.add-form')).toBeVisible();

    const pName = 'Passenger One';
    const pIdCard = `11010119900101${Math.floor(Math.random() * 1000)}`;
    const pPhone = '13912345678';

    await page.fill('input[name="name"]', pName);
    await page.fill('input[name="idCard"]', pIdCard);
    await page.fill('input[name="phone"]', pPhone);
    await page.click('.add-form button[type="submit"]');

    // Verify in list
    await expect(page.locator('.add-form')).not.toBeVisible();
    await expect(page.locator('.passenger-table')).toContainText(pName);
    await expect(page.locator('.passenger-table')).toContainText(pIdCard);

    // Delete Passenger
    page.on('dialog', dialog => dialog.accept());
    await page.click(`.passenger-table tr:has-text("${pName}") .delete-btn`);

    // Verify deletion
    await expect(page.locator('.passenger-table')).not.toContainText(pName);
  });
});
