import { test, expect } from '@playwright/test';

test.describe('Forgot Password Flow (REQ-1-3)', () => {
  const password = 'Password123_';

  // Helper to register a user before testing forgot password
  async function registerUser(page) {
    const username = `fp_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const phone = `137${Math.floor(10000000 + Math.random() * 90000000)}`;
    const idCard = `11010119900307${Math.floor(1000 + Math.random() * 9000)}`;

    await page.goto('/register');
    await page.fill('input[name="username"]', username);
    await page.fill('input[name="password"]', password);
    await page.fill('input[name="confirmPassword"]', password);
    await page.fill('input[name="realName"]', '找回用户');
    await page.fill('input[name="idCard"]', idCard);
    await page.fill('input[name="phone"]', phone);
    await page.check('input[name="agreed"]');
    page.on('dialog', dialog => dialog.accept());
    await page.getByRole('button', { name: '下一步' }).click();
    await expect(page).toHaveURL(/\/login/);
    return username;
  }

  test('Happy Path: Complete reset password flow', async ({ page }) => {
    const username = await registerUser(page);

    // 1. Start at Login, go to Forgot Password
    await page.goto('/login');
    await page.getByText('忘记密码？').click();
    await expect(page).toHaveURL(/\/forgot-password/);

    // 2. Step 1: Input Username
    await expect(page.getByRole('heading', { name: '填写账号' })).toBeVisible();
    await page.fill('input[placeholder="请输入账号/手机号"]', username);
    await page.getByRole('button', { name: '下一步' }).click();

    // 3. Step 2: Verify Code (Mock 123456)
    await expect(page.getByRole('heading', { name: '短信验证 (Step 2)' })).toBeVisible();
    await page.fill('input[placeholder="请输入验证码"]', '123456');
    await page.getByRole('button', { name: '下一步' }).click();

    // 4. Step 3: Reset Password
    await expect(page.getByRole('heading', { name: '重置密码 (Step 3)' })).toBeVisible();
    const newPass = 'NewPassword456_';
    await page.fill('input[placeholder="请输入新密码"]', newPass);
    await page.fill('input[placeholder="请确认新密码"]', newPass);
    await page.getByRole('button', { name: '确定' }).click();

    // 5. Step 4: Success
    await expect(page.getByRole('heading', { name: '重置成功' })).toBeVisible();
    await page.getByRole('link', { name: '立即登录' }).click();
    await expect(page).toHaveURL(/\/login/);

    // 6. Verify Login with New Password
    await page.fill('input[placeholder="用户名/邮箱/手机号"]', username);
    await page.fill('input[placeholder="请输入密码"]', newPass);
    await page.getByRole('button', { name: '立即登录' }).click();
    await expect(page).toHaveURL('http://localhost:5173/');
  });

  test('Error Case: User not found in Step 1', async ({ page }) => {
    await page.goto('/forgot-password');
    const nonExistentUser = `nonexist_${Date.now()}`;
    await page.fill('input[placeholder="请输入账号/手机号"]', nonExistentUser);
    await page.getByRole('button', { name: '下一步' }).click();
    
    // Expect error message
    await expect(page.locator('.error-message')).toHaveText(/用户不存在/);
    // Should stay on Step 1
    await expect(page.getByRole('heading', { name: '填写账号' })).toBeVisible();
  });

  test('Error Case: Wrong verification code in Step 2', async ({ page }) => {
    const username = await registerUser(page);
    await page.goto('/forgot-password');

    // Step 1
    await page.fill('input[placeholder="请输入账号/手机号"]', username);
    await page.getByRole('button', { name: '下一步' }).click();

    // Step 2
    await expect(page.getByRole('heading', { name: '短信验证 (Step 2)' })).toBeVisible();
    await page.fill('input[placeholder="请输入验证码"]', '000000'); // Wrong code
    await page.getByRole('button', { name: '下一步' }).click();

    // Expect error
    await expect(page.locator('.error-message')).toHaveText(/验证码错误/);
    // Should stay on Step 2
    await expect(page.getByRole('heading', { name: '短信验证 (Step 2)' })).toBeVisible();
  });

  test('Error Case: Password mismatch in Step 3', async ({ page }) => {
    const username = await registerUser(page);
    await page.goto('/forgot-password');

    // Step 1
    await page.fill('input[placeholder="请输入账号/手机号"]', username);
    await page.getByRole('button', { name: '下一步' }).click();

    // Step 2
    await page.fill('input[placeholder="请输入验证码"]', '123456');
    await page.getByRole('button', { name: '下一步' }).click();

    // Step 3
    await expect(page.getByRole('heading', { name: '重置密码 (Step 3)' })).toBeVisible();
    await page.fill('input[placeholder="请输入新密码"]', 'NewPass1');
    await page.fill('input[placeholder="请确认新密码"]', 'NewPass2'); // Mismatch
    await page.getByRole('button', { name: '确定' }).click();

    // Expect error
    await expect(page.locator('.error-message')).toHaveText(/两次输入的密码不一致/);
    // Should stay on Step 3
    await expect(page.getByRole('heading', { name: '重置密码 (Step 3)' })).toBeVisible();
  });
});
