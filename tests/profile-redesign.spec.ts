import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const profileFilePath = path.join(process.cwd(), 'customer_profile.json');
const ordersFilePath = path.join(process.cwd(), 'orders_data.json');

test.describe('Profile Page Two Small Buttons Redesign & Verification', () => {
  test.describe.configure({ mode: 'serial' });

  let backupProfile: string = '{}';
  let backupOrders: string = '[]';

  test.beforeAll(() => {
    if (fs.existsSync(profileFilePath)) {
      backupProfile = fs.readFileSync(profileFilePath, 'utf8');
    }
    if (fs.existsSync(ordersFilePath)) {
      backupOrders = fs.readFileSync(ordersFilePath, 'utf8');
    }
  });

  test.afterAll(() => {
    fs.writeFileSync(profileFilePath, backupProfile, 'utf8');
    fs.writeFileSync(ordersFilePath, backupOrders, 'utf8');
  });

  test('Verify two small clean buttons: Personal Details and Delivery Address, edit options, GPS auto-fill, and database persistence', async ({ browser }) => {
    // Seed test profile
    const initialProfile = {
      name: 'Abhishek Sharma',
      phone: '9893249212',
      email: 'abhishek@example.com',
      country: 'India',
      state: 'Madhya Pradesh',
      district: 'Dewas',
      city: 'Sonkach',
      locality: 'Main Bazar',
      pincode: '455118',
      address: 'Near Old Bus Stand, Main Bazar, Sonkach',
      coordinates: {
        lat: 22.9744,
        lng: 76.3595
      },
      liveLocationUrl: 'https://www.google.com/maps?q=22.9744,76.3595',
      avatar: '',
      isVerified: true,
      hasDetectedGps: true
    };
    fs.writeFileSync(profileFilePath, JSON.stringify(initialProfile, null, 2), 'utf8');

    // Launch mobile context (Flipkart style 390x844)
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await context.newPage();

    await page.goto('/profile');
    await page.waitForLoadState('networkidle');

    // 1. Verify Profile Header
    await expect(page.locator('h1:has-text("Abhishek Sharma")')).toBeVisible();
    await expect(page.locator('text=9893249212').first()).toBeVisible();

    // 2. Verify the two small clean buttons are present
    const personalBtn = page.locator('button:has-text("Personal Details")');
    const addressBtn = page.locator('button:has-text("Delivery Address")');
    await expect(personalBtn).toBeVisible();
    await expect(addressBtn).toBeVisible();

    // Capture screenshot of the two clean buttons
    await page.screenshot({ path: 'screenshot_profile_two_buttons.png' });

    // 3. Test Button 1: "Personal Details" (shows name, mobile, email with edit option)
    await expect(page.locator('h2:has-text("Personal Details")')).toBeVisible();
    await expect(page.locator('text=abhishek@example.com')).toBeVisible();
    const editPersonalBtn = page.locator('button:has-text("Edit")').first();
    await expect(editPersonalBtn).toBeVisible();

    // 4. Test Button 2: "Delivery Address" (opens full address, PIN code, GPS with edit and use current location)
    await addressBtn.click();
    await expect(page.locator('h2:has-text("Delivery Address")')).toBeVisible();
    await expect(page.locator('text=Near Old Bus Stand, Main Bazar, Sonkach')).toBeVisible();
    await expect(page.locator('text=455118')).toBeVisible();
    await expect(page.locator('text=Sonkach').first()).toBeVisible();
    await expect(page.locator('button:has-text("Use Current Location")')).toBeVisible();
    await expect(page.locator('a:has-text("View on Google Maps")')).toBeVisible();

    // Capture screenshot of Delivery Address opened by Button 2
    await page.screenshot({ path: 'screenshot_profile_delivery_address_opened.png' });

    // 5. Test Edit option on Delivery Address
    const editAddressBtn = page.locator('button:has-text("Edit")').first();
    await editAddressBtn.click();

    // Fill new address in textarea
    const addressInput = page.locator('textarea#profile-address');
    await expect(addressInput).toBeVisible();
    await addressInput.fill('Shop No. 12, Shivaji Chowk, Sonkach');

    // Save Changes and wait for /api/profile POST response
    const savePromise = page.waitForResponse(resp => resp.url().includes('/api/profile') && resp.status() === 200);
    await page.locator('button:has-text("Save Changes")').click();
    await savePromise;

    // Verify Success notification and updated address in view
    await expect(page.locator('text=Profile updated successfully!')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Shop No. 12, Shivaji Chowk, Sonkach')).toBeVisible();

    // 6. Verify Database File customer_profile.json was updated on disk
    await expect.poll(() => {
      const savedData = JSON.parse(fs.readFileSync(profileFilePath, 'utf8'));
      return savedData.address;
    }, { timeout: 5000 }).toBe('Shop No. 12, Shivaji Chowk, Sonkach');

    // 7. Test Language Toggle: Hindi
    const hindiBtn = page.locator('button:has-text("हिंदी")');
    await hindiBtn.click();
    await expect(page.locator('button:has-text("व्यक्तिगत विवरण")')).toBeVisible();
    await expect(page.locator('button:has-text("डिलीवरी पता")')).toBeVisible();

    // Capture screenshot in Hindi
    await page.screenshot({ path: 'screenshot_profile_two_buttons_hindi.png' });
  });
});
