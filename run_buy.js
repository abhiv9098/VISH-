const { chromium } = require('@playwright/test');
const path = require('path');

async function runBuyFlow() {
  console.log('Starting Playwright browser for Buy Flow E2E...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 420, height: 850 } // Mobile view matching screenshot
  });
  const page = await context.newPage();

  const customerName = 'Abhi Sharma (Live Buyer)';
  const customerPhone = '9876543210';
  const customerAddress = 'Plot 104, Green Avenue, Near Atta Mandir, Sector 15';
  const customerCity = 'Gurugram';
  const customerPincode = '122001';

  try {
    // 1. Visit Home Page in English
    console.log('1. Navigating to Home Page...');
    await page.goto('http://localhost:4000', { waitUntil: 'networkidle' });
    await page.screenshot({ path: 'screenshot_lang_english.png' });
    console.log('Saved screenshot_lang_english.png (English Home)');

    // 2. Click Hindi button
    console.log('2. Switching to Hindi...');
    const hindiBtn = page.locator('button[aria-label="Hindi"]');
    await hindiBtn.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'screenshot_lang_hindi.png' });
    console.log('Saved screenshot_lang_hindi.png (Hindi Home)');

    // 3. Click English button to switch back to English
    console.log('3. Switching back to English for Purchase...');
    const englishBtn = page.locator('button[aria-label="English"]');
    await englishBtn.click();
    await page.waitForTimeout(500);

    // 4. Click "Buy Now" on the first product card
    console.log('4. Clicking "Buy Now" button...');
    const buyBtn = page.locator('button:has-text("Buy Now"), button:has-text("अभी खरीदें")').first();
    await buyBtn.click();
    await page.waitForURL(/\/checkout|\/order/, { timeout: 10000 });
    console.log('Navigated to:', page.url());

    // 5. In Step 1 of Checkout, proceed to Address
    console.log('5. Proceeding to Address step...');
    const proceedToAddrBtn = page.locator('button:has-text("Proceed to Address"), button:has-text("पते पर आगे बढ़ें")').first();
    await proceedToAddrBtn.waitFor({ state: 'visible', timeout: 10000 });
    await proceedToAddrBtn.click();

    // 6. Fill Address Details
    console.log('6. Filling Customer Address Details...');
    const nameInput = page.locator('input[placeholder*="Rahul Sharma"], input[placeholder*="राहुल शर्मा"]').first();
    await nameInput.waitFor({ state: 'visible', timeout: 10000 });
    await nameInput.fill(customerName);

    const phoneInput = page.locator('input[type="tel"]').first();
    await phoneInput.fill(customerPhone);

    const addrInput = page.locator('textarea').first();
    await addrInput.fill(customerAddress);

    const cityInput = page.locator('input[placeholder*="Gurugram"]').first();
    await cityInput.fill(customerCity);

    const pinInput = page.locator('input[placeholder*="122001"]').first();
    await pinInput.fill(customerPincode);

    await page.screenshot({ path: 'screenshot_buy_2_address.png' });
    console.log('Saved screenshot_buy_2_address.png');

    // 7. Proceed to Payment
    console.log('7. Proceeding to Payment...');
    const proceedToPayBtn = page.locator('button:has-text("Proceed to Payment"), button:has-text("भुगतान पर आगे बढ़ें")').first();
    await proceedToPayBtn.click();

    // 9. Select Payment Method (COD)
    console.log('9. Selecting Cash on Delivery (COD)...');
    const codOption = page.locator('input[value="cod"]').first();
    await codOption.waitFor({ state: 'attached', timeout: 10000 });
    await codOption.check();
    await page.screenshot({ path: 'screenshot_buy_4_payment.png' });
    console.log('Saved screenshot_buy_4_payment.png');

    // 10. Confirm and Place Order!
    console.log('10. Confirming and Placing Order...');
    const confirmBtn = page.locator('button:has-text("Confirm & Place Order"), button:has-text("ऑर्डर कन्फ़र्म करें")').first();
    await confirmBtn.click();

    // 11. Wait for redirection to My Orders page
    console.log('11. Waiting for redirection to My Orders...');
    await page.waitForURL(/\/order/, { timeout: 15000 });
    await page.waitForTimeout(2000); // Wait for tracking animation
    await page.screenshot({ path: 'screenshot_buy_5_order_success.png' });
    console.log('Saved screenshot_buy_5_order_success.png');

    // 12. Open Admin Panel to verify order in backend
    console.log('12. Checking Admin Orders Panel...');
    const adminPage = await context.newPage();
    await adminPage.goto('http://localhost:4000/admin/orders', { waitUntil: 'networkidle' });
    await adminPage.waitForSelector(`text=${customerName}`, { timeout: 10000 });
    await adminPage.screenshot({ path: 'screenshot_buy_6_admin_order.png' });
    console.log('Saved screenshot_buy_6_admin_order.png');

    console.log('\n--- BUY FLOW & LANGUAGE E2E TEST COMPLETED SUCCESSFULLY! ---');
  } catch (error) {
    console.error('Error during Buy flow:', error);
    await page.screenshot({ path: 'screenshot_buy_error.png' });
  } finally {
    await browser.close();
  }
}

runBuyFlow();
