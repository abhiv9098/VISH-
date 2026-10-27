const fs = require('fs');
const { chromium } = require('@playwright/test');

async function capture() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 420, height: 860 }
  });
  const page = await context.newPage();

  // 1. Visit Home & set English
  await page.goto('http://localhost:4000');
  await page.evaluate(() => localStorage.setItem('vishwakarma_lang', 'en'));
  await page.reload({ waitUntil: 'networkidle' });

  // 1. Home / Product Card with Buy Now
  console.log('Capturing Step 1: Storefront with English Buy Now...');
  await page.screenshot({ path: 'en_step1_buy_now.png' });

  // 2. Click Buy Now
  console.log('Clicking Buy Now...');
  const buyBtn = page.locator('button:has-text("Buy Now")').first();
  await buyBtn.click();
  await page.waitForURL(/\/order/, { timeout: 10000 });
  await page.waitForTimeout(600);

  // 3. Step 1 of Order (Flour Items)
  console.log('Capturing Step 2: Order details...');
  await page.screenshot({ path: 'en_step2_order_details.png' });

  // 4. Click Proceed to Address
  console.log('Proceeding to Address...');
  const toAddrBtn = page.locator('button:has-text("Proceed to Address")').first();
  await toAddrBtn.click();
  await page.waitForTimeout(600);

  // Fill English Customer Details
  const nameInput = page.locator('input[placeholder*="Rahul"]').first();
  await nameInput.fill('Abhi Sharma (Live Buyer)');
  const phoneInput = page.locator('input[type="tel"]').first();
  await phoneInput.fill('9876543210');
  const addrInput = page.locator('textarea').first();
  await addrInput.fill('Plot 104, Green Avenue, Sector 15');
  const cityInput = page.locator('input[placeholder*="Gurugram"]').first();
  await cityInput.fill('Gurugram');
  const pinInput = page.locator('input[placeholder*="122001"]').first();
  await pinInput.fill('122001');

  console.log('Capturing Step 3: Address & Delivery Details...');
  await page.screenshot({ path: 'en_step3_delivery_address.png' });

  // 5. Proceed to Payment
  console.log('Proceeding to Payment...');
  const toPayBtn = page.locator('button:has-text("Proceed to Payment")').first();
  await toPayBtn.click();
  await page.waitForTimeout(600);

  // Select COD
  const codOption = page.locator('input[value="cod"]').first();
  await codOption.check();
  await page.waitForTimeout(400);

  console.log('Capturing Step 4: Payment Selection...');
  await page.screenshot({ path: 'en_step4_payment_cod.png' });

  // 6. Confirm & Place Order
  console.log('Placing Order...');
  const confirmBtn = page.locator('button:has-text("Confirm & Place Order")').first();
  await confirmBtn.click();
  await page.waitForURL(/\/order\?newOrder=/, { timeout: 15000 });
  await page.waitForTimeout(2000);

  console.log('Capturing Step 5: Order Confirmation & Live Tracking...');
  await page.screenshot({ path: 'en_step5_order_tracking.png' });

  // 7. Admin Orders Panel
  console.log('Checking Admin Orders Panel...');
  const adminPage = await context.newPage();
  await adminPage.goto('http://localhost:4000/admin/orders', { waitUntil: 'networkidle' });
  await adminPage.waitForTimeout(1000);

  console.log('Capturing Step 6: Admin Orders synchronization...');
  await adminPage.screenshot({ path: 'en_step6_admin_orders.png' });

  await browser.close();
  console.log('All English Buy Flow screenshots captured successfully!');
}

capture().catch(err => {
  console.error('Error during capture:', err);
  process.exit(1);
});
