import { test, expect } from '@playwright/test';

test.describe('Forgot Password via Phone', () => {
  test('should reset password when using phone number', async ({ page }) => {
    const username = `user_${Date.now()}`;
    const phone = `139${Math.floor(10000000 + Math.random() * 90000000)}`;
    const password = 'Password123_';
    const idCard = `11010119900307${Math.floor(1000 + Math.random() * 9000)}`;

    // 1. Register
    await page.goto('/register');
    await page.fill('input[name="username"]', username);
    await page.fill('input[name="password"]', password);
    await page.fill('input[name="confirmPassword"]', password);
    await page.fill('input[name="realName"]', '手机用户');
    await page.fill('input[name="idCard"]', idCard);
    await page.fill('input[name="phone"]', phone);
    await page.check('input[name="agreed"]');
    page.on('dialog', dialog => dialog.accept());
    await page.getByRole('button', { name: '下一步' }).click();
    await expect(page).toHaveURL(/\/login/);

    // 2. Forgot Password using Phone
    await page.goto('/forgot-password');
    
    // Step 1: Input Phone (NOT Username)
    await page.fill('input[placeholder="请输入账号/手机号"]', phone);
    await page.getByRole('button', { name: '下一步' }).click();

    // Step 2: Verify Code
    await expect(page.getByRole('heading', { name: '短信验证 (Step 2)' })).toBeVisible();
    await page.fill('input[placeholder="请输入验证码"]', '123456');
    await page.getByRole('button', { name: '下一步' }).click();

    // Step 3: Reset Password
    await expect(page.getByRole('heading', { name: '重置密码 (Step 3)' })).toBeVisible();
    const newPass = 'NewPassword456_';
    await page.fill('input[placeholder="请输入新密码"]', newPass);
    await page.fill('input[placeholder="请确认新密码"]', newPass);
    await page.getByRole('button', { name: '确定' }).click();

    // Expect Success
    // If the bug exists, this will likely fail or show an error
    await expect(page.getByRole('heading', { name: '重置成功' })).toBeVisible();
  });
});
