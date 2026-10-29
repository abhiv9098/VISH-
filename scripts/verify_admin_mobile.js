const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 }, // Mobile viewport (iPhone 12/13/14)
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1'
  });
  const page = await context.newPage();

  console.log('Navigating to http://localhost:4000/admin ...');
  await page.goto('http://localhost:4000/admin', { waitUntil: 'networkidle' });

  // 1. Check if the bottom nav bar is present or not
  const bottomNav = page.locator('nav[aria-label="Admin Mobile Navigation"]');
  const bottomNavCount = await bottomNav.count();
  console.log('Admin Mobile Navigation nav count (should be 0):', bottomNavCount);

  // 2. Check if Hamburger Menu button is present and visible
  const hamburgerBtn = page.locator('button[aria-label="Open menu"]');
  const isHamburgerVisible = await hamburgerBtn.isVisible();
  console.log('Hamburger Menu button visible (should be true):', isHamburgerVisible);

  // Take screenshot of mobile admin page without bottom bar
  await page.screenshot({ path: 'screenshot_admin_mobile_no_bottom_bar.png' });
  console.log('Saved screenshot_admin_mobile_no_bottom_bar.png');

  // 3. Click hamburger menu to open drawer
  if (isHamburgerVisible) {
    await hamburgerBtn.click();
    await page.waitForTimeout(600); // Wait for transition
    await page.screenshot({ path: 'screenshot_admin_mobile_hamburger_opened.png' });
    console.log('Saved screenshot_admin_mobile_hamburger_opened.png');
  }

  await browser.close();
  console.log('Verification finished successfully!');
})();
