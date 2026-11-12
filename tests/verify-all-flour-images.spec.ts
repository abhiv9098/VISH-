import { test, expect } from '@playwright/test';

test.describe('Verify All Product Flour Images', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('All 8 products have visible and loaded images without 404 or broken fallbacks', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check all product cards
    const productCards = page.locator('div.group.select-none');
    await expect(productCards).toHaveCount(8);

    // Scroll to see Jowar, Bajra, Makka
    await page.evaluate(() => window.scrollBy(0, 480));
    await page.waitForTimeout(600);
    await page.screenshot({ path: 'screenshots/all_products_scrolled_images.png' });

    // Assert that every image inside product cards has naturalWidth > 0
    const images = page.locator('div.group.select-none img');
    const count = await images.count();
    expect(count).toBeGreaterThanOrEqual(8);

    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      const isLoaded = await img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0);
      expect(isLoaded).toBeTruthy();
    }
  });
});
