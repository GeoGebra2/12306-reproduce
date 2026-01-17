const { test, expect } = require('@playwright/test');

test.describe('Catering Service Entry', () => {
  test('should load catering home page', async ({ page }) => {
    // Navigate to catering page directly
    await page.goto('/catering');

    // Check for global header elements (BrandSearch & Navbar)
    // Note: Navbar usually has "首页" link
    await expect(page.getByText('首页', { exact: true })).toBeVisible();

    // Check for Hero Section
    await expect(page.getByText('餐饮•特产')).toBeVisible();
    await expect(page.getByText('尽享旅途美食')).toBeVisible();

    // Check for 12306 Logo
    await expect(page.getByAltText('12306 Logo')).toBeVisible();

    // Check for Start Booking button
    const bookBtn = page.getByRole('link', { name: '开始订餐' });
    await expect(bookBtn).toBeVisible();
    await expect(bookBtn).toHaveAttribute('href', '/catering/book');
  });
});
