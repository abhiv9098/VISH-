/* eslint-disable */
'use server';

import fs from 'fs';
import path from 'path';
import { Order } from '@/lib/data';

const dataFilePath = path.join(process.cwd(), 'orders_data.json');

function ensureDataFile() {
  if (!fs.existsSync(dataFilePath)) {
    fs.writeFileSync(dataFilePath, JSON.stringify([], null, 2), 'utf8');
  }
}

function deduplicateOrders(orders: Order[]): Order[] {
  if (!Array.isArray(orders)) return [];
  const seen = new Set<string>();
  const unique: Order[] = [];
  for (const o of orders) {
    if (o && o.id && !seen.has(o.id)) {
      seen.add(o.id);
      unique.push(o);
    }
  }
  return unique;
}

export async function getOrdersServer(): Promise<Order[]> {
  try {
    ensureDataFile();
    const data = fs.readFileSync(dataFilePath, 'utf8');
    const parsed = JSON.parse(data);
    return deduplicateOrders(parsed);
  } catch (e) {
    console.error('getOrdersServer error:', e);
    return [];
  }
}

export async function saveOrderServer(orders: Order[]): Promise<{ success: boolean }> {
  try {
    ensureDataFile();
    const uniqueOrders = deduplicateOrders(orders);
    fs.writeFileSync(dataFilePath, JSON.stringify(uniqueOrders, null, 2), 'utf8');
    return { success: true };
  } catch (e) {
    console.error('saveOrderServer error:', e);
    return { success: false };
  }
}
