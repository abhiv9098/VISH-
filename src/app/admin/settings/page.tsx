'use client';

import { useState } from 'react';
import { Settings, Store, Phone, MapPin, DollarSign, Bell, ShieldCheck, Save, CheckCircle2 } from 'lucide-react';

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);
  const [formData, setFormData] = useState({
    storeName: 'Vishwakarma Atta Mill & Store',
    contactPhone: '+91 98765 01234',
    whatsappPhone: '+91 98765 01234',
    address: 'Near Vishwakarma Mandir, Main Market, Delhi NCR',
    deliveryCharge: 30,
    freeDeliveryThreshold: 500,
    codEnabled: true,
    upiEnabled: true,
    notificationsEnabled: true
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Settings className="text-gray-700" size={24} /> Store Settings
          </h1>
          <p className="text-xs text-gray-500 mt-1">Manage store contact details, delivery charges & payment settings</p>
        </div>
        {saved && (
          <div className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 animate-fadeIn">
            <CheckCircle2 size={16} /> Saved!
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Store Info */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2 border-b pb-3 border-gray-100">
            <Store size={16} className="text-blue-600" /> Store Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Store Name</label>
              <input
                type="text"
                value={formData.storeName}
                onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-green-600 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Contact Phone</label>
              <input
                type="text"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-green-600 outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-700 mb-1">Store Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-green-600 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Delivery & Payment Settings */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2 border-b pb-3 border-gray-100">
            <DollarSign size={16} className="text-emerald-600" /> Delivery & Payment Settings
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Default Delivery Fee (₹)</label>
              <input
                type="number"
                value={formData.deliveryCharge}
                onChange={(e) => setFormData({ ...formData, deliveryCharge: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-green-600 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Free Delivery Min Amount (₹)</label>
              <input
                type="number"
                value={formData.freeDeliveryThreshold}
                onChange={(e) => setFormData({ ...formData, freeDeliveryThreshold: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-green-600 outline-none"
              />
            </div>
          </div>

          <div className="pt-2 space-y-3">
            <label className="flex items-center justify-between cursor-pointer p-3 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-xs font-bold text-gray-800">Allow Cash on Delivery (COD)</span>
              <input
                type="checkbox"
                checked={formData.codEnabled}
                onChange={(e) => setFormData({ ...formData, codEnabled: e.target.checked })}
                className="w-4 h-4 accent-green-700 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer p-3 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-xs font-bold text-gray-800">Allow Online UPI Payments</span>
              <input
                type="checkbox"
                checked={formData.upiEnabled}
                onChange={(e) => setFormData({ ...formData, upiEnabled: e.target.checked })}
                className="w-4 h-4 accent-green-700 cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition shadow-sm"
          >
            <Save size={16} /> Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}