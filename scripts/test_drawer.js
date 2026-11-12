const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

  page.on('console', msg => console.log('LOG:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('ERROR:', err.message));

  await page.goto('http://192.168.29.236:4000/admin', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  const isHydrated = await page.evaluate(() => {
    return !!window.__NEXT_DATA__ || !!window.__next_f;
  });
  console.log('Is Next hydrated object present:', isHydrated);

  await browser.close();
})();
