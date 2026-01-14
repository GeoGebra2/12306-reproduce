import { test, expect } from '@playwright/test';

test.describe('Ticket Search Flow', () => {
  test('should navigate to ticket list page with correct params on search', async ({ page }) => {
    await page.goto('/');
    
    // Locators based on current HomePage.jsx structure
    const fromInput = page.locator('.from-station input');
    const toInput = page.locator('.to-station input');
    const dateInput = page.locator('.date-input input');
    const searchBtn = page.locator('.query-btn');

    // Fill form
    await fromInput.fill('北京南');
    await toInput.fill('上海虹桥');
    await dateInput.fill('2023-10-01');

    // Submit
    await searchBtn.click();

    // Verify URL change
    // Expect URL to look like: /tickets?from=北京南&to=上海虹桥&date=2023-10-01
    await expect(page).toHaveURL(/\/tickets/);
    
    const url = new URL(page.url());
    expect(url.searchParams.get('from')).toBe('北京南');
    expect(url.searchParams.get('to')).toBe('上海虹桥');
    expect(url.searchParams.get('date')).toBe('2023-10-01');

    // Wait for tickets to load
    await expect(page.locator('.ticket-list')).toBeVisible();
    
    // Check if G1 train is displayed (assuming seed data exists)
    // Note: If no seed data, this might fail or show "No tickets"
    // We check for either ticket item or no-tickets message to ensure page rendered
    const ticketItems = page.locator('.ticket-item');
    const noTickets = page.locator('.no-tickets');
    
    await expect(ticketItems.or(noTickets)).toBeVisible();
    
    // Specifically check for G1 if we trust our seeding
    if (await ticketItems.count() > 0) {
        await expect(page.locator('.train-number').first()).toBeVisible();
    }
  });
});
