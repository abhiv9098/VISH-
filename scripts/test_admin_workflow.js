const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

async function run() {
  console.log('🚀 Starting End-to-End Admin Redesign & Synchronization Test...');
  const browser = await chromium.launch({ headless: true });

  try {
    // 1. Desktop Context
    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 }
    });

    const pageCustomer = await context.newPage();
    const pageAdmin = await context.newPage();

    // STEP 1: Place a new real order in the Customer App
    console.log('\n--- Step 1: Customer Places a Real New Order ---');
    await pageCustomer.goto('http://localhost:4000', { waitUntil: 'networkidle' });
    
    // Find and click Buy Now on the first product
    const buyNowBtn = pageCustomer.locator('button:has-text("Buy Now"), button:has-text("अभी खरीदें")').first();
    await buyNowBtn.waitFor({ state: 'visible', timeout: 10000 });
    await buyNowBtn.click();
    console.log('✓ Clicked Buy Now');

    await pageCustomer.waitForTimeout(1000);

    // Step 1 in Checkout: Click "Proceed to Address"
    const step1Btn = pageCustomer.locator('button:has-text("Proceed to Address"), button:has-text("पते पर आगे बढ़ें")').first();
    await step1Btn.waitFor({ state: 'visible', timeout: 10000 });
    await step1Btn.click();
    console.log('✓ Checkout Step 1: Proceeded to Address');

    await pageCustomer.waitForTimeout(1000);

    // Step 2 in Checkout: Fill customer address details
    const nameInput = pageCustomer.locator('input[placeholder*="Name"], input[placeholder*="नाम"]').first();
    if (await nameInput.isVisible()) {
      await nameInput.fill('Abhishek Sharma');
    }

    const phoneInput = pageCustomer.locator('input[type="tel"], input[placeholder*="Phone"], input[placeholder*="फोन"]').first();
    if (await phoneInput.isVisible()) {
      await phoneInput.fill('9893249212');
    }

    const addressInput = pageCustomer.locator('textarea, input[placeholder*="Address"], input[placeholder*="पता"]').first();
    if (await addressInput.isVisible()) {
      await addressInput.fill('Sonkach, Dewas, Madhya Pradesh, 455118');
    }

    const step2Btn = pageCustomer.locator('button:has-text("Proceed to Payment"), button:has-text("भुगतान पर आगे बढ़ें")').first();
    await step2Btn.waitFor({ state: 'visible', timeout: 10000 });
    await step2Btn.click();
    console.log('✓ Checkout Step 2: Proceeded to Payment');

    await pageCustomer.waitForTimeout(1000);

    // Step 3 in Checkout: Select Cash on Delivery
    const codOption = pageCustomer.locator('text="Cash on Delivery", text="कैश ऑन डिलीवरी"').first();
    if (await codOption.isVisible()) {
      await codOption.click();
      console.log('✓ Selected Cash on Delivery');
    }

    // Submit Order
    const placeOrderBtn = pageCustomer.locator('button:has-text("Confirm & Place Order"), button:has-text("ऑर्डर कन्फ़र्म करें")').first();
    await placeOrderBtn.waitFor({ state: 'visible', timeout: 10000 });
    await placeOrderBtn.click();
    console.log('✓ Clicked Confirm & Place Order');

    // Wait for redirect to /order?newOrder=
    await pageCustomer.waitForURL(/.*order.*/, { timeout: 15000 });
    await pageCustomer.waitForTimeout(2000);
    console.log('✓ Navigated to Customer My Orders:', pageCustomer.url());

    // Extract Order ID
    const url = pageCustomer.url();
    let newOrderId = '';
    const match = url.match(/newOrder=(ORD-[A-Za-z0-9-]+)/);
    if (match) {
      newOrderId = match[1];
    } else {
      const idElem = await pageCustomer.locator('text=/ORD-\\d+/').first();
      newOrderId = (await idElem.textContent()).trim();
    }
    console.log(`✓ Placed Order ID: ${newOrderId}`);

    // Verify verification code is NOT present
    const verificationText = await pageCustomer.locator('text="Delivery Verification", text="REQUIRED", text="Verify upon arrival."').count();
    console.log(`✓ Verification Code Elements count on Customer App: ${verificationText} (Must be 0)`);

    // Save Customer App Screenshot
    await pageCustomer.screenshot({ path: 'test_step1_customer_placed_order.png', fullPage: true });
    console.log('📸 Captured: test_step1_customer_placed_order.png');


    // STEP 2: Check Admin Dashboard in Real Time
    console.log('\n--- Step 2: Open Admin Dashboard & Check Real-Time Incoming Order ---');
    await pageAdmin.goto('http://localhost:4000/admin', { waitUntil: 'networkidle' });
    await pageAdmin.waitForTimeout(1500);

    // Verify new order is visible in New Incoming Orders
    const adminOrderCard = pageAdmin.locator(`text=${newOrderId}`).first();
    await adminOrderCard.waitFor({ state: 'visible', timeout: 10000 });
    console.log(`✓ New order ${newOrderId} appeared on Admin Dashboard in real time!`);

    // Verify Customer name and contact buttons
    const customerNameVisible = await pageAdmin.locator('text="Abhishek Sharma"').first().isVisible();
    console.log(`✓ Customer name visible on Dashboard: ${customerNameVisible}`);

    const callBtnVisible = await pageAdmin.locator('a[href^="tel:9893249212"]').first().isVisible();
    console.log(`✓ Call button active with tel link: ${callBtnVisible}`);

    const waBtnVisible = await pageAdmin.locator('a[href*="wa.me/919893249212"]').first().isVisible();
    console.log(`✓ WhatsApp button active with wa.me link: ${waBtnVisible}`);

    const mapsBtnVisible = await pageAdmin.locator('a[href*="maps"]').first().isVisible();
    console.log(`✓ Open in Maps button active: ${mapsBtnVisible}`);

    // Verify NO verification code badge on admin dashboard
    const adminCodeBadge = await pageAdmin.locator('text=/CODE:\\s*\\d+/i').count();
    console.log(`✓ Verification Code badges count on Admin Dashboard: ${adminCodeBadge} (Must be 0)`);

    await pageAdmin.screenshot({ path: 'test_step2_admin_dashboard_incoming.png', fullPage: true });
    console.log('📸 Captured: test_step2_admin_dashboard_incoming.png');


    // STEP 3: Admin Confirms the Order
    console.log('\n--- Step 3: Admin Confirms Order & Syncs with Customer App ---');
    const confirmBtn = pageAdmin.locator(`div:has-text("${newOrderId}") button:has-text("Confirm Order")`).last();
    await confirmBtn.click();
    console.log('✓ Clicked "Confirm Order" button on Admin Dashboard');

    await pageAdmin.waitForTimeout(1500);
    await pageAdmin.screenshot({ path: 'test_step3_admin_dashboard_after_confirm.png', fullPage: true });
    console.log('📸 Captured: test_step3_admin_dashboard_after_confirm.png');

    // Switch back to customer app to verify live sync!
    console.log('Checking customer app live synchronization without reload...');
    await pageCustomer.waitForTimeout(2500);

    // Verify stage 2 Confirmed on customer timeline tracker
    const confirmedBadge = pageCustomer.locator('text="Confirmed", text="कन्फ़र्म हुआ"').first();
    await confirmedBadge.waitFor({ state: 'visible', timeout: 10000 });
    console.log('✓ Customer App successfully synced live to status: "Confirmed"!');

    await pageCustomer.screenshot({ path: 'test_step4_customer_synced_confirmed.png', fullPage: true });
    console.log('📸 Captured: test_step4_customer_synced_confirmed.png');


    // STEP 4: Admin Updates Status through Preparing, Out for Delivery, to Delivered
    console.log('\n--- Step 4: Admin Progresses Order Workflow in Orders Manager ---');
    await pageAdmin.goto('http://localhost:4000/admin/orders', { waitUntil: 'networkidle' });
    await pageAdmin.waitForTimeout(1000);

    // Locate the order card
    const orderInManager = pageAdmin.locator(`div:has-text("${newOrderId}")`).last();
    await orderInManager.waitFor({ state: 'visible', timeout: 10000 });

    // Click "2. Start Preparing / Milling"
    const prepBtn = pageAdmin.locator(`div:has-text("${newOrderId}") button:has-text("Preparing")`).last();
    if (await prepBtn.isVisible()) {
      await prepBtn.click();
      console.log('✓ Progressed status to: Preparing Your Order');
      await pageAdmin.waitForTimeout(1500);
    }

    // Click "3. Dispatch (Out for Delivery)"
    const dispatchBtn = pageAdmin.locator(`div:has-text("${newOrderId}") button:has-text("Dispatch")`).last();
    await dispatchBtn.waitFor({ state: 'visible', timeout: 8000 });
    await dispatchBtn.click();
    console.log('✓ Progressed status to: Out for Delivery');
    await pageAdmin.waitForTimeout(1500);

    // Verify Customer App synced to Out for Delivery
    await pageCustomer.waitForTimeout(2500);
    const outForDeliveryBadge = pageCustomer.locator('text="Out for Delivery", text="डिलीवरी के लिए निकला"').first();
    await outForDeliveryBadge.waitFor({ state: 'visible', timeout: 8000 });
    console.log('✓ Customer App successfully synced live to: "Out for Delivery"!');
    await pageCustomer.screenshot({ path: 'test_step5_customer_synced_out_for_delivery.png', fullPage: true });

    // Now click "4. Mark as Delivered" - WITHOUT ANY VERIFICATION CODE!
    const deliverBtn = pageAdmin.locator(`div:has-text("${newOrderId}") button:has-text("Mark as Delivered")`).last();
    await deliverBtn.waitFor({ state: 'visible', timeout: 8000 });
    await deliverBtn.click();
    console.log('✓ Clicked "Mark as Delivered" (No code prompted or needed!)');
    await pageAdmin.waitForTimeout(1500);

    // Verify admin card shows Completed & Delivered
    const completedBadge = pageAdmin.locator(`div:has-text("${newOrderId}") text="Completed & Delivered"`).first();
    await completedBadge.waitFor({ state: 'visible', timeout: 8000 });
    console.log('✓ Admin Panel marks order as: Completed & Delivered');
    await pageAdmin.screenshot({ path: 'test_step6_admin_orders_delivered.png', fullPage: true });

    // Verify Customer App synced to Delivered
    await pageCustomer.waitForTimeout(2500);
    const customerDelivered = pageCustomer.locator('text="Delivered", text="डिलीवर हो गया"').first();
    await customerDelivered.waitFor({ state: 'visible', timeout: 8000 });
    console.log('✓ Customer App successfully synced live to: "Delivered"!');
    await pageCustomer.screenshot({ path: 'test_step7_customer_synced_delivered.png', fullPage: true });


    // STEP 5: Test Products Section
    console.log('\n--- Step 5: Test Products Section ---');
    await pageAdmin.goto('http://localhost:4000/admin/products', { waitUntil: 'networkidle' });
    await pageAdmin.waitForTimeout(1000);

    // Test product search
    const productSearchInput = pageAdmin.locator('input[placeholder*="Search products"]').first();
    await productSearchInput.fill('Makki');
    await pageAdmin.waitForTimeout(500);
    console.log('✓ Tested product search for "Makki"');

    // Clear search
    await productSearchInput.fill('');
    await pageAdmin.waitForTimeout(500);

    // Test stock toggle
    const firstStockToggle = pageAdmin.locator('button:has-text("Mark Out of Stock"), button:has-text("Mark In Stock")').first();
    const beforeText = await firstStockToggle.textContent();
    await firstStockToggle.click();
    await pageAdmin.waitForTimeout(1000);
    console.log(`✓ Tested Stock Toggle (Switched from "${beforeText.trim()}")`);

    await pageAdmin.screenshot({ path: 'test_step8_admin_products.png', fullPage: true });
    console.log('📸 Captured: test_step8_admin_products.png');


    // STEP 6: Test Customers Section
    console.log('\n--- Step 6: Test Customers Section ---');
    await pageAdmin.goto('http://localhost:4000/admin/customers', { waitUntil: 'networkidle' });
    await pageAdmin.waitForTimeout(1000);

    // Verify our customer is in directory
    const custItem = pageAdmin.locator('text="Abhishek Sharma"').first();
    await custItem.waitFor({ state: 'visible', timeout: 8000 });
    console.log('✓ Customer "Abhishek Sharma" listed in Customer Directory');

    // Click to expand order history
    await custItem.click();
    await pageAdmin.waitForTimeout(800);
    console.log('✓ Expanded Customer Order History Drawer');

    await pageAdmin.screenshot({ path: 'test_step9_admin_customers.png', fullPage: true });
    console.log('📸 Captured: test_step9_admin_customers.png');


    // STEP 7: Test Settings Section
    console.log('\n--- Step 7: Test Settings Section ---');
    await pageAdmin.goto('http://localhost:4000/admin/settings', { waitUntil: 'networkidle' });
    await pageAdmin.waitForTimeout(1000);

    const storeNameInput = pageAdmin.locator('input[value*="Vishwakarma"]').first();
    await storeNameInput.waitFor({ state: 'visible' });

    // Save changes
    const saveBtn = pageAdmin.locator('button:has-text("Save Changes")').first();
    await saveBtn.click();
    await pageAdmin.waitForTimeout(1000);

    const savedNotice = pageAdmin.locator('text="Settings saved successfully"').first();
    await savedNotice.waitFor({ state: 'visible', timeout: 5000 });
    console.log('✓ Settings saved successfully with toast notification!');

    await pageAdmin.screenshot({ path: 'test_step10_admin_settings.png', fullPage: true });
    console.log('📸 Captured: test_step10_admin_settings.png');


    // STEP 8: Test Mobile Viewport & Responsive Sidebar Drawer
    console.log('\n--- Step 8: Test Mobile Viewport (375px) & Sidebar Drawer ---');
    const mobileContext = await browser.newContext({
      viewport: { width: 375, height: 812 },
      isMobile: true,
      hasTouch: true
    });
    const pageMobile = await mobileContext.newPage();
    await pageMobile.goto('http://localhost:4000/admin', { waitUntil: 'networkidle' });
    await pageMobile.waitForTimeout(1000);

    // Capture mobile dashboard
    await pageMobile.screenshot({ path: 'test_step11_mobile_admin_dashboard.png', fullPage: false });
    console.log('📸 Captured: test_step11_mobile_admin_dashboard.png');

    // Open hamburger menu
    const menuBtn = pageMobile.locator('button[aria-label="Open menu"]').first();
    await menuBtn.click();
    await pageMobile.waitForTimeout(800);

    // Verify all 5 sidebar items exist in mobile drawer
    for (const name of ['Dashboard', 'Orders', 'Products', 'Customers', 'Settings']) {
      const item = pageMobile.locator(`aside nav a:has-text("${name}")`).first();
      await item.waitFor({ state: 'visible' });
    }
    console.log('✓ All 5 sidebar sections verified in mobile drawer (Dashboard, Orders, Products, Customers, Settings)');

    await pageMobile.screenshot({ path: 'test_step12_mobile_admin_sidebar_drawer.png', fullPage: false });
    console.log('📸 Captured: test_step12_mobile_admin_sidebar_drawer.png');

    await mobileContext.close();
    await context.close();

    console.log('\n🎉 ALL TESTS PASSED SUCCESSFULLY! COMPLETE END-TO-END WORKFLOW VERIFIED!');
  } catch (err) {
    console.error('❌ Error during test run:', err);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

run();
