import { test, expect } from '@playwright/test';

test.describe('Auth Flow', () => {
  const username = `testuser_${Date.now()}`;
  const password = 'Password123_';
  const idCard = `11010119900307${Math.floor(1000 + Math.random() * 9000)}`;
  const phone = `138${Math.floor(10000000 + Math.random() * 90000000)}`;

  test('should register a new user', async ({ page }) => {
    await page.goto('/register');
    
    // Fill Registration Form
    await page.fill('input[name="username"]', username);
    await page.fill('input[name="password"]', password);
    await page.fill('input[name="confirmPassword"]', password);
    await page.fill('input[name="realName"]', '测试用户');
    await page.selectOption('select[name="idType"]', '1');
    await page.fill('input[name="idCard"]', idCard);
    await page.fill('input[name="phone"]', phone);
    await page.check('input[name="agreed"]');

    // Submit
    page.on('dialog', dialog => dialog.accept()); // Handle alert
    await page.getByRole('button', { name: '下一步' }).click();

    // Expect redirect to login
    await expect(page).toHaveURL(/\/login/);
  });

  test('should login with the new user', async ({ page }) => {
    // We assume the user is registered from the previous test or we register again?
    // Playwright tests are isolated. We should register first or seed DB.
    // For simplicity, let's just register a user in this test too or reuse logic.
    // Ideally, we should use API to seed user, but we are testing E2E.
    
    // Let's register a user specifically for login test to be safe
    const loginUser = `login_${Date.now()}`;
    const loginPhone = `139${Math.floor(10000000 + Math.random() * 90000000)}`;
    const loginId = `11010119900307${Math.floor(1000 + Math.random() * 9000)}`;

    await page.goto('/register');
    await page.fill('input[name="username"]', loginUser);
    await page.fill('input[name="password"]', password);
    await page.fill('input[name="confirmPassword"]', password);
    await page.fill('input[name="realName"]', '登录用户');
    await page.fill('input[name="idCard"]', loginId);
    await page.fill('input[name="phone"]', loginPhone);
    await page.check('input[name="agreed"]');
    page.on('dialog', dialog => dialog.accept());
    await page.getByRole('button', { name: '下一步' }).click();
    await expect(page).toHaveURL(/\/login/);

    // Login
    await page.fill('input[placeholder="用户名/邮箱/手机号"]', loginUser);
    await page.fill('input[placeholder="请输入密码"]', password);
    await page.getByRole('button', { name: '立即登录' }).click();

    // Expect redirect to Home or verify login state
    // Currently HomePage doesn't show user info, but Login should redirect to Home '/'
    await expect(page).toHaveURL('http://localhost:5173/'); 
  });

  test('should go through forgot password flow', async ({ page }) => {
    // 1. Register a user
    const fpUser = `fp_${Date.now()}`;
    const fpPhone = `137${Math.floor(10000000 + Math.random() * 90000000)}`;
    const fpId = `11010119900307${Math.floor(1000 + Math.random() * 9000)}`;

    await page.goto('/register');
    await page.fill('input[name="username"]', fpUser);
    await page.fill('input[name="password"]', password);
    await page.fill('input[name="confirmPassword"]', password);
    await page.fill('input[name="realName"]', '找回用户');
    await page.fill('input[name="idCard"]', fpId);
    await page.fill('input[name="phone"]', fpPhone);
    await page.check('input[name="agreed"]');
    page.on('dialog', dialog => dialog.accept());
    await page.getByRole('button', { name: '下一步' }).click();
    await expect(page).toHaveURL(/\/login/);

    // 2. Go to Forgot Password
    await page.goto('/login'); // Click link
    await page.getByText('忘记密码？').click();
    await expect(page).toHaveURL(/\/forgot-password/);

    // Step 1: Input Username
    await expect(page.getByRole('heading', { name: '填写账号' })).toBeVisible();
    await page.fill('input[placeholder="请输入账号/手机号"]', fpUser);
    await page.getByRole('button', { name: '下一步' }).click();

    // Step 2: Verify Code
    await expect(page.getByRole('heading', { name: '短信验证 (Step 2)' })).toBeVisible();
    await page.fill('input[placeholder="请输入验证码"]', '123456');
    await page.getByRole('button', { name: '下一步' }).click();

    // Step 3: Reset Password
    await expect(page.getByRole('heading', { name: '重置密码 (Step 3)' })).toBeVisible();
    const newPass = 'NewPassword123_';
    await page.fill('input[placeholder="请输入新密码"]', newPass);
    await page.fill('input[placeholder="请确认新密码"]', newPass);
    await page.getByRole('button', { name: '确定' }).click();

    // Step 4: Success
    await expect(page.getByRole('heading', { name: '重置成功' })).toBeVisible();
    await expect(page.getByText('您的密码已重置成功')).toBeVisible();
    await page.getByRole('link', { name: '立即登录' }).click();
    await expect(page).toHaveURL(/\/login/);
  });
});
