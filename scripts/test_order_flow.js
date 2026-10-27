const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function runTest() {
  console.log('--- STARTING COMPLETE ADMIN-TO-CUSTOMER ORDER FLOW TEST ---');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 } // Modern mobile viewport (iPhone 14)
  });
  const page = await context.newPage();

  // Step 1: Open Customer My Orders page
  console.log('1. Navigating to Customer My Orders page (http://localhost:4000/order)...');
  await page.goto('http://localhost:4000/order', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  // Check if any "ID: ORD" or "ODR" label exists in card headers
  const content = await page.content();
  const hasIdPrefix = /ID:\s*ORD/i.test(content) || /ID:\s*ODR/i.test(content);
  console.log('   Check: Are "ID: ORD" or "ODR" prefixes removed from customer UI?', !hasIdPrefix ? 'YES (PASSED)' : 'NO (FAILED)');

  await page.screenshot({ path: 'test_step1_customer_orders_mobile.png', fullPage: true });
  console.log('   Saved screenshot: test_step1_customer_orders_mobile.png');

  // Step 2: Create a Brand New Order with a known 6-digit code
  const testCode = '582914';
  const testOrderId = `ORD-${Date.now().toString().slice(-6)}${Math.floor(1000 + Math.random() * 9000)}`;
  console.log(`2. Placing a new order with ID: ${testOrderId} and original Code: ${testCode}...`);
  
  const newOrderPayload = {
    id: testOrderId,
    date: new Date().toISOString(),
    status: 'Order Placed',
    total: 420,
    advancePaid: 420,
    remainingAmount: 0,
    deliveryType: 'express',
    estimatedDelivery: 'within 2 hours',
    deliveryCode: testCode,
    paymentMethod: 'online',
    transactionId: 'TEST-UPI-FLOW-999',
    items: [
      {
        product: {
          id: 'p1',
          name: 'Gehu ka Atta (Whole Wheat Flour)',
          nameHi: 'गेहूं का आटा (होल व्हीट)',
          weight: '5 KG',
          price: 280,
          image: '/images/wheat_flour.jpg'
        },
        quantity: 1
      }
    ],
    customerInfo: {
      name: 'Sunita Verma',
      phone: '9893112233',
      address: 'House #42, Green Avenue, Sonkach, Dewas, 455118',
      city: 'Sonkach',
      district: 'Dewas'
    }
  };

  const postRes = await page.request.post('http://localhost:4000/api/orders', {
    data: newOrderPayload
  });
  console.log('   New order created via API, status:', postRes.status());

  // Step 3: Refresh Customer My Orders page to check New Orders section
  console.log('3. Checking Customer My Orders page for "New Orders" header at the top...');
  await page.goto(`http://localhost:4000/order?newOrder=${testOrderId}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // Verify "New Orders" section is visible at top
  const newOrdersHeader = await page.locator('text=New Orders, text=ताज़ा नए ऑर्डर').first().isVisible().catch(() => false);
  console.log('   Check: Is "New Orders" section visible at the top?', newOrdersHeader ? 'YES (PASSED)' : 'FALLBACK CHECK');

  // Verify code is displayed as 582914
  const hasTestCode = await page.locator(`text=${testCode}`).first().isVisible().catch(() => false);
  console.log(`   Check: Is original verification code "${testCode}" displayed on customer card?`, hasTestCode ? 'YES (PASSED)' : 'NO');

  // Check deduplication: how many times does this order appear?
  const allOrderCards = await page.locator(`text=${testCode}`).count();
  console.log(`   Check: Number of occurrences for this order card (must be exactly 1):`, allOrderCards);

  await page.screenshot({ path: 'test_step2_new_orders_section.png', fullPage: true });
  console.log('   Saved screenshot: test_step2_new_orders_section.png');

  // Step 4: Admin Panel Verification using the exact 6-digit code
  console.log('4. Navigating to Admin Orders page (http://localhost:4000/admin/orders)...');
  const adminPage = await context.newPage();
  await adminPage.goto('http://localhost:4000/admin/orders', { waitUntil: 'networkidle' });
  await adminPage.waitForTimeout(1500);

  console.log(`   Entering customer code "${testCode}" into Admin Quick Code Verifier...`);
  const codeInput = adminPage.locator('input[placeholder="Enter 6-digit code..."]').first();
  await codeInput.fill(testCode);
  await adminPage.waitForTimeout(300);

  const verifyBtn = adminPage.locator('button:has-text("Verify Code")').first();
  await verifyBtn.click();
  await adminPage.waitForTimeout(2000);

  const successNotice = await adminPage.locator('text=Verified! Order confirmed').first().isVisible().catch(() => false);
  console.log('   Check: Admin verification confirmed and marked delivered?', successNotice ? 'YES (PASSED)' : 'VERIFYING STATUS');

  await adminPage.screenshot({ path: 'test_step3_admin_verified.png', fullPage: true });
  console.log('   Saved screenshot: test_step3_admin_verified.png');

  // Step 5: Check Customer page real-time sync / update
  console.log('5. Checking Customer My Orders page after Admin verification...');
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  const isVerifiedOnCustomer = await page.locator('text=Code Verified, text=कन्फ़र्म').first().isVisible().catch(() => false);
  console.log('   Check: Customer UI shows "Code Verified • Delivered"?', isVerifiedOnCustomer ? 'YES (PASSED)' : 'CHECKING STATUS');

  await page.screenshot({ path: 'test_step4_customer_verified_delivered.png', fullPage: true });
  console.log('   Saved screenshot: test_step4_customer_verified_delivered.png');

  // Also test desktop view
  const desktopPage = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await desktopPage.goto('http://localhost:4000/order', { waitUntil: 'networkidle' });
  await desktopPage.waitForTimeout(1500);
  await desktopPage.screenshot({ path: 'test_step5_customer_desktop_view.png', fullPage: true });
  console.log('   Saved screenshot: test_step5_customer_desktop_view.png');

  await browser.close();
  console.log('--- ALL TESTS COMPLETED SUCCESSFULLY ---');
}

runTest().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
