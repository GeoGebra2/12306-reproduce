import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should display key elements', async ({ page }) => {
    await page.goto('/');

    // Check Title
    await expect(page).toHaveTitle(/frontend/); 

    // Check Brand
    await expect(page.locator('.brand-text h1')).toHaveText('中国铁路12306');
    
    // Check Navigation
    await expect(page.getByText('首页')).toBeVisible();
    await expect(page.getByText('车票', { exact: true })).toBeVisible();
    
    // Check Search Form
    await expect(page.getByPlaceholder('搜索车票')).toBeVisible();
    await expect(page.getByRole('button', { name: '查询车票' })).toBeVisible();

    // Check Footer/Services
    await expect(page.getByText('重点旅客预约')).toBeVisible();
  });
});
