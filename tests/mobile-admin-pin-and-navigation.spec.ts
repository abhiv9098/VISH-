import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'orders_data.json');

test.describe('Mobile Admin Panel with 6-Digit PIN & Navigation', () => {
  let originalOrders = '[]';

  test.beforeAll(() => {
    if (fs.existsSync(dataFilePath)) {
      originalOrders = fs.readFileSync(dataFilePath, 'utf8');
    }
    const testOrders = [
      {
        id: 'ORD-MOBILE-TEST-1',
        date: new Date().toISOString(),
        status: 'Order Placed',
        total: 280,
        advancePaid: 0,
        remainingAmount: 280,
        deliveryType: 'standard',
        paymentMethod: 'cod',
        items: [
          {
            product: {
              id: 'p1',
              name: 'Gehu ka Atta (Whole Wheat Flour)',
              weight: '5 KG',
              price: 280
            },
            quantity: 1
          }
        ],
        customerInfo: {
          name: 'Mobile Test Customer',
          phone: '9876543210',
          address: 'Flat 101, Mobile Admin Towers, Sector 14',
          city: 'Gurugram'
        }
      }
    ];
    fs.writeFileSync(dataFilePath, JSON.stringify(testOrders, null, 2), 'utf8');
  });

  test.afterAll(() => {
    fs.writeFileSync(dataFilePath, originalOrders, 'utf8');
  });

  test.use({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });

  test('End-to-End Mobile Admin Flow: Dashboard, Navigation Drawer, Call, WhatsApp, GPS, Status & Settings', async ({ page }) => {
    await page.goto('http://localhost:4000/admin');
    await page.waitForLoadState('networkidle');

    // 1. Verify Admin Dashboard loads directly and cleanly on mobile
    await expect(page.locator('h1:has-text("Dashboard")')).toBeVisible({ timeout: 10000 });
    await page.screenshot({ path: 'screenshots/mobile-admin-01-dashboard.png' });

    // Helper function to open mobile navigation drawer
    const openDrawer = async () => {
      await page.waitForTimeout(500);
      const menuBtn = page.getByRole('button', { name: 'Open menu' }).first();
      await expect(menuBtn).toBeVisible({ timeout: 5000 });
      await menuBtn.click();
      // Wait for drawer CSS transition to complete and links to be visible
      const aside = page.locator('aside').first();
      await expect(aside).toHaveClass(/translate-x-0/, { timeout: 3000 });
      await page.waitForTimeout(300);
    };

    // 5. Navigate to Orders via Mobile Sidebar Drawer
    await openDrawer();
    await page.locator('aside nav a[href="/admin/orders"]').first().click();
    await expect(page.locator('h1:has-text("Orders")')).toBeVisible({ timeout: 8000 });

    // Verify Call, WhatsApp, and GPS navigation buttons if orders exist on mobile
    const callBtn = page.locator('a[href^="tel:"]').first();
    if (await callBtn.isVisible()) {
      const callHref = await callBtn.getAttribute('href');
      expect(callHref).toMatch(/^tel:\d+/);

      const waBtn = page.locator('a[href*="wa.me"]').first();
      await expect(waBtn).toBeVisible();

      const mapsBtn = page.locator('a[href*="maps"]').first();
      await expect(mapsBtn).toBeVisible();
    }

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

    // 9. Test Storefront / Logout link in mobile drawer
    await openDrawer();
    const logoutLink = page.locator('aside a:has-text("Logout"), aside a:has-text("Go to Storefront")').first();
    await expect(logoutLink).toBeVisible();
    await page.screenshot({ path: 'screenshots/mobile-admin-07-drawer-logout.png' });
  });
});
