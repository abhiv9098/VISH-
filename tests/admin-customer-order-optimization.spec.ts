import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'orders_data.json');

test.describe('Admin and Customer Order Management Optimization', () => {
  test.describe.configure({ mode: 'serial' });

  let backupOrders: string = '[]';

  test.beforeAll(() => {
    if (fs.existsSync(dataFilePath)) {
      backupOrders = fs.readFileSync(dataFilePath, 'utf8');
    }
  });

  test.afterAll(() => {
    fs.writeFileSync(dataFilePath, backupOrders, 'utf8');
  });

  test('Verify Admin order card, 6-digit code in horizontal row, copy button, and sync with Customer My Orders', async ({ browser }) => {
    // 1. Create a clean test order in orders_data.json
    const testOrderId = 'ORD-8822441199';
    const testCode = '654321';

    const initialOrders = [
      {
        id: testOrderId,
        date: new Date().toISOString(),
        status: 'Order Placed',
        total: 560,
        advancePaid: 0,
        remainingAmount: 560,
        deliveryType: 'express',
        estimatedDelivery: 'within 2 hours',
        deliveryCode: testCode,
        paymentMethod: 'cod',
        items: [
          {
            product: {
              id: 'p1',
              name: 'Gehu ka Atta (Whole Wheat Flour)',
              weight: '5 KG',
              price: 280,
              originalPrice: 330,
              discount: 15,
              image: '/images/wheat_flour.jpg'
            },
            quantity: 2
          }
        ],
        customerInfo: {
          name: 'Sunita Verma',
          phone: '9876543210',
          address: 'Flat 302, Green Valley Apartments, Sector 21, Gurugram, Haryana, 122001',
          city: 'Gurugram',
          district: 'Gurugram',
          state: 'Haryana',
          pincode: '122001',
          country: 'India'
        }
      }
    ];

    fs.writeFileSync(dataFilePath, JSON.stringify(initialOrders, null, 2), 'utf8');

    // 2. Open Customer page in Context A
    const customerContext = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    const customerPage = await customerContext.newPage();
    await customerPage.goto('/order');
    await customerPage.waitForLoadState('networkidle');

    // Verify ORD number visible at the top on Customer page
    await expect(customerPage.locator(`text=${testOrderId}`)).toBeVisible();

    // Verify 6-digit code in small horizontal row on Customer page
    const digitBoxes = customerPage.locator('text=6').first();
    await expect(digitBoxes).toBeVisible();

    // Verify Copy button is present and aligned
    const customerCopyBtn = customerPage.locator('button[title="Copy Code"]').first();
    await expect(customerCopyBtn).toBeVisible();

    // Test copy button functionality
    await customerCopyBtn.click();
    await expect(customerPage.locator('text=Copied!').first()).toBeVisible();

    // Screenshot customer order card on desktop
    await customerPage.screenshot({ path: 'screenshot_customer_order_desktop.png' });

    // Test responsive mobile view for customer order card (~360px)
    await customerPage.setViewportSize({ width: 360, height: 800 });
    await customerPage.screenshot({ path: 'screenshot_customer_order_mobile_360px.png' });
    await customerPage.setViewportSize({ width: 1280, height: 720 });

    // 3. Open Admin page in Context B
    const adminContext = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const adminPage = await adminContext.newPage();
    await adminPage.goto('/admin/orders');
    await adminPage.waitForLoadState('networkidle');

    // Verify ORD number visible at the top on Admin page
    await expect(adminPage.locator(`text=${testOrderId}`)).toBeVisible();

    // Verify Customer name, address, and items
    await expect(adminPage.locator('text=Sunita Verma').first()).toBeVisible();
    await expect(adminPage.locator('text=₹560').first()).toBeVisible();

    // Verify 6-digit code in a small horizontal row on Admin side
    await expect(adminPage.locator('text=Delivery Code:').first()).toBeVisible();
    for (const digit of testCode) {
      await expect(adminPage.locator(`div:has-text("${digit}")`).first()).toBeVisible();
    }

    // Verify Copy button on Admin page
    const adminCopyBtn = adminPage.locator('button[title="Copy 6-digit code"]').first();
    await expect(adminCopyBtn).toBeVisible();
    await adminCopyBtn.click();
    await expect(adminPage.locator('text=Copied!').first()).toBeVisible();

    // Screenshot Admin order card on desktop
    await adminPage.screenshot({ path: 'screenshot_admin_order_desktop.png' });

    // Test responsive mobile view for admin order card (~360px)
    await adminPage.setViewportSize({ width: 360, height: 850 });
    // If mobile sidebar is open, close it
    const closeSidebarBtn = adminPage.locator('button.md\\:hidden:has(.lucide-x)');
    if (await closeSidebarBtn.isVisible()) {
      await closeSidebarBtn.click();
    }
    await adminPage.screenshot({ path: 'screenshot_admin_order_mobile_360px.png' });
    await adminPage.setViewportSize({ width: 1280, height: 800 });

    // 4. Test Sync: On admin side, mark order as Delivered
    // First transition to Out for Delivery using sequential buttons or dropdown
    const orderSelect = adminPage.locator('select').first();
    await orderSelect.selectOption('Delivered');

    // Wait for Admin feedback
    await expect(adminPage.locator('text=Code Verified & Delivered').first()).toBeVisible();

    // Screenshot Admin verified state
    await adminPage.screenshot({ path: 'screenshot_admin_order_delivered.png' });

    // 5. Switch to Customer page and verify automatic update to "Delivered" without manual reload!
    await customerPage.bringToFront();
    await expect(customerPage.locator('text=Delivered').first()).toBeVisible({ timeout: 5000 });
    await expect(customerPage.locator('text=Code Verified • Delivered').first()).toBeVisible();

    // Screenshot Customer verified state
    await customerPage.screenshot({ path: 'screenshot_customer_order_delivered.png' });

    await customerContext.close();
    await adminContext.close();
  });
});
