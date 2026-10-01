/* eslint-disable */
'use server';

import { Order } from '@/lib/data';

const API_URL = typeof window === 'undefined'
  ? `http://localhost:${process.env.PORT || 4000}/api/orders`
  : '/api/orders';

export async function getOrdersServer(): Promise<Order[]> {
  try {
    const res = await fetch(API_URL, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    console.log('getOrdersServer CALLED! CWD:', process.cwd(), '| Orders Length:', data.length);
    return data;
  } catch (e) {
    console.error('getOrdersServer error:', e);
    return [];
  }
}

export async function saveOrderServer(orders: Order[]): Promise<{ success: boolean }> {
  try {
    // Save the full orders array by overwriting
    const res = await fetch(API_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orders }),
    });
    return { success: res.ok };
  } catch (e) {
    console.error('saveOrderServer error:', e);
    return { success: false };
  }
}
