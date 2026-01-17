const { test, expect } = require('@playwright/test');

test.describe('Catering Vendor Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Mock user login
    await page.route('**/api/users/profile', async route => {
      await route.fulfill({ json: { success: true, data: { id: 1, name: 'Test User' } } });
    });
  });

  test('should navigate to vendor page and book food', async ({ page }) => {
    // 1. Go to Catering Home
    await page.goto('http://localhost:5173/catering');
    await expect(page.getByText('餐饮•特产')).toBeVisible();

    // 2. Click on a brand (e.g., 麦当劳)
    // Wait for brands to load
    await expect(page.getByText('麦当劳')).toBeVisible();
    await page.getByText('麦当劳').click();

    // 3. Check Vendor Page
    await expect(page).toHaveURL(/\/catering\/vendor\/\d+/);
    await expect(page.getByRole('heading', { name: '麦当劳' })).toBeVisible();
    
    // 4. Add item to cart
    // Assuming "麦香鸡腿堡" exists
    await expect(page.getByText('麦香鸡腿堡')).toBeVisible();
    // Click the first "+" button inside the card for 麦香鸡腿堡
    // Using a more robust locator
    const itemCard = page.locator('.food-item-card').filter({ hasText: '麦香鸡腿堡' });
    await itemCard.getByRole('button', { name: '+' }).click();

    // 5. Check Cart
    const cartSection = page.locator('.cart-sidebar');
    await expect(cartSection).toContainText('麦香鸡腿堡');
    await expect(cartSection).toContainText('1'); // Quantity

    // 6. Checkout
    // Mock order creation
    await page.route('**/api/catering/orders', async route => {
        const request = route.request();
        const postData = request.postDataJSON();
        expect(postData.items).toHaveLength(1);
        await route.fulfill({ json: { success: true, data: { orderId: 999 } } });
    });

    // Handle alert
    page.once('dialog', async dialog => {
        expect(dialog.message()).toContain('下单成功');
        await dialog.accept();
    });

    await page.getByRole('button', { name: '去结算' }).click();
    
    // Wait for cart to be cleared
    await expect(cartSection).not.toContainText('麦香鸡腿堡');
  });
});
