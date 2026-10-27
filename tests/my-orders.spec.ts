import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'orders_data.json');

test.describe('My Orders Page Verification', () => {
  test.describe.configure({ mode: 'serial' });

  let backupOrders: string = '[]';

  test.beforeAll(() => {
    if (fs.existsSync(dataFilePath)) {
      backupOrders = fs.readFileSync(dataFilePath, 'utf8');
    }
  });

  test.afterAll(() => {
    // Restore backup
    fs.writeFileSync(dataFilePath, backupOrders, 'utf8');
  });

  test('Scenario 1: Customer has NO orders', async ({ page }) => {
    // Ensure database has empty orders array
    fs.writeFileSync(dataFilePath, JSON.stringify([], null, 2), 'utf8');

    // 1. Visit /order in English
    await page.goto('/order');
    await page.waitForLoadState('networkidle');

    // Verify Title & Header
    await expect(page.locator('h1:has-text("My Orders")')).toBeVisible();
    await expect(page.locator('text=0 Orders')).toBeVisible();

    // Verify Empty State with Shopping Bag Icon
    const shoppingBagIcon = page.locator('.lucide-shopping-bag').first();
    await expect(shoppingBagIcon).toBeVisible();

    // Verify Heading
    const heading = page.locator('h2:has-text("No Orders Yet")');
    await expect(heading).toBeVisible();

    // Verify Message
    const message = page.locator('text=You haven\'t placed any orders yet. Order fresh atta today!');
    await expect(message).toBeVisible();

    // Verify Order Now Button
    const orderNowBtn = page.locator('a:has-text("Order Now")');
    await expect(orderNowBtn).toBeVisible();

    // Verify NO Order Tracking is rendered
    await expect(page.locator('text=Live Order Status')).toHaveCount(0);
    await expect(page.locator('text=Current Status:')).toHaveCount(0);

    // Capture screenshot of empty state in English
    await page.screenshot({ path: 'screenshot_orders_empty_en.png', fullPage: true });

    // Switch to Hindi and verify translated empty state
    await page.click('button[aria-label="Hindi"]');
    await expect(page.locator('h2:has-text("अभी तक कोई ऑर्डर नहीं")')).toBeVisible();
    await expect(page.locator('text=आपने अभी तक कोई ऑर्डर नहीं दिया है। आज ही ताज़ा आटा ऑर्डर करें!')).toBeVisible();
    await expect(page.locator('a:has-text("अभी ऑर्डर करें")')).toBeVisible();
    await page.screenshot({ path: 'screenshot_orders_empty_hi.png', fullPage: true });

    // Switch back to English
    await page.click('button[aria-label="English"]');

    // Click "Order Now" button and verify it navigates to Home / Products page
    await orderNowBtn.click();
    await expect(page).toHaveURL('/');
    await expect(page.locator('text=All Products').first()).toBeVisible();
  });

  test('Scenario 2: Customer has ONE or MORE orders', async ({ page, context }) => {
    // 1. Visit Direct Order flow to place a real order
    await page.goto('/order?productId=p1&qty=2');
    await page.waitForLoadState('networkidle');

    // Step 1: Details - Verify product
    await expect(page.locator('h1:has-text("Place Order")')).toBeVisible();
    await page.click('button:has-text("Proceed to Address")');

    // Step 2: Address
    await page.fill('input[placeholder="e.g. Rahul Sharma"]', 'Rohit Sharma');
    await page.fill('input[placeholder="10-digit mobile number"]', '9812345678');
    await page.fill('textarea', 'Flat 405, Palm Heights, Golf Course Road');
    await page.fill('input[placeholder="Gurugram"]', 'Gurugram');
    await page.fill('input[placeholder="122001"]', '122001');
    await page.click('button:has-text("Proceed to Payment")');

    // Step 3: Payment
    await page.click('text=Cash on Delivery (COD)');
    await page.click('button:has-text("Confirm & Place Order")');

    // Auto-redirected to My Orders
    await expect(page).toHaveURL(/\/order/, { timeout: 10000 });
    await expect(page.locator('h1:has-text("My Orders")')).toBeVisible();

    // 2. Verify all required elements are present:
    // Order ID
    const orderIdElem = page.locator('text=ORD-').first();
    await expect(orderIdElem).toBeVisible();
    const orderIdText = await orderIdElem.textContent();

    // Order Date
    await expect(page.locator('.lucide-calendar').first()).toBeVisible();

    // Products & Weights
    await expect(page.locator('text=Gehu ka Atta (Whole Wheat Flour)').first()).toBeVisible();
    await expect(page.locator('text=5 KG').first()).toBeVisible();

    // Quantities
    await expect(page.getByText(/Qty:\s*\d+/).first()).toBeVisible();

    // Total Amount
    await expect(page.locator('text=Total Amount').first()).toBeVisible();

    // Payment Status
    await expect(page.locator('text=Cash on Delivery').first()).toBeVisible();

    // Delivery Status
    await expect(page.locator('text=Order Placed').first()).toBeVisible();

    // Estimated Delivery Time
    await expect(page.locator('text=Estimated Delivery').first()).toBeVisible();

    // Order Tracking (for placed order)
    await expect(page.locator('text=Current Status:').first()).toBeVisible();
    await expect(page.locator('button:has-text("Hide Tracking")').first()).toBeVisible();

    // Capture screenshot of My Orders with placed order (Desktop & Mobile)
    await page.screenshot({ path: 'screenshot_orders_with_order_en.png', fullPage: true });

    // Set mobile viewport to verify responsiveness
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({ path: 'screenshot_orders_mobile_responsive.png', fullPage: true });

    // Reset viewport
    await page.setViewportSize({ width: 1280, height: 720 });

    // 3. Admin updates order status to "Order Confirmed"
    const adminPage = await context.newPage();
    await adminPage.goto('/admin/orders');
    await expect(adminPage.locator('text=Rohit Sharma').first()).toBeVisible();
    const orderSelect = adminPage.locator('select').first();
    await orderSelect.selectOption('Order Confirmed');

    // 4. Verify My Orders updates automatically
    await page.bringToFront();
    // Wait for the 3-second polling to sync the status update
    await expect(page.locator('text=Order Confirmed').first()).toBeVisible({ timeout: 10000 });

    // Toggle Tracking button test
    const trackingBtn = page.locator('button:has-text("Hide Tracking")').first();
    await trackingBtn.click();
    await expect(page.locator('button:has-text("Track Order")').first()).toBeVisible();
    await expect(page.locator('text=Current Status:')).toHaveCount(0);

    // Toggle Tracking back on
    await page.locator('button:has-text("Track Order")').first().click();
    await expect(page.locator('text=Current Status:').first()).toBeVisible();

    // Toggle Details button test
    const detailsBtn = page.locator('button:has-text("Details")').first();
    await detailsBtn.click();
    await expect(page.locator('text=Delivery Details').first()).toBeVisible();
    await expect(page.locator('text=Payment Breakdown').first()).toBeVisible();
  });
});
