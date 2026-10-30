/* eslint-disable */
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Order, getStatusDeliveryTiming } from '@/lib/data';

export type DeliverySettings = {
  threshold: number;
  chargeBelow: number;
  chargeAbove: number;
};

export type CustomerProfile = {
  name: string;
  phone: string;
  email?: string;
  country: string;
  state?: string;
  district?: string;
  city: string;
  locality?: string;
  pincode: string;
  address: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  liveLocationUrl?: string;
  isVerified: boolean;
  hasDetectedGps?: boolean;
  avatar?: string;
};

type OrderContextType = {
  orders: Order[];
  addOrder: (order: Order) => Promise<boolean>;
  updateOrderStatus: (orderId: string, status: Order['status'], estimatedDelivery?: string, estimatedDeliveryTarget?: string) => Promise<boolean>;
  updateOrderEstimatedDelivery: (orderId: string, estimatedDelivery: string) => Promise<boolean>;
  verifyDeliveryCode: (orderId: string, inputCode: string) => Promise<{ success: boolean; error?: string }>;
  sendEtaNotification: (orderId: string, eta: string) => Promise<boolean>;
  deleteOrder: (orderId: string) => Promise<boolean>;
  clearAllOrders: () => Promise<boolean>;
  fetchOrders: () => Promise<void>;
  deliverySettings: DeliverySettings;
  updateDeliverySettings: (settings: DeliverySettings) => void;
  customerProfile: CustomerProfile | null;
  updateCustomerProfile: (profile: CustomerProfile) => void;
  clearCustomerProfile: () => void;
  hasUnseenNewOrder: boolean;
  newOrdersCount: number;
  markOrdersAsSeen: () => void;
};

function areOrderListsEqual(listA: Order[], listB: Order[]): boolean {
  if (listA === listB) return true;
  if (!listA || !listB) return false;
  if (listA.length !== listB.length) return false;
  for (let i = 0; i < listA.length; i++) {
    const a = listA[i];
    const b = listB[i];
    if (!a || !b) return false;
    if (
      a.id !== b.id ||
      a.status !== b.status ||
      a.total !== b.total ||
      a.date !== b.date ||
      a.estimatedDelivery !== b.estimatedDelivery ||
      a.estimatedDeliveryTarget !== b.estimatedDeliveryTarget ||
      a.statusUpdatedAt !== b.statusUpdatedAt ||
      a.advancePaid !== b.advancePaid ||
      a.remainingAmount !== b.remainingAmount ||
      a.deliveryType !== b.deliveryType ||
      a.paymentMethod !== b.paymentMethod ||
      a.isHiddenFromAdmin !== b.isHiddenFromAdmin ||
      a.items?.length !== b.items?.length
    ) {
      return false;
    }
  }
  return true;
}

function deduplicateOrders(orderList: Order[]): Order[] {
  if (!Array.isArray(orderList)) return [];
  const seen = new Set<string>();
  const unique: Order[] = [];
  for (const o of orderList) {
    if (o && o.id && !seen.has(o.id)) {
      seen.add(o.id);
      unique.push(o);
    }
  }
  return unique;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [deliverySettings, setDeliverySettings] = useState<DeliverySettings>({
    threshold: 500,
    chargeBelow: 50,
    chargeAbove: 20
  });
  const [customerProfile, setCustomerProfile] = useState<CustomerProfile | null>(null);
  const [lastSeenTime, setLastSeenTime] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('vishwakarma_last_seen_time');
      return saved ? parseInt(saved, 10) : 0;
    }
    return 0;
  });

  // Fetch orders from API with guaranteed deduplication and reference equality preservation
  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch(`/api/orders?t=${Date.now()}`, { 
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          const clean = deduplicateOrders(data);
          setOrders(prev => {
            // Keep identical reference to avoid unnecessary re-renders that interrupt mobile touches
            if (areOrderListsEqual(prev, clean)) {
              return prev;
            }
            return clean;
          });
        }
      }
    } catch (e) {
      // Silently ignore fetch errors during polling
    }
  }, []);

  // Fetch saved profile from database
  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch('/api/profile', { cache: 'no-store' });
      if (res.ok) {
        const dbProfile = await res.json();
        if (dbProfile && dbProfile.name) {
          setCustomerProfile(prev => {
            if (prev && prev.name && prev.address) {
              return { ...dbProfile, ...prev };
            }
            return dbProfile;
          });
        }
      }
    } catch (e) {
      // Silently ignore profile fetch errors
    }
  }, []);

  const broadcastOrderUpdate = () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('vishwakarma_orders_synced_at', Date.now().toString());
        if ('BroadcastChannel' in window) {
          const ch = new BroadcastChannel('vishwakarma_orders_channel');
          ch.postMessage({ type: 'ORDERS_CHANGED', time: Date.now() });
          ch.close();
        }
      }
    } catch {}
  };

  useEffect(() => {
    fetchOrders();
    fetchProfile();

    // Poll regularly while preserving reference equality (instant tab sync via BroadcastChannel)
    const interval = setInterval(fetchOrders, 4000);

    // Instant sync across tabs using BroadcastChannel & Storage Event
    let channel: BroadcastChannel | null = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      channel = new BroadcastChannel('vishwakarma_orders_channel');
      channel.onmessage = () => {
        fetchOrders();
      };
    }

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'vishwakarma_orders_synced_at') {
        fetchOrders();
      }
    };

    const handleVisibility = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        fetchOrders();
      }
    };

    const handleFocus = () => {
      fetchOrders();
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibility);

    // Profile and settings from LocalStorage for the current device
    const savedSettings = localStorage.getItem('vishwakarma_delivery_settings');
    if (savedSettings) {
      try { setDeliverySettings(JSON.parse(savedSettings)); } catch (e) { }
    }

    const savedProfile = localStorage.getItem('vishwakarma_customer_profile');
    if (savedProfile) {
      try { setCustomerProfile(JSON.parse(savedProfile)); } catch (e) { }
    }

    return () => {
      clearInterval(interval);
      if (channel) channel.close();
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [fetchOrders, fetchProfile]);

  // Unseen new orders check
  const hasUnseenNewOrder = orders.some(o => {
    if (!o || o.isHiddenFromAdmin || o.status !== 'Order Placed') {
      return false;
    }
    const orderTime = o.date ? new Date(o.date).getTime() : 0;
    return orderTime > lastSeenTime;
  });

  // Count active new orders
  const newOrdersCount = orders.filter(o => o.status === 'Order Placed' && !o.isHiddenFromAdmin).length;

  const markOrdersAsSeen = () => {
    const now = Date.now();
    setLastSeenTime(now);
    if (typeof window !== 'undefined') {
      localStorage.setItem('vishwakarma_last_seen_time', now.toString());
    }
  };

  const addOrder = async (order: Order): Promise<boolean> => {
    try {
      // Optimistic update with deduplication
      setOrders(prev => deduplicateOrders([order, ...prev.filter(o => o.id !== order.id)]));
      
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order)
      });
      
      if (res.ok) {
        broadcastOrderUpdate();
        await fetchOrders();
        return true;
      }
      return false;
    } catch (e) {
      console.error('Error adding order:', e);
      return false;
    }
  };

  const updateOrderStatus = async (
    orderId: string, 
    status: Order['status'], 
    estimatedDelivery?: string,
    estimatedDeliveryTarget?: string
  ): Promise<boolean> => {
    try {
      const timing = getStatusDeliveryTiming(status);
      const now = Date.now();
      
      let finalEta = estimatedDelivery;
      let finalTarget = estimatedDeliveryTarget;

      if (!finalEta && timing) {
        finalEta = timing.estimatedDelivery;
      }
      if (finalTarget === undefined && timing) {
        finalTarget = timing.durationMs ? new Date(now + timing.durationMs).toISOString() : '';
      }

      const statusUpdatedAt = new Date(now).toISOString();

      setOrders(prev => deduplicateOrders(prev.map(o => {
        if (o.id === orderId) {
          return {
            ...o,
            status,
            statusUpdatedAt,
            ...(finalEta !== undefined ? { estimatedDelivery: finalEta } : {}),
            ...(finalTarget !== undefined ? { estimatedDeliveryTarget: finalTarget } : {})
          };
        }
        return o;
      })));
      
      const payload: any = { 
        id: orderId, 
        status,
        statusUpdatedAt
      };
      if (finalEta !== undefined) payload.estimatedDelivery = finalEta;
      if (finalTarget !== undefined) payload.estimatedDeliveryTarget = finalTarget;

      const res = await fetch('/api/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        broadcastOrderUpdate();
        await fetchOrders();
        return true;
      }
      return false;
    } catch (e) {
      console.error('Error updating status:', e);
      return false;
    }
  };

  const updateOrderEstimatedDelivery = async (orderId: string, estimatedDelivery: string): Promise<boolean> => {
    try {
      let durationMs: number | null = null;
      const lower = (estimatedDelivery || '').toLowerCase();
      if (lower.includes('15 min')) durationMs = 15 * 60 * 1000;
      else if (lower.includes('20 min')) durationMs = 20 * 60 * 1000;
      else if (lower.includes('30 min')) durationMs = 30 * 60 * 1000;
      else if (lower.includes('45 min')) durationMs = 45 * 60 * 1000;
      else if (lower.includes('1.5 hour') || lower.includes('1.5 hr')) durationMs = 90 * 60 * 1000;
      else if (lower.includes('1 hour') || lower.includes('1 hr')) durationMs = 60 * 60 * 1000;
      else if (lower.includes('2 hour') || lower.includes('2 hr')) durationMs = 120 * 60 * 1000;
      else if (lower.includes('3-4 hour')) durationMs = 210 * 60 * 1000;

      const estimatedDeliveryTarget = durationMs ? new Date(Date.now() + durationMs).toISOString() : '';
      const statusUpdatedAt = new Date().toISOString();

      setOrders(prev => deduplicateOrders(prev.map(o => o.id === orderId ? { 
        ...o, 
        estimatedDelivery,
        estimatedDeliveryTarget,
        statusUpdatedAt
      } : o)));

      const res = await fetch('/api/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: orderId, 
          estimatedDelivery,
          estimatedDeliveryTarget,
          statusUpdatedAt
        })
      });

      if (res.ok) {
        broadcastOrderUpdate();
        await fetchOrders();
        return true;
      }
      return false;
    } catch (e) {
      console.error('Error updating estimated delivery:', e);
      return false;
    }
  };

  const verifyDeliveryCode = async (orderId: string): Promise<{ success: boolean; error?: string }> => {
    const success = await updateOrderStatus(orderId, 'Delivered');
    return { success };
  };

  const sendEtaNotification = async (orderId: string, eta: string): Promise<boolean> => {
    try {
      const now = new Date().toISOString();
      setOrders(prev => deduplicateOrders(prev.map(o => o.id === orderId ? { ...o, estimatedDelivery: eta, etaNotifiedAt: now } : o)));

      const res = await fetch('/api/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, estimatedDelivery: eta, etaNotifiedAt: now })
      });

      if (res.ok) {
        broadcastOrderUpdate();
        await fetchOrders();
        return true;
      }
      return false;
    } catch (e) {
      console.error('Error sending ETA notification:', e);
      return false;
    }
  };

  const deleteOrder = async (orderId: string): Promise<boolean> => {
    try {
      setOrders(prev => deduplicateOrders(prev.filter(o => o.id !== orderId)));
      
      const res = await fetch(`/api/orders?id=${encodeURIComponent(orderId)}`, {
        method: 'DELETE'
      });
      
      if (res.ok) {
        broadcastOrderUpdate();
        await fetchOrders();
        return true;
      }
      return false;
    } catch (e) {
      console.error('Error deleting order:', e);
      return false;
    }
  };

  const clearAllOrders = async (): Promise<boolean> => {
    try {
      setOrders([]);
      const res = await fetch('/api/orders?all=true', {
        method: 'DELETE'
      });
      if (res.ok) {
        broadcastOrderUpdate();
        await fetchOrders();
        return true;
      }
      return false;
    } catch (e) {
      console.error('Error clearing all orders:', e);
      return false;
    }
  };

  const updateDeliverySettings = (settings: DeliverySettings) => {
    setDeliverySettings(settings);
    if (typeof window !== 'undefined') {
      localStorage.setItem('vishwakarma_delivery_settings', JSON.stringify(settings));
    }
  };

  const updateCustomerProfile = (profile: CustomerProfile) => {
    setCustomerProfile(profile);
    if (typeof window !== 'undefined') {
      localStorage.setItem('vishwakarma_customer_profile', JSON.stringify(profile));
    }
    // Persist to server-side database
    fetch('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile)
    }).catch(() => { });
  };

  const clearCustomerProfile = () => {
    setCustomerProfile(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('vishwakarma_customer_profile');
    }
  };

  return (
    <OrderContext.Provider value={{ 
      orders, 
      addOrder, 
      updateOrderStatus, 
      updateOrderEstimatedDelivery,
      verifyDeliveryCode,
      sendEtaNotification,
      deleteOrder,
      clearAllOrders,
      fetchOrders,
      deliverySettings, 
      updateDeliverySettings,
      customerProfile, 
      updateCustomerProfile, 
      clearCustomerProfile,
      hasUnseenNewOrder,
      newOrdersCount,
      markOrdersAsSeen
    }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
}
