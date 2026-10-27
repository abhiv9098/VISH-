const { chromium } = require('@playwright/test');

async function testCheckout() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));

  await page.goto('http://localhost:4000/order?productId=p1&qty=1', { waitUntil: 'networkidle' });
  console.log('URL 1:', page.url());

  // Step 1: Proceed to Address
  const step1Btn = page.locator('button:has-text("Proceed to Address"), button:has-text("पते पर आगे बढ़ें")').first();
  await step1Btn.click();
  console.log('Clicked Proceed to Address');
  await page.waitForTimeout(1000);

  // Step 2: Fill address using robust selectors
  const nameInput = page.locator('form input[type="text"]').first();
  await nameInput.fill('Abhishek Sharma');

  const phoneInput = page.locator('form input[type="tel"]').first();
  await phoneInput.fill('9893249212');

  const addrInput = page.locator('form textarea').first();
  await addrInput.fill('Near Vishwakarma Mandir, Sonkach, Dewas, Madhya Pradesh');

  // Submit Step 2
  const step2Btn = page.locator('form button[type="submit"]').first();
  await step2Btn.click();
  console.log('Clicked Proceed to Payment');
  await page.waitForTimeout(1500);

  // Step 3: Click COD option
  const codRadio = page.locator('input[type="radio"][value="cod"]').first();
  if (await codRadio.isVisible()) {
    await codRadio.check();
  } else {
    const codText = page.locator('text="Cash on Delivery", text="कैश ऑन डिलीवरी"').first();
    await codText.click();
  }
  console.log('Selected COD');
  await page.waitForTimeout(500);

  // Click Confirm & Place Order
  const submitBtn = page.locator('button:has-text("Confirm & Place Order"), button:has-text("ऑर्डर कन्फ़र्म करें")').first();
  await submitBtn.click();
  console.log('Clicked Confirm & Place Order');

  // Wait for newOrder URL
  await page.waitForURL(/.*newOrder=.*/, { timeout: 15000 });
  console.log('SUCCESS! Navigated to:', page.url());

  await page.screenshot({ path: 'test_order_placed_success.png', fullPage: true });
  console.log('Captured screenshot test_order_placed_success.png');

  await browser.close();
}

testCheckout().catch(console.error);
