'use client';

import { useEffect, useState, useMemo } from 'react';
import { 
  Search, 
  Phone, 
  Navigation, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Trash2,
  Zap,
  Bell,
  Truck,
  ChefHat,
  MessageCircle,
  PlusCircle,
  ExternalLink,
  Eye,
  X,
  Edit3
} from 'lucide-react';
import { useOrders } from '@/context/OrderContext';
import { Order, products, checkDeliveryFeasibility, getCanonicalStatus } from '@/lib/data';

const ETA_PRESETS = [
  { value: 'within 30 mins', label: '⚡ 30 Mins (30 मिनट)' },
  { value: 'within 45 mins', label: '⚡ 45 Mins (45 मिनट)' },
  { value: 'within 1 hour', label: '⚡ 1 Hour (1 घंटा)' },
  { value: 'within 1.5 hours', label: '⚡ 1.5 Hours (1.5 घंटा)' },
  { value: 'within 2 hours', label: '⚡ 2 Hours (2 घंटे)' },
  { value: 'today in 3-4 hours', label: '🕒 3-4 Hours (3-4 घंटे)' },
  { value: 'today by 5:00 PM', label: '🕒 Today by 5:00 PM' },
  { value: 'today by 7:00 PM', label: '🕒 Today by 7:00 PM' },
  { value: 'today by 9:00 PM', label: '🕒 Today by 9:00 PM' },
  { value: 'tomorrow morning', label: '🕒 Tomorrow Morning (कल सुबह)' },
  { value: 'tomorrow evening', label: '🕒 Tomorrow Evening (कल शाम)' },
];

function extractUrl(text?: string) {
  if (!text) return null;
  const match = text.match(new RegExp('https?:\\/\\/[^\\s]+'));
  return match ? match[0] : null;
}

export default function OrdersPage() {
  const { 
    orders, 
    updateOrderStatus, 
    updateOrderEstimatedDelivery,
    deleteOrder, 
    clearAllOrders,
    addOrder, 
    markOrdersAsSeen 
  } = useOrders();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [customEtaModalOrder, setCustomEtaModalOrder] = useState<Order | null>(null);
  const [customEtaInput, setCustomEtaInput] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleEtaSelect = async (orderId: string, val: string) => {
    if (val === '__custom__') {
      const target = uniqueOrders.find(o => o.id === orderId);
      if (target) {
        setCustomEtaModalOrder(target);
        setCustomEtaInput(target.estimatedDelivery || getEstDelivery(target));
      }
      return;
    }
    const success = await updateOrderEstimatedDelivery(orderId, val);
    if (success) {
      showToast(`⏱️ Delivery time updated to "${val}" and synced to Customer App!`);
    }
  };

  const getStatusDropdownValue = (order: Order) => {
    const canonical = getCanonicalStatus(order.status);
    if (canonical === 'Confirmed') return 'Order Confirmed';
    if (canonical === 'Pending') return 'Preparing Your Order';
    if (canonical === 'Out for Delivery') return 'Out for Delivery';
    if (canonical === 'Delivered') return 'Delivered';
    if (canonical === 'Cancelled') return 'Cancelled';
    return 'Order Placed';
  };

  const handleStatusChangeWithTime = async (orderId: string, rawVal: string) => {
    let targetStatus: Order['status'] = rawVal as Order['status'];
    let targetEta: string | undefined = undefined;

    if (rawVal.includes('|')) {
      const [statusPart, etaPart] = rawVal.split('|');
      if (etaPart === '__custom__') {
        const target = uniqueOrders.find(o => o.id === orderId);
        if (target) {
          setCustomEtaModalOrder(target);
          setCustomEtaInput(target.estimatedDelivery || 'within 30 mins');
        }
        return;
      }
      targetStatus = statusPart as Order['status'];
      targetEta = etaPart;
    } else if (rawVal === 'Order Confirmed' || rawVal === 'Confirmed') {
      targetStatus = 'Order Confirmed';
      targetEta = '2 hours';
    } else if (rawVal === 'Preparing Your Order' || rawVal === 'Preparing') {
      targetStatus = 'Preparing Your Order';
      targetEta = '1 hour';
    } else if (rawVal === 'Out for Delivery') {
      targetStatus = 'Out for Delivery';
      targetEta = '30 minutes';
    } else if (rawVal === 'Delivered') {
      targetStatus = 'Delivered';
      targetEta = 'Delivered Successfully.';
    }

    const success = await updateOrderStatus(orderId, targetStatus, targetEta);
    if (success) {
      if (targetEta) {
        showToast(`Order status updated to "${targetStatus}" (${targetEta}) & synced to Customer App!`);
      } else {
        showToast(`Order status updated to "${targetStatus}"!`);
      }
    }
  };

  const handleCustomEtaSubmit = async () => {
    if (!customEtaModalOrder || !customEtaInput.trim()) return;
    const val = customEtaInput.trim();
    const success = await updateOrderStatus(customEtaModalOrder.id, 'Out for Delivery', val);
    if (success) {
      showToast(`🛵 Order ${customEtaModalOrder.id}: Out for Delivery with time "${val}" & synced to App!`);
    }
    setCustomEtaModalOrder(null);
    setCustomEtaInput('');
  };

  useEffect(() => {
    markOrdersAsSeen();
  }, []);

  // Deduplicate orders by ID to guarantee single display per order
  const uniqueOrders = useMemo(() => {
    const seen = new Set<string>();
    return orders.filter(o => {
      if (!o || !o.id || seen.has(o.id)) return false;
      seen.add(o.id);
      return true;
    });
  }, [orders]);

  // Real-time Counts for all status categories
  const counts = useMemo(() => {
    const c: Record<string, number> = {
      ALL: uniqueOrders.length,
      New: 0,
      Confirmed: 0,
      Pending: 0,
      'Out for Delivery': 0,
      Delivered: 0,
      Cancelled: 0,
    };
    for (const o of uniqueOrders) {
      const cat = getCanonicalStatus(o.status);
      if (c[cat] !== undefined) {
        c[cat]++;
      }
    }
    return c;
  }, [uniqueOrders]);

  // Filter tabs mapped to statuses
  const filterTabs = [
    { id: 'ALL', label: 'All Orders', count: counts.ALL },
    { id: 'New', label: 'New', count: counts.New },
    { id: 'Confirmed', label: 'Confirmed', count: counts.Confirmed },
    { id: 'Pending', label: 'Preparing', count: counts.Pending },
    { id: 'Out for Delivery', label: 'Out for Delivery', count: counts['Out for Delivery'] },
    { id: 'Delivered', label: 'Delivered', count: counts.Delivered },
    { id: 'Cancelled', label: 'Cancelled', count: counts.Cancelled },
  ];

  // Filter orders by search & canonical status tab
  const filteredOrders = useMemo(() => {
    return uniqueOrders.filter(order => {
      const safeId = order.id || '';
      const safeName = order.customerInfo?.name || '';
      const safePhone = order.customerInfo?.phone || '';
      const safeAddress = order.customerInfo?.address || '';

      const matchesSearch = 
        !searchTerm.trim() ||
        safeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        safeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        safePhone.includes(searchTerm) ||
        safeAddress.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (!matchesSearch) return false;

      if (statusFilter === 'ALL') return true;
      const orderCanonical = getCanonicalStatus(order.status);
      return orderCanonical === statusFilter;
    });
  }, [uniqueOrders, searchTerm, statusFilter]);

  const getStatusBadge = (status: Order['status']) => {
    const canonical = getCanonicalStatus(status);
    switch (canonical) {
      case 'Delivered':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Out for Delivery':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Pending':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'Confirmed':
        return 'bg-teal-100 text-teal-800 border-teal-300';
      case 'Cancelled':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-amber-100 text-amber-900 border-amber-300';
    }
  };

  const getEstDelivery = (order: Order) => {
    const canonical = getCanonicalStatus(order.status);
    if (canonical === 'Delivered') return 'Delivered Successfully.';
    if (order.estimatedDelivery) return order.estimatedDelivery;
    if (canonical === 'Out for Delivery') return '30 minutes';
    if (canonical === 'Pending') return '1 hour';
    if (canonical === 'Confirmed') return '2 hours';
    const baseDate = order.date ? new Date(order.date) : new Date();
    const feasibility = checkDeliveryFeasibility(order.items || [], order.customerInfo?.city, order.customerInfo?.pincode, baseDate);
    return order.deliveryType === 'express' ? feasibility.estimatedDeliveryTime : feasibility.standardDeliveryTime;
  };

  const createQuickTestOrder = () => {
    const testId = `ORD-${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    const randomLat = 22.9745 + (Math.random() - 0.5) * 0.05;
    const randomLng = 76.3595 + (Math.random() - 0.5) * 0.05;
    
    addOrder({
      id: testId,
      date: new Date().toISOString(),
      status: 'Order Placed',
      total: 280,
      advancePaid: 0,
      remainingAmount: 280,
      deliveryType: 'express',
      estimatedDelivery: 'within 2 hours',
      paymentMethod: 'cod',
      items: [{ product: products[0], quantity: 1 }],
      customerInfo: {
        name: 'Suresh Patel (Test Customer)',
        phone: '9893200111',
        email: 'suresh.patel@example.com',
        address: 'Station Road, Main Market, Sonkach, Dewas, Madhya Pradesh, 455118',
        city: 'Sonkach',
        district: 'Dewas',
        state: 'Madhya Pradesh',
        pincode: '455118',
        country: 'India',
        coordinates: {
          lat: parseFloat(randomLat.toFixed(5)),
          lng: parseFloat(randomLng.toFixed(5))
        },
        liveLocationUrl: `https://www.google.com/maps?q=${randomLat.toFixed(5)},${randomLng.toFixed(5)}`
      }
    });
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-12 w-full min-w-0">

      {/* Header Row: Title & Quick Test Order Button */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-gray-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-gray-900">
            Orders Manager
          </h2>
          <p className="text-xs text-gray-500">
            Manage live orders, progress status, and track delivery synchronization
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
          {uniqueOrders.length > 0 && (
            <button
              onClick={() => {
                if (confirm('Are you sure you want to remove all test orders? This will clear all orders.')) {
                  clearAllOrders();
                }
              }}
              className="inline-flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold text-xs px-3 py-2 rounded-xl transition cursor-pointer shadow-2xs"
            >
              <Trash2 size={14} />
              <span>Clear All Orders</span>
            </button>
          )}
          <button
            onClick={createQuickTestOrder}
            className="inline-flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold text-xs px-3.5 py-2 rounded-xl transition cursor-pointer shadow-2xs"
          >
            <PlusCircle size={15} />
            <span>+ Create Test Order</span>
          </button>
        </div>
      </div>

      {/* Search and Status Filters Toolbar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white p-3 sm:p-3.5 rounded-2xl border border-gray-200/80 shadow-2xs">
        <div className="relative w-full lg:w-72 shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search order ID, name, phone, address..." 
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:bg-white transition"
          />
        </div>

        {/* Status Filter Tabs (All, New, Confirmed, Preparing, Out for Delivery, Delivered, Cancelled) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 lg:pb-0 scrollbar-none -mx-1 px-1 sm:mx-0 sm:px-0">
          {filterTabs.map((tab) => {
            const isSelected = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  isSelected 
                    ? 'bg-[#062e1e] text-[#f59e0b] shadow-xs' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${
                  isSelected ? 'bg-[#f59e0b] text-[#062e1e]' : 'bg-gray-200 text-gray-700'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders Listing: Clean Compact Order Cards */}
      <div className="space-y-2.5 sm:space-y-3">
        {filteredOrders.map(order => {
          const safeName = order.customerInfo?.name || 'Customer';
          const safePhone = order.customerInfo?.phone || '';
          const phoneClean = safePhone.replace(/[^0-9]/g, '');

          const canonical = getCanonicalStatus(order.status);
          const isNewOrder = canonical === 'New';
          const currentEta = getEstDelivery(order);
          const isExpress = order.deliveryType === 'express' || currentEta.toLowerCase().includes('within 2');

          const addressUrl = extractUrl(order.customerInfo?.address);
          const googleMapsUrl = order.customerInfo?.liveLocationUrl || 
            addressUrl ||
            (order.customerInfo?.coordinates 
              ? `https://www.google.com/maps?q=${order.customerInfo.coordinates.lat},${order.customerInfo.coordinates.lng}`
              : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.customerInfo?.address || '')}`);

          const orderDateObj = order.date ? new Date(order.date) : new Date();
          const formattedDate = orderDateObj.toLocaleDateString('en-IN', { 
            day: '2-digit', 
            month: 'short'
          });
          const formattedTime = orderDateObj.toLocaleTimeString('en-IN', { 
            hour: '2-digit', 
            minute: '2-digit' 
          });

          return (
            <div 
              key={order.id} 
              className={`bg-white rounded-xl border transition-all ${
                isNewOrder 
                  ? 'border-amber-400 ring-1 ring-amber-400/40 shadow-xs bg-gradient-to-b from-amber-50/15 to-white' 
                  : 'border-gray-200/90 shadow-2xs hover:shadow-xs hover:border-gray-300'
              }`}
            >
              {/* 1. Header Bar: Compact Single-Bar (Order ID, Status, Speed, Date) */}
              <div className="flex flex-wrap items-center justify-between border-b border-gray-100 px-3 sm:px-3.5 py-1 sm:py-1.5 gap-1.5 bg-gray-50/70 rounded-t-xl">
                
                {/* Left side: ID, NEW badge, Status badge, Speed/ETA */}
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <span className="font-mono font-black text-gray-900 text-xs sm:text-[13px] tracking-tight">{order.id}</span>
                  
                  {isNewOrder && (
                    <span className="bg-red-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full animate-pulse flex items-center gap-0.5 shrink-0 shadow-2xs">
                      <Bell size={9} className="fill-white" /> NEW
                    </span>
                  )}

                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border shrink-0 ${getStatusBadge(order.status)}`}>
                    {canonical === 'Pending' ? 'Preparing' : canonical === 'Delivered' ? 'Delivered' : canonical}
                  </span>

                  {/* Speed & ETA Pill (Click to edit delivery time) */}
                  <button
                    type="button"
                    onClick={() => {
                      setCustomEtaModalOrder(order);
                      setCustomEtaInput(order.estimatedDelivery || currentEta || '');
                    }}
                    className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border shrink-0 transition hover:brightness-95 active:scale-95 cursor-pointer ${
                      isExpress 
                        ? 'bg-amber-100 text-amber-950 border-amber-300 hover:bg-amber-200' 
                        : 'bg-blue-50 text-blue-900 border-blue-200 hover:bg-blue-100'
                    }`}
                    title="Click to edit estimated delivery time for customer app"
                  >
                    {isExpress ? <Zap size={10} className="text-amber-700 shrink-0" /> : <Clock size={10} className="text-blue-700 shrink-0" />}
                    <span>{currentEta}</span>
                    <span className="text-[9px] opacity-70 ml-0.5 font-normal">✎</span>
                  </button>
                </div>

                {/* Right side: Date & Time */}
                <div className="text-[10.5px] sm:text-xs text-gray-500 font-semibold flex items-center gap-1 ml-auto shrink-0">
                  <span>📅</span> {formattedDate}, {formattedTime}
                </div>
              </div>

              {/* 2. Compact 3-Column Info Row (Customer, Delivery Address, Items & Payment) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-2.5 px-3 sm:px-3.5 py-1.5 sm:py-2 text-xs">
                
                {/* Col 1: Customer Details */}
                <div className="min-w-0 flex flex-col justify-between space-y-0.5">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-950 font-black text-[9.5px] flex items-center justify-center shrink-0 border border-emerald-300">
                      {safeName.charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <p className="text-[9px] font-bold text-gray-400 uppercase leading-none">Customer</p>
                      <p className="font-bold text-gray-900 text-xs truncate" title={safeName}>{safeName}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                    <span className="text-[11px] font-semibold text-gray-700">{safePhone || 'N/A'}</span>
                    {safePhone && (
                      <a 
                        href={`tel:${safePhone}`} 
                        className="bg-emerald-50 hover:bg-emerald-100 text-emerald-950 text-[10.5px] sm:text-[9.5px] font-bold px-2 py-1 sm:px-1.5 sm:py-0.5 rounded-lg border border-emerald-300 transition flex items-center gap-1 active:scale-95 shrink-0 touch-manipulation shadow-2xs"
                        title="Direct Call Customer"
                      >
                        <Phone size={11} className="text-emerald-700" />
                        <span>Call</span>
                      </a>
                    )}
                    {phoneClean && (
                      <a 
                        href={`https://wa.me/${phoneClean.length === 10 ? `91${phoneClean}` : phoneClean}?text=${encodeURIComponent(`नमस्ते ${safeName}, विश्वकर्मा आटा चक्की से आपका ऑर्डर #${order.id} (₹${order.total}) प्राप्त हुआ है। हम इसे ताज़ा तैयार कर रहे हैं।`)}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="bg-green-50 hover:bg-green-100 text-green-900 text-[10.5px] sm:text-[9.5px] font-bold px-2 py-1 sm:px-1.5 sm:py-0.5 rounded-lg border border-green-300 transition flex items-center gap-1 active:scale-95 shrink-0 touch-manipulation shadow-2xs"
                        title="WhatsApp Order Update to Customer"
                      >
                        <MessageCircle size={11} className="text-green-700" />
                        <span>WhatsApp</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Col 2: Delivery Address & Google Maps */}
                <div className="min-w-0 flex flex-col justify-between space-y-0.5">
                  <div>
                    <div className="flex items-center gap-1.5 leading-none mb-0.5">
                      <span className="text-[9px] font-bold text-gray-400 uppercase">Address</span>
                      {order.customerInfo?.coordinates && (
                        <span className="text-[8.5px] font-bold text-emerald-800 bg-emerald-50 px-1 rounded border border-emerald-300">
                          GPS Active
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-gray-800 font-medium leading-snug line-clamp-2 break-words" title={order.customerInfo?.address}>
                      {order.customerInfo?.address || 'N/A'}
                    </p>
                  </div>

                  <div>
                    <a 
                      href={order.customerInfo?.coordinates ? `https://www.google.com/maps/dir/?api=1&destination=${order.customerInfo.coordinates.lat},${order.customerInfo.coordinates.lng}` : googleMapsUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="inline-flex items-center gap-1 text-[11px] sm:text-[10px] font-bold text-blue-700 hover:text-blue-900 bg-blue-50/60 px-2 py-0.5 rounded-md border border-blue-200/80 active:scale-95 transition touch-manipulation"
                    >
                      <Navigation size={11} className="text-blue-600" />
                      <span>{order.customerInfo?.coordinates ? 'Navigate GPS ↗' : 'Open in Maps ↗'}</span>
                    </a>
                  </div>
                </div>

                {/* Col 3: Items & Payment Breakdown */}
                <div className="bg-gray-50/90 px-2 py-1.5 rounded-lg border border-gray-100 min-w-0 flex flex-col justify-between space-y-1">
                  <div>
                    <div className="flex items-center justify-between text-[9px] font-bold text-gray-400 uppercase leading-none mb-1">
                      <span>Items</span>
                      <span className="text-gray-500 font-normal">{order.items?.length || 1} item{order.items && order.items.length > 1 ? 's' : ''}</span>
                    </div>
                    
                    <div className="space-y-0.5 text-[10.5px] leading-tight max-h-[32px] overflow-y-auto scrollbar-none">
                      {order.items?.map((item, i) => (
                        <div key={i} className="flex items-baseline justify-between gap-1 text-gray-800 font-medium">
                          <span className="truncate">{item.quantity}× {item.product?.name || 'Atta'}</span>
                          {item.product?.weight && <span className="text-[9.5px] text-gray-500 font-normal shrink-0">({item.product.weight})</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-1 border-t border-gray-200">
                    <span className="font-black text-xs sm:text-sm text-emerald-950">₹{order.total}</span>
                    <span className={`text-[9px] font-black px-1.5 py-0.2 rounded border ${
                      order.advancePaid >= order.total 
                        ? 'bg-emerald-100 text-emerald-900 border-emerald-300' 
                        : order.advancePaid > 0 
                        ? 'bg-amber-100 text-amber-950 border-amber-300' 
                        : 'bg-amber-50 text-amber-900 border border-amber-300'
                    }`}>
                      {order.advancePaid >= order.total 
                        ? 'PAID ONLINE' 
                        : order.advancePaid > 0 
                        ? `PARTIAL (₹${order.advancePaid})` 
                        : 'COD'}
                    </span>
                  </div>
                </div>

              </div>

              {/* 3. Bottom Toolbar: Compact Action Progression & Status Selector */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 px-3 sm:px-3.5 py-1.5 border-t border-gray-100 bg-gray-50/70 rounded-b-xl">
                
                {/* One-Click Sequential Action Progression */}
                <div className="flex items-center gap-1.5 w-full sm:w-auto">
                  {canonical === 'New' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'Order Confirmed', '2 hours')}
                      className="flex-1 sm:flex-none justify-center bg-[#062e1e] hover:bg-[#0b482d] text-white font-bold text-[11px] px-2.5 py-1.5 rounded-lg transition flex items-center gap-1 cursor-pointer shadow-xs active:scale-95"
                    >
                      <CheckCircle2 size={13} className="text-amber-400" />
                      <span>1. Accept & Confirm Order</span>
                    </button>
                  )}

                  {canonical === 'Confirmed' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'Preparing Your Order', '1 hour')}
                      className="flex-1 sm:flex-none justify-center bg-purple-800 hover:bg-purple-900 text-white font-bold text-[11px] px-2.5 py-1.5 rounded-lg transition flex items-center gap-1 cursor-pointer shadow-xs active:scale-95"
                    >
                      <ChefHat size={13} />
                      <span>2. Start Preparing / Milling</span>
                    </button>
                  )}

                  {canonical === 'Pending' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'Out for Delivery', '30 minutes')}
                      className="flex-1 sm:flex-none justify-center bg-blue-700 hover:bg-blue-800 text-white font-bold text-[11px] px-2.5 py-1.5 rounded-lg transition flex items-center gap-1 cursor-pointer shadow-xs active:scale-95"
                    >
                      <Truck size={13} />
                      <span>3. Dispatch (Out for Delivery)</span>
                    </button>
                  )}

                  {canonical === 'Out for Delivery' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'Delivered', 'Delivered Successfully.')}
                      className="flex-1 sm:flex-none justify-center bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-[11px] px-2.5 py-1.5 rounded-lg transition flex items-center gap-1 cursor-pointer shadow-xs active:scale-95"
                    >
                      <CheckCircle2 size={13} />
                      <span>4. Mark as Delivered</span>
                    </button>
                  )}

                  {canonical === 'Delivered' && (
                    <span className="text-emerald-900 font-bold text-[11px] flex items-center gap-1 bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-300">
                      <CheckCircle2 size={13} className="text-emerald-700" />
                      <span>Delivered Successfully.</span>
                    </span>
                  )}

                  {canonical === 'Cancelled' && (
                    <span className="text-red-900 font-bold text-[11px] flex items-center gap-1 bg-red-100 px-2.5 py-1 rounded-lg border border-red-300">
                      <XCircle size={13} className="text-red-700" />
                      <span>Cancelled Order</span>
                    </span>
                  )}

                  {canonical !== 'Cancelled' && canonical !== 'Delivered' && (
                    <button
                      onClick={() => {
                        if (confirm(`Cancel order ${order.id}?`)) {
                          updateOrderStatus(order.id, 'Cancelled');
                        }
                      }}
                      className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold text-[11px] px-2 py-1.5 rounded-lg transition flex items-center justify-center gap-0.5 cursor-pointer shrink-0 active:scale-95"
                    >
                      <XCircle size={12} /> Cancel
                    </button>
                  )}
                </div>

                {/* Status Selector Dropdown (Integrated with Delivery Times) & Utility Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-1.5 pt-1 sm:pt-0 border-t sm:border-t-0 border-gray-200/60 w-full sm:w-auto">
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tight shrink-0">Status:</span>
                    <select
                      value={getStatusDropdownValue(order)}
                      onChange={(e) => handleStatusChangeWithTime(order.id, e.target.value)}
                      className={`text-[11px] font-bold border rounded-lg px-2 py-1 outline-none cursor-pointer ${getStatusBadge(order.status)}`}
                    >
                      <option value="Order Placed">New (Placed)</option>
                      <option value="Order Confirmed">Confirmed (2 hours)</option>
                      <option value="Preparing Your Order">Preparing / Milling (1 hour)</option>
                      <option value="Out for Delivery">Out for Delivery (30 mins)</option>
                      <option value="Delivered">Delivered (Delivered Successfully)</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="p-1 text-gray-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg border border-gray-200 transition cursor-pointer active:scale-95"
                      title="View Full Details"
                    >
                      <Eye size={13} />
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`Delete order ${order.id}?`)) {
                          deleteOrder(order.id);
                        }
                      }}
                      className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg border border-gray-200 transition cursor-pointer active:scale-95"
                      title="Delete Order"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>

            </div>
          );
        })}

        {/* Empty State */}
        {filteredOrders.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center space-y-2 shadow-2xs">
            <CheckCircle2 size={36} className="mx-auto text-emerald-600" />
            <h3 className="text-base font-bold text-gray-900">
              No orders found
            </h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              No orders match your filter criteria or search keyword.
            </p>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 cursor-pointer touch-manipulation"
          onClick={() => setSelectedOrder(null)}
        >
          <div 
            className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setSelectedOrder(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100 transition"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-2 mb-1.5">
              <h3 className="text-lg font-bold text-gray-900 font-mono">
                {selectedOrder.id}
              </h3>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-lg border ${getStatusBadge(selectedOrder.status)}`}>
                {selectedOrder.status}
              </span>
            </div>

            <p className="text-xs text-gray-500 mb-4">
              Placed on {new Date(selectedOrder.date).toLocaleString('en-IN')}
            </p>

            <div className="space-y-3 text-xs">
              {/* Delivery Time (ETA) Manager in Modal */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-3 sm:p-3.5 rounded-xl border border-amber-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                    <Clock size={14} className="text-amber-700" />
                    Estimated Delivery Time (Synced to App)
                  </span>
                  <span className="text-xs font-black text-amber-950 bg-white px-2 py-0.5 rounded border border-amber-300">
                    {selectedOrder.estimatedDelivery || getEstDelivery(selectedOrder)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 pt-1">
                  <select
                    value={
                      ETA_PRESETS.some(p => p.value.toLowerCase() === (selectedOrder.estimatedDelivery || '').toLowerCase())
                        ? (selectedOrder.estimatedDelivery || '').toLowerCase()
                        : (selectedOrder.estimatedDelivery ? '__custom_val__' : '')
                    }
                    onChange={async (e) => {
                      const val = e.target.value;
                      if (val === '__custom__' || val === '__custom_val__') {
                        setCustomEtaModalOrder(selectedOrder);
                        setCustomEtaInput(selectedOrder.estimatedDelivery || '');
                        return;
                      }
                      await updateOrderEstimatedDelivery(selectedOrder.id, val);
                      setSelectedOrder(prev => prev ? { ...prev, estimatedDelivery: val } : null);
                      showToast(`⏱️ Delivery time set to "${val}" and synced to customer app!`);
                    }}
                    className="text-xs font-bold bg-white border border-amber-300 rounded-lg px-2 py-1.5 flex-1 outline-none cursor-pointer"
                  >
                    <option value="" disabled>Choose Delivery Time Preset</option>
                    {selectedOrder.estimatedDelivery && !ETA_PRESETS.some(p => p.value.toLowerCase() === selectedOrder.estimatedDelivery?.toLowerCase()) && (
                      <option value="__custom_val__">⭐ {selectedOrder.estimatedDelivery}</option>
                    )}
                    {ETA_PRESETS.map(p => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                    <option value="__custom__">✏️ Custom Time (कस्टम समय)...</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      setCustomEtaModalOrder(selectedOrder);
                      setCustomEtaInput(selectedOrder.estimatedDelivery || '');
                    }}
                    className="text-xs font-bold bg-amber-700 hover:bg-amber-800 text-white px-3 py-1.5 rounded-lg transition shrink-0 cursor-pointer"
                  >
                    Custom
                  </button>
                </div>
              </div>

              <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100 space-y-1.5">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  Customer Information
                </h4>
                <div><strong className="text-gray-700">Name:</strong> {selectedOrder.customerInfo?.name || 'N/A'}</div>
                <div><strong className="text-gray-700">Phone:</strong> {selectedOrder.customerInfo?.phone || 'N/A'}</div>
                <div><strong className="text-gray-700">Address:</strong> {selectedOrder.customerInfo?.address || 'N/A'}</div>
              </div>

              <div className="border border-gray-100 rounded-xl p-3.5">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Ordered Items
                </h4>
                <div className="divide-y divide-gray-100 text-xs">
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} className="py-2 flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-gray-900">{item.product?.name || 'Atta'}</p>
                        <p className="text-gray-500 text-[11px]">Qty: {item.quantity} × ₹{item.product?.price}</p>
                      </div>
                      <span className="font-bold text-gray-900">
                        ₹{item.quantity * item.product?.price}
                      </span>
                    </div>
                  ))}
                  <div className="pt-2.5 flex justify-between font-bold text-sm text-gray-900 border-t border-gray-200">
                    <span>Total Amount:</span>
                    <span className="text-emerald-900">₹{selectedOrder.total}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Delivery Time Modal */}
      {customEtaModalOrder && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 cursor-pointer touch-manipulation"
          onClick={() => setCustomEtaModalOrder(null)}
        >
          <div 
            className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl relative cursor-default space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b pb-3 border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
                  <Clock size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">
                    Set Delivery Time for Customer App
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    Order <span className="font-mono font-bold text-gray-700">{customEtaModalOrder.id}</span> • {customEtaModalOrder.customerInfo?.name || 'Customer'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setCustomEtaModalOrder(null)}
                className="text-gray-400 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                  Delivery Time (ETA) Text
                </label>
                <input
                  type="text"
                  value={customEtaInput}
                  onChange={(e) => setCustomEtaInput(e.target.value)}
                  placeholder="e.g. Within 30 mins, Today by 6:00 PM, 45 मिनट में"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleCustomEtaSubmit();
                    }
                  }}
                />
              </div>

              <div>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tight block mb-1.5">
                  Quick Suggestions (Click to fill):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Within 20 mins',
                    'Within 30 mins',
                    'Within 45 mins',
                    'Within 1 hour',
                    'Within 2 hours',
                    'Today by 5:00 PM',
                    'Today by 7:00 PM',
                    'Tomorrow Morning'
                  ].map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => setCustomEtaInput(chip)}
                      className={`text-[10.5px] font-bold px-2 py-1 rounded-lg border transition cursor-pointer ${
                        customEtaInput === chip
                          ? 'bg-amber-100 text-amber-950 border-amber-400 shadow-2xs'
                          : 'bg-gray-50 hover:bg-amber-50 text-gray-700 border-gray-200'
                      }`}
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 text-[11px] text-emerald-900 flex items-center gap-2">
                <CheckCircle2 size={15} className="text-emerald-700 shrink-0" />
                <span>This time will show up immediately on the customer&apos;s live tracking screen.</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setCustomEtaModalOrder(null)}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCustomEtaSubmit}
                disabled={!customEtaInput.trim()}
                className="px-4 py-2 bg-[#062e1e] hover:bg-[#0b482d] text-[#f59e0b] rounded-xl text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                <Clock size={13} />
                <span>Save & Sync to App</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#062e1e] text-[#f59e0b] border border-amber-500/30 px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-bold animate-bounce">
          <Clock size={15} className="text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
}
