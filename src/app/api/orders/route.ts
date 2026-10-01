import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'orders_data.json');

// Initialize with some dummy data if it doesn't exist
function ensureDataFile() {
  if (!fs.existsSync(dataFilePath)) {
    fs.writeFileSync(dataFilePath, JSON.stringify([], null, 2));
  }
}

export async function GET() {
  try {
    ensureDataFile();
    const data = fs.readFileSync(dataFilePath, 'utf8');
    return NextResponse.json(JSON.parse(data));
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const newOrder = await request.json();
    ensureDataFile();
    const data = fs.readFileSync(dataFilePath, 'utf8');
    const orders = JSON.parse(data);
    
    orders.unshift(newOrder); // Add to top
    
    fs.writeFileSync(dataFilePath, JSON.stringify(orders, null, 2));
    return NextResponse.json({ success: true, order: newOrder });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to write data' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, status } = await request.json();
    ensureDataFile();
    const data = fs.readFileSync(dataFilePath, 'utf8');
    let orders = JSON.parse(data);
    
    orders = orders.map((o: any) => o.id === id ? { ...o, status } : o);
    
    fs.writeFileSync(dataFilePath, JSON.stringify(orders, null, 2));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update data' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    ensureDataFile();
    const data = fs.readFileSync(dataFilePath, 'utf8');
    let orders = JSON.parse(data);
    
    orders = orders.filter((o: any) => o.id !== id);
    
    fs.writeFileSync(dataFilePath, JSON.stringify(orders, null, 2));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete data' }, { status: 500 });
  }
}
