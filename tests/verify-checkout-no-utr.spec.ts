import { test, expect } from '@playwright/test';

test.describe('Checkout UPI Payment Screen', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('should not display Transaction ID or UTR input field', async ({ page }) => {
    // Navigate directly to the order checkout flow with a product
    await page.goto('http://localhost:4000/order?productId=p1&qty=1');
    await page.waitForLoadState('networkidle');

    // Step 1: Click "Proceed to Address"
    const proceedToAddressBtn = page.getByRole('button', { name: /Proceed to Address|पता दर्ज करें/i });
    await expect(proceedToAddressBtn).toBeVisible();
    await proceedToAddressBtn.click();
    await page.waitForTimeout(500);

    // Step 2: Fill address fields
    const nameInput = page.locator('input[placeholder*="Name" i], input[type="text"]').first();
    if (await nameInput.isVisible()) {
      await nameInput.fill('Abhishek Verma');
    }
    const phoneInput = page.locator('input[type="tel"]').first();
    if (await phoneInput.isVisible()) {
      await phoneInput.fill('9893249212');
    }
    const addrInput = page.locator('textarea, input[placeholder*="Address" i]').first();
    if (await addrInput.isVisible()) {
      await addrInput.fill('Flat 402, Green Park Avenue');
    }

    // Step 2 -> Step 3: Click "Proceed to Payment"
    const proceedToPaymentBtn = page.getByRole('button', { name: /Proceed to Payment|भुगतान के लिए आगे बढ़ें/i });
    await expect(proceedToPaymentBtn).toBeVisible();
    await proceedToPaymentBtn.click();
    await page.waitForTimeout(600);

    // Step 3 Payment: Verify UPI payment option is active
    await expect(page.locator('text=/Pay Online|UPI/i').first()).toBeVisible({ timeout: 5000 });

    // Assert that the Transaction ID / UTR input field (placeholder "123456789012") does NOT exist
    const txnInput = page.locator('input[placeholder*="123456789012"]');
    await expect(txnInput).toHaveCount(0);

    const utrLabel = page.locator('text="Transaction ID / UTR"');
    await expect(utrLabel).toHaveCount(0);

    // Assert that the QR code is visible
    const upiQr = page.locator('img[alt*="UPI QR Code"]');
    await expect(upiQr).toBeVisible();

    // Assert that the Copy UPI ID button exists
    const copyBtn = page.getByRole('button', { name: /Copy|कॉपी/i });
    await expect(copyBtn).toBeVisible();

    // Capture screenshot of the verified payment UI
    await page.screenshot({ path: 'screenshots/checkout-payment-screen-no-utr.png', fullPage: true });
  });
});
