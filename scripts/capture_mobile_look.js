const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 375, height: 720 },
    isMobile: true,
    hasTouch: true
  });
  const page = await context.newPage();

  // 1. Mobile Home Storefront
  await page.goto('http://localhost:4000', { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'mobile_customer_home.png' });
  console.log('1. Captured mobile_customer_home.png');

  // 2. Mobile Customer Orders
  await page.goto('http://localhost:4000/order', { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'mobile_customer_orders.png' });
  console.log('2. Captured mobile_customer_orders.png');

  // 3. Mobile Admin Dashboard
  await page.goto('http://localhost:4000/admin', { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'mobile_admin_dashboard.png' });
  console.log('3. Captured mobile_admin_dashboard.png');

  // 4. Mobile Admin Drawer Open
  const menuBtn = page.locator('button[aria-label="Open menu"]').first();
  if (await menuBtn.isVisible()) {
    await menuBtn.click();
    await page.waitForTimeout(400);
    await page.screenshot({ path: 'mobile_admin_menu.png' });
    console.log('4. Captured mobile_admin_menu.png');
  }

  await browser.close();
  console.log('All mobile screenshots captured successfully!');
})();
