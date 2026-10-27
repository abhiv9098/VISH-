const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  await page.goto('http://localhost:4000', { waitUntil: 'networkidle' });
  
  // Evaluate in browser context directly
  const clickResult = await page.evaluate(() => {
    const btn = document.querySelector('button[aria-label="Hindi"]');
    if (!btn) return 'BUTTON NOT FOUND';
    btn.click();
    return 'CLICKED';
  });
  console.log('Evaluate click result:', clickResult);

  await page.waitForTimeout(1000);

  const state = await page.evaluate(() => {
    return {
      h1: document.querySelector('header h1')?.innerText,
      localStorage: localStorage.getItem('vishwakarma_lang'),
      btnClasses: document.querySelector('button[aria-label="Hindi"]')?.className
    };
  });
  console.log('State after click:', JSON.stringify(state, null, 2));

  await browser.close();
})();
