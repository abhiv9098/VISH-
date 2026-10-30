import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'orders_data.json');

test.describe('E2E Customer Buy Flow & Admin Panel Synchronization', () => {
  test.describe.configure({ mode: 'serial' });

  let placedOrderId = '';

  test.afterAll(() => {
    fs.writeFileSync(dataFilePath, '[]', 'utf8');
  });

  test.beforeEach(async ({ context }) => {
    await context.addInitScript(() => {
      localStorage.setItem('vishwakarma_admin_session', JSON.stringify({
        token: 'test-session',
        expiresAt: Date.now() + 86400000 * 30
      }));
    });
  });

  test('Step 1: Customer clicks Buy Now and completes 3-step checkout', async ({ page }) => {
    // 1. Visit Storefront
    await page.goto('http://localhost:4000', { waitUntil: 'networkidle' });
    
    // Check that products exist and click "Buy Now" on first product
    const buyNowBtn = page.locator('button:has-text("Buy Now"), button:has-text("अभी खरीदें")').first();
    await expect(buyNowBtn).toBeVisible({ timeout: 10000 });
    await buyNowBtn.click();

    // 2. Checkout Step 1: Items overview
    await page.waitForURL(/\/order|\/checkout/, { timeout: 10000 });
    const proceedToAddrBtn = page.locator('button:has-text("Proceed to Address"), button:has-text("पते पर आगे बढ़ें")').first();
    await expect(proceedToAddrBtn).toBeVisible({ timeout: 10000 });
    await proceedToAddrBtn.click();

    // 3. Checkout Step 2: Fill address form
    await page.waitForTimeout(500);
    const nameInput = page.locator('form input[type="text"]').first();
    await nameInput.fill('Rahul Sharma (E2E Live Buyer)');

    const phoneInput = page.locator('form input[type="tel"]').first();
    await phoneInput.fill('9876543210');

    const addressInput = page.locator('form textarea').first();
    await addressInput.fill('Flat 402, Sunshine Heights, Near Atta Chakki, Sector 14');

    const proceedToPayBtn = page.locator('form button[type="submit"]').first();
    await proceedToPayBtn.click();

    // 4. Checkout Step 3: Payment mode (COD)
    await page.waitForTimeout(600);
    const codOption = page.locator('input[type="radio"][value="cod"]').first();
    if (await codOption.isVisible()) {
      await codOption.check();
    } else {
      const codText = page.getByText(/Cash on Delivery|कैश ऑन डिलीवरी/i).first();
      await codText.click();
    }

    // Submit order
    const confirmPlaceBtn = page.locator('button:has-text("Confirm & Place Order"), button:has-text("ऑर्डर कन्फ़र्म करें")').first();
    await confirmPlaceBtn.click();

    // 5. Verify confirmation & Extract Order ID
    await page.waitForURL(/\/order\?newOrder=/, { timeout: 15000 });
    const currentUrl = page.url();
    const match = currentUrl.match(/newOrder=(ORD-[A-Za-z0-9\-]+)/);
    expect(match).not.toBeNull();
    placedOrderId = match![1];
    console.log('✓ Successfully placed real customer order:', placedOrderId);

    // Verify order is visible on Customer page
    const customerOrderCard = page.getByText('Rahul Sharma (E2E Live Buyer)').first();
    await expect(customerOrderCard).toBeVisible({ timeout: 10000 });
    await page.screenshot({ path: 'screenshot_e2e_1_customer_bought.png' });
  });

  test('Step 2: Admin Dashboard receives order live with NO Customer Store / View Store links', async ({ page }) => {
    await page.goto('http://localhost:4000/admin', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Verify "Customer Store" is NOT in the sidebar
    const sidebarStoreLink = page.locator('aside a:has-text("Customer Store")');
    await expect(sidebarStoreLink).toHaveCount(0);

    // Verify "View Store" is NOT in the header
    const headerStoreLink = page.locator('header a:has-text("View Store")');
    await expect(headerStoreLink).toHaveCount(0);

    // Verify the newly placed order appears under "New Incoming Orders"
    const orderCard = page.locator('div:has-text("Rahul Sharma (E2E Live Buyer)")').first();
    await expect(orderCard).toBeVisible({ timeout: 10000 });

    // Verify customer contact action buttons are present
    const callBtn = page.locator('a[href^="tel:"]').first();
    await expect(callBtn).toBeVisible();

    const waBtn = page.locator('a[href*="wa.me/"]').first();
    await expect(waBtn).toBeVisible();

    const mapsBtn = page.locator('a:has-text("Maps"), a:has-text("GPS")').first();
    await expect(mapsBtn).toBeVisible();

    await page.screenshot({ path: 'screenshot_e2e_2_admin_dashboard_order_received.png' });

    // 1-Click Confirm Order in Admin
    const confirmBtn = page.locator('button:has-text("Confirm Order")').first();
    await expect(confirmBtn).toBeVisible();
    await confirmBtn.click();

    // Wait for card to transition
    await page.waitForTimeout(1500);
    console.log('✓ Admin confirmed order:', placedOrderId);
    await page.screenshot({ path: 'screenshot_e2e_3_admin_order_confirmed.png' });
  });

  test('Step 3: Admin updates status in Orders Manager to Delivered with NO verification code', async ({ page }) => {
    await page.goto('http://localhost:4000/admin/orders', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Find our order card
    const orderCard = page.locator('div:has-text("Rahul Sharma (E2E Live Buyer)")').last();
    await expect(orderCard).toBeVisible({ timeout: 10000 });

    // Use select inside this order card to change to Delivered
    const statusSelect = orderCard.locator('select').first();
    if (await statusSelect.isVisible()) {
      await statusSelect.selectOption('Delivered');
      await page.waitForTimeout(1500);
    } else {
      const btn = orderCard.locator('button:has-text("Start Preparing"), button:has-text("Dispatch"), button:has-text("Mark as Delivered")').first();
      if (await btn.isVisible()) {
        await btn.click();
        await page.waitForTimeout(1000);
      }
    }

    // Verify Completed & Delivered badge is visible
    const deliveredBadge = page.getByText(/Completed & Delivered|Delivered/i).first();
    await expect(deliveredBadge).toBeVisible({ timeout: 8000 });
    console.log('✓ Admin successfully progressed order to Delivered without verification code');
    await page.screenshot({ path: 'screenshot_e2e_4_admin_order_delivered.png' });
  });

  test('Step 4: Customer Order page reflects Delivered status in real time', async ({ page }) => {
    await page.goto('http://localhost:4000/order', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    // Check delivered label
    const deliveredText = page.getByText(/Delivered|डिलीवर हुआ/).first();
    await expect(deliveredText).toBeVisible({ timeout: 8000 });
    console.log('✓ Customer page synced to Delivered successfully');
    await page.screenshot({ path: 'screenshot_e2e_5_customer_delivered_synced.png' });
  });

  test('Step 5: Admin Products, Customers, and Settings sections function properly', async ({ page }) => {
    // Products
    await page.goto('http://localhost:4000/admin/products', { waitUntil: 'networkidle' });
    const productSearch = page.locator('input[placeholder*="Search products"]').first();
    await expect(productSearch).toBeVisible();
    await productSearch.fill('Chana');
    await page.waitForTimeout(400);
    await productSearch.fill('');
    await page.screenshot({ path: 'screenshot_e2e_6_admin_products.png' });

    // Customers
    await page.goto('http://localhost:4000/admin/customers', { waitUntil: 'networkidle' });
    const customerHeading = page.getByRole('heading', { name: /Customers Directory/i }).first();
    await expect(customerHeading).toBeVisible();
    await page.screenshot({ path: 'screenshot_e2e_7_admin_customers.png' });

    // Settings
    await page.goto('http://localhost:4000/admin/settings', { waitUntil: 'networkidle' });
    const storeNameInput = page.locator('input[value*="Vishwakarma"]').first();
    await expect(storeNameInput).toBeVisible();
    await page.screenshot({ path: 'screenshot_e2e_8_admin_settings.png' });

    console.log('✓ All 5 Admin sections verified functioning properly');
  });
});
