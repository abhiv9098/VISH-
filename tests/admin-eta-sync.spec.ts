import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'orders_data.json');

test.describe('Admin Status Dropdown with Integrated Delivery Times', () => {
  let backupOrders = '[]';

  test.beforeAll(() => {
    if (fs.existsSync(dataFilePath)) {
      backupOrders = fs.readFileSync(dataFilePath, 'utf8');
    }
    // Seed temporary order for ETA sync test
    const tempOrders = [
      {
        id: 'ORD-TEST-ETA-SYNC',
        date: new Date().toISOString(),
        status: 'Order Placed',
        total: 280,
        advancePaid: 0,
        remainingAmount: 280,
        deliveryType: 'express',
        estimatedDelivery: 'Within 2 hours',
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
          name: 'Test Customer',
          phone: '9876543210',
          address: 'Main Road',
          city: 'Sonkach'
        }
      }
    ];
    fs.writeFileSync(dataFilePath, JSON.stringify(tempOrders, null, 2), 'utf8');
  });

  test.afterAll(() => {
    fs.writeFileSync(dataFilePath, '[]', 'utf8');
  });

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

    // Target the status dropdown on the test card
    const statusSelect = adminPage.locator('select:has(option[value="Order Placed"])').first();
    await expect(statusSelect).toBeVisible();

    // Select "Out for Delivery" directly inside the Status Dropdown!
    await statusSelect.selectOption('Out for Delivery');

    await adminPage.waitForTimeout(1000);

    // 2. Open Customer App and verify
    const customerContext = await browser.newContext();
    const customerPage = await customerContext.newPage();
    await customerPage.goto('http://localhost:4000/order');
    await customerPage.waitForLoadState('networkidle');

    // Verify Customer App shows Out for Delivery
    const trackingOutForDelivery = customerPage.locator('text=/Out for Delivery|30 mins|30 minutes/i').first();
    await expect(trackingOutForDelivery).toBeVisible({ timeout: 10000 });
  });
});
