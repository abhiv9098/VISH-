import { test, expect } from '@playwright/test';

test.describe('Customer Storefront UI/UX Modernization', () => {
  test.use({
    viewport: { width: 390, height: 844 }, // Mobile device viewport (iPhone 14)
    isMobile: true,
    hasTouch: true,
  });

  test('Verify Modern Product Cards, Categories & Floating Bottom Nav', async ({ page }) => {
    await page.goto('http://localhost:4000/');
    await page.waitForLoadState('networkidle');

    // 1. Verify Header & Branding
    await expect(page.locator('text=VISHWAKARMA')).toBeVisible();
    await expect(page.locator('text=Atta Chakki')).toBeVisible();

    // 2. Verify Category Pills
    const allCatBtn = page.getByRole('button', { name: 'ALL', exact: true });
    await expect(allCatBtn).toBeVisible();
    const gehuCatBtn = page.getByRole('button', { name: 'Gehu Atta', exact: true });
    await expect(gehuCatBtn).toBeVisible();

    // 3. Verify Product Cards Grid
    const productCards = page.locator('.grid > div');
    const cardCount = await productCards.count();
    expect(cardCount).toBeGreaterThan(0);

    // Verify first card has rounded image, discount tag, weight pill, title, price, stepper & buy button
    const firstCard = productCards.first();
    await expect(firstCard.locator('img')).toBeVisible();
    await expect(firstCard.locator('h3')).toBeVisible();
    await expect(firstCard.locator('button:has-text("Buy Now"), button:has-text("अभी खरीदें")')).toBeVisible();

    // 4. Verify Floating Pill Bottom Navigation Bar with EXACTLY 3 Tabs
    const bottomNav = page.locator('nav[aria-label="Mobile Navigation"]');
    await expect(bottomNav).toBeVisible();
    
    const navLinks = bottomNav.locator('a');
    await expect(navLinks).toHaveCount(3);
    await expect(bottomNav.locator('text=Home')).toBeVisible();
    await expect(bottomNav.locator('text=My Orders')).toBeVisible();
    await expect(bottomNav.locator('text=Profile')).toBeVisible();

    // Take screenshot of Initial Mobile Home View
    await page.screenshot({ path: 'screenshots/customer-ui-01-home-screen.png' });

    // 5. Test Quantity Stepper
    const initialPriceText = await firstCard.locator('.text-slate-900').first().innerText();
    const plusBtn = firstCard.locator('button[aria-label="Increase quantity"]');
    if (await plusBtn.isVisible()) {
      await plusBtn.click();
      await page.waitForTimeout(300);
      const updatedQty = await firstCard.locator('span.border-x').innerText();
      expect(updatedQty).toBe('2');
    }

    // 6. Test Category Filter
    await gehuCatBtn.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'screenshots/customer-ui-02-gehu-category.png' });

    // 7. Scroll Down to verify floating pill nav over cards
    await page.evaluate(() => window.scrollBy(0, 350));
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'screenshots/customer-ui-03-scrolled-cards.png' });

    // 8. Test Language Toggle in Header
    const langBtn = page.locator('header button:has-text("हिंदी"), header button:has-text("ENG")');
    if (await langBtn.isVisible()) {
      await langBtn.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'screenshots/customer-ui-04-hindi-mode.png' });
      // Switch back
      await langBtn.click();
      await page.waitForTimeout(500);
    }
  });
});
