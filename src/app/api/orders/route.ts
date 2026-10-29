import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'orders_data.json');

function ensureDataFile() {
  if (!fs.existsSync(dataFilePath)) {
    fs.writeFileSync(dataFilePath, JSON.stringify([], null, 2), 'utf8');
  }
}

function cleanAndDeduplicateOrders(orders: any[]): any[] {
  if (!Array.isArray(orders)) return [];
  const seenIds = new Set<string>();
  const result: any[] = [];
  for (const order of orders) {
    if (order && order.id && !seenIds.has(order.id)) {
      seenIds.add(order.id);
      result.push(order);
    }
  }
  return result;
}

export async function GET() {
  try {
    ensureDataFile();
    const data = fs.readFileSync(dataFilePath, 'utf8');
    let orders: any[] = [];
    try {
      orders = JSON.parse(data);
    } catch {
      orders = [];
    }
    const cleanOrders = cleanAndDeduplicateOrders(orders);
    return NextResponse.json(cleanOrders, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const newOrder = await request.json();
    if (!newOrder || !newOrder.id) {
      return NextResponse.json({ error: 'Invalid order data: Missing ID' }, { status: 400 });
    }

    ensureDataFile();
    const data = fs.readFileSync(dataFilePath, 'utf8');
    let orders: any[] = [];
    try {
      orders = JSON.parse(data);
    } catch {
      orders = [];
    }

    orders = cleanAndDeduplicateOrders(orders);

    // 1. Exact ID duplicate check (Idempotent response for retries or identical ID submission)
    const existingById = orders.find((o: any) => o.id === newOrder.id);
    if (existingById) {
      return NextResponse.json({ success: true, order: existingById, alreadyExists: true });
    }

    // 2. Online Payment Transaction ID duplicate check
    if (newOrder.transactionId && typeof newOrder.transactionId === 'string' && newOrder.transactionId.trim() !== '') {
      const existingByTxn = orders.find((o: any) => 
        o.transactionId && 
        o.transactionId.trim() !== '' && 
        o.transactionId.trim().toLowerCase() === newOrder.transactionId.trim().toLowerCase()
      );
      if (existingByTxn) {
        return NextResponse.json({ success: true, order: existingByTxn, duplicatePrevented: true });
      }
    }

    // 3. Rapid duplicate submission protection (same phone, same total amount within 30 seconds)
    const newPhone = (newOrder.customerInfo?.phone || '').replace(/[^0-9]/g, '');
    const newOrderTime = newOrder.date ? new Date(newOrder.date).getTime() : Date.now();

    if (newPhone && newPhone.length >= 10) {
      const rapidDuplicate = orders.find((o: any) => {
        const existingPhone = (o.customerInfo?.phone || '').replace(/[^0-9]/g, '');
        if (existingPhone === newPhone && Number(o.total) === Number(newOrder.total)) {
          const existingTime = o.date ? new Date(o.date).getTime() : 0;
          const timeDiff = Math.abs(newOrderTime - existingTime);
          // If placed within 30 seconds with identical total and customer phone, treat as duplicate submission
          if (timeDiff < 30000) {
            return true;
          }
        }
        return false;
      });

      if (rapidDuplicate) {
        return NextResponse.json({ success: true, order: rapidDuplicate, duplicatePrevented: true });
      }
    }

    // 4. Legitimate new order - prepend to top
    const updated = [newOrder, ...orders.filter((o: any) => o.id !== newOrder.id)];
    const finalOrders = cleanAndDeduplicateOrders(updated);

    fs.writeFileSync(dataFilePath, JSON.stringify(finalOrders, null, 2), 'utf8');
    return NextResponse.json({ success: true, order: newOrder });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to write data' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    ensureDataFile();

    if (body.orders && Array.isArray(body.orders)) {
      const clean = cleanAndDeduplicateOrders(body.orders);
      fs.writeFileSync(dataFilePath, JSON.stringify(clean, null, 2), 'utf8');
      return NextResponse.json({ success: true });
    }

    const { id, status, estimatedDelivery, etaNotifiedAt } = body;
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const data = fs.readFileSync(dataFilePath, 'utf8');
    let orders: any[] = [];
    try {
      orders = JSON.parse(data);
    } catch {
      orders = [];
    }

    orders = cleanAndDeduplicateOrders(orders);
    const targetOrder = orders.find((o: any) => o.id === id);
    if (!targetOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    orders = orders.map((o: any) => {
      if (o.id === id) {
        const updated = { ...o };
        if (status !== undefined) updated.status = status;
        if (estimatedDelivery !== undefined) updated.estimatedDelivery = estimatedDelivery;
        if (etaNotifiedAt !== undefined) updated.etaNotifiedAt = etaNotifiedAt;
        return updated;
      }
      return o;
    });

    fs.writeFileSync(dataFilePath, JSON.stringify(orders, null, 2), 'utf8');
    return NextResponse.json(
      { success: true, order: orders.find((o: any) => o.id === id) },
      { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0' } }
    );
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update data' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    const all = url.searchParams.get('all');
    
    ensureDataFile();

    if (all === 'true' || all === 'all') {
      fs.writeFileSync(dataFilePath, JSON.stringify([], null, 2), 'utf8');
      return NextResponse.json({ success: true, message: 'All orders cleared' });
    }

    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    const data = fs.readFileSync(dataFilePath, 'utf8');
    let orders: any[] = [];
    try {
      orders = JSON.parse(data);
    } catch {
      orders = [];
    }

    orders = cleanAndDeduplicateOrders(orders).filter((o: any) => o.id !== id);
    
    fs.writeFileSync(dataFilePath, JSON.stringify(orders, null, 2), 'utf8');
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete data' }, { status: 500 });
  }
}
