const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  
  console.log('Testing http://192.168.29.236:4000/admin...');
  await page.goto('http://192.168.29.236:4000/admin', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  const text = await page.locator('text=Total Revenue').locator('..').innerText();
  console.log('Revenue text:', JSON.stringify(text));

  const orderCards = await page.locator('span:has-text("ORD-")').allInnerTexts();
  console.log('Order cards:', orderCards);

  await page.screenshot({ path: 'screenshots/mobile_new_wifi_ip_verified.png' });
  console.log('Screenshot saved to screenshots/mobile_new_wifi_ip_verified.png');

  await browser.close();
})();
