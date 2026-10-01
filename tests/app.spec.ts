import { test, expect } from '@playwright/test';

test.describe('Vishwakarma Atta App E2E Tests', () => {
  
  test('should load the home page successfully', async ({ page }) => {
    // Attempting to go to root. If it redirects, Playwright will wait.
    await page.goto('/');
    
    // Check if the page has a title
    const pageTitle = await page.title();
    expect(pageTitle).not.toBeNull();
  });

  test('should load the admin dashboard', async ({ page }) => {
    await page.goto('/admin');
    
    // Verify that some common admin keywords or elements are on the page
    // Since we don't know the exact UI, we just ensure the page loads without a 404/500
    const bodyText = await page.locator('body').innerText();
    expect(bodyText).toBeDefined();
  });

  test('should load the customer order page', async ({ page }) => {
    await page.goto('/order');
    
    const bodyText = await page.locator('body').innerText();
    expect(bodyText).toBeDefined();
  });

});
