import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'orders_data.json');

test.describe('Delivery Verification & Delivery ETA Features E2E', () => {
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

  test('1. Delivery Code is HIDDEN from Admin Panel and Verification is Required to complete order', async ({ page, context }) => {
    // 1. Customer places an order
    await page.goto('/order?productId=p1&qty=1');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('h1:has-text("Place Order")')).toBeVisible();
    await page.click('button:has-text("Proceed to Address")');

    await page.fill('input[placeholder="e.g. Rahul Sharma"]', 'Sunil Verma');
    await page.fill('input[placeholder="10-digit mobile number"]', '9811224466');
    await page.fill('textarea', 'Flat 101, Galaxy Heights, Sector 15');
    await page.fill('input[placeholder="Gurugram"]', 'Gurugram');
    await page.fill('input[placeholder="122001"]', '122001');
    await page.click('button:has-text("Proceed to Payment")');

    await page.click('text=Cash on Delivery (COD)');
    await page.click('button:has-text("Confirm & Place Order")');

    await expect(page).toHaveURL(/\/order/, { timeout: 10000 });

    // 2. Customer sees their compact 6-digit delivery verification code
    await expect(page.locator('text=Delivery Verification').first()).toBeVisible();
    await expect(page.locator('text=Required').first()).toBeVisible();
    await expect(page.locator('text=Share this code with your delivery partner').first()).toBeVisible();

    // Read the 6-digit code digits from the customer's screen
    const digitElements = page.locator('.select-all');
    await expect(digitElements).toHaveCount(6);
    let customerCode = '';
    for (let i = 0; i < 6; i++) {
      customerCode += (await digitElements.nth(i).textContent())?.trim();
    }
    expect(customerCode).toMatch(/^\d{6}$/);

    // 3. Open Admin Panel
    const adminPage = await context.newPage();
    await adminPage.goto('/admin/orders');
    await adminPage.waitForLoadState('networkidle');

    // Customer Sunil Verma should be listed
    await expect(adminPage.locator('text=Sunil Verma').first()).toBeVisible();

    // CRITICAL SECURITY REQUIREMENT:
    // Delivery code must STAY HIDDEN from Admin Panel!
    // The admin page must NOT display Sunil's delivery code anywhere in text
    const adminPageText = await adminPage.innerText('body');
    expect(adminPageText).not.toContain(customerCode);

    // 4. Test Delivery ETA Notification in Admin Panel
    // Admin clicks "within 45 mins" preset
    const eta45Btn = adminPage.locator('button:has-text("within 45 mins")').first();
    await eta45Btn.click();
    await expect(adminPage.locator('text=Customer Notified').first()).toBeVisible({ timeout: 5000 });

    // Customer page updates with ETA Notification
    await page.bringToFront();
    await page.waitForTimeout(4000); // Wait for 3-sec polling
    await expect(page.locator('text=Delivery ETA Notification').first()).toBeVisible();
    await expect(page.locator('text=45 mins').first()).toBeVisible();

    // 5. Admin updates order to "Out for Delivery"
    await adminPage.bringToFront();
    const dispatchBtn = adminPage.locator('button:has-text("3. Dispatch (Out for Delivery)")').first();
    if (await dispatchBtn.isVisible()) {
      await dispatchBtn.click();
    } else {
      // Step sequentially from Order Placed -> Order Confirmed -> Preparing -> Out for Delivery
      const confirmBtn = adminPage.locator('button:has-text("1. Accept & Confirm Order")').first();
      if (await confirmBtn.isVisible()) await confirmBtn.click();
      await adminPage.waitForTimeout(500);

      const prepBtn = adminPage.locator('button:has-text("2. Start Preparing / Milling")').first();
      if (await prepBtn.isVisible()) await prepBtn.click();
      await adminPage.waitForTimeout(500);

      const outBtn = adminPage.locator('button:has-text("3. Dispatch (Out for Delivery)")').first();
      if (await outBtn.isVisible()) await outBtn.click();
    }

    // 6. Test Automatic Order Completion Protection:
    // Admin tries to mark Delivered using an incorrect delivery code
    const verifyInput = adminPage.locator('input[placeholder*="6-digit code"]').first();
    await expect(verifyInput).toBeVisible();

    // Enter incorrect code
    await verifyInput.fill('000000');
    const verifyBtn = adminPage.locator('button:has-text("Verify & Complete Delivery")').first();
    await verifyBtn.click();

    // Error alert must appear and order is NOT marked Delivered
    await expect(adminPage.locator('text=Verification failed').first()).toBeVisible();
    await expect(adminPage.locator('select').first()).not.toHaveValue('Delivered');

    // 7. Admin enters the CORRECT 6-digit delivery code provided by customer
    await verifyInput.fill(customerCode);
    await verifyBtn.click();

    // Automatic order completion occurs!
    await expect(adminPage.locator('text=Verification Successful!').first()).toBeVisible({ timeout: 5000 });
    await expect(adminPage.locator('text=Verified & Delivered').first()).toBeVisible();

    // 8. Customer page reflects Delivered & Verified handoff
    await page.bringToFront();
    await page.waitForTimeout(4000);
    await expect(page.locator('text=Code Verified').first()).toBeVisible({ timeout: 10000 });
  });

  test('2. Verification Code ONLY appears in the correct customer\'s My Orders', async ({ page, context }) => {
    // Read orders from data file
    const rawData = fs.readFileSync(dataFilePath, 'utf8');
    const orders = JSON.parse(rawData);
    expect(orders.length).toBeGreaterThan(0);

    // Create a new browser context that acts as a different customer (different phone)
    const otherCustomerContext = await context.browser()?.newContext();
    if (!otherCustomerContext) return;
    const otherCustomerPage = await otherCustomerContext.newPage();

    // This customer visits /order
    await otherCustomerPage.goto('/order');
    await otherCustomerPage.waitForLoadState('networkidle');

    // If any orders are visible that don't belong to this empty/different session,
    // their delivery verification code MUST NOT be shown to other customers
    const protectedNotices = otherCustomerPage.locator('text=Visible only to verified customer');
    const count = await protectedNotices.count();
    expect(count).toBeGreaterThan(0);

    await otherCustomerContext.close();
  });
});
