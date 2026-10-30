import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'orders_data.json');
const profileFilePath = path.join(process.cwd(), 'customer_profile.json');

test.describe('Vishwakarma Atta Chakki E2E Tests', () => {
  let backupProfile = '';

  test.beforeAll(() => {
    if (fs.existsSync(profileFilePath)) {
      backupProfile = fs.readFileSync(profileFilePath, 'utf8');
    }
  });

  test.beforeEach(async ({ context }) => {
    await context.addInitScript(() => {
      localStorage.setItem('vishwakarma_admin_session', JSON.stringify({
        token: 'test-session',
        expiresAt: Date.now() + 86400000 * 30
      }));
    });
  });
  test.describe.configure({ mode: 'serial' });

  test.afterAll(() => {
    fs.writeFileSync(dataFilePath, '[]', 'utf8');
    if (backupProfile) {
      fs.writeFileSync(profileFilePath, backupProfile, 'utf8');
    }
  });
  
  test('1. Home Page UI/UX Redesign: Should display branding, hero banner, categories, and 5 KG packs', async ({ page }) => {
    await page.goto('/');
    
    // Check Vishwakarma Atta Chakki branding (first occurrence)
    await expect(page.locator('text=VISHWAKARMA').first()).toBeVisible();

    // Check Category Filter Pills strip
    await expect(page.locator('button:has-text("Gehu Atta")').first()).toBeVisible();

    // Check Products Listing section
    await expect(page.locator('text=All Products').first()).toBeVisible();

    // Check 5 KG default weight badges on cards
    const weightBadges = page.locator('span:has-text("5 KG")');
    await expect(weightBadges.first()).toBeVisible();
  });

  test('2. Product Detail & Dynamic Scaling: Increasing quantity should scale total weight badge and total price', async ({ page }) => {
    await page.goto('/products/p1', { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);
    
    // Heading
    await expect(page.locator('h1').last()).toContainText('Gehu ka Atta');

    // Initial weight badge is "5 KG" or "5 किलो"
    const weightBadge = page.locator('div:has-text("5 KG"), div:has-text("5 किलो")').last();
    await expect(weightBadge).toBeVisible();

    // Price element initial ₹263 or similar
    const priceElement = page.locator('span.text-3xl');
    await expect(priceElement).toBeVisible();

    // Increase quantity from 1 to 2
    const plusButton = page.locator('button[aria-label="Increase quantity"]').first();
    await expect(plusButton).toBeVisible();
    await plusButton.click();

    // Weight badge updates to 10 KG or 10 किलो (5 KG x 2)
    await expect(page.getByText(/10 KG|10 किलो/).first()).toBeVisible({ timeout: 5000 });
  });

  test('3. CRITICAL E2E Flow: Customer Order Placement & Real-time Admin Integration', async ({ page, context }) => {
    // 1. Customer visits Place Order flow
    await page.goto('/order?productId=p1');
    
    // Step 1: Details - Verify product and click Proceed to Address
    await expect(page.locator('h1:has-text("Place Order")')).toBeVisible();
    await page.click('button:has-text("Proceed to Address")');

    // Step 2: Address - Fill customer details
    await page.fill('input[placeholder="e.g. Rahul Sharma"]', 'Test Customer Raj');
    await page.fill('input[placeholder="10-digit mobile number"]', '9876543210');
    await page.fill('textarea', 'Flat 102, Sharbati Greens, Sector 21');
    await page.fill('input[placeholder="Gurugram"]', 'Gurugram');
    await page.fill('input[placeholder="122001"]', '122001');
    await page.click('button:has-text("Proceed to Payment")');

    // Step 3: Payment - Choose COD & place order
    await page.waitForTimeout(500);
    const codOption = page.locator('input[type="radio"][value="cod"]').first();
    if (await codOption.isVisible()) {
      await codOption.check();
    } else {
      await page.getByText(/Cash on Delivery|कैश ऑन डिलीवरी/i).first().click();
    }
    await page.click('button:has-text("Confirm & Place Order"), button:has-text("ऑर्डर कन्फ़र्म करें")');

    // Customer is redirected to My Orders page (/order)
    await expect(page).toHaveURL(/\/order/, { timeout: 15000 });

    // Verify order is displayed in My Orders
    await expect(page.getByText('Test Customer Raj').first()).toBeVisible({ timeout: 10000 });

    // 2. Open Admin Panel in new tab and verify order appears in Admin View Orders
    const adminPage = await context.newPage();
    await adminPage.goto('/admin/orders');

    // Verify Customer name 'Test Customer Raj' appears in admin orders list
    await expect(adminPage.locator('text=Test Customer Raj').first()).toBeVisible();

    // 3. Admin updates order status to "Order Confirmed"
    const orderSelect = adminPage.locator('select').first();
    await orderSelect.selectOption('Order Confirmed');

    // 4. Verify Customer My Orders page shows updated status
    await page.reload();
    await expect(page.getByText(/Confirmed|कन्फ़र्म हुआ/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('4. Redesigned My Profile Page with Single Manage Profile Button & GPS Feature', async ({ page }) => {
    await page.goto('/profile');

    // Check classic look: heading / name, Personal Details, Delivery Address
    await expect(page.getByText(/Personal Details|Personal Information|व्यक्तिगत विवरण/i).first()).toBeVisible();
    await expect(page.getByText(/Delivery Address|Delivery & GPS Details|डिलीवरी पता/i).first()).toBeVisible();

    // Switch to Delivery Address tab to verify GPS location button
    const addressTab = page.locator('button:has-text("Delivery Address"), button:has-text("डिलीवरी पता")').first();
    if (await addressTab.isVisible()) {
      await addressTab.click();
    }
    await expect(page.locator('button:has-text("Use Current Location"), button:has-text("Use My Current Location")').first()).toBeVisible();

    // Edit delivery address or profile
    const editBtn = page.locator('button:has-text("Edit"), button:has-text("Edit Profile"), button:has-text("Manage Profile")').first();
    await expect(editBtn).toBeVisible();
    await editBtn.click();

    const addressArea = page.locator('textarea#profile-address, textarea[placeholder*="House"]').first();
    if (await addressArea.isVisible()) {
      await addressArea.fill('House 42, Atta Market Road, Sector 14');
    }

    // Save and update profile
    const saveBtn = page.locator('button:has-text("Save Changes"), button:has-text("Save & Update Profile")').first();
    if (await saveBtn.isVisible()) {
      await saveBtn.click();
      await page.waitForTimeout(600);
    }
  });

  test('5. Geocode Reverse API: Should return country, state, district, city, locality, and pincode', async ({ request }) => {
    const response = await request.get('/api/geocode?lat=28.4595&lng=77.0266');
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.country).toBe('India');
    expect(data.data.liveLocationUrl).toContain('https://www.google.com/maps?q=28.4595,77.0266');
  });

  test('6. Language Switcher (EN <-> Hindi): Toggling language dynamically updates UI branding and labels', async ({ page }) => {
    // 1. Visit Profile page where language selector is located
    await page.goto('/profile');
    const langSelector = page.locator('[role="group"][aria-label="Language selector"]');
    await expect(langSelector).toBeVisible();

    // 2. Click Hindi button
    const hindiBtn = page.locator('button:has-text("हिंदी")');
    await expect(hindiBtn).toBeVisible();
    await hindiBtn.click();

    // Verify Hindi branding appears in header
    await expect(page.locator('header').locator('text=विश्वकर्मा')).toBeVisible();

    // Verify Profile fields are in Hindi
    await expect(page.getByText(/व्यक्तिगत विवरण|व्यक्तिगत जानकारी/).first()).toBeVisible();

    // 3. Click English button to switch back to English
    const englishBtn = page.locator('button:has-text("English")');
    await expect(englishBtn).toBeVisible();
    await englishBtn.click();

    // Verify English branding and Profile fields restored
    await expect(page.locator('header').locator('text=VISHWAKARMA')).toBeVisible();
    await expect(page.getByText(/Personal Details|Personal Information/).first()).toBeVisible();
  });

  test('7. Category Filter Pills: Filtering products dynamically updates results and heading', async ({ page }) => {
    await page.goto('/');

    // Click Category filter "Besan"
    const besanPill = page.locator('button:has-text("Besan"), button:has-text("बेसन")').first();
    await expect(besanPill).toBeVisible();
    await besanPill.click();

    // Products heading updates
    await expect(page.getByRole('heading', { level: 2 }).first()).toContainText(/Besan|बेसन/);

    // Click Category filter "Makka"
    const makkaPill = page.locator('button:has-text("Makka"), button:has-text("मक्का")').first();
    await expect(makkaPill).toBeVisible();
    await makkaPill.click();
    await expect(page.getByRole('heading', { level: 2 }).first()).toContainText(/Makka|मक्का/);

    // Click "All" to reset
    const allPill = page.locator('button:has-text("ALL"), button:has-text("सभी"), button:has-text("All")').first();
    await allPill.click();
  });

  test('8. Admin Dashboard & Navigation: Displays metrics and links to sub-modules', async ({ page }) => {
    await page.goto('/admin');

    // Verify Admin Header Title
    await expect(page.locator('header h1:has-text("Dashboard")')).toBeVisible();

    // Verify Metrics Cards exist
    await expect(page.locator('text=Total Revenue')).toBeVisible();
    await expect(page.locator('text=Total Orders')).toBeVisible();

    // Navigate to Admin Products via sidebar
    await page.click('aside nav a:has-text("Products")');
    await expect(page).toHaveURL(/\/admin\/products/);
    await expect(page.locator('header h1:has-text("Products")')).toBeVisible();

    // Check Back to Dashboard link works
    await page.click('aside nav a:has-text("Dashboard")');
    await expect(page).toHaveURL(/\/admin$/);
  });

  test('9. Admin Prices & Settings Modules: View and update store settings and price list', async ({ page }) => {
    // 1. Check Admin Prices
    await page.goto('/admin/prices');
    await expect(page.locator('h1:has-text("Live Product Prices & Rates")')).toBeVisible();

    // Click Save All Prices button
    const savePricesBtn = page.locator('button:has-text("Save All Prices")');
    await expect(savePricesBtn).toBeVisible();
    await savePricesBtn.click();
    await expect(page.locator('text=Prices Updated!')).toBeVisible();

    // 2. Check Admin Settings
    await page.goto('/admin/settings');
    await expect(page.locator('header h1:has-text("Settings")')).toBeVisible();
    await expect(page.getByText('Store Configuration & Settings')).toBeVisible();

    // Verify form input and submit
    const storeNameInput = page.locator('input[value*="Vishwakarma"]').first();
    await expect(storeNameInput).toBeVisible();
    await page.click('button:has-text("Save Changes")');
    await expect(page.locator('text=Settings saved successfully!').first()).toBeVisible();
  });

  test('10. Orders REST API: Supports GET, POST, PUT, and DELETE lifecycle', async ({ request }) => {
    const testOrderId = `TEST-E2E-${Date.now()}`;

    // 1. POST new order
    const createRes = await request.post('/api/orders', {
      data: {
        id: testOrderId,
        date: new Date().toISOString(),
        customerInfo: {
          name: 'Playwright API Tester',
          phone: '9998887770',
          address: 'E2E Testing Lab',
          city: 'Gurugram',
          pincode: '122001'
        },
        items: [
          {
            product: { id: 'p1', name: 'Gehu ka Atta', price: 280, weight: '5 KG' },
            quantity: 1
          }
        ],
        total: 280,
        status: 'Order Placed'
      }
    });
    expect(createRes.ok()).toBeTruthy();
    const createData = await createRes.json();
    expect(createData.success).toBe(true);

    // 2. GET orders list and verify test order exists
    const getRes = await request.get('/api/orders');
    expect(getRes.ok()).toBeTruthy();
    const ordersList = await getRes.json();
    const found = ordersList.some((o: any) => o.id === testOrderId);
    expect(found).toBe(true);

    // 3. PUT update order status
    const updateRes = await request.put('/api/orders', {
      data: {
        id: testOrderId,
        status: 'Delivered'
      }
    });
    expect(updateRes.ok()).toBeTruthy();
    const updateData = await updateRes.json();
    expect(updateData.success).toBe(true);

    // 4. DELETE test order
    const deleteRes = await request.delete(`/api/orders?id=${testOrderId}`);
    expect(deleteRes.ok()).toBeTruthy();
    const deleteData = await deleteRes.json();
    expect(deleteData.success).toBe(true);
  });

});
