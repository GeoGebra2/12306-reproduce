const { test, expect } = require('@playwright/test');

test.describe('Catering Booking', () => {
  test('should book self-operated food successfully', async ({ page }) => {
    // 1. Navigate to Booking Page
    await page.goto('/catering/book');

    // 2. Wait for items to load
    await expect(page.getByText('列车自营商品-15元')).toBeVisible();

    // 3. Add item to cart
    // Find the button for 15元 item
    const addItemBtn = page.locator('.food-item').filter({ hasText: '列车自营商品-15元' }).getByText('加入购物车');
    await addItemBtn.click();

    // 4. Verify Cart update
    await expect(page.locator('.cart-summary')).toContainText('列车自营商品-15元');
    await expect(page.locator('.cart-summary')).toContainText('¥15');
    await expect(page.locator('.cart-total')).toContainText('¥15');

    // 5. Checkout
    // Handle alert dialog
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('下单成功');
      await dialog.accept();
    });

    await page.getByText('去结算').click();

    // 6. Verify cart cleared
    await expect(page.getByText('购物车是空的')).toBeVisible();
  });
});