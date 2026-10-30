import { test, expect } from '@playwright/test';

test.describe('Mobile Admin Panel with 6-Digit PIN & Navigation', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });

  test('End-to-End Mobile Admin Flow: PIN Login, Navigation Drawer, Call, WhatsApp, GPS, Status & Settings', async ({ page, context }) => {
    await context.addInitScript(() => localStorage.clear());
    await page.goto('http://localhost:4000/admin');
    await page.waitForLoadState('networkidle');

    // 1. Verify 6-digit PIN Login Screen is displayed first
    const pinHeading = page.locator('text=Enter 6-Digit Admin PIN');
    await expect(pinHeading).toBeVisible({ timeout: 10000 });

    // Verify numeric keypad (1 through 9, 0, Clear, Delete)
    await expect(page.getByRole('button', { name: '1', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Clear', exact: true })).toBeVisible();

    // Take screenshot of PIN Login Screen
    await page.screenshot({ path: 'screenshots/mobile-admin-01-pin-screen.png' });

    // 2. Test Incorrect PIN (999999)
    for (const d of ['9', '9', '9', '9', '9', '9']) {
      await page.getByRole('button', { name: d, exact: true }).click();
    }
    const errorMsg = page.locator('text=Incorrect PIN');
    await expect(errorMsg).toBeVisible({ timeout: 5000 });
    await page.waitForTimeout(600);

    // 3. Test Correct Default PIN (123456)
    for (const d of ['1', '2', '3', '4', '5', '6']) {
      await page.getByRole('button', { name: d, exact: true }).click();
    }

    // 4. Verify Admin Panel is unlocked and Dashboard loads
    await expect(page.locator('h1:has-text("Dashboard")')).toBeVisible({ timeout: 10000 });

    // Helper function to open mobile navigation drawer
    const openDrawer = async () => {
      const menuBtn = page.getByRole('button', { name: 'Open menu' }).first();
      await expect(menuBtn).toBeVisible({ timeout: 5000 });
      await menuBtn.click();
      await page.waitForTimeout(400);
    };

    // 5. Navigate to Orders via Mobile Sidebar Drawer
    await openDrawer();
    await page.locator('aside nav a[href="/admin/orders"]').first().click();
    await expect(page.locator('h1:has-text("Orders")')).toBeVisible({ timeout: 8000 });

    // Verify Call, WhatsApp, and GPS navigation buttons exist on mobile orders
    const callBtn = page.locator('a[href^="tel:"]').first();
    await expect(callBtn).toBeVisible();
    const callHref = await callBtn.getAttribute('href');
    expect(callHref).toMatch(/^tel:\d+/);

    const waBtn = page.locator('a[href*="wa.me"]').first();
    await expect(waBtn).toBeVisible();
    const waHref = await waBtn.getAttribute('href');
    expect(waHref).toContain('wa.me');

    const mapsBtn = page.locator('a[href*="maps"]').first();
    await expect(mapsBtn).toBeVisible();

    await page.screenshot({ path: 'screenshots/mobile-admin-03-orders-mobile.png' });

    // 6. Navigate to Customers via Mobile Drawer
    await openDrawer();
    await page.locator('aside nav a[href="/admin/customers"]').first().click();
    await expect(page.locator('h1:has-text("Customers")')).toBeVisible({ timeout: 8000 });
    await page.screenshot({ path: 'screenshots/mobile-admin-04-customers-mobile.png' });

    // 7. Navigate to Products via Mobile Drawer
    await openDrawer();
    await page.locator('aside nav a[href="/admin/products"]').first().click();
    await expect(page.locator('h1:has-text("Products")')).toBeVisible({ timeout: 8000 });
    await page.screenshot({ path: 'screenshots/mobile-admin-05-products-mobile.png' });

    // 8. Navigate to Settings via Mobile Drawer
    await openDrawer();
    await page.locator('aside nav a[href="/admin/settings"]').first().click();
    await expect(page.locator('h1:has-text("Settings")')).toBeVisible({ timeout: 8000 });

    // Verify 6-digit PIN Security section is present in Settings
    await expect(page.locator('text=Admin Security & 6-Digit PIN')).toBeVisible();
    await page.screenshot({ path: 'screenshots/mobile-admin-06-settings-pin.png' });

    // 9. Test Quick Lock button
    const lockBtn = page.locator('button:has-text("Lock Admin")').first();
    if (await lockBtn.isVisible()) {
      await lockBtn.click();
    } else {
      await openDrawer();
      await page.locator('button:has-text("Lock Admin Panel")').first().click();
    }

    // Verify it securely returns to PIN screen immediately!
    await expect(page.locator('text=Enter 6-Digit Admin PIN')).toBeVisible({ timeout: 5000 });
    await page.screenshot({ path: 'screenshots/mobile-admin-07-locked-again.png' });
  });
});
