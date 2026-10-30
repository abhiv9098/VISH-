import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'orders_data.json');

test.describe('Flipkart-style Orders Redesign & Normal Delivery Flow', () => {
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

  test('Verify Flipkart-style Orders layout, clean timeline, no verification codes, no ODR in customer view, and admin normal delivery', async ({ browser }) => {
    const activeOrderId = 'ORD-1010101010';
    const pastOrderId = 'ORD-2020202020';

    const testOrders = [
      {
        id: activeOrderId,
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
              nameHi: 'गेहूं का आटा (होल व्हीट)',
              weight: '5 KG',
              price: 280,
              image: '/images/wheat_flour.jpg'
            },
            quantity: 1
          }
        ],
        customerInfo: {
          name: 'Priya Sharma',
          phone: '9876543210',
          address: 'Flat 102, Shanti Niketan, Sector 14, Gurugram',
          city: 'Gurugram'
        }
      },
      {
        id: pastOrderId,
        date: new Date(Date.now() - 86400000 * 3).toISOString(),
        status: 'Delivered',
        total: 549,
        advancePaid: 549,
        remainingAmount: 0,
        deliveryType: 'standard',
        paymentMethod: 'online',
        items: [
          {
            product: {
              id: 'p4',
              name: 'Multigrain Atta (7 Grains)',
              nameHi: 'मल्टीग्रेन आटा (7 अनाज)',
              weight: '5 KG',
              price: 340,
              image: '/images/multigrain_flour.jpg'
            },
            quantity: 1
          }
        ],
        customerInfo: {
          name: 'Priya Sharma',
          phone: '9876543210',
          address: 'Flat 102, Shanti Niketan, Sector 14, Gurugram',
          city: 'Gurugram'
        }
      }
    ];

    fs.writeFileSync(dataFilePath, JSON.stringify(testOrders, null, 2), 'utf8');

    // 1. CUSTOMER VIEW VERIFICATION
    const customerContext = await browser.newContext({ viewport: { width: 390, height: 844 } }); // Mobile viewport like Flipkart
    const customerPage = await customerContext.newPage();
    await customerPage.goto('/order');
    await customerPage.waitForLoadState('networkidle');

    // Verify Active Orders Section is clearly at the top
    await expect(customerPage.locator('text=Active Orders').first()).toBeVisible();

    // Verify the 4 timeline stages are rendered: Order Placed, Confirmed, Out for Delivery, Delivered
    await expect(customerPage.locator('text=Order Placed').first()).toBeVisible();
    await expect(customerPage.locator('text=Confirmed').first()).toBeVisible();
    await expect(customerPage.locator('text=Out for Delivery').first()).toBeVisible();
    await expect(customerPage.locator('text=Delivered').first()).toBeVisible();

    // Verify product card details
    await expect(customerPage.locator('text=Gehu ka Atta (Whole Wheat Flour)')).toBeVisible();
    await expect(customerPage.locator('text=₹280').first()).toBeVisible();
    await expect(customerPage.locator('text=Cash on Delivery').first()).toBeVisible();

    // Verify Order History is separated below
    await expect(customerPage.locator('text=Order History').first()).toBeVisible();
    await expect(customerPage.locator('text=Multigrain Atta (7 Grains)')).toBeVisible();

    // VERIFY: NO ODR OR ORD NUMBER IN CUSTOMER VIEW
    const pageText = await customerPage.content();
    expect(pageText).not.toContain(activeOrderId);
    expect(pageText).not.toContain(pastOrderId);
    expect(pageText).not.toContain('ORD-');
    expect(pageText).not.toContain('ODR-');

    // VERIFY: NO VERIFICATION CODE IN CUSTOMER VIEW
    expect(pageText).not.toContain('Verification Code');
    expect(pageText).not.toContain('deliveryCode');
    expect(pageText).not.toContain('Share this code');
    expect(pageText).not.toContain('delivery verification');

    // Take mobile screenshot of customer orders page
    await customerPage.screenshot({ path: 'screenshot_flipkart_orders_mobile.png' });

    // 2. ADMIN VIEW & NORMAL DELIVER ACTION VERIFICATION
    const adminContext = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const adminPage = await adminContext.newPage();
    await adminPage.goto('/admin/orders');
    await adminPage.waitForLoadState('networkidle');

    // Verify NO verification code input, banner, or code badges on admin page
    const adminContent = await adminPage.content();
    expect(adminContent).not.toContain('Verify Customer Delivery Code');
    expect(adminContent).not.toContain('verify-code-input');
    expect(adminContent).not.toContain('Verify & Deliver');

    // Verify admin can click "Accept & Confirm Order"
    const acceptBtn = adminPage.locator('button:has-text("1. Accept & Confirm Order")').first();
    await expect(acceptBtn).toBeVisible();
    await acceptBtn.click();

    // Move to Out for Delivery, then normal Mark as Delivered
    await expect(adminPage.locator('button:has-text("2. Start Preparing / Milling")').first()).toBeVisible({ timeout: 5000 });
    await adminPage.locator('button:has-text("2. Start Preparing / Milling")').first().click();

    await expect(adminPage.locator('button:has-text("3. Dispatch (Out for Delivery)")').first()).toBeVisible({ timeout: 5000 });
    await adminPage.locator('button:has-text("3. Dispatch (Out for Delivery)")').first().click();

    // If custom ETA sync modal appears, save & sync to customer app
    const saveEtaBtn = adminPage.locator('button:has-text("Save & Sync to App")').first();
    if (await saveEtaBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await saveEtaBtn.click();
    }

    // Verify step 4 is normal "Mark as Delivered" without any verification code prompt
    const markDeliveredBtn = adminPage.locator('button:has-text("4. Mark as Delivered")').first();
    await expect(markDeliveredBtn).toBeVisible({ timeout: 5000 });
    await markDeliveredBtn.click();

    // Verify Completed & Delivered badge appears
    await expect(adminPage.locator('text=Completed & Delivered').first()).toBeVisible({ timeout: 5000 });

    // 3. VERIFY CUSTOMER VIEW UPDATED TO DELIVERED AUTOMATICALLY
    await customerPage.bringToFront();
    // In customer page, the order now moves smoothly to Delivered / Order History
    await expect(customerPage.locator('text=Delivered on').first()).toBeVisible({ timeout: 8000 });

    await customerPage.screenshot({ path: 'screenshot_flipkart_orders_delivered.png' });
  });
});
