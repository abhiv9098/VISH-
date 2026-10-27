import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'orders_data.json');

test.describe('Admin Panel Optimization & Order Flow E2E', () => {
  test.describe.configure({ mode: 'serial' });

  let backupOrders: string = '[]';

  test.beforeAll(() => {
    if (fs.existsSync(dataFilePath)) {
      backupOrders = fs.readFileSync(dataFilePath, 'utf8');
    }
  });

  test.afterAll(() => {
    fs.writeFileSync(dataFilePath, backupOrders, 'utf8');
  });

  test('1. Dashboard displays ONLY new orders with compact cards, ORD number, and readable 6-digit code', async ({ page }) => {
    // Setup test orders in orders_data.json
    const initialOrders = [
      {
        id: 'ORD-NEW-111111',
        date: new Date().toISOString(),
        status: 'Order Placed',
        total: 560,
        advancePaid: 0,
        remainingAmount: 560,
        deliveryType: 'express',
        estimatedDelivery: 'within 2 hours',
        deliveryCode: '654321',
        paymentMethod: 'cod',
        items: [{ product: { id: 'p1', name: 'Gehu ka Atta', price: 280, weight: '5 KG' }, quantity: 2 }],
        customerInfo: {
          name: 'Vikram Singh',
          phone: '9876500001',
          address: 'Sector 23, House 45, Gurugram',
          city: 'Gurugram',
          pincode: '122001'
        }
      },
      {
        id: 'ORD-CONFIRMED-222222',
        date: new Date().toISOString(),
        status: 'Order Confirmed',
        total: 280,
        advancePaid: 280,
        remainingAmount: 0,
        deliveryType: 'standard',
        deliveryCode: '112233',
        paymentMethod: 'online',
        items: [{ product: { id: 'p1', name: 'Gehu ka Atta', price: 280, weight: '5 KG' }, quantity: 1 }],
        customerInfo: {
          name: 'Pooja Sharma',
          phone: '9876500002',
          address: 'Sector 14, Shop 10, Gurugram',
          city: 'Gurugram',
          pincode: '122001'
        }
      },
      {
        id: 'ORD-DELIVERED-333333',
        date: new Date().toISOString(),
        status: 'Delivered',
        total: 340,
        advancePaid: 340,
        remainingAmount: 0,
        deliveryCode: '778899',
        isVerified: true,
        items: [{ product: { id: 'p4', name: 'Multigrain Atta', price: 340, weight: '5 KG' }, quantity: 1 }],
        customerInfo: {
          name: 'Rohan Mehra',
          phone: '9876500003',
          address: 'DLF Phase 2, Gurugram',
          city: 'Gurugram',
          pincode: '122002'
        }
      }
    ];

    fs.writeFileSync(dataFilePath, JSON.stringify(initialOrders, null, 2), 'utf8');

    // Visit Admin Dashboard
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    // Heading must state New Incoming Orders
    await expect(page.locator('text=New Incoming Orders')).toBeVisible();

    // MUST show the new order 'ORD-NEW-111111'
    await expect(page.locator('text=ORD-NEW-111111')).toBeVisible();
    await expect(page.locator('text=Vikram Singh')).toBeVisible();

    // 6-digit verification code must be visible and readable
    await expect(page.locator('text=654321')).toBeVisible();
    await expect(page.locator('text=Code:').first()).toBeVisible();

    // Customer details and actions
    await expect(page.locator('a[href="tel:9876500001"]')).toBeVisible();
    await expect(page.locator('a[href*="wa.me/919876500001"]')).toBeVisible();
    await expect(page.locator('text=Sector 23, House 45, Gurugram')).toBeVisible();

    // DASHBOARD REQUIREMENT: Already confirmed or delivered orders MUST NOT appear in the dashboard list
    await expect(page.locator('text=ORD-CONFIRMED-222222')).toHaveCount(0);
    await expect(page.locator('text=Pooja Sharma')).toHaveCount(0);
    await expect(page.locator('text=ORD-DELIVERED-333333')).toHaveCount(0);
    await expect(page.locator('text=Rohan Mehra')).toHaveCount(0);

    // Confirm the new order directly from Dashboard
    const confirmBtn = page.locator('button:has-text("Confirm Order")').first();
    await expect(confirmBtn).toBeVisible();
    await confirmBtn.click();

    // The order moves out of New Orders immediately
    await expect(page.locator('text=All Caught Up! No New Orders Pending Confirmation')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=ORD-NEW-111111')).toHaveCount(0);

    // Verify it persisted in database as Order Confirmed
    const updatedData = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
    const confirmedOrder = updatedData.find((o: any) => o.id === 'ORD-NEW-111111');
    expect(confirmedOrder.status).toBe('Order Confirmed');

    // Page refresh maintains this state (status persists after refresh)
    await page.reload();
    await expect(page.locator('text=All Caught Up! No New Orders Pending Confirmation')).toBeVisible();
  });

  test('2. Orders Page: Move orders between New, Pending, Confirmed, Out for Delivery, Delivered, and Cancelled without duplicates', async ({ page }) => {
    const testOrders = [
      {
        id: 'ORD-FLOW-999001',
        date: new Date().toISOString(),
        status: 'Order Placed',
        total: 500,
        advancePaid: 0,
        remainingAmount: 500,
        deliveryCode: '998877',
        paymentMethod: 'cod',
        items: [{ product: { id: 'p1', name: 'Gehu ka Atta', price: 280, weight: '5 KG' }, quantity: 1 }],
        customerInfo: {
          name: 'Flow Tester User',
          phone: '9800011122',
          address: 'Main Street, Block A, Gurugram',
          city: 'Gurugram',
          pincode: '122001'
        }
      }
    ];

    fs.writeFileSync(dataFilePath, JSON.stringify(testOrders, null, 2), 'utf8');

    await page.goto('/admin/orders');
    await page.waitForLoadState('networkidle');

    // 1. Initial State: New
    await expect(page.locator('text=ORD-FLOW-999001')).toBeVisible();
    await expect(page.locator('text=998877')).toBeVisible(); // 6-digit code small & readable

    // Verify Tab counts: New should have 1
    const newTab = page.locator('button:has-text("New")').first();
    await expect(newTab).toContainText('1');

    // 2. Move to Confirmed
    const acceptBtn = page.locator('button:has-text("1. Accept & Confirm Order")').first();
    await acceptBtn.click();
    await page.waitForTimeout(1000);

    // Status is now Confirmed
    const confirmedTab = page.locator('button:has-text("Confirmed")').first();
    await expect(confirmedTab).toContainText('1');

    // 3. Move to Pending / Preparing
    const prepBtn = page.locator('button:has-text("2. Start Preparing / Milling (Pending)")').first();
    await expect(prepBtn).toBeVisible();
    await prepBtn.click();
    await page.waitForTimeout(1000);

    // Status is now Pending
    const pendingTab = page.locator('button:has-text("Pending")').first();
    await expect(pendingTab).toContainText('1');

    // 4. Move to Out for Delivery
    const dispatchBtn = page.locator('button:has-text("3. Dispatch (Out for Delivery)")').first();
    await expect(dispatchBtn).toBeVisible();
    await dispatchBtn.click();
    await page.waitForTimeout(1000);

    // Status is now Out for Delivery
    const outTab = page.locator('button:has-text("Out for Delivery")').first();
    await expect(outTab).toContainText('1');

    // 5. Complete Delivery using Complete Delivery / Verify Code
    const completeBtn = page.locator('button:has-text("4. Complete Delivery")').first();
    await expect(completeBtn).toBeVisible();
    await completeBtn.click();
    await page.waitForTimeout(1500);

    // Status is now Delivered / Completed
    const deliveredTab = page.locator('button:has-text("Delivered / Completed")').first();
    await expect(deliveredTab).toContainText('1');

    // 6. Check persistence in Database
    let diskOrders = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
    let current = diskOrders.find((o: any) => o.id === 'ORD-FLOW-999001');
    expect(current.status).toBe('Delivered');
    expect(current.isVerified).toBe(true);

    // 7. Verify NO DUPLICATES exist on page or in database
    const matchingInDisk = diskOrders.filter((o: any) => o.id === 'ORD-FLOW-999001');
    expect(matchingInDisk.length).toBe(1);

    const matchingOnPage = page.locator('text=ORD-FLOW-999001');
    await expect(matchingOnPage).toHaveCount(1);

    // 8. Test Cancelled Transition via Status Dropdown
    const statusSelect = page.locator('select').first();
    await statusSelect.selectOption('Cancelled');
    await page.waitForTimeout(1000);

    // Verify status updated in database and persists across refresh
    diskOrders = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
    current = diskOrders.find((o: any) => o.id === 'ORD-FLOW-999001');
    expect(current.status).toBe('Cancelled');

    await page.reload();
    await expect(page.locator('text=ORD-FLOW-999001')).toBeVisible();
    const cancelledTab = page.locator('button:has-text("Cancelled")').first();
    await expect(cancelledTab).toContainText('1');
  });

  test('3. Status Filter Tabs correctly filter orders without duplicate entries', async ({ page }) => {
    const multiOrders = [
      {
        id: 'ORD-TAB-01',
        date: new Date().toISOString(),
        status: 'Order Placed',
        total: 280,
        advancePaid: 0,
        remainingAmount: 280,
        deliveryCode: '100001',
        items: [{ product: { id: 'p1', name: 'Gehu ka Atta', price: 280, weight: '5 KG' }, quantity: 1 }],
        customerInfo: { name: 'Customer A', phone: '9900000001', address: 'Address A' }
      },
      {
        id: 'ORD-TAB-02',
        date: new Date().toISOString(),
        status: 'Preparing Your Order',
        total: 280,
        advancePaid: 280,
        remainingAmount: 0,
        deliveryCode: '100002',
        items: [{ product: { id: 'p1', name: 'Gehu ka Atta', price: 280, weight: '5 KG' }, quantity: 1 }],
        customerInfo: { name: 'Customer B', phone: '9900000002', address: 'Address B' }
      },
      {
        id: 'ORD-TAB-03',
        date: new Date().toISOString(),
        status: 'Delivered',
        total: 280,
        advancePaid: 280,
        remainingAmount: 0,
        deliveryCode: '100003',
        isVerified: true,
        items: [{ product: { id: 'p1', name: 'Gehu ka Atta', price: 280, weight: '5 KG' }, quantity: 1 }],
        customerInfo: { name: 'Customer C', phone: '9900000003', address: 'Address C' }
      }
    ];

    fs.writeFileSync(dataFilePath, JSON.stringify(multiOrders, null, 2), 'utf8');

    await page.goto('/admin/orders');
    await page.waitForLoadState('networkidle');

    // Click "New" Tab -> only ORD-TAB-01 should be shown
    await page.click('button:has-text("New")');
    await expect(page.locator('text=ORD-TAB-01')).toBeVisible();
    await expect(page.locator('text=ORD-TAB-02')).toHaveCount(0);
    await expect(page.locator('text=ORD-TAB-03')).toHaveCount(0);

    // Click "Pending" Tab -> only ORD-TAB-02 should be shown
    await page.click('button:has-text("Pending")');
    await expect(page.locator('text=ORD-TAB-02')).toBeVisible();
    await expect(page.locator('text=ORD-TAB-01')).toHaveCount(0);
    await expect(page.locator('text=ORD-TAB-03')).toHaveCount(0);

    // Click "Delivered / Completed" Tab -> only ORD-TAB-03 should be shown
    await page.click('button:has-text("Delivered / Completed")');
    await expect(page.locator('text=ORD-TAB-03')).toBeVisible();
    await expect(page.locator('text=ORD-TAB-01')).toHaveCount(0);
    await expect(page.locator('text=ORD-TAB-02')).toHaveCount(0);

    // Click "All Orders" Tab -> all 3 appear, each exactly once
    await page.click('button:has-text("All Orders")');
    await expect(page.locator('text=ORD-TAB-01')).toHaveCount(1);
    await expect(page.locator('text=ORD-TAB-02')).toHaveCount(1);
    await expect(page.locator('text=ORD-TAB-03')).toHaveCount(1);
  });
});
