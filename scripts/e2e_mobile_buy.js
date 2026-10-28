const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();

  console.log('1. Opening Storefront on mobile...');
  await page.goto('http://localhost:4000', { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'mobile_buy_step1_home.png' });

  console.log('2. Clicking Buy Now on first product...');
  const buyBtn = page.locator('button:has-text("Buy Now")').first();
  await buyBtn.click();
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'mobile_buy_step2_items_overview.png' });

  console.log('3. Proceeding to Address...');
  const proceedAddr = page.locator('button:has-text("Proceed to Address")').first();
  await proceedAddr.click();
  await page.waitForTimeout(600);

  // Fill address form
  await page.locator('form input[type="text"]').first().fill('Abhishek Sharma (Mobile Live)');
  await page.locator('form input[type="tel"]').first().fill('9893249212');
  await page.locator('form textarea').first().fill('Near Vishwakarma Mandir, Main Road, Sonkach');
  await page.screenshot({ path: 'mobile_buy_step3_address_filled.png' });

  console.log('4. Proceeding to Payment...');
  const proceedPay = page.locator('form button[type="submit"]').first();
  await proceedPay.click();
  await page.waitForTimeout(600);

  // Click Cash on Delivery
  console.log('Selecting Cash on Delivery...');
  const codRadio = page.locator('text="Cash on Delivery (COD)"').first();
  await codRadio.click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: 'mobile_buy_step4_payment_cod_selected.png' });

  console.log('5. Confirming and Placing Order (COD)...');
  const confirmBtn = page.locator('button:has-text("Confirm & Place Order")').first();
  await confirmBtn.click();
  await page.waitForURL(/\/order\?newOrder=/, { timeout: 15000 });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: 'mobile_buy_step5_order_confirmed.png' });

  const url = page.url();
  const orderId = url.match(/newOrder=([A-Za-z0-9\-]+)/)?.[1];
  console.log('✓ Successfully placed mobile order:', orderId);

  // 6. Check Admin Mobile View
  console.log('6. Checking Admin on Mobile...');
  const adminPage = await context.newPage();
  await adminPage.goto('http://localhost:4000/admin', { waitUntil: 'networkidle' });
  await adminPage.waitForTimeout(1000);
  await adminPage.screenshot({ path: 'mobile_buy_step6_admin_dashboard.png' });

  await browser.close();
  console.log('All mobile buy steps completed and verified successfully!');
})();
