/* eslint-disable */
'use client';

import { useCart } from '@/context/CartContext';
import { useOrders } from '@/context/OrderContext';
import { useGeolocation } from '@/lib/useGeolocation';
import { useLanguage } from '@/context/LanguageContext';
import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Zap,
  Clock,
  CheckCircle, 
  Truck, 
  CreditCard, 
  Banknote, 
  QrCode, 
  ArrowLeft, 
  ArrowRight, 
  ShieldCheck, 
  MapPin, 
  ShoppingBag, 
  Navigation, 
  Compass, 
  AlertTriangle, 
  Loader2, 
  ExternalLink 
} from 'lucide-react';
import Image from 'next/image';
import { products } from '@/lib/data';
import { checkDeliveryFeasibility } from '@/lib/delivery';

type Step = 1 | 2 | 3 | 4;

interface CheckoutFlowProps {
  title?: string;
}

export default function CheckoutFlow({ title = 'Order Checkout' }: CheckoutFlowProps) {
  const { cart, getCartTotal, clearCart, updateQuantity, addToCart } = useCart();
  const { addOrder, customerProfile, updateCustomerProfile, deliverySettings } = useOrders();
  const { language, t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams?.get('productId');
  const qtyParam = parseInt(searchParams?.get('qty') || '1') || 1;

  const { loading: isLocating, error: locationError, successMessage: locationSuccess, detectLocation } = useGeolocation();

  // Auto-populate cart if accessed directly with productId
  useEffect(() => {
    if (cart.length === 0 && productId) {
      const prod = products.find(p => p.id === productId) || products[0];
      if (prod) {
        addToCart(prod, qtyParam);
      }
    }
  }, [cart.length, productId, qtyParam, addToCart]);

  // 3-Step Checkout Progress: 1: Details, 2: Address, 3: Payment
  const [step, setStep] = useState<Step>(1);
  const [deliverySpeed, setDeliverySpeed] = useState<'express' | 'standard'>('standard');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);

  const [customerInfo, setCustomerInfo] = useState({
    name: customerProfile?.name || '',
    phone: customerProfile?.phone || '',
    email: customerProfile?.email || '',
    country: customerProfile?.country || 'India',
    state: customerProfile?.state || '',
    district: customerProfile?.district || '',
    city: customerProfile?.city || 'Gurugram',
    locality: customerProfile?.locality || '',
    pincode: customerProfile?.pincode || '122001',
    address: customerProfile?.address || '',
    lat: customerProfile?.coordinates?.lat || undefined as number | undefined,
    lng: customerProfile?.coordinates?.lng || undefined as number | undefined
  });

  const [paymentChoice, setPaymentChoice] = useState<'online' | 'cod'>('online');
  const [txnId, setTxnId] = useState('');
  const [txnError, setTxnError] = useState('');

  // Delivery charge calculation
  const defaultFeasibility = {
    isExpressAvailable: false,
    expressReason: '',
    estimatedDeliveryTime: 'Today within 2 hrs',
    standardDeliveryTime: 'Today in 3-4 hrs'
  };
  const feasibility = typeof checkDeliveryFeasibility === 'function'
    ? checkDeliveryFeasibility(cart, customerInfo.city, customerInfo.pincode)
    : defaultFeasibility;

  useEffect(() => {
    if (feasibility.isExpressAvailable) {
      setDeliverySpeed('express');
    } else {
      setDeliverySpeed('standard');
    }
  }, [feasibility.isExpressAvailable]);

  const subtotal = getCartTotal();
  const deliveryCharge = subtotal >= (deliverySettings.threshold || 500) ? 0 : (deliverySettings.chargeBelow || 50);
  const total = subtotal + deliveryCharge;

  // Sync with customerProfile when loaded
  useEffect(() => {
    if (customerProfile && customerProfile.name) {
      setCustomerInfo({
        name: customerProfile.name || '',
        phone: customerProfile.phone || '',
        email: customerProfile.email || '',
        country: customerProfile.country || 'India',
        state: customerProfile.state || '',
        district: customerProfile.district || '',
        city: customerProfile.city || 'Gurugram',
        locality: customerProfile.locality || '',
        pincode: customerProfile.pincode || '122001',
        address: customerProfile.address || '',
        lat: customerProfile.coordinates?.lat,
        lng: customerProfile.coordinates?.lng
      });
    }
  }, [customerProfile]);

  // Use My Current Location Handler in Checkout
  const handleUseCurrentLocation = async () => {
    const geo = await detectLocation();
    if (geo) {
      setCustomerInfo(prev => ({
        ...prev,
        country: geo.country || prev.country || 'India',
        state: geo.state || prev.state,
        district: geo.district || prev.district,
        city: geo.city || prev.city,
        locality: geo.locality || prev.locality,
        pincode: geo.pincode || prev.pincode,
        address: geo.fullAddress || prev.address,
        lat: geo.lat,
        lng: geo.lng
      }));
    }
  };

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-md">
        <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShoppingBag size={32} />
        </div>
        <h2 className="text-xl font-black text-slate-900 mb-2">{t('emptyCartTitle')}</h2>
        <p className="text-xs text-slate-500 mb-6">{t('emptyCartDesc')}</p>
        <button 
          onClick={() => router.push('/')} 
          className="bg-amber-500 hover:bg-amber-600 text-emerald-950 font-black px-6 py-2.5 rounded-xl transition text-xs shadow-md cursor-pointer"
        >
          {t('exploreFreshAtta')}
        </button>
      </div>
    );
  }

  const handleNext = () => setStep((prev) => Math.min(3, prev + 1) as Step);
  const handleBack = () => setStep((prev) => Math.max(1, prev - 1) as Step);

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const coordinates = (customerInfo.lat !== undefined && customerInfo.lng !== undefined)
      ? { lat: Number(customerInfo.lat), lng: Number(customerInfo.lng) }
      : undefined;

    updateCustomerProfile({
      name: customerInfo.name,
      phone: customerInfo.phone,
      email: customerInfo.email,
      country: customerInfo.country,
      state: customerInfo.state,
      district: customerInfo.district,
      city: customerInfo.city,
      locality: customerInfo.locality,
      pincode: customerInfo.pincode,
      address: customerInfo.address,
      coordinates,
      isVerified: true
    });
    setStep(3);
  };

  const placeOrder = async () => {
    if (isSubmittingRef.current || isSubmitting) return;

    if (paymentChoice === 'online' && txnId.trim().length < 6) {
      setTxnError('Please enter a valid Transaction / UTR ID.');
      return;
    }

    isSubmittingRef.current = true;
    setIsSubmitting(true);
    const timestampPart = Date.now().toString().slice(-6);
    const randomPart = Math.floor(1000 + Math.random() * 9000);
    const newOrderId = `ORD-${timestampPart}${randomPart}`;
    
    // Construct complete address string
    const addressParts = [
      customerInfo.address,
      customerInfo.locality,
      customerInfo.city,
      customerInfo.district,
      customerInfo.state,
      customerInfo.pincode,
      customerInfo.country
    ].filter(Boolean);
    const fullAddr = addressParts.join(', ');

    const coordinates = (customerInfo.lat !== undefined && customerInfo.lng !== undefined && !isNaN(customerInfo.lat) && !isNaN(customerInfo.lng))
      ? { lat: Number(customerInfo.lat), lng: Number(customerInfo.lng) }
      : undefined;

    const liveMapUrl = coordinates
      ? `https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddr)}`;

    try {
      const chosenSpeed = (feasibility.isExpressAvailable && deliverySpeed === 'express') ? 'express' : 'standard';
      const chosenEta = chosenSpeed === 'express' ? feasibility.estimatedDeliveryTime : feasibility.standardDeliveryTime;

      await addOrder({
        id: newOrderId,
        date: new Date().toISOString(),
        status: 'Order Placed',
        total: total,
        advancePaid: paymentChoice === 'online' ? total : 0,
        remainingAmount: paymentChoice === 'cod' ? total : 0,
        deliveryType: chosenSpeed,
        estimatedDelivery: chosenEta,
        paymentMethod: paymentChoice,
        transactionId: paymentChoice === 'online' ? txnId : undefined,
        items: cart,
        customerInfo: {
          name: customerInfo.name,
          phone: customerInfo.phone,
          email: customerInfo.email,
          address: fullAddr,
          locality: customerInfo.locality,
          city: customerInfo.city,
          district: customerInfo.district,
          state: customerInfo.state,
          pincode: customerInfo.pincode,
          country: customerInfo.country,
          coordinates,
          liveLocationUrl: liveMapUrl
        }
      });

      // Update customer profile with the latest verified address
      updateCustomerProfile({
        name: customerInfo.name,
        phone: customerInfo.phone,
        email: customerInfo.email,
        country: customerInfo.country,
        state: customerInfo.state,
        district: customerInfo.district,
        city: customerInfo.city,
        locality: customerInfo.locality,
        pincode: customerInfo.pincode,
        address: customerInfo.address,
        coordinates,
        isVerified: true
      });

      if (typeof window !== 'undefined') {
        localStorage.setItem('vishwakarma_customer_phone', customerInfo.phone);
        try {
          const placed = JSON.parse(localStorage.getItem('vishwakarma_customer_order_ids') || '[]');
          if (Array.isArray(placed)) {
            if (!placed.includes(newOrderId)) placed.push(newOrderId);
            localStorage.setItem('vishwakarma_customer_order_ids', JSON.stringify(placed));
          }
        } catch (e) {}
      }

      clearCart();
      setIsSubmitting(false);

      // Redirect to My Orders page
      if (typeof window !== 'undefined') {
        window.location.href = `/order?newOrder=${newOrderId}`;
      } else {
        router.push(`/order?newOrder=${newOrderId}`);
      }
    } catch (err) {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
      alert("Error placing order. Please try again.");
    }
  };

  const displayTitle = language === 'hi' 
    ? (title === 'Place Order' ? 'ऑर्डर दें' : 'ऑर्डर चेकआउट')
    : title;

  return (
    <div className="min-h-[85vh] bg-[#fdfbf7] py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      
      {/* Page Title */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{displayTitle}</h1>
          <p className="text-xs text-slate-500">
            {language === 'hi' ? 'शुद्ध चक्की ताज़ा आटा सीधी डिलीवरी' : 'Pure Stone-Milled Chakki Fresh Flour Direct Delivery'}
          </p>
        </div>
        <button 
          onClick={() => router.push('/')} 
          className="text-xs font-bold text-slate-500 hover:text-red-600 bg-white px-3 py-1.5 rounded-full border border-slate-200 transition cursor-pointer"
        >
          {language === 'hi' ? 'बाहर जाएं' : 'Exit'}
        </button>
      </div>

      {/* 3-Step Progress Indicator */}
      <div className="mb-8 bg-white p-4 rounded-2xl border border-amber-900/10 shadow-sm">
        <div className="flex justify-between items-center relative max-w-sm mx-auto">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 z-0 rounded-full"></div>
          <div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-emerald-800 z-0 rounded-full transition-all duration-300"
            style={{ width: `${((step - 1) / 2) * 100}%` }}
          ></div>
          
          {[1, 2, 3].map((s) => (
            <div 
              key={s} 
              className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center font-black text-xs transition-all ${
                step === s 
                  ? 'bg-amber-400 text-emerald-950 ring-4 ring-amber-400/30 scale-110 shadow-md' 
                  : step > s 
                  ? 'bg-emerald-900 text-amber-300 shadow-sm' 
                  : 'bg-slate-100 text-slate-400 border border-slate-200'
              }`}
            >
              {step > s ? '✓' : s}
            </div>
          ))}
        </div>

        <div className="flex justify-between text-xs font-bold text-slate-600 mt-2 max-w-sm mx-auto px-1">
          <span className={step === 1 ? 'text-emerald-950 font-black' : ''}>{t('step1Title')}</span>
          <span className={step === 2 ? 'text-emerald-950 font-black' : ''}>{t('step2Title')}</span>
          <span className={step === 3 ? 'text-emerald-950 font-black' : ''}>{t('step3Title')}</span>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-2xl overflow-hidden border border-amber-900/10">
        
        {/* STEP 1: ORDER DETAILS & QUANTITY ADJUSTMENT */}
        {step === 1 && (
          <div className="p-5 sm:p-8 space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-lg font-black text-slate-900">
                {language === 'hi' ? 'आपके चुने हुए आटा उत्पाद' : 'Your Selected Flour Items'}
              </h2>
              <p className="text-xs text-slate-500">
                {language === 'hi' ? 'प्रत्येक पैक में ताज़ा चक्की का पिसा आटा है' : 'Each pack contains fresh stone-ground flour'}
              </p>
            </div>

            {/* Cart Items List with + / - Quantity Controls */}
            <div className="space-y-3">
              {cart.map((item) => {
                const prodName = language === 'hi' && item.product.nameHi ? item.product.nameHi : item.product.name;
                const prodWeight = language === 'hi' ? item.product.weight.replace('KG', 'किलो') : item.product.weight;
                return (
                  <div key={item.product.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <div className="relative w-16 h-16 bg-white rounded-xl overflow-hidden border border-slate-200 shrink-0">
                        <Image src={item.product.image || '/images/wheat_flour.jpg'} alt={prodName} fill className="object-cover" />
                      </div>
                      <div>
                        <h3 className="font-black text-slate-900 text-sm leading-snug">{prodName}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full text-[10px] font-black">
                            {prodWeight || '5 KG'} {t('pack')}
                          </span>
                          <span className="text-xs font-bold text-slate-500">₹{item.product.price}</span>
                        </div>
                      </div>
                    </div>

                    {/* Editable Quantity Controls */}
                    <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto border-t sm:border-t-0 pt-2 sm:pt-0">
                      <div className="flex items-center border-2 border-slate-300 rounded-xl bg-white shadow-sm overflow-hidden h-9">
                        <button 
                          type="button" 
                          onClick={() => updateQuantity(item.product.id, Math.max(1, item.quantity - 1))} 
                          className="w-8 h-full flex items-center justify-center text-slate-700 hover:bg-slate-100 font-black text-base cursor-pointer"
                        >
                          −
                        </button>
                        <span className="w-8 text-center font-black text-xs text-slate-900">{item.quantity}</span>
                        <button 
                          type="button" 
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)} 
                          className="w-8 h-full flex items-center justify-center text-slate-700 hover:bg-slate-100 font-black text-base cursor-pointer"
                        >
                          +
                        </button>
                      </div>

                      <div className="font-black text-slate-900 text-base min-w-[70px] text-right">
                        ₹{item.product.price * item.quantity}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Estimated Delivery & Express Option */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Truck size={15} className="text-emerald-800" />
                  {language === 'hi' ? 'डिलीवरी का समय और विकल्प' : 'Delivery Speed & Schedule'}
                </span>
                {feasibility.isExpressAvailable ? (
                  <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Zap size={10} className="fill-amber-600 text-amber-600" /> 2-Hour Express Feasible
                  </span>
                ) : (
                  <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Standard Chakki Delivery
                  </span>
                )}
              </div>

              {feasibility.isExpressAvailable ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <label className={`p-3 rounded-xl border cursor-pointer transition flex items-start gap-2 ${deliverySpeed === 'express' ? 'border-amber-500 bg-amber-50/60 ring-2 ring-amber-400/30' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                    <input 
                      type="radio" 
                      name="deliverySpeed" 
                      value="express" 
                      checked={deliverySpeed === 'express'} 
                      onChange={() => setDeliverySpeed('express')}
                      className="mt-0.5 text-amber-500"
                    />
                    <div>
                      <p className="font-black text-slate-900 text-xs flex items-center gap-1">
                        ⚡ {language === 'hi' ? '2 घंटे में एक्सप्रेस डिलीवरी' : 'Express Delivery (2 Hours)'}
                      </p>
                      <p className="text-[11px] text-emerald-800 font-bold mt-0.5">
                        {feasibility.estimatedDeliveryTime}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {language === 'hi' ? 'प्राथमिकता चक्की पिसाई' : 'Priority fresh chakki milling'}
                      </p>
                    </div>
                  </label>

                  <label className={`p-3 rounded-xl border cursor-pointer transition flex items-start gap-2 ${deliverySpeed === 'standard' ? 'border-emerald-700 bg-emerald-50/40 ring-2 ring-emerald-700/20' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                    <input 
                      type="radio" 
                      name="deliverySpeed" 
                      value="standard" 
                      checked={deliverySpeed === 'standard'} 
                      onChange={() => setDeliverySpeed('standard')}
                      className="mt-0.5 text-emerald-700"
                    />
                    <div>
                      <p className="font-black text-slate-900 text-xs flex items-center gap-1">
                        📦 {language === 'hi' ? 'मानक ताज़ा डिलीवरी' : 'Standard Fresh Delivery'}
                      </p>
                      <p className="text-[11px] text-slate-700 font-bold mt-0.5">
                        {feasibility.standardDeliveryTime}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {language === 'hi' ? 'नियमित बैच पिसाई' : 'Standard batch milling'}
                      </p>
                    </div>
                  </label>
                </div>
              ) : (
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs flex items-start gap-2">
                  <Clock size={15} className="text-slate-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-slate-800">
                      {language === 'hi' ? 'अनुमानित डिलीवरी:' : 'Estimated Delivery:'} <span className="text-emerald-900 font-black">{feasibility.standardDeliveryTime}</span>
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {feasibility.expressReason ? `⚡ 2-Hour Express: ${feasibility.expressReason}` : 'Standard chakki stone milling batch'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Price Breakdown */}
            <div className="bg-amber-50/40 p-4 rounded-xl border border-amber-900/10 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>{t('subtotal')}:</span>
                <span className="font-bold text-slate-900">₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>{t('deliveryCharge')}:</span>
                <span className="font-bold text-emerald-800">{deliveryCharge === 0 ? t('freeDelivery') : `+₹${deliveryCharge}`}</span>
              </div>
              <div className="flex justify-between border-t border-amber-900/10 pt-2 font-black text-slate-900 text-sm">
                <span>{t('grandTotal')}:</span>
                <span className="text-emerald-950 font-black text-lg">₹{total}</span>
              </div>
            </div>

            <button 
              onClick={() => setStep(2)}
              className="w-full bg-amber-500 hover:bg-amber-600 text-emerald-950 font-black text-sm py-3.5 rounded-xl transition flex justify-center items-center gap-2 cursor-pointer shadow-md"
            >
              {language === 'hi' ? 'पते पर आगे बढ़ें' : 'Proceed to Address'} <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* STEP 2: ADDRESS WITH GPS LOCATION DETECTION */}
        {step === 2 && (
          <div className="p-5 sm:p-8 space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <button onClick={handleBack} className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer">
                <ArrowLeft size={16} />
              </button>
              <div>
                <h2 className="text-lg font-black text-slate-900">
                  {language === 'hi' ? 'डिलीवरी पता' : 'Delivery Address'}
                </h2>
                <p className="text-xs text-slate-500">
                  {language === 'hi' ? 'हम आपका चक्की का आटा कहां पहुंचाएं?' : 'Where should we deliver your chakki flour?'}
                </p>
              </div>
            </div>

            {/* GPS Location Highlight Banner */}
            <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                    <Compass size={15} className="text-amber-700" />
                    {t('autoGpsNotice')}
                  </p>
                  <p className="text-[11px] text-amber-900/80 mt-0.5">
                    {t('autoGpsDesc')}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  disabled={isLocating}
                  className={`px-4 py-2.5 rounded-xl font-black text-xs transition flex items-center justify-center gap-2 shrink-0 cursor-pointer shadow-sm ${
                    isLocating
                      ? 'bg-amber-200 text-amber-800 cursor-not-allowed'
                      : 'bg-emerald-950 hover:bg-emerald-900 text-amber-300 active:scale-95'
                  }`}
                >
                  {isLocating ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> {t('detectingGps')}
                    </>
                  ) : (
                    <>
                      <Navigation size={14} /> {t('useCurrentLocation')}
                    </>
                  )}
                </button>
              </div>

              {/* Error Alert */}
              {locationError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700">
                  <AlertTriangle size={16} className="text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">GPS Notice:</p>
                    <p className="text-[11px] leading-relaxed text-red-600">{locationError}</p>
                  </div>
                </div>
              )}

              {/* Success Alert */}
              {locationSuccess && (
                <div className="p-3 bg-emerald-100/80 border border-emerald-300 rounded-xl flex items-start gap-2 text-xs text-emerald-950">
                  <CheckCircle size={16} className="text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">{locationSuccess}</p>
                    {customerInfo.lat && customerInfo.lng && (
                      <p className="text-[10px] text-emerald-800 font-medium mt-0.5">
                        Latitude: {customerInfo.lat.toFixed(5)}, Longitude: {customerInfo.lng.toFixed(5)}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Address Form */}
            <form onSubmit={handleAddressSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{t('fullName')}</label>
                  <input 
                    required 
                    type="text" 
                    value={customerInfo.name} 
                    onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})} 
                    className="w-full border border-slate-200 rounded-xl p-3 text-xs outline-none focus:ring-2 focus:ring-emerald-700 font-semibold" 
                    placeholder={language === 'hi' ? 'उदा. राहुल शर्मा' : 'e.g. Rahul Sharma'} 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{t('mobileNumber')}</label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-slate-200 bg-slate-100 text-slate-600 font-bold text-xs">
                      +91
                    </span>
                    <input 
                      required 
                      type="tel" 
                      pattern="[0-9]{10}" 
                      value={customerInfo.phone} 
                      onChange={e => setCustomerInfo({...customerInfo, phone: e.target.value})} 
                      className="flex-1 border border-slate-200 rounded-r-xl p-3 text-xs outline-none focus:ring-2 focus:ring-emerald-700 font-semibold" 
                      placeholder={language === 'hi' ? '10 अंकों का मोबाइल नंबर' : '10-digit mobile number'} 
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{t('completeDeliveryAddress')}</label>
                <textarea 
                  required 
                  rows={2} 
                  value={customerInfo.address} 
                  onChange={e => setCustomerInfo({...customerInfo, address: e.target.value})} 
                  className="w-full border border-slate-200 rounded-xl p-3 text-xs outline-none focus:ring-2 focus:ring-emerald-700 font-semibold" 
                  placeholder={language === 'hi' ? 'मकान / फ्लैट नं., सोसायटी, सड़क, इलाका' : 'House / Flat No, Street, Landmark, Area'}
                ></textarea>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{t('localityLandmark')}</label>
                  <input 
                    type="text" 
                    value={customerInfo.locality} 
                    onChange={e => setCustomerInfo({...customerInfo, locality: e.target.value})} 
                    className="w-full border border-slate-200 rounded-xl p-3 text-xs outline-none focus:ring-2 focus:ring-emerald-700 font-semibold" 
                    placeholder="Sector 14 / Near Metro" 
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{t('city')}</label>
                  <input 
                    required 
                    type="text" 
                    value={customerInfo.city} 
                    onChange={e => setCustomerInfo({...customerInfo, city: e.target.value})} 
                    className="w-full border border-slate-200 rounded-xl p-3 text-xs outline-none focus:ring-2 focus:ring-emerald-700 font-semibold" 
                    placeholder="Gurugram" 
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{t('district')}</label>
                  <input 
                    type="text" 
                    value={customerInfo.district} 
                    onChange={e => setCustomerInfo({...customerInfo, district: e.target.value})} 
                    className="w-full border border-slate-200 rounded-xl p-3 text-xs outline-none focus:ring-2 focus:ring-emerald-700 font-semibold" 
                    placeholder="Gurugram" 
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{t('state')}</label>
                  <input 
                    type="text" 
                    value={customerInfo.state} 
                    onChange={e => setCustomerInfo({...customerInfo, state: e.target.value})} 
                    className="w-full border border-slate-200 rounded-xl p-3 text-xs outline-none focus:ring-2 focus:ring-emerald-700 font-semibold" 
                    placeholder="Haryana" 
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{t('pincode')}</label>
                  <input 
                    required 
                    type="text" 
                    value={customerInfo.pincode} 
                    onChange={e => setCustomerInfo({...customerInfo, pincode: e.target.value})} 
                    className="w-full border border-slate-200 rounded-xl p-3 text-xs outline-none focus:ring-2 focus:ring-emerald-700 font-semibold" 
                    placeholder="122001" 
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{t('country')}</label>
                  <input 
                    required 
                    type="text" 
                    value={customerInfo.country} 
                    onChange={e => setCustomerInfo({...customerInfo, country: e.target.value})} 
                    className="w-full border border-slate-200 rounded-xl p-3 text-xs outline-none focus:ring-2 focus:ring-emerald-700 font-semibold" 
                    placeholder="India" 
                  />
                </div>
              </div>

              {/* Coordinates Preview */}
              {customerInfo.lat && customerInfo.lng && (
                <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-200/70 flex items-center justify-between text-xs text-emerald-950">
                  <div className="flex items-center gap-1.5 font-bold">
                    <Navigation size={13} className="text-emerald-700" />
                    <span>GPS: {customerInfo.lat.toFixed(5)}, {customerInfo.lng.toFixed(5)}</span>
                  </div>
                  <a 
                    href={`https://www.google.com/maps?q=${customerInfo.lat},${customerInfo.lng}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-700 underline font-black text-[11px] flex items-center gap-0.5"
                  >
                    View Map <ExternalLink size={11} />
                  </a>
                </div>
              )}

              <button 
                type="submit" 
                className="w-full mt-4 bg-amber-500 hover:bg-amber-600 text-emerald-950 font-black text-sm py-3.5 rounded-xl transition flex justify-center items-center gap-2 cursor-pointer shadow-md"
              >
                {language === 'hi' ? 'भुगतान पर आगे बढ़ें' : 'Proceed to Payment'} <ArrowRight size={16} />
              </button>
            </form>
          </div>
        )}

        {/* STEP 3: PAYMENT */}
        {step === 3 && (
          <div className="p-5 sm:p-8 space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <button onClick={handleBack} className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer">
                <ArrowLeft size={16} />
              </button>
              <div>
                <h2 className="text-lg font-black text-slate-900">{t('selectPaymentMode')}</h2>
                <p className="text-xs text-slate-500">
                  {language === 'hi' ? 'ऑनलाइन भुगतान करें या कैश ऑन डिलीवरी चुनें' : 'Pay securely online or choose Cash on Delivery'}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <label className={`flex items-center gap-3 p-4 border rounded-2xl cursor-pointer transition ${paymentChoice === 'online' ? 'border-emerald-800 bg-emerald-50/50 ring-2 ring-emerald-800/20' : 'border-slate-200'}`}>
                <input 
                  type="radio" 
                  name="paymentChoice" 
                  value="online" 
                  checked={paymentChoice === 'online'} 
                  onChange={() => setPaymentChoice('online')}
                  className="w-4 h-4 text-emerald-800"
                />
                <div>
                  <p className="font-black text-slate-900 text-xs sm:text-sm">{t('upiOnline')}</p>
                  <p className="text-[11px] text-slate-500">
                    {language === 'hi' ? '100% सुरक्षित तुरंत डिजिटल भुगतान' : '100% Secure instant contactless payment'}
                  </p>
                </div>
              </label>

              <label className={`flex items-center gap-3 p-4 border rounded-2xl cursor-pointer transition ${paymentChoice === 'cod' ? 'border-emerald-800 bg-emerald-50/50 ring-2 ring-emerald-800/20' : 'border-slate-200'}`}>
                <input 
                  type="radio" 
                  name="paymentChoice" 
                  value="cod" 
                  checked={paymentChoice === 'cod'} 
                  onChange={() => setPaymentChoice('cod')}
                  className="w-4 h-4 text-emerald-800"
                />
                <div>
                  <p className="font-black text-slate-900 text-xs sm:text-sm">{t('cod')}</p>
                  <p className="text-[11px] text-slate-500">
                    {language === 'hi' ? `डिलीवरी के समय ₹${total} नकद भुगतान करें` : `Pay ₹${total} in cash upon order delivery`}
                  </p>
                </div>
              </label>
            </div>

            {paymentChoice === 'online' && (
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-center space-y-3">
                <QrCode size={56} className="mx-auto text-emerald-950" />
                <p className="font-black text-slate-900 text-sm">
                  {language === 'hi' ? `₹${total} भुगतान के लिए क्यूआर कोड स्कैन करें` : `Scan QR Code to Pay ₹${total}`}
                </p>
                <p className="text-xs text-slate-600 font-mono bg-white inline-block px-3 py-1 rounded-lg border border-slate-200 select-all font-bold">
                  UPI ID: 9893249212@mbk
                </p>
                <div className="max-w-xs mx-auto text-left pt-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {language === 'hi' ? 'ट्रांजेक्शन आईडी / UTR *' : 'Transaction ID / UTR *'}
                  </label>
                  <input 
                    type="text" 
                    value={txnId} 
                    onChange={(e) => { setTxnId(e.target.value); setTxnError(''); }}
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-emerald-700 font-semibold"
                    placeholder="e.g. 123456789012"
                  />
                  {txnError && <p className="text-xs text-red-600 mt-1 font-bold">{txnError}</p>}
                </div>
              </div>
            )}

            <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-3">
              <div>
                <span className="text-xs text-slate-500">{t('grandTotal')}:</span>
                <p className="text-xl font-black text-emerald-950">₹{total}</p>
              </div>

              <button 
                onClick={placeOrder}
                disabled={isSubmitting}
                className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-black text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-md ${
                  isSubmitting 
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed pointer-events-none' 
                    : 'bg-emerald-950 hover:bg-emerald-900 text-amber-400 cursor-pointer'
                }`}
              >
                {isSubmitting 
                  ? (language === 'hi' ? 'ऑर्डर दिया जा रहा है...' : 'Placing Order...') 
                  : (language === 'hi' ? 'ऑर्डर कन्फ़र्म करें' : 'Confirm & Place Order')} <CheckCircle size={16} />
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
