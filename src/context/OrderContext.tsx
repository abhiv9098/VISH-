/* eslint-disable */
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Order } from '@/lib/data';

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

  useEffect(() => {
    const savedOrders = localStorage.getItem('vishwakarma_orders');
    if (savedOrders) {
      try { setOrders(JSON.parse(savedOrders)); } catch (e) { }
    }
    
    const savedSettings = localStorage.getItem('vishwakarma_delivery_settings');
    if (savedSettings) {
      try { setDeliverySettings(JSON.parse(savedSettings)); } catch (e) { }
    }
    
    const savedProfile = localStorage.getItem('vishwakarma_customer_profile');
    if (savedProfile) {
      try { setCustomerProfile(JSON.parse(savedProfile)); } catch (e) { }
    }
  }, []);

  const addOrder = (order: Order) => {
    const newOrders = [order, ...orders];
    setOrders(newOrders);
    localStorage.setItem('vishwakarma_orders', JSON.stringify(newOrders));
  };

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
      orders, addOrder, 
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


