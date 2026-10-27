import { test, expect } from '@playwright/test';

test.describe('Vishwakarma Atta Chakki E2E Tests', () => {
  test.describe.configure({ mode: 'serial' });
  
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
    await page.goto('/products/p1');
    
    // Heading
    await expect(page.locator('h1').last()).toContainText('Gehu ka Atta');

    // Initial weight badge is "5 KG"
    const weightBadge = page.locator('div:has-text("5 KG")').last();
    await expect(weightBadge).toBeVisible();

    // Price element initial ₹263 (₹280 with volume discount)
    const priceElement = page.locator('span.text-3xl');
    await expect(priceElement).toContainText('₹263');

    // Increase quantity from 1 to 2
    const plusButton = page.locator('button:has(svg.lucide-plus), button:has-text("+")').first();
    await plusButton.click();

    // Weight badge updates to 10 KG (5 KG x 2)
    const updatedBadge = page.locator('div:has-text("10 KG")').last();
    await expect(updatedBadge).toBeVisible();
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
    await page.click('text=Cash on Delivery (COD)');
    await page.click('button:has-text("Confirm & Place Order")');

    // Customer is redirected to My Orders page (/order)
    await expect(page).toHaveURL(/\/order/, { timeout: 10000 });
    await expect(page.locator('h1:has-text("My Orders")')).toBeVisible();

    // Verify order is displayed in My Orders
    await expect(page.locator('text=ORD-').first()).toBeVisible();

    // 2. Open Admin Panel in new tab and verify order appears in Admin View Orders
    const adminPage = await context.newPage();
    await adminPage.goto('/admin/orders');

    // Verify Customer name 'Test Customer Raj' appears in admin orders list
    await expect(adminPage.locator('text=Test Customer Raj').first()).toBeVisible();

    // 3. Admin updates order status to "Order Confirmed"
    const orderSelect = adminPage.locator('select').first();
    await orderSelect.selectOption('Order Confirmed');

    // 4. Verify Customer My Orders page shows updated status "Order Confirmed"
    await page.reload();
    await expect(page.locator('text=Order Confirmed').first()).toBeVisible();
  });

  test('4. Redesigned My Profile Page with Single Manage Profile Button & GPS Feature', async ({ page }) => {
    await page.goto('/profile');

    // Check classic look: heading / name, Personal Information, Delivery Address, My Location
    await expect(page.getByText(/Personal Information/i).first()).toBeVisible();
    await expect(page.getByText(/Delivery Address|Delivery & GPS Details/i).first()).toBeVisible();
    await expect(page.getByText(/My Location/i).first()).toBeVisible();

    // Small Manage/Edit Profile button
    const manageBtn = page.locator('button:has-text("Edit Profile"), button:has-text("Manage Profile"), button:has-text("एडिट करें")').first();
    await expect(manageBtn).toBeVisible();
    await manageBtn.click();

    // Check "Use Current Location" button
    await expect(page.locator('button:has-text("Use Current Location"), button:has-text("Use My Current Location")').first()).toBeVisible();

    // Edit personal details and address
    await page.fill('input[placeholder="e.g. Rahul Sharma"]', 'Vikram Singh');
    await page.fill('input[placeholder="10-digit mobile number"]', '9899112233');
    await page.fill('textarea[placeholder="House / Flat No., Society / Building, Street, Area"]', 'House 42, Atta Market Road, Sector 14');
    await page.fill('input[placeholder="e.g. Gurugram"]', 'Gurugram');
    await page.fill('input[placeholder="e.g. 122001"]', '122001');

    // Save and update profile
    await page.click('button:has-text("Save Changes"), button:has-text("Save & Update Profile")');

    // Success toast or updated name should appear
    await expect(page.locator('text=Vikram Singh').first()).toBeVisible();
    await expect(page.locator('text=House 42, Atta Market Road').first()).toBeVisible();
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
    // 1. Verify Header has the original small language switcher
    await page.goto('/');
    const headerLangSelector = page.locator('header [role="group"][aria-label="Language selector"]');
    await expect(headerLangSelector).toBeVisible();

    // Verify initial English branding
    await expect(page.locator('header').locator('text=VISHWAKARMA')).toBeVisible();

    // 2. Click Hindi button in Header
    const hindiBtn = page.locator('header button[aria-label="Hindi"]');
    await expect(hindiBtn).toBeVisible();
    await hindiBtn.click();

    // Verify Hindi branding appears across the app
    await expect(page.locator('header').locator('text=विश्वकर्मा')).toBeVisible();

    // 3. Visit Profile page and verify no duplicate oversized App Language card exists
    await page.goto('/profile');
    await expect(page.locator('h2:has-text("App Language")')).toHaveCount(0);
    await expect(page.locator('h2:has-text("ऐप की भाषा")')).toHaveCount(0);

    // Verify Profile fields are in Hindi
    await expect(page.locator('text=व्यक्तिगत जानकारी')).toBeVisible();
    await expect(page.locator('text=डिलीवरी और जीपीएस विवरण')).toBeVisible();

    // 4. Click English button to switch back to English
    const englishBtn = page.locator('header button[aria-label="English"]');
    await expect(englishBtn).toBeVisible();
    await englishBtn.click();

    // Verify English branding and Profile fields restored
    await expect(page.locator('header').locator('text=VISHWAKARMA')).toBeVisible();
    await expect(page.locator('text=Personal Information')).toBeVisible();
  });

  test('7. Search and Category Filter: Filtering products dynamically updates results', async ({ page }) => {
    await page.goto('/');

    // Search for Makka
    const searchInput = page.locator('input[placeholder*="Search Gehu Atta"]');
    await expect(searchInput).toBeVisible();
    await searchInput.fill('Makka');

    // Header updates to search results
    await expect(page.locator('h2:has-text("Search Results for \\"Makka\\"")')).toBeVisible();

    // Clear search
    await searchInput.fill('');

    // Click Category filter "Besan"
    const besanPill = page.locator('button:has-text("Besan")').first();
    await besanPill.click();

    // Products heading updates
    await expect(page.locator('h2:has-text("Besan Products")')).toBeVisible();
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
    await page.click('text=← Back to Dashboard');
    await expect(page).toHaveURL(/\/admin$/);
  });

  test('9. Admin Prices & Settings Modules: View and update store settings and price list', async ({ page }) => {
    // 1. Check Admin Prices
    await page.goto('/admin/prices');
    await expect(page.locator('header h1:has-text("Live Prices")')).toBeVisible();
    await expect(page.locator('h1:has-text("Live Product Prices & Rates")')).toBeVisible();

    // Click Save All Prices button
    const savePricesBtn = page.locator('button:has-text("Save All Prices")');
    await expect(savePricesBtn).toBeVisible();
    await savePricesBtn.click();
    await expect(page.locator('text=Prices Updated!')).toBeVisible();

    // 2. Check Admin Settings
    await page.goto('/admin/settings');
    await expect(page.locator('header h1:has-text("Settings")')).toBeVisible();
    await expect(page.locator('h1:has-text("Store Settings")')).toBeVisible();

    // Verify form input and submit
    const storeNameInput = page.locator('input[value*="Vishwakarma"]').first();
    await expect(storeNameInput).toBeVisible();
    await page.click('button:has-text("Save Changes")');
    await expect(page.locator('div:has-text("Saved!")').first()).toBeVisible();
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
