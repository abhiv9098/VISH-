import { test, expect } from '@playwright/test';

test.describe('Admin Status Dropdown with Integrated Delivery Times', () => {
  test('Selecting Out for Delivery with time directly in status dropdown updates app in real time', async ({ browser }) => {
    // 1. Open Admin Panel
    const adminContext = await browser.newContext();
    await adminContext.addInitScript(() => {
      localStorage.setItem('vishwakarma_admin_session', JSON.stringify({
        token: 'test-session',
        expiresAt: Date.now() + 86400000 * 30
      }));
    });
    const adminPage = await adminContext.newPage();
    await adminPage.goto('http://localhost:4000/admin/orders');
    await adminPage.waitForLoadState('networkidle');

    // Create a fresh test order
    const createTestOrderBtn = adminPage.locator('button:has-text("Create Test Order")').first();
    if (await createTestOrderBtn.isVisible()) {
      await createTestOrderBtn.click();
      await adminPage.waitForTimeout(1000);
    }

    // Target the status dropdown on the first card
    const statusSelect = adminPage.locator('select:has(option[value="Order Placed"])').first();
    await expect(statusSelect).toBeVisible();

    // Select "Out for Delivery (20 mins)" directly inside the Status Dropdown!
    await statusSelect.selectOption('Out for Delivery|within 20 mins');

    await adminPage.waitForTimeout(1000);
    await adminPage.screenshot({ path: 'screenshots/admin-status-dropdown-with-time.png', fullPage: false });

    // 2. Open Customer App and verify
    const customerContext = await browser.newContext();
    const customerPage = await customerContext.newPage();
    await customerPage.goto('http://localhost:4000/order');
    await customerPage.waitForLoadState('networkidle');

    // Verify Customer App shows Out for Delivery and 20 mins
    const trackingOutForDelivery = customerPage.locator('text=within 20 mins').first();
    await expect(trackingOutForDelivery).toBeVisible({ timeout: 10000 });

    await customerPage.screenshot({ path: 'screenshots/customer-status-and-time-updated.png', fullPage: false });
  });
});
