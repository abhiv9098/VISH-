'use client';

import { useState, useMemo, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useOrders } from '@/context/OrderContext';
import { useLanguage } from '@/context/LanguageContext';
import { 
  Package, 
  Clock, 
  Truck, 
  ShoppingBag, 
  MapPin, 
  ExternalLink, 
  ChevronDown, 
  ChevronUp, 
  Zap,
  CheckCircle2,
  CreditCard,
  Banknote,
  Calendar,
  AlertCircle,
  XCircle,
  Sparkles,
  Phone,
  RotateCcw,
  Check
} from 'lucide-react';
import OrderTracking from '@/components/OrderTracking';
import CheckoutFlow from '@/components/CheckoutFlow';
import { useOrderCountdown } from '@/lib/useOrderCountdown';

function ActiveOrderCard({
  order,
  isNew,
  isDetailsOpen,
  onToggleDetails,
  language,
  customerProfile,
  formatOrderDate,
  formatOrderTime,
  getStatusBadge
}: {
  order: any;
  isNew: boolean;
  isDetailsOpen: boolean;
  onToggleDetails: () => void;
  language: string;
  customerProfile: any;
  formatOrderDate: (date?: string) => string;
  formatOrderTime: (date?: string) => string;
  getStatusBadge: (status: string) => { label: string; bg: string; dot: string };
}) {
  const countdown = useOrderCountdown(order, language);
  const statusMeta = getStatusBadge(order.status);

  const safeName = order.customerInfo?.name || customerProfile?.name || 'Customer';
  const safePhone = order.customerInfo?.phone || customerProfile?.phone || '';
  const safeAddress = order.customerInfo?.address || customerProfile?.address || 'N/A';
  const coords = order.customerInfo?.coordinates;
  const mapsUrl = order.customerInfo?.liveLocationUrl || (coords ? `https://www.google.com/maps?q=${coords.lat},${coords.lng}` : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(safeAddress)}`);

  const isOnlinePaid = order.paymentMethod === 'online' || (order.advancePaid > 0 && order.advancePaid >= order.total);
  const estDelivery = order.estimatedDelivery || (order.deliveryType === 'express' ? 'Within 2 hours' : 'Today in 3-4 hours');

  return (
    <div 
      className={`bg-white rounded-xl border transition-all duration-300 shadow-2xs overflow-hidden ${
        isNew 
          ? 'border-emerald-500 ring-2 ring-emerald-500/20' 
          : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      {/* 1. Header: Date & Status Badge with Live Countdown */}
      <div className="bg-slate-50/80 px-3.5 py-2.5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-600">
            {language === 'hi' ? 'ऑर्डर की तारीख:' : 'Ordered on'}{' '}
            <strong className="text-slate-900">{formatOrderDate(order.date)}, {formatOrderTime(order.date)}</strong>
          </span>
          {isNew && (
            <span className="bg-emerald-600 text-white text-[9.5px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-2xs">
              <Sparkles size={10} className="fill-white" />
              <span>{language === 'hi' ? 'नया ऑर्डर' : 'New Order'}</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {countdown.isDelivered ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-950 border border-emerald-300 shadow-2xs">
              <Check size={11} className="text-emerald-700 stroke-[3]" />
              <span><strong>{countdown.displayText}</strong></span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-amber-50 text-amber-950 border border-amber-300 shadow-2xs">
              <Clock size={11} className="text-amber-700" />
              <span>{language === 'hi' ? 'समय:' : 'ETA:'} <strong className="font-mono">{countdown.displayText}</strong></span>
            </span>
          )}
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border ${statusMeta.bg}`}>
            <span className={`w-2 h-2 rounded-full ${statusMeta.dot}`} />
            <span>{statusMeta.label}</span>
          </span>
        </div>
      </div>

      {/* 2. Items List (Flipkart E-Commerce Product Rows) */}
      <div className="p-3.5 space-y-3">
        <div className="divide-y divide-slate-100">
          {order.items?.map((item: any, idx: number) => {
            const itemName = language === 'hi' && item.product?.nameHi ? item.product.nameHi : (item.product?.name || 'Chakki Fresh Atta');
            const itemWeight = item.product?.weight || '5 KG';
            const itemPrice = item.product?.price || 0;
            const itemImage = item.product?.image || '/images/wheat_flour.jpg';

            return (
              <div key={idx} className="py-2 first:pt-0 last:pb-0 flex items-center gap-3">
                <div className="relative w-14 h-14 rounded-lg bg-amber-50/40 border border-slate-200/80 overflow-hidden shrink-0">
                  <Image 
                    src={itemImage} 
                    alt={itemName} 
                    fill 
                    className="object-cover" 
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                    {itemName}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {language === 'hi' ? 'पैक:' : 'Pack:'} <span className="font-semibold text-slate-700">{itemWeight}</span>
                    {' • '}
                    {language === 'hi' ? 'मात्रा:' : 'Qty:'} <span className="font-bold text-emerald-800">{item.quantity}</span>
                  </p>
                  <p className="text-xs font-black text-slate-900 mt-0.5">
                    ₹{itemPrice * item.quantity}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* 3. Flipkart 4-Stage Timeline Tracker */}
        <div className="pt-2">
          <OrderTracking 
            currentStatus={order.status} 
            city={order.customerInfo?.city || "Gurugram"} 
            estimatedDelivery={estDelivery}
            deliveryType={order.deliveryType}
            order={order}
          />
        </div>

        {/* 4. Delivery Address & Expected Arrival */}
        <div className="bg-slate-50/70 rounded-xl p-3 border border-slate-200/80 flex flex-wrap items-center justify-between gap-2.5 text-xs">
          <div className="flex items-start gap-2 min-w-0 flex-1">
            <MapPin size={14} className="text-emerald-700 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="font-bold text-slate-900 text-xs truncate">
                {safeName} {safePhone ? `(${safePhone})` : ''}
              </p>
              <p className="text-[11px] text-slate-600 line-clamp-1 mt-0.5">
                {safeAddress}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="bg-white px-2.5 py-1 rounded-lg border border-amber-300 text-[11px] flex items-center gap-1.5 shadow-2xs">
              <Clock size={12} className="text-amber-700 shrink-0" />
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase block leading-none">
                  {language === 'hi' ? 'डिलीवरी समय' : 'Delivery Time'}
                </span>
                <span className="font-extrabold text-slate-900 leading-tight block">
                  {countdown.isDelivered ? (
                    <span className="text-emerald-800 font-bold">{countdown.displayText}</span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <span>{countdown.baseEstimate}</span>
                      <span className="text-amber-700 font-mono text-[10.5px]">({countdown.displayText})</span>
                    </span>
                  )}
                </span>
              </div>
            </div>

            {mapsUrl && (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline shrink-0 bg-white px-2 py-1.5 rounded-lg border border-slate-200"
              >
                <span>{language === 'hi' ? 'नक्शा देखें' : 'Map'}</span>
                <ExternalLink size={10} />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* 5. Footer: Total, Payment Method & Toggle Details */}
      <div className="bg-slate-50/60 px-3.5 py-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-500 text-[11px]">
            {language === 'hi' ? 'कुल राशि:' : 'Total Amount:'}
          </span>
          <span className="font-black text-sm text-slate-900">
            ₹{order.total}
          </span>
          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border ${
            isOnlinePaid ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-amber-50 text-amber-900 border-amber-200'
          }`}>
            {isOnlinePaid ? <CreditCard size={10} /> : <Banknote size={10} />}
            <span>{isOnlinePaid ? (language === 'hi' ? 'ऑनलाइन भुगतान' : 'Paid Online') : (language === 'hi' ? 'कैश ऑन डिलीवरी' : 'Cash on Delivery')}</span>
          </span>
        </div>

        <button
          onClick={onToggleDetails}
          className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs hover:bg-slate-50 transition cursor-pointer"
        >
          <span>{isDetailsOpen ? (language === 'hi' ? 'कम विवरण' : 'Hide Details') : (language === 'hi' ? 'बिल विवरण' : 'Price Details')}</span>
          {isDetailsOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
      </div>

      {/* 6. Expandable Bill Details */}
      {isDetailsOpen && (
        <div className="p-3.5 bg-slate-50 border-t border-slate-200/80 space-y-1.5 text-xs">
          <div className="flex justify-between text-slate-600">
            <span>{language === 'hi' ? 'आइटम मूल्य:' : 'Items Subtotal:'}</span>
            <span className="font-semibold text-slate-900">₹{order.total - 50 > 0 ? order.total - 50 : order.total}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>{language === 'hi' ? 'डिलीवरी शुल्क:' : 'Delivery Charge:'}</span>
            <span className="font-semibold text-emerald-800">{order.total - 50 > 0 ? '₹50' : (language === 'hi' ? 'मुफ्त' : 'FREE')}</span>
          </div>
          <div className="flex justify-between font-black text-xs text-slate-900 border-t border-slate-200 pt-1.5">
            <span>{language === 'hi' ? 'अंतिम राशि:' : 'Final Payable:'}</span>
            <span className="text-emerald-950 font-black">₹{order.total}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function MyOrdersContent() {
  const searchParams = useSearchParams();
  const productId = searchParams?.get('productId');
  const newOrderId = searchParams?.get('newOrder');
  const { language, t } = useLanguage();
  const { orders, customerProfile } = useOrders();

  // Filter tab: 'ALL' | 'ACTIVE' | 'HISTORY'
  const [activeTab, setActiveTab] = useState<'ALL' | 'ACTIVE' | 'HISTORY'>('ALL');
  // State for show/hide full items/address details per order
  const [detailsVisible, setDetailsVisible] = useState<Record<string, boolean>>({});

  // Deduplicate orders and separate cleanly into Active / New Orders vs Order History
  const { activeOrders, historyOrders } = useMemo(() => {
    const seen = new Set<string>();
    const deduplicated = orders.filter(o => {
      if (!o || !o.id || seen.has(o.id)) return false;
      seen.add(o.id);
      return true;
    });

    const isOrderDeliveredOrCancelled = (o: any) => {
      const st = (o.status || '').toLowerCase().trim();
      return st === 'delivered' || st === 'completed' || st === 'complete delivery' || st === 'cancelled';
    };

    const activeList: any[] = [];
    const historyList: any[] = [];

    deduplicated.forEach(o => {
      if (isOrderDeliveredOrCancelled(o)) {
        historyList.push(o);
      } else {
        activeList.push(o);
      }
    });

    // Sort by date (descending), putting newly placed order at the very top
    const sortOrders = (list: any[]) => {
      return [...list].sort((a, b) => {
        if (newOrderId) {
          if (a.id === newOrderId) return -1;
          if (b.id === newOrderId) return 1;
        }
        const timeA = a.date ? new Date(a.date).getTime() : 0;
        const timeB = b.date ? new Date(b.date).getTime() : 0;
        return timeB - timeA;
      });
    };

    return {
      activeOrders: sortOrders(activeList),
      historyOrders: sortOrders(historyList)
    };
  }, [orders, newOrderId]);

  const totalOrdersCount = activeOrders.length + historyOrders.length;

  // Direct checkout flow if customer navigated with a productId
  if (productId && !newOrderId) {
    return <CheckoutFlow title={language === 'hi' ? 'ऑर्डर दें' : 'Place Order'} />;
  }

  const toggleDetails = (id: string) => {
    setDetailsVisible(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const formatOrderDate = (dateStr?: string) => {
    const d = dateStr ? new Date(dateStr) : new Date();
    return d.toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatOrderTime = (dateStr?: string) => {
    const d = dateStr ? new Date(dateStr) : new Date();
    return d.toLocaleTimeString(language === 'hi' ? 'hi-IN' : 'en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const s = (status || '').toLowerCase().trim();
    if (s === 'delivered' || s === 'completed') {
      return {
        label: language === 'hi' ? 'डिलीवर हो गया' : 'Delivered',
        bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        dot: 'bg-emerald-600'
      };
    }
    if (s === 'out for delivery' || s === 'dispatched') {
      return {
        label: language === 'hi' ? 'डिलीवरी के लिए निकला' : 'Out for Delivery',
        bg: 'bg-blue-50 text-blue-800 border-blue-200',
        dot: 'bg-blue-600'
      };
    }
    if (s === 'order confirmed' || s === 'confirmed' || s === 'preparing your order' || s === 'pending') {
      return {
        label: language === 'hi' ? 'कन्फ़र्म हुआ' : 'Confirmed',
        bg: 'bg-teal-50 text-teal-800 border-teal-200',
        dot: 'bg-teal-600'
      };
    }
    if (s === 'cancelled') {
      return {
        label: language === 'hi' ? 'रद्द हुआ' : 'Cancelled',
        bg: 'bg-red-50 text-red-800 border-red-200',
        dot: 'bg-red-600'
      };
    }
    return {
      label: language === 'hi' ? 'ऑर्डर दिया गया' : 'Order Placed',
      bg: 'bg-amber-50 text-amber-900 border-amber-200',
      dot: 'bg-amber-500'
    };
  };

  // Render an individual Active / Current Purchase Card (Flipkart Style with Live Countdown)
  const renderActiveOrderCard = (order: any) => (
    <ActiveOrderCard
      key={order.id}
      order={order}
      isNew={Boolean(newOrderId && order.id === newOrderId)}
      isDetailsOpen={Boolean(detailsVisible[order.id])}
      onToggleDetails={() => toggleDetails(order.id)}
      language={language}
      customerProfile={customerProfile}
      formatOrderDate={formatOrderDate}
      formatOrderTime={formatOrderTime}
      getStatusBadge={getStatusBadge}
    />
  );

  // Render an individual Previous Purchase Card (Order History)
  const renderHistoryOrderCard = (order: any) => {
    const isDetailsOpen = !!detailsVisible[order.id];
    const isDelivered = order.status === 'Delivered' || order.status === 'Completed';
    const firstProduct = order.items?.[0]?.product;
    const firstProductName = language === 'hi' && firstProduct?.nameHi ? firstProduct.nameHi : (firstProduct?.name || 'Fresh Chakki Flour');
    const firstProductImage = firstProduct?.image || '/images/wheat_flour.jpg';

    return (
      <div 
        key={order.id} 
        className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition-all shadow-2xs overflow-hidden"
      >
        {/* Header: Delivery Date & Clean Status */}
        <div className="bg-slate-50/70 px-3.5 py-2.5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5">
            {isDelivered ? (
              <span className="inline-flex items-center gap-1 text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 text-xs">
                <CheckCircle2 size={13} className="text-emerald-600" />
                <span>{language === 'hi' ? 'डिलीवर हुआ' : 'Delivered on'} {formatOrderDate(order.date)}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-red-800 font-bold bg-red-50 px-2 py-0.5 rounded-md border border-red-200 text-xs">
                <XCircle size={13} className="text-red-600" />
                <span>{language === 'hi' ? 'रद्द हुआ' : 'Cancelled on'} {formatOrderDate(order.date)}</span>
              </span>
            )}
          </div>

          <span className="text-slate-500 font-medium text-[11px]">
            {formatOrderTime(order.date)}
          </span>
        </div>

        {/* Card Body: Items Preview */}
        <div className="p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative w-14 h-14 rounded-lg bg-amber-50/40 border border-slate-200/80 overflow-hidden shrink-0">
              <Image 
                src={firstProductImage} 
                alt={firstProductName} 
                fill 
                className="object-cover" 
              />
            </div>

            <div className="min-w-0">
              <h4 className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                {firstProductName}
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {order.items?.length > 1 ? (
                  <span>{order.items.length} {language === 'hi' ? 'उत्पाद' : 'items'} • </span>
                ) : null}
                <span className="font-semibold text-slate-700">{firstProduct?.weight || '5 KG'}</span>
              </p>
              <p className="text-xs font-black text-slate-900 mt-0.5">
                ₹{order.total}
              </p>
            </div>
          </div>

          {/* Action Buttons: Buy Again / Reorder & View Details */}
          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            {firstProduct?.id && (
              <Link
                href={`/order?productId=${firstProduct.id}`}
                className="inline-flex items-center gap-1 bg-emerald-950 hover:bg-emerald-900 text-amber-300 font-bold text-xs px-3 py-1.5 rounded-lg shadow-2xs transition active:scale-95"
              >
                <RotateCcw size={12} />
                <span>{language === 'hi' ? 'फिर से ऑर्डर करें' : 'Buy Again'}</span>
              </Link>
            )}

            <button
              onClick={() => toggleDetails(order.id)}
              className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-lg transition cursor-pointer"
            >
              <span>{isDetailsOpen ? (language === 'hi' ? 'कम' : 'Hide') : (language === 'hi' ? 'विवरण' : 'Details')}</span>
              {isDetailsOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
          </div>
        </div>

        {/* Expandable Order Details */}
        {isDetailsOpen && (
          <div className="p-3.5 bg-slate-50 border-t border-slate-200/80 space-y-2 text-xs">
            <div className="divide-y divide-slate-200/60">
              {order.items?.map((item: any, idx: number) => (
                <div key={idx} className="py-1.5 first:pt-0 last:pb-0 flex justify-between text-slate-700">
                  <span>
                    {language === 'hi' && item.product?.nameHi ? item.product.nameHi : item.product?.name} ({item.product?.weight || '5 KG'}) × {item.quantity}
                  </span>
                  <span className="font-bold text-slate-900">₹{(item.product?.price || 0) * item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs font-black">
              <span className="text-slate-600">{language === 'hi' ? 'कुल भुगतान:' : 'Total Paid:'}</span>
              <span className="text-emerald-900 font-black">₹{order.total}</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-[85vh] bg-[#f8f9fa] py-4 sm:py-6 px-3 sm:px-6 lg:px-8 max-w-3xl mx-auto pb-24 md:pb-12">
      
      {/* 1. Header Bar with Order Count */}
      <div className="bg-white px-4 py-3 rounded-xl border border-slate-200 shadow-2xs mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-emerald-950 text-amber-300 flex items-center justify-center shrink-0 shadow-2xs">
            <Package size={17} />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
              {language === 'hi' ? 'मेरे ऑर्डर' : 'My Orders'}
            </h1>
            <p className="text-[11px] text-slate-500">
              {language === 'hi' ? 'ताज़ा चक्की आटा पिसाई और डिलीवरी स्थिति' : 'Track your fresh chakki flour orders'}
            </p>
          </div>
        </div>

        <span className="bg-slate-100 text-slate-700 font-bold text-xs px-2.5 py-1 rounded-lg border border-slate-200">
          {totalOrdersCount} {language === 'hi' ? 'ऑर्डर' : (totalOrdersCount === 1 ? 'Order' : 'Orders')}
        </span>
      </div>

      {/* 2. Flipkart Style Filter Tabs */}
      {totalOrdersCount > 0 && (
        <div className="flex items-center gap-1.5 mb-4 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              activeTab === 'ALL'
                ? 'bg-emerald-950 text-amber-300 shadow-2xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {language === 'hi' ? 'सभी ऑर्डर' : 'All Orders'} ({totalOrdersCount})
          </button>

          <button
            onClick={() => setActiveTab('ACTIVE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap flex items-center gap-1 ${
              activeTab === 'ACTIVE'
                ? 'bg-emerald-950 text-amber-300 shadow-2xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span>{language === 'hi' ? 'सक्रिय नए ऑर्डर' : 'Active Orders'}</span>
            <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${
              activeTab === 'ACTIVE' ? 'bg-amber-400 text-emerald-950' : 'bg-emerald-100 text-emerald-800'
            }`}>
              {activeOrders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('HISTORY')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap flex items-center gap-1 ${
              activeTab === 'HISTORY'
                ? 'bg-emerald-950 text-amber-300 shadow-2xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span>{language === 'hi' ? 'ऑर्डर इतिहास' : 'Order History'}</span>
            <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${
              activeTab === 'HISTORY' ? 'bg-amber-400 text-emerald-950' : 'bg-slate-200 text-slate-700'
            }`}>
              {historyOrders.length}
            </span>
          </button>
        </div>
      )}

      {/* 3. Empty State */}
      {totalOrdersCount === 0 ? (
        <div className="bg-white rounded-2xl shadow-2xs border border-slate-200 p-8 sm:p-12 text-center max-w-md mx-auto my-6 space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mx-auto shadow-2xs">
            <ShoppingBag size={30} className="stroke-[2.2]" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base sm:text-lg font-black text-slate-900">
              {language === 'hi' ? 'कोई ऑर्डर नहीं मिला' : 'No Orders Yet'}
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto">
              {language === 'hi' ? 'आपने अभी तक कोई ऑर्डर नहीं दिया है। ताज़ा चक्की आटा आज ही ऑर्डर करें!' : 'You haven\'t placed any orders yet. Fresh stone-milled atta delivered to your doorstep!'}
            </p>
          </div>
          <div className="pt-2">
            <Link 
              href="/" 
              className="inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-emerald-950 font-black px-5 py-2.5 rounded-xl shadow-xs transition active:scale-95 text-xs sm:text-sm"
            >
              <ShoppingBag size={15} className="stroke-[2.5]" />
              <span>{language === 'hi' ? 'अभी आटा ऑर्डर करें' : 'Order Fresh Atta Now'}</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* 4. ACTIVE / NEW ORDERS SECTION (Clearly at the top) */}
          {(activeTab === 'ALL' || activeTab === 'ACTIVE') && activeOrders.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2 px-1">
                <h2 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
                  </span>
                  <span>{language === 'hi' ? 'सक्रिय ऑर्डर' : 'Active Orders'}</span>
                  <span className="bg-emerald-100 text-emerald-900 text-[10px] font-black px-2 py-0.2 rounded-full border border-emerald-300">
                    {activeOrders.length}
                  </span>
                </h2>
                <span className="text-[11px] text-emerald-700 font-bold">
                  {language === 'hi' ? 'लाइव ट्रैकिंग जारी' : 'Live Tracking'}
                </span>
              </div>

              {/* Each new purchase as its own separate card */}
              <div className="space-y-3">
                {activeOrders.map(order => renderActiveOrderCard(order))}
              </div>
            </div>
          )}

          {/* 5. ORDER HISTORY SECTION (Previous purchases below, without duplicates) */}
          {(activeTab === 'ALL' || activeTab === 'HISTORY') && historyOrders.length > 0 && (
            <div className={`space-y-3 ${activeOrders.length > 0 && activeTab === 'ALL' ? 'pt-4 border-t border-slate-200' : ''}`}>
              <div className="flex items-center justify-between gap-2 px-1">
                <h2 className="text-xs sm:text-sm font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 size={15} className="text-emerald-700" />
                  <span>{language === 'hi' ? 'ऑर्डर इतिहास' : 'Order History'}</span>
                  <span className="bg-slate-100 text-slate-700 text-[10px] font-black px-2 py-0.2 rounded-full border border-slate-200">
                    {historyOrders.length}
                  </span>
                </h2>
                <span className="text-[11px] text-slate-500 font-medium">
                  {language === 'hi' ? 'पूर्ण किए गए ऑर्डर' : 'Past Purchases'}
                </span>
              </div>

              {/* Each past purchase as its own separate card */}
              <div className="space-y-2.5">
                {historyOrders.map(order => renderHistoryOrderCard(order))}
              </div>
            </div>
          )}

          {/* Fallback when a filter tab has no matching orders */}
          {activeTab === 'ACTIVE' && activeOrders.length === 0 && (
            <div className="bg-white rounded-xl p-8 text-center border border-slate-200 text-slate-500 text-xs font-semibold">
              {language === 'hi' ? 'कोई सक्रिय ऑर्डर नहीं है।' : 'No active orders in progress.'}
            </div>
          )}

          {activeTab === 'HISTORY' && historyOrders.length === 0 && (
            <div className="bg-white rounded-xl p-8 text-center border border-slate-200 text-slate-500 text-xs font-semibold">
              {language === 'hi' ? 'अभी तक कोई पिछला ऑर्डर नहीं है।' : 'No past orders in history.'}
            </div>
          )}

        </div>
      )}

    </div>
  );
}

export default function MyOrdersPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-[50vh] text-xs font-bold text-slate-500">Loading Orders...</div>}>
      <MyOrdersContent />
    </Suspense>
  );
}
