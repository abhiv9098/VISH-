import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'orders_data.json');

test.describe('Compact Admin Order Cards Test Suite', () => {
  test.describe.configure({ mode: 'serial' });
  let originalOrders = '[]';

  const resetOrders = () => {
    const sampleOrders = [
      {
        id: 'ORD-9988776655',
        date: new Date().toISOString(),
        status: 'Order Placed',
        total: 560,
        advancePaid: 0,
        remainingAmount: 560,
        deliveryType: 'express',
        estimatedDelivery: 'Within 2 hours',
        paymentMethod: 'cod',
        items: [
          {
            product: {
              id: 'p1',
              name: 'Gehu ka Atta (Whole Wheat Flour)',
              weight: '5 KG',
              price: 280
            },
            quantity: 2
          }
        ],
        customerInfo: {
          name: 'Ramesh Sharma',
          phone: '9893012345',
          address: 'House 12, Shivaji Nagar, Sonkach, Dewas, 455118',
          city: 'Sonkach',
          district: 'Dewas',
          state: 'Madhya Pradesh',
          pincode: '455118',
          coordinates: { lat: 22.9745, lng: 76.3595 },
          liveLocationUrl: 'https://www.google.com/maps?q=22.9745,76.3595'
        }
      },
      {
        id: 'ORD-5544332211',
        date: new Date().toISOString(),
        status: 'Order Confirmed',
        total: 340,
        advancePaid: 340,
        remainingAmount: 0,
        deliveryType: 'standard',
        estimatedDelivery: 'Tomorrow Morning',
        paymentMethod: 'online',
        items: [
          {
            product: {
              id: 'p4',
              name: 'Multigrain Atta (7 Grains)',
              weight: '5 KG',
              price: 340
            },
            quantity: 1
          }
        ],
        customerInfo: {
          name: 'Pooja Verma',
          phone: '9826054321',
          address: 'Station Road, Near Bus Stand, Dewas, 455001',
          city: 'Dewas',
          pincode: '455001'
        }
      }
    ];
    fs.writeFileSync(dataFilePath, JSON.stringify(sampleOrders, null, 2), 'utf8');
  };

  test.beforeAll(() => {
    if (fs.existsSync(dataFilePath)) {
      originalOrders = fs.readFileSync(dataFilePath, 'utf8');
    }
  });

  test.beforeEach(() => {
    resetOrders();
  });

  test.afterAll(() => {
    fs.writeFileSync(dataFilePath, originalOrders, 'utf8');
  });

  test('Verify compact order cards on desktop viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/admin/orders');
    await page.waitForLoadState('networkidle');

    // Check order ID is visible
    const orderCard = page.locator('div:has-text("ORD-9988776655")').first();
    await expect(orderCard).toBeVisible();

    // Verify compact header elements
    await expect(page.locator('text=ORD-9988776655').first()).toBeVisible();
    await expect(page.locator('text=NEW').first()).toBeVisible();
    await expect(page.locator('text=Within 2 hours').first()).toBeVisible();

    // Verify compact customer details
    await expect(page.locator('text=Ramesh Sharma').first()).toBeVisible();
    await expect(page.locator('text=9893012345').first()).toBeVisible();
    const callBtn = page.locator('a[href^="tel:9893012345"]').first();
    await expect(callBtn).toBeVisible();
    const waBtn = page.locator('a[href*="9893012345"]').first();
    await expect(waBtn).toBeVisible();

    // Verify compact delivery address & GPS
    await expect(page.locator('text=GPS Active').first()).toBeVisible();
    await expect(page.locator('text=House 12, Shivaji Nagar').first()).toBeVisible();
    const mapLink = page.locator('a:has-text("Open in Maps")').first();
    await expect(mapLink).toBeVisible();

    // Verify compact items & payment
    await expect(page.locator('text=Gehu ka Atta').first()).toBeVisible();
    await expect(page.locator('text=5 KG').first()).toBeVisible();
    await expect(page.locator('text=₹560').first()).toBeVisible();
    await expect(page.locator('text=COD').first()).toBeVisible();

    // Verify action progression buttons
    const confirmBtn = page.locator('button:has-text("Accept & Confirm")').first();
    await expect(confirmBtn).toBeVisible();

    // Check card height is compact (less than 180px on desktop)
    const cardBox = await page.locator('div:has-text("ORD-9988776655")').locator('xpath=ancestor::div[contains(@class, "bg-white") and contains(@class, "rounded-xl")]').first().boundingBox();
    console.log('Desktop Card bounding box height:', cardBox?.height);
    expect(cardBox?.height).toBeLessThan(180);

    // Take screenshot of desktop
    await page.screenshot({ path: 'compact-orders-desktop.png', fullPage: false });
  });

  test('Verify compact order cards on mobile viewport without horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/admin/orders');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('text=ORD-9988776655').first()).toBeVisible();

    // Check for horizontal overflow
    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasHorizontalOverflow).toBe(false);

    // Verify all key actions exist on mobile
    await expect(page.locator('a[href^="tel:"]').first()).toBeVisible();
    await expect(page.locator('a[href*="wa.me"]').first()).toBeVisible();
    await expect(page.locator('a:has-text("Open in Maps")').first()).toBeVisible();
    await expect(page.locator('button:has-text("Accept & Confirm")').first()).toBeVisible();

    // Take screenshot of mobile
    await page.screenshot({ path: 'compact-orders-mobile.png', fullPage: false });
  });

  test('Verify modal details still work', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/admin/orders');
    await page.waitForLoadState('networkidle');

    // Click Eye button to view modal
    const eyeBtn = page.locator('button[title="View Full Details"]').first();
    await eyeBtn.click();

    // Verify modal is open
    await expect(page.locator('h4:has-text("Customer Information")')).toBeVisible();
    await expect(page.locator('h4:has-text("Ordered Items")')).toBeVisible();

    // Close modal
    await page.locator('button:has-text("Close")').click();
    await expect(page.locator('h4:has-text("Customer Information")')).not.toBeVisible();
  });
});
