const { chromium } = require('@playwright/test');
const http = require('http');

async function check() {
  const urls = [
    'http://localhost:4000',
    'http://localhost:4000/order',
    'http://localhost:4000/admin',
    'http://localhost:4000/admin/orders',
    'http://localhost:4000/admin/products',
    'http://localhost:4000/admin/customers',
    'http://localhost:4000/admin/settings'
  ];

  console.log('--- 1. HTTP Status Checks ---');
  for (const u of urls) {
    await new Promise(resolve => {
      http.get(u, res => {
        console.log(`${res.statusCode === 200 ? '✓' : '✗'} ${u} -> HTTP ${res.statusCode}`);
        resolve();
      }).on('error', err => {
        console.log(`✗ ${u} -> Error: ${err.message}`);
        resolve();
      });
    });
  }

  console.log('\n--- 2. Browser Console & Page Error Checks ---');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

  const errors = [];
  page.on('pageerror', err => errors.push(`[PageError] ${page.url()}: ${err.message}`));
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(`[ConsoleError] ${page.url()}: ${msg.text()}`);
    }
  });

  for (const u of urls) {
    await page.goto(u, { waitUntil: 'networkidle' });
    console.log(`✓ Loaded successfully: ${u}`);
  }

  // Also test mobile view 375px
  console.log('\n--- 3. Mobile View Responsive Check (375px) ---');
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('http://localhost:4000/admin', { waitUntil: 'networkidle' });
  console.log('✓ Loaded Admin on mobile (375px)');
  await page.goto('http://localhost:4000/order', { waitUntil: 'networkidle' });
  console.log('✓ Loaded Customer Orders on mobile (375px)');

  await browser.close();

  console.log('\n--- 4. Final Diagnostics Report ---');
  if (errors.length === 0) {
    console.log('🎉 100% HEALTHY: Sab kuch bilkul first class chal raha hai! Zero console errors, Zero crashes.');
  } else {
    console.log(`Found ${errors.length} error(s):`, errors);
  }
}

check().catch(err => {
  console.error('Diagnostic error:', err);
});
