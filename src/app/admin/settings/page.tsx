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
  RefreshCw,
  Lock,
  KeyRound,
  ShieldCheck,
  AlertCircle
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

  // Security & 6-Digit PIN state
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinLoading, setPinLoading] = useState(false);
  const [pinSuccess, setPinSuccess] = useState<string | null>(null);
  const [pinError, setPinError] = useState<string | null>(null);
  const [isDefaultPin, setIsDefaultPin] = useState<boolean>(true);

  useEffect(() => {
    // Fetch PIN status
    fetch('/api/admin/auth', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (data && typeof data.isDefaultPin === 'boolean') {
          setIsDefaultPin(data.isDefaultPin);
        }
      })
      .catch(() => {});
  }, []);

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

  const handleUpdatePin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError(null);
    setPinSuccess(null);

    if (newPin.length !== 6 || !/^\d{6}$/.test(newPin)) {
      setPinError('New PIN must be exactly 6 digits (numbers only).');
      return;
    }

    if (newPin !== confirmPin) {
      setPinError('New PIN and Confirm PIN do not match.');
      return;
    }

    setPinLoading(true);
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'change_pin',
          currentPin,
          newPin,
          confirmPin
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setPinSuccess('Admin 6-digit PIN updated successfully!');
        setIsDefaultPin(false);
        setCurrentPin('');
        setNewPin('');
        setConfirmPin('');

        // Update local session
        if (data.token) {
          const sessionData = {
            token: data.token,
            expiresAt: data.expiresAt,
            savedAt: Date.now()
          };
          localStorage.setItem('vishwakarma_admin_session', JSON.stringify(sessionData));
        }

        setTimeout(() => setPinSuccess(null), 4000);
      } else {
        setPinError(data.error || 'Failed to update PIN. Please verify your current PIN.');
      }
    } catch {
      setPinError('Connection error. Please try again.');
    } finally {
      setPinLoading(false);
    }
  };

  const handleLockAdmin = () => {
    if (confirm('Lock admin panel now? You will need your 6-digit PIN to access again.')) {
      try {
        localStorage.removeItem('vishwakarma_admin_session');
      } catch {}
      window.location.reload();
    }
  };

  const handleResetPinToDefault = async () => {
    if (confirm('Reset admin PIN back to factory default: 123456?')) {
      setPinLoading(true);
      try {
        const res = await fetch('/api/admin/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'reset_pin',
            confirmText: 'RESET_PIN'
          })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setPinSuccess('PIN reset to default: 123456');
          setIsDefaultPin(true);
          if (data.token) {
            localStorage.setItem('vishwakarma_admin_session', JSON.stringify({
              token: data.token,
              expiresAt: data.expiresAt,
              savedAt: Date.now()
            }));
          }
          setTimeout(() => setPinSuccess(null), 4000);
        } else {
          setPinError(data.error || 'Failed to reset PIN.');
        }
      } catch {
        setPinError('Network error resetting PIN.');
      } finally {
        setPinLoading(false);
      }
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
            Manage your store information, delivery pricing, 6-digit PIN security, and payment gateways
          </p>
        </div>

        {savedSuccess && (
          <div className="bg-emerald-100 text-emerald-900 text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-2xs animate-fadeIn border border-emerald-300">
            <CheckCircle2 size={16} className="text-emerald-700" />
            <span>Settings saved successfully!</span>
          </div>
        )}
      </div>

      {/* 0. Dedicated Admin Security & 6-Digit PIN Section */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-emerald-600/30 ring-1 ring-emerald-500/10 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#062e1e] text-amber-400 flex items-center justify-center shrink-0 shadow-xs">
              <ShieldCheck size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-gray-900">Admin Security & 6-Digit PIN</h3>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                  isDefaultPin 
                    ? 'bg-amber-100 text-amber-900 border-amber-300' 
                    : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                }`}>
                  {isDefaultPin ? 'Default PIN Active (123456)' : 'Custom PIN Active'}
                </span>
              </div>
              <p className="text-[11px] text-gray-500">
                Protect your admin panel with a 6-digit PIN code. Session stays securely active for 30 days.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleLockAdmin}
              className="flex items-center gap-1.5 text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 px-3 py-1.5 rounded-xl transition cursor-pointer active:scale-95"
            >
              <Lock size={13} />
              <span>Lock Panel Now</span>
            </button>
          </div>
        </div>

        {pinSuccess && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 size={16} className="text-emerald-700 shrink-0" />
            <span>{pinSuccess}</span>
          </div>
        )}

        {pinError && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-300 text-red-900 text-xs font-bold flex items-center gap-2 animate-fadeIn">
            <AlertCircle size={16} className="text-red-600 shrink-0" />
            <span>{pinError}</span>
          </div>
        )}

        {/* Change PIN Form */}
        <form onSubmit={handleUpdatePin} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block font-bold text-gray-700 mb-1">
                Current 6-Digit PIN *
              </label>
              <input
                type="password"
                maxLength={6}
                value={currentPin}
                onChange={e => setCurrentPin(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder={isDefaultPin ? '123456' : 'Enter current PIN'}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl font-mono text-center tracking-widest text-sm focus:ring-2 focus:ring-emerald-700 outline-none"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">
                New 6-Digit PIN *
              </label>
              <input
                type="password"
                maxLength={6}
                value={newPin}
                onChange={e => setNewPin(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="6 new digits"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl font-mono text-center tracking-widest text-sm focus:ring-2 focus:ring-emerald-700 outline-none"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">
                Confirm New PIN *
              </label>
              <input
                type="password"
                maxLength={6}
                value={confirmPin}
                onChange={e => setConfirmPin(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="Re-enter 6 digits"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl font-mono text-center tracking-widest text-sm focus:ring-2 focus:ring-emerald-700 outline-none"
                required
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-gray-500 text-[11px]">
                Session duration: <strong>30 Days</strong> (Don&apos;t have to enter PIN repeatedly on your phone)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetPinToDefault}
                disabled={pinLoading}
                className="text-[11px] font-bold text-gray-500 hover:text-gray-800 underline cursor-pointer"
              >
                Reset to Default (123456)
              </button>

              <button
                type="submit"
                disabled={pinLoading}
                className="flex items-center gap-1.5 bg-[#062e1e] hover:bg-[#0b482d] text-amber-300 font-bold px-4 py-2 rounded-xl text-xs transition shadow-2xs cursor-pointer active:scale-95 disabled:opacity-50"
              >
                {pinLoading ? <RefreshCw size={13} className="animate-spin" /> : <KeyRound size={13} />}
                <span>Update 6-Digit PIN</span>
              </button>
            </div>
          </div>
        </form>
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
