'use client';

import { useState, useEffect } from 'react';
import { getCanonicalStatus } from './data';

export type CountdownInfo = {
  isDelivered: boolean;
  isCancelled: boolean;
  displayText: string; // e.g. "1h 59m 45s left" or "Delivered Successfully."
  countdownOnly: string; // e.g. "1h 59m 45s"
  baseEstimate: string; // e.g. "2 hours", "1 hour", "30 minutes", "Delivered Successfully."
  remainingSeconds: number;
};

export function getOrderBaseEstimate(order: {
  status?: string;
  estimatedDelivery?: string;
  deliveryType?: string;
}): string {
  const canonical = getCanonicalStatus(order.status);
  if (canonical === 'Delivered') return 'Delivered Successfully.';
  if (canonical === 'Out for Delivery') return order.estimatedDelivery || '30 minutes';
  if (canonical === 'Pending') return order.estimatedDelivery || '1 hour';
  if (canonical === 'Confirmed') return order.estimatedDelivery || '2 hours';
  if (order.estimatedDelivery) return order.estimatedDelivery;
  return order.deliveryType === 'express' ? 'within 2 hours' : 'in 3-4 hours';
}

export function useOrderCountdown(
  order: {
    status?: string;
    estimatedDelivery?: string;
    estimatedDeliveryTarget?: string;
    statusUpdatedAt?: string;
    date?: string;
    deliveryType?: string;
  },
  language: string = 'en'
): CountdownInfo {
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const canonical = getCanonicalStatus(order.status);
  const isDelivered = canonical === 'Delivered' || (order.estimatedDelivery || '').toLowerCase().includes('delivered successfully');
  const isCancelled = canonical === 'Cancelled';

  const baseEstimate = getOrderBaseEstimate(order);

  if (isDelivered) {
    const text = language === 'hi' ? 'सफलतापूर्वक डिलीवर हो गया' : 'Delivered Successfully.';
    return {
      isDelivered: true,
      isCancelled: false,
      displayText: text,
      countdownOnly: '',
      baseEstimate: text,
      remainingSeconds: 0,
    };
  }

  if (isCancelled) {
    const text = language === 'hi' ? 'रद्द हुआ' : 'Cancelled';
    return {
      isDelivered: false,
      isCancelled: true,
      displayText: text,
      countdownOnly: '',
      baseEstimate: text,
      remainingSeconds: 0,
    };
  }

  // Calculate target time in ms
  let targetMs: number | null = null;
  if (order.estimatedDeliveryTarget) {
    const parsed = new Date(order.estimatedDeliveryTarget).getTime();
    if (!isNaN(parsed) && parsed > 0) {
      targetMs = parsed;
    }
  }

  if (!targetMs) {
    // Derive from duration
    let durationMs = 2 * 60 * 60 * 1000; // default 2 hours
    const lowerEta = (order.estimatedDelivery || '').toLowerCase();
    if (canonical === 'Out for Delivery' || lowerEta.includes('30 min')) {
      durationMs = 30 * 60 * 1000;
    } else if (canonical === 'Pending' || lowerEta.includes('1 hour') || lowerEta.includes('1 hr')) {
      durationMs = 60 * 60 * 1000;
    } else if (canonical === 'Confirmed' || lowerEta.includes('2 hour') || lowerEta.includes('2 hr')) {
      durationMs = 2 * 60 * 60 * 1000;
    } else if (lowerEta.includes('45 min')) {
      durationMs = 45 * 60 * 1000;
    } else if (lowerEta.includes('15 min')) {
      durationMs = 15 * 60 * 1000;
    } else if (lowerEta.includes('20 min')) {
      durationMs = 20 * 60 * 1000;
    }

    const baseTime = order.statusUpdatedAt
      ? new Date(order.statusUpdatedAt).getTime()
      : order.date
      ? new Date(order.date).getTime()
      : now;
    
    if (!isNaN(baseTime) && baseTime > 0) {
      targetMs = baseTime + durationMs;
    } else {
      targetMs = now + durationMs;
    }
  }

  const diffMs = targetMs - now;
  const remainingSeconds = Math.max(0, Math.floor(diffMs / 1000));
  const hours = Math.floor(remainingSeconds / 3600);
  const minutes = Math.floor((remainingSeconds % 3600) / 60);
  const seconds = remainingSeconds % 60;

  let countdownOnly = '';
  let displayText = '';

  if (remainingSeconds <= 0) {
    countdownOnly = '00:00';
    displayText = language === 'hi' ? 'शीघ्र ही पहुँच रहा है' : 'Arriving shortly';
  } else if (hours > 0) {
    const paddedM = minutes.toString().padStart(2, '0');
    const paddedS = seconds.toString().padStart(2, '0');
    countdownOnly = `${hours}h ${paddedM}m ${paddedS}s`;
    displayText = language === 'hi' ? `${hours}h ${paddedM}m ${paddedS}s शेष` : `${hours}h ${paddedM}m ${paddedS}s left`;
  } else {
    const paddedS = seconds.toString().padStart(2, '0');
    countdownOnly = `${minutes}m ${paddedS}s`;
    displayText = language === 'hi' ? `${minutes}m ${paddedS}s शेष` : `${minutes}m ${paddedS}s left`;
  }

  return {
    isDelivered: false,
    isCancelled: false,
    displayText,
    countdownOnly,
    baseEstimate,
    remainingSeconds,
  };
}
