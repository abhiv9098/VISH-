const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

  // 1. Customer Store Mobile View
  console.log('Navigating to http://192.168.29.236:4000/ ...');
  await page.goto('http://192.168.29.236:4000/', { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'screenshots/customer_app_new_admin_icon.png' });
  console.log('Saved screenshots/customer_app_new_admin_icon.png');

  // 2. Admin Panel Mobile View
  console.log('Navigating to http://192.168.29.236:4000/admin ...');
  await page.goto('http://192.168.29.236:4000/admin', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'screenshots/admin_mobile_new_verified.png' });
  console.log('Saved screenshots/admin_mobile_new_verified.png');

  // 3. Admin Panel Drawer with New Icons
  await page.locator('button[aria-label="Open menu"]').click();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'screenshots/admin_mobile_drawer_new_icons.png' });
  console.log('Saved screenshots/admin_mobile_drawer_new_icons.png');

  // 4. Customer Profile Page with New Admin Badge
  await page.goto('http://192.168.29.236:4000/profile', { waitUntil: 'networkidle' });
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(400);
  await page.screenshot({ path: 'screenshots/customer_profile_new_admin_card.png' });
  console.log('Saved screenshots/customer_profile_new_admin_card.png');

  await browser.close();
})();
