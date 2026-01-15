import { test, expect } from '@playwright/test';

test.describe('Catering Flow', () => {
  let username;
  
  test.beforeEach(async ({ page, request }) => {
    username = `user_catering_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    const password = 'Password123';
    // Use larger random range for ID Card to avoid collision
    const idCardSuffix = Math.floor(Math.random() * 9000) + 1000; 
    const idCard = `11010119900101${idCardSuffix}`;
    const phone = `138${Math.floor(Math.random() * 100000000)}`;

    // Register via API
    const res = await request.post('http://localhost:3000/api/auth/register', {
      data: {
        username,
        password,
        idType: '1',
        idCard,
        realName: 'Catering User',
        phone,
        userType: 'passenger'
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

  test('should book catering items', async ({ page }) => {
    // 1. Go to Catering Home
    await page.goto('/catering');
    await expect(page.locator('h1')).toHaveText('餐饮特产');

    // 2. Go to Book Page
    await page.click('.search-btn');
    await expect(page).toHaveURL('/catering/book');

    // 3. Wait for items to load
    await page.waitForSelector('.food-card');
    
    // 4. Add Self-operated item (First one)
    const firstSelfItem = page.locator('.section-self .food-card').first();
    await firstSelfItem.locator('.add-btn').click();

    // 5. Add Brand item (First one)
    const firstBrandItem = page.locator('.section-brands .food-card').first();
    await firstBrandItem.locator('.add-btn').click();

    // 6. Verify Cart
    const cartItems = page.locator('.cart-item');
    await expect(cartItems).toHaveCount(2);

    // 7. Checkout
    page.on('dialog', async dialog => {
        console.log(`Dialog: ${dialog.message()}`);
        await dialog.accept();
    });

    await page.click('.checkout-btn');
    
    // 8. Verify Cart Cleared (after success alert)
    // Note: Alert handling is async, might need to wait a bit or check cart empty state
    await expect(page.locator('.empty-cart')).toBeVisible();
  });

  test('should navigate to vendor page and view items', async ({ page }) => {
    // 1. Go to Catering Book Page
    await page.goto('/catering/book');

    // 2. Wait for brands to load
    await page.waitForSelector('.brand-card');
    
    // 3. Click the brand "麦当劳" (since it has items seeded)
    const brand = page.locator('.brand-card').filter({ hasText: '麦当劳' });
    let brandName;
    if (await brand.count() > 0) {
        brandName = await brand.innerText();
        await brand.click();
    } else {
        const firstBrand = page.locator('.brand-card').first();
        brandName = await firstBrand.innerText();
        await firstBrand.click();
    }

    // 4. Verify Vendor Page
    // URL should contain /catering/vendor/
    await expect(page).toHaveURL(/\/catering\/vendor\/\d+/);
    
    // Verify Brand Name in Header
    await expect(page.locator('h1')).toHaveText(brandName);

    // 5. Verify Items displayed
    // Assuming there are items for the seeded brands
    await page.waitForSelector('.food-card');
    const items = page.locator('.food-card');
    const count = await items.count();
    expect(count).toBeGreaterThan(0);

    // 6. Click Back Link
    await page.click('.back-link');
    await expect(page).toHaveURL('/catering/book');
  });
});
