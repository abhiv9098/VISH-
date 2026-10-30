import { test, expect } from '@playwright/test';

test.describe('Modern Floating Bottom Navigation Bar', () => {
  test.use({ viewport: { width: 390, height: 844 } }); // Mobile iPhone 12/13/14 viewport

  test('Verify floating pill bottom nav on Home, My Orders, and Profile with soft light green active tab', async ({ page }) => {
    // 1. Visit Home Page
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const bottomNav = page.locator('nav[aria-label="Mobile Navigation"]');
    await expect(bottomNav).toBeVisible();

    // Verify 3 tabs exist: Home, My Orders, Profile
    await expect(bottomNav.getByText(/Home|होम/i)).toBeVisible();
    await expect(bottomNav.getByText(/My Orders|मेरे ऑर्डर/i)).toBeVisible();
    await expect(bottomNav.getByText(/Profile|प्रोफ़ाइल/i)).toBeVisible();

    // Verify Home tab is active on '/' (has soft light green background bg-[#e8f5ee])
    const homeTab = bottomNav.locator('a[href="/"]');
    await expect(homeTab).toHaveClass(/bg-\[#e8f5ee\]/);

    // Screenshot Home page mobile with floating nav
    await page.screenshot({ path: 'screenshots/bottom_nav_home_mobile.png' });

    // 2. Click My Orders tab
    const ordersTab = bottomNav.locator('a[href="/order"]');
    await ordersTab.click();
    await expect(page).toHaveURL(/\/order/);

    // Verify My Orders tab is now active (has bg-[#e8f5ee])
    await expect(ordersTab).toHaveClass(/bg-\[#e8f5ee\]/);
    await page.screenshot({ path: 'screenshots/bottom_nav_orders_mobile.png' });

    // 3. Click Profile tab
    const profileTab = bottomNav.locator('a[href="/profile"]');
    await profileTab.click();
    await expect(page).toHaveURL(/\/profile/);

    // Verify Profile tab is now active (has bg-[#e8f5ee])
    await expect(profileTab).toHaveClass(/bg-\[#e8f5ee\]/);
    await page.screenshot({ path: 'screenshots/bottom_nav_profile_mobile.png' });
  });
});
