'use client';

import { useState, useEffect } from 'react';
import { 
  Settings, 
  Store, 
  Phone, 
  MapPin, 
  DollarSign, 
  Bell, 
  Save, 
  CheckCircle2, 
  Clock, 
  CreditCard, 
  Truck, 
  Volume2,
  RefreshCw
} from 'lucide-react';
import { useOrders } from '@/context/OrderContext';

type StoreSettings = {
  storeName: string;
  tagline: string;
  contactPhone: string;
  whatsappPhone: string;
  address: string;
  operatingHours: string;
  deliveryChargeStandard: number;
  deliveryChargeExpress: number;
  freeDeliveryThreshold: number;
  codEnabled: boolean;
  upiEnabled: boolean;
  upiId: string;
  soundAlertsEnabled: boolean;
};

const defaultSettings: StoreSettings = {
  storeName: 'Vishwakarma Atta Chakki & Fresh Flour Store',
  tagline: '100% Pure, Stone Milled Fresh Chakki Atta',
  contactPhone: '+91 98932 49212',
  whatsappPhone: '+91 98932 49212',
  address: 'Near Vishwakarma Mandir, Main Market, Sonkach, Dewas, Madhya Pradesh, 455118',
  operatingHours: '08:00 AM - 08:00 PM (Everyday)',
  deliveryChargeStandard: 30,
  deliveryChargeExpress: 50,
  freeDeliveryThreshold: 500,
  codEnabled: true,
  upiEnabled: true,
  upiId: '9893249212@upi',
  soundAlertsEnabled: true
};

export default function SettingsPage() {
  const { deliverySettings, updateDeliverySettings } = useOrders();
  const [formData, setFormData] = useState<StoreSettings>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('vishwakarma_store_settings');
      if (saved) {
        try {
          return { ...defaultSettings, ...JSON.parse(saved) };
        } catch {}
      }
    }
    return defaultSettings;
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    // Sync free delivery threshold from OrderContext if present
    if (deliverySettings && deliverySettings.threshold) {
      setFormData(prev => ({
        ...prev,
        freeDeliveryThreshold: deliverySettings.threshold,
        deliveryChargeStandard: deliverySettings.chargeAbove || prev.deliveryChargeStandard,
        deliveryChargeExpress: deliverySettings.chargeBelow || prev.deliveryChargeExpress,
      }));
    }
  }, [deliverySettings]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      localStorage.setItem('vishwakarma_store_settings', JSON.stringify(formData));
    }

    // Sync with order delivery settings
    updateDeliverySettings({
      threshold: formData.freeDeliveryThreshold,
      chargeBelow: formData.deliveryChargeExpress,
      chargeAbove: formData.deliveryChargeStandard
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  const handleReset = () => {
    if (confirm('Reset store settings to original defaults?')) {
      setFormData(defaultSettings);
      if (typeof window !== 'undefined') {
        localStorage.setItem('vishwakarma_store_settings', JSON.stringify(defaultSettings));
      }
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto pb-14 w-full min-w-0">

      {/* Header Row */}
      <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-gray-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
            <Settings className="text-[#062e1e]" size={22} />
            <span>Store Configuration & Settings</span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage your store information, delivery pricing, payment gateways, and real-time alerts
          </p>
        </div>

        {savedSuccess && (
          <div className="bg-emerald-100 text-emerald-900 text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-2xs animate-fadeIn border border-emerald-300">
            <CheckCircle2 size={16} className="text-emerald-700" />
            <span>Settings saved successfully!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        
        {/* 1. Store Profile Details */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0">
              <Store size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Store Profile</h3>
              <p className="text-[11px] text-gray-500">Business identification and contact lines for customers</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Store Name *</label>
              <input
                type="text"
                value={formData.storeName}
                onChange={e => setFormData({ ...formData, storeName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-700 outline-none"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Store Tagline / Subtitle</label>
              <input
                type="text"
                value={formData.tagline}
                onChange={e => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-700 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Contact Phone Number *</label>
              <input
                type="text"
                value={formData.contactPhone}
                onChange={e => setFormData({ ...formData, contactPhone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-700 outline-none"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">WhatsApp Support Number</label>
              <input
                type="text"
                value={formData.whatsappPhone}
                onChange={e => setFormData({ ...formData, whatsappPhone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-700 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Operating Hours</label>
              <input
                type="text"
                value={formData.operatingHours}
                onChange={e => setFormData({ ...formData, operatingHours: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-700 outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-gray-700 mb-1">Store Address *</label>
              <input
                type="text"
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-700 outline-none"
                required
              />
            </div>
          </div>
        </div>

        {/* 2. Delivery Rates & Free Threshold */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
              <Truck size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Delivery Configuration</h3>
              <p className="text-[11px] text-gray-500">Shipping fees, free delivery rules, and order dispatch tiers</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Standard Delivery Fee (₹)</label>
              <input
                type="number"
                value={formData.deliveryChargeStandard}
                onChange={e => setFormData({ ...formData, deliveryChargeStandard: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-700 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Express Delivery Fee (₹)</label>
              <input
                type="number"
                value={formData.deliveryChargeExpress}
                onChange={e => setFormData({ ...formData, deliveryChargeExpress: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-700 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Free Delivery Threshold (₹)</label>
              <input
                type="number"
                value={formData.freeDeliveryThreshold}
                onChange={e => setFormData({ ...formData, freeDeliveryThreshold: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-700 outline-none"
              />
            </div>
          </div>
        </div>

        {/* 3. Payment Methods */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
              <CreditCard size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Payment Gateways & Options</h3>
              <p className="text-[11px] text-gray-500">Enable or disable checkout payment methods</p>
            </div>
          </div>

          <div className="space-y-2.5 text-xs">
            <label className="flex items-center justify-between p-3.5 bg-gray-50/80 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-100/60 transition">
              <div>
                <p className="font-bold text-gray-900">Allow Cash on Delivery (COD)</p>
                <p className="text-[11px] text-gray-500">Customers pay in cash when flour is delivered</p>
              </div>
              <input
                type="checkbox"
                checked={formData.codEnabled}
                onChange={e => setFormData({ ...formData, codEnabled: e.target.checked })}
                className="w-4 h-4 accent-emerald-700 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 bg-gray-50/80 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-100/60 transition">
              <div>
                <p className="font-bold text-gray-900">Allow UPI & Online Payments</p>
                <p className="text-[11px] text-gray-500">Support Google Pay, PhonePe, Paytm, and BHIM QR scan</p>
              </div>
              <input
                type="checkbox"
                checked={formData.upiEnabled}
                onChange={e => setFormData({ ...formData, upiEnabled: e.target.checked })}
                className="w-4 h-4 accent-emerald-700 cursor-pointer"
              />
            </label>

            {formData.upiEnabled && (
              <div className="pt-1">
                <label className="block font-bold text-gray-700 mb-1">Store UPI VPA Address</label>
                <input
                  type="text"
                  value={formData.upiId}
                  onChange={e => setFormData({ ...formData, upiId: e.target.value })}
                  placeholder="e.g. 9893249212@upi"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-700 outline-none"
                />
              </div>
            )}
          </div>
        </div>

        {/* 4. Real-time Sound Alerts */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center shrink-0">
              <Volume2 size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Audio Alerts</h3>
              <p className="text-[11px] text-gray-500">Play chime when new customer orders arrive in real time</p>
            </div>
          </div>

          <label className="flex items-center justify-between p-3.5 bg-gray-50/80 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-100/60 transition text-xs">
            <div>
              <p className="font-bold text-gray-900">Incoming Order Sound Alert</p>
              <p className="text-[11px] text-gray-500">Plays an instant chime on the dashboard when a customer places an order</p>
            </div>
            <input
              type="checkbox"
              checked={formData.soundAlertsEnabled}
              onChange={e => setFormData({ ...formData, soundAlertsEnabled: e.target.checked })}
              className="w-4 h-4 accent-emerald-700 cursor-pointer"
            />
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-4 py-2.5 rounded-xl transition cursor-pointer"
          >
            <RefreshCw size={13} />
            <span>Reset to Defaults</span>
          </button>

          <button
            type="submit"
            className="flex items-center gap-2 bg-[#062e1e] hover:bg-[#0b482d] text-[#f59e0b] font-black px-6 py-2.5 rounded-xl text-sm transition shadow-xs cursor-pointer active:scale-95"
          >
            <Save size={16} />
            <span>Save Changes</span>
          </button>
        </div>

      </form>

    </div>
  );
}
