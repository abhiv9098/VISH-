/* eslint-disable */
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Order, sampleOrders } from '@/lib/data';
import { getOrdersServer, saveOrderServer } from '@/actions/orderActions';

export type DeliverySettings = {
  threshold: number;
  chargeBelow: number;
  chargeAbove: number;
};

export type CustomerProfile = {
  name: string;
  phone: string;
  country: string;
  pincode: string;
  address: string;
  city: string;
  isVerified: boolean;
};

type OrderContextType = {
  orders: Order[];
  addOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  deleteOrder: (orderId: string) => void;
  deliverySettings: DeliverySettings;
  updateDeliverySettings: (settings: DeliverySettings) => void;
  customerProfile: CustomerProfile | null;
  updateCustomerProfile: (profile: CustomerProfile) => void;
  clearCustomerProfile: () => void;
};

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [deliverySettings, setDeliverySettings] = useState<DeliverySettings>({
    threshold: 500,
    chargeBelow: 50,
    chargeAbove: 20
  });
  const [customerProfile, setCustomerProfile] = useState<CustomerProfile | null>(null);

  // Fetch orders from API
  const fetchOrders = async () => { try { const data = await getOrdersServer(); if (Array.isArray(data)) { setOrders(data); } } catch(e) { console.error(e); } };

  useEffect(() => {
    fetchOrders();

    // Poll every 3 seconds to get real-time updates from mobile!
    const interval = setInterval(fetchOrders, 3000);

    // Profile and settings still from LocalStorage for the current device
    const savedSettings = localStorage.getItem('vishwakarma_delivery_settings');
    if (savedSettings) {
      try { setDeliverySettings(JSON.parse(savedSettings)); } catch (e) { }
    }

    const savedProfile = localStorage.getItem('vishwakarma_customer_profile');
    if (savedProfile) {
      try { setCustomerProfile(JSON.parse(savedProfile)); } catch (e) { }
    }

    return () => clearInterval(interval);
  }, []);

  const addOrder = async (order: Order) => { const newOrders = [order, ...orders]; setOrders(newOrders); await saveOrderServer(newOrders); };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => { const newOrders = orders.map(o => o.id === orderId ? { ...o, status } : o); setOrders(newOrders); await saveOrderServer(newOrders); };

  const deleteOrder = async (orderId: string) => { const newOrders = orders.filter(o => o.id !== orderId); setOrders(newOrders); await saveOrderServer(newOrders); };

  const updateDeliverySettings = (settings: DeliverySettings) => {
    setDeliverySettings(settings);
    localStorage.setItem('vishwakarma_delivery_settings', JSON.stringify(settings));
  };

  const updateCustomerProfile = (profile: CustomerProfile) => {
    setCustomerProfile(profile);
    localStorage.setItem('vishwakarma_customer_profile', JSON.stringify(profile));
  };

  const clearCustomerProfile = () => {
    setCustomerProfile(null);
    localStorage.removeItem('vishwakarma_customer_profile');
  };

  return (
    <OrderContext.Provider value={{ 
      orders, addOrder, updateOrderStatus, deleteOrder,
      deliverySettings, updateDeliverySettings,
      customerProfile, updateCustomerProfile, clearCustomerProfile
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
