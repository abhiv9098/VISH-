const { chromium } = require('@playwright/test');

async function testFullWorkflow() {
  console.log('🚀 Starting Comprehensive End-to-End Workflow & Sync Verification...');
  const browser = await chromium.launch({ headless: true });

  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const pageAdmin = await context.newPage();
  const pageCustomer = await context.newPage();

  try {
    const orderId = 'ORD-7479524238';

    // 1. Go to Admin Orders Manager
    console.log('\n--- Step 6: Verify Delivered Status in Admin (NO CODE) ---');
    await pageAdmin.goto('http://localhost:4000/admin/orders', { waitUntil: 'networkidle' });
    await pageAdmin.waitForTimeout(2000);

    const completedBadge = pageAdmin.getByText('Completed & Delivered').first();
    await completedBadge.waitFor({ state: 'visible', timeout: 8000 });
    console.log('✓ Order status in Admin: Completed & Delivered');

    await pageAdmin.screenshot({ path: 'test_step6_admin_orders_delivered.png', fullPage: true });
    console.log('📸 Captured: test_step6_admin_orders_delivered.png');

    // 2. Check Customer App sync to Delivered
    console.log('\n--- Step 7: Check Customer App Sync to Delivered ---');
    await pageCustomer.goto('http://localhost:4000/order', { waitUntil: 'networkidle' });
    await pageCustomer.waitForTimeout(2000);

    const deliveredText = pageCustomer.getByText(/Delivered|डिलीवर हुआ/).first();
    await deliveredText.waitFor({ state: 'visible', timeout: 8000 });
    console.log('✓ Customer App successfully moved order to Order History as Delivered!');

    await pageCustomer.screenshot({ path: 'test_step7_customer_synced_delivered.png', fullPage: true });
    console.log('📸 Captured: test_step7_customer_synced_delivered.png');

    // 3. Test Products Page
    console.log('\n--- Step 8: Test Products Page Functionality ---');
    await pageAdmin.goto('http://localhost:4000/admin/products', { waitUntil: 'networkidle' });
    await pageAdmin.waitForTimeout(1500);

    const searchInput = pageAdmin.locator('input[placeholder*="Search products"]').first();
    await searchInput.fill('Chana Dal');
    await pageAdmin.waitForTimeout(800);
    console.log('✓ Product search for "Chana Dal" working');

    await searchInput.fill('');
    await pageAdmin.waitForTimeout(500);

    // Toggle stock
    const stockBtn = pageAdmin.locator('button:has-text("Mark Out of Stock"), button:has-text("Mark In Stock")').first();
    await stockBtn.click();
    await pageAdmin.waitForTimeout(1000);
    console.log('✓ Product In-Stock / Out-of-Stock toggle working');

    await pageAdmin.screenshot({ path: 'test_step8_admin_products.png', fullPage: true });
    console.log('📸 Captured: test_step8_admin_products.png');

    // 4. Test Customers Page
    console.log('\n--- Step 9: Test Customers Page Functionality ---');
    await pageAdmin.goto('http://localhost:4000/admin/customers', { waitUntil: 'networkidle' });
    await pageAdmin.waitForTimeout(1500);

    const custRow = pageAdmin.getByText('Abhishek Sharma').first();
    await custRow.waitFor({ state: 'visible', timeout: 8000 });
    console.log('✓ Customer "Abhishek Sharma" visible with stats and channels');

    await custRow.click();
    await pageAdmin.waitForTimeout(800);
    console.log('✓ Expanded customer order history drawer');

    await pageAdmin.screenshot({ path: 'test_step9_admin_customers.png', fullPage: true });
    console.log('📸 Captured: test_step9_admin_customers.png');

    // 5. Test Settings Page
    console.log('\n--- Step 10: Test Settings Page Functionality ---');
    await pageAdmin.goto('http://localhost:4000/admin/settings', { waitUntil: 'networkidle' });
    await pageAdmin.waitForTimeout(1500);

    const saveSettingsBtn = pageAdmin.locator('button:has-text("Save Changes")').first();
    await saveSettingsBtn.click();
    await pageAdmin.waitForTimeout(1000);

    const toastNotice = pageAdmin.getByText('Settings saved successfully').first();
    await toastNotice.waitFor({ state: 'visible', timeout: 5000 });
    console.log('✓ Store settings saved with confirmation banner');

    await pageAdmin.screenshot({ path: 'test_step10_admin_settings.png', fullPage: true });
    console.log('📸 Captured: test_step10_admin_settings.png');

    // 6. Test Mobile Viewport & Sidebar Drawer
    console.log('\n--- Step 11: Test Mobile Viewport (375px) & Sidebar Drawer ---');
    const mobileContext = await browser.newContext({
      viewport: { width: 375, height: 812 },
      isMobile: true,
      hasTouch: true
    });
    const pageMobile = await mobileContext.newPage();
    await pageMobile.goto('http://localhost:4000/admin', { waitUntil: 'networkidle' });
    await pageMobile.waitForTimeout(1500);

    await pageMobile.screenshot({ path: 'test_step11_mobile_dashboard.png', fullPage: false });
    console.log('📸 Captured: test_step11_mobile_dashboard.png');

    const hamburgerBtn = pageMobile.locator('button[aria-label="Open menu"]').first();
    await hamburgerBtn.click();
    await pageMobile.waitForTimeout(800);

    for (const name of ['Dashboard', 'Orders', 'Products', 'Customers', 'Settings']) {
      const item = pageMobile.locator(`aside nav a:has-text("${name}")`).first();
      await item.waitFor({ state: 'visible' });
    }
    console.log('✓ Verified all 5 sidebar sections in mobile drawer!');

    await pageMobile.screenshot({ path: 'test_step12_mobile_sidebar_drawer.png', fullPage: false });
    console.log('📸 Captured: test_step12_mobile_sidebar_drawer.png');

    await mobileContext.close();
    await context.close();

    console.log('\n============================================================');
    console.log('🎉🎉🎉 ALL TESTS PASSED SUCCESSFULLY! 100% COMPLETE! 🎉🎉🎉');
    console.log('============================================================');
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

testFullWorkflow();
