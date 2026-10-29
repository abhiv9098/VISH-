'use client';

import { useState, useMemo } from 'react';
import {
  TrendingUp, 
  Users, 
  Package, 
  ShoppingBag,
  Search,
  Phone,
  Navigation,
  Eye,
  Trash2,
  X,
  Clock,
  CheckCircle2,
  XCircle,
  Calendar,
  CreditCard,
  Bell,
  ArrowRight,
  Zap,
  MessageCircle,
  MapPin,
  RefreshCw
} from 'lucide-react';
import { useOrders } from '@/context/OrderContext';
import { Order, products, getCanonicalStatus } from '@/lib/data';
import Link from 'next/link';

export default function AdminDashboard() {
  const { orders, updateOrderStatus, deleteOrder, fetchOrders } = useOrders();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [dateFilter, setDateFilter] = useState<'Today' | 'Last 7 Days' | 'Last 30 Days' | 'Custom'>('Last 7 Days');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Deduplicate orders by ID to guarantee single display per order
  const uniqueOrders = useMemo(() => {
    const seen = new Set<string>();
    return orders.filter(o => {
      if (!o || !o.id || seen.has(o.id)) return false;
      seen.add(o.id);
      return true;
    });
  }, [orders]);

  const activeOrders = uniqueOrders.filter(o => !o.isHiddenFromAdmin);
  const totalRevenue = activeOrders.reduce((sum, order) => sum + (order.total || 0), 0);
  const totalOrders = activeOrders.length;
  
  const pendingOrders = activeOrders.filter(o => {
    const c = getCanonicalStatus(o.status);
    return c === 'Pending' || c === 'New' || c === 'Confirmed';
  }).length;
  
  const completedOrders = activeOrders.filter(o => getCanonicalStatus(o.status) === 'Delivered').length;
  const cancelledOrders = activeOrders.filter(o => getCanonicalStatus(o.status) === 'Cancelled').length;
  const totalCustomers = new Set(activeOrders.map(o => o.customerInfo?.phone).filter(Boolean)).size || 1;
  const productsCount = products.length;

  // Today calculations
  const todayStr = new Date().toISOString().split('T')[0];
  const todaysOrdersList = activeOrders.filter(o => o.date && o.date.startsWith(todayStr));
  const todaysOrders = todaysOrdersList.length || (activeOrders.length > 0 ? activeOrders.length : 0);
  const todaysRevenue = todaysOrdersList.reduce((sum, o) => sum + (o.total || 0), 0) || totalRevenue;

  // Pending Payments (COD pending)
  const pendingPayments = activeOrders
    .filter(o => getCanonicalStatus(o.status) !== 'Delivered' && getCanonicalStatus(o.status) !== 'Cancelled')
    .reduce((sum, o) => sum + (o.remainingAmount !== undefined ? o.remainingAmount : (o.paymentMethod === 'cod' ? o.total : 0)), 0);

  // DASHBOARD REQUIREMENT: Real-time New Orders awaiting confirmation
  const newOrders = useMemo(() => {
    return activeOrders.filter(order => getCanonicalStatus(order.status) === 'New');
  }, [activeOrders]);

  // Filter new orders by search term
  const filteredNewOrders = useMemo(() => {
    if (!searchTerm.trim()) return newOrders;
    const term = searchTerm.toLowerCase();
    return newOrders.filter(order => {
      const safeId = order.id || '';
      const safeName = order.customerInfo?.name || '';
      const safePhone = order.customerInfo?.phone || '';
      const safeAddress = order.customerInfo?.address || '';
      return (
        safeId.toLowerCase().includes(term) ||
        safeName.toLowerCase().includes(term) ||
        safePhone.includes(term) ||
        safeAddress.toLowerCase().includes(term)
      );
    });
  }, [newOrders, searchTerm]);

  const getStatusBadge = (status: Order['status']) => {
    const canonical = getCanonicalStatus(status);
    switch (canonical) {
      case 'Delivered':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Out for Delivery':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Pending':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Confirmed':
        return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'Cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-amber-100 text-amber-900 border-amber-300';
    }
  };

  const getGoogleMapsUrl = (info: any) => {
    if (!info) return '#';
    if (info.liveLocationUrl && info.liveLocationUrl.trim()) return info.liveLocationUrl.trim();
    if (info.coordinates && info.coordinates.lat && info.coordinates.lng) {
      return `https://www.google.com/maps?q=${info.coordinates.lat},${info.coordinates.lng}`;
    }
    const rawAddress = info.address || '';
    const urlMatch = rawAddress.match(/(https?:\/\/[^\s]+)/);
    if (urlMatch) return urlMatch[0];
    const fullAddressParts = [rawAddress, info.city, info.pincode].filter(Boolean).join(', ');
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddressParts || rawAddress)}`;
  };

  const handleConfirmOrder = async (orderId: string) => {
    try {
      setActionLoading(orderId);
      await updateOrderStatus(orderId, 'Order Confirmed');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-4 pb-12 max-w-7xl mx-auto w-full min-w-0">

      {/* 1. Date Filter Row - Inspired by Reference Image Ref2 */}
      <div className="bg-white p-2 sm:p-2.5 rounded-2xl border border-gray-200/80 shadow-2xs flex items-center justify-between gap-2 overflow-x-auto w-full min-w-0 scrollbar-none">
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {(['Today', 'Last 7 Days', 'Last 30 Days', 'Custom'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setDateFilter(tab)}
              className={`px-3.5 sm:px-4 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer shrink-0 ${
                dateFilter === tab 
                  ? 'bg-[#062e1e] text-white shadow-xs' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <button
          onClick={() => fetchOrders()}
          className="text-gray-500 hover:text-emerald-800 p-1.5 rounded-lg hover:bg-gray-100 transition shrink-0"
          title="Refresh orders"
        >
          <RefreshCw size={15} />
        </button>
      </div>

      {/* 2. 10 KPI Stat Cards Grid - Inspired by Reference Image Ref2 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5 sm:gap-3 w-full min-w-0">
        {/* 1. Total Revenue */}
        <div className="bg-white p-3 sm:p-3.5 rounded-2xl border border-gray-200/70 shadow-2xs flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <TrendingUp size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-gray-500 font-medium truncate">Total Revenue</p>
            <h3 className="text-sm sm:text-base font-black text-gray-900 truncate">₹{totalRevenue.toLocaleString('en-IN')}</h3>
          </div>
        </div>

        {/* 2. Total Orders */}
        <Link href="/admin/orders" className="bg-white p-3 sm:p-3.5 rounded-2xl border border-gray-200/70 shadow-2xs flex items-center gap-2.5 sm:gap-3 hover:border-emerald-500/50 transition cursor-pointer min-w-0">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <ShoppingBag size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-gray-500 font-medium truncate">Total Orders</p>
            <h3 className="text-sm sm:text-base font-black text-gray-900 truncate">{totalOrders}</h3>
          </div>
        </Link>

        {/* 3. Pending Orders */}
        <Link href="/admin/orders" className="bg-white p-3 sm:p-3.5 rounded-2xl border border-gray-200/70 shadow-2xs flex items-center gap-2.5 sm:gap-3 hover:border-orange-500/50 transition cursor-pointer min-w-0">
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
            <Clock size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-gray-500 font-medium truncate">Pending Orders</p>
            <h3 className="text-sm sm:text-base font-black text-gray-900 truncate">{pendingOrders}</h3>
          </div>
        </Link>

        {/* 4. Completed */}
        <Link href="/admin/orders" className="bg-white p-3 sm:p-3.5 rounded-2xl border border-gray-200/70 shadow-2xs flex items-center gap-2.5 sm:gap-3 hover:border-emerald-500/50 transition cursor-pointer min-w-0">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-gray-500 font-medium truncate">Completed</p>
            <h3 className="text-sm sm:text-base font-black text-gray-900 truncate">{completedOrders}</h3>
          </div>
        </Link>

        {/* 5. Cancelled */}
        <Link href="/admin/orders" className="bg-white p-3 sm:p-3.5 rounded-2xl border border-gray-200/70 shadow-2xs flex items-center gap-2.5 sm:gap-3 hover:border-red-500/50 transition cursor-pointer min-w-0">
          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
            <XCircle size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-gray-500 font-medium truncate">Cancelled</p>
            <h3 className="text-sm sm:text-base font-black text-gray-900 truncate">{cancelledOrders}</h3>
          </div>
        </Link>

        {/* 6. Total Customers */}
        <Link href="/admin/customers" className="bg-white p-3 sm:p-3.5 rounded-2xl border border-gray-200/70 shadow-2xs flex items-center gap-2.5 sm:gap-3 hover:border-purple-500/50 transition cursor-pointer min-w-0">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Users size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-gray-500 font-medium truncate">Total Customers</p>
            <h3 className="text-sm sm:text-base font-black text-gray-900 truncate">{totalCustomers}</h3>
          </div>
        </Link>

        {/* 7. Total Products */}
        <Link href="/admin/products" className="bg-white p-3 sm:p-3.5 rounded-2xl border border-gray-200/70 shadow-2xs flex items-center gap-2.5 sm:gap-3 hover:border-teal-500/50 transition cursor-pointer min-w-0">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
            <Package size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-gray-500 font-medium truncate">Total Products</p>
            <h3 className="text-sm sm:text-base font-black text-gray-900 truncate">{productsCount}</h3>
          </div>
        </Link>

        {/* 8. Today's Orders */}
        <div className="bg-white p-3 sm:p-3.5 rounded-2xl border border-gray-200/70 shadow-2xs flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
            <Calendar size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-gray-500 font-medium truncate">Today&apos;s Orders</p>
            <h3 className="text-sm sm:text-base font-black text-gray-900 truncate">{todaysOrders}</h3>
          </div>
        </div>

        {/* 9. Today's Revenue */}
        <div className="bg-white p-3 sm:p-3.5 rounded-2xl border border-gray-200/70 shadow-2xs flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <TrendingUp size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-gray-500 font-medium truncate">Today&apos;s Revenue</p>
            <h3 className="text-sm sm:text-base font-black text-gray-900 truncate">₹{todaysRevenue.toLocaleString('en-IN')}</h3>
          </div>
        </div>

        {/* 10. Pending Payments */}
        <div className="bg-white p-3 sm:p-3.5 rounded-2xl border border-gray-200/70 shadow-2xs flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <CreditCard size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-gray-500 font-medium truncate">Pending Payments</p>
            <h3 className="text-sm sm:text-base font-black text-gray-900 truncate">₹{pendingPayments.toLocaleString('en-IN')}</h3>
          </div>
        </div>
      </div>

      {/* 3. New Incoming Orders Section - Matching Reference Image Ref2 */}
      <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-gray-200/80 shadow-2xs space-y-4 mt-4 w-full min-w-0 overflow-hidden">
        
        {/* Section Header: Title, Real-time New Badge, Description, Search & Orders Manager Link */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-gray-100">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-700 shrink-0">
              <Bell size={20} className="text-amber-800" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-gray-900 tracking-tight">
                  New Incoming Orders
                </h2>
                <span className="bg-[#f59e0b] text-[#062e1e] text-xs font-black px-2.5 py-0.5 rounded-full animate-pulse shadow-2xs">
                  {newOrders.length} New
                </span>
              </div>
              <p className="text-xs text-gray-500 font-medium mt-0.5">
                Only new customer orders appear on the dashboard for immediate action. Confirmed orders move to Orders Manager.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search new orders..." 
                className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:bg-white transition"
              />
            </div>
            <Link 
              href="/admin/orders" 
              className="inline-flex items-center gap-1.5 bg-[#062e1e] hover:bg-[#0b482d] text-[#f59e0b] px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-2xs whitespace-nowrap cursor-pointer shrink-0"
            >
              <span>Orders Manager</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* New Order Cards Grid */}
        {filteredNewOrders.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
            {filteredNewOrders.map(order => {
              const safeName = order.customerInfo?.name || 'Customer';
              const safePhone = order.customerInfo?.phone || '';
              const phoneClean = safePhone.replace(/[^0-9]/g, '');
              const googleMapsUrl = getGoogleMapsUrl(order.customerInfo);

              const isExpress = order.deliveryType === 'express' || (order.estimatedDelivery || '').toLowerCase().includes('within 2');
              const currentEta = order.estimatedDelivery || (isExpress ? 'within 2 hours' : 'in 3-4 hours');
              const orderDate = order.date ? new Date(order.date) : new Date();

              return (
                <div 
                  key={order.id} 
                  className="bg-white p-3.5 sm:p-4 rounded-2xl border-2 border-amber-300 ring-1 ring-amber-400/30 shadow-xs hover:shadow-md transition-all space-y-3 bg-gradient-to-b from-amber-50/25 to-white"
                >
                  {/* Top Bar: Order ID, Pulse NEW badge, Speed pill, Date */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-amber-100/80 pb-2.5 gap-2">
                    <div className="flex items-center justify-between sm:justify-start gap-2 w-full sm:w-auto">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-gray-900 text-xs sm:text-sm tracking-tight">{order.id}</span>
                        <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse flex items-center gap-1 shadow-2xs">
                          <Bell size={10} className="fill-white" /> NEW
                        </span>
                      </div>
                      <span className="text-[11px] sm:hidden text-gray-500 font-semibold shrink-0">
                        📅 {orderDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}, {orderDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Speed Badge */}
                      <span className={`inline-flex items-center gap-1 text-[10.5px] font-bold px-2 py-0.5 rounded-lg border shrink-0 ${
                        isExpress ? 'bg-amber-100 text-amber-950 border-amber-300' : 'bg-blue-50 text-blue-900 border-blue-200'
                      }`}>
                        {isExpress ? <Zap size={11} className="text-amber-700 shrink-0" /> : <Clock size={11} className="text-blue-700 shrink-0" />}
                        <span>{currentEta}</span>
                      </span>

                      <span className="hidden sm:inline text-[11px] text-gray-500 font-semibold shrink-0 ml-auto">
                        📅 {orderDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}, {orderDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  {/* 3-Column Info: Customer, Delivery Address, Items & Total */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                    {/* Customer Info */}
                    <div className="space-y-1 min-w-0">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Customer</p>
                      <p className="font-bold text-gray-900 text-xs truncate flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-950 font-black text-[10px] flex items-center justify-center shrink-0 border border-emerald-300">
                          {safeName.charAt(0).toUpperCase()}
                        </span>
                        <span className="truncate">{safeName}</span>
                      </p>
                      <div className="flex items-center gap-1.5 pt-0.5 flex-wrap">
                        <span className="text-xs font-semibold text-gray-700">{safePhone || 'N/A'}</span>
                        {safePhone && (
                          <a 
                            href={`tel:${safePhone}`} 
                            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-950 text-[10px] font-bold px-2 py-0.5 rounded-md border border-emerald-300 transition flex items-center gap-0.5"
                            title="Call customer"
                          >
                            <Phone size={10} /> Call
                          </a>
                        )}
                        {phoneClean && (
                          <a 
                            href={`https://wa.me/${phoneClean.length === 10 ? `91${phoneClean}` : phoneClean}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="bg-green-50 hover:bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded-md border border-green-300 transition flex items-center gap-0.5"
                            title="WhatsApp customer"
                          >
                            <MessageCircle size={10} /> WA
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Delivery Address */}
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Address</p>
                        {order.customerInfo?.coordinates && (
                          <span className="text-[9px] font-black text-emerald-800 bg-emerald-100/70 px-1.5 py-0.2 rounded border border-emerald-300">
                            GPS Active
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-800 font-medium leading-snug line-clamp-2">
                        {order.customerInfo?.address || 'N/A'}
                      </p>
                      <a 
                        href={googleMapsUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 hover:text-blue-900 hover:underline pt-0.5"
                      >
                        <Navigation size={11} /> Open in Maps ↗
                      </a>
                    </div>

                    {/* Items & Total */}
                    <div className="bg-gray-50/90 p-2 rounded-xl border border-gray-100 space-y-1 min-w-0">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Items & Total</p>
                      <p className="text-[11px] text-gray-800 font-medium truncate">
                        {order.items?.map(i => `${i.quantity}× ${i.product?.name || 'Atta'}`).join(', ')}
                      </p>
                      <div className="flex items-center justify-between pt-0.5 border-t border-gray-200">
                        <span className="font-black text-sm text-gray-900">₹{order.total}</span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${
                          order.advancePaid >= order.total 
                            ? 'bg-emerald-100 text-emerald-900 border-emerald-300' 
                            : 'bg-amber-100 text-amber-950 border-amber-300'
                        }`}>
                          {order.advancePaid >= order.total ? 'PAID' : 'COD'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Action Bar: Confirm Order Button, Status Dropdown, Cancel, View Details, Delete */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-amber-100">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {/* Primary Action Button: Confirm Order */}
                      <button
                        onClick={() => handleConfirmOrder(order.id)}
                        disabled={actionLoading === order.id}
                        className="bg-[#062e1e] hover:bg-[#0b482d] text-white font-black text-xs px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 shadow-xs active:scale-95 cursor-pointer disabled:opacity-50"
                        title="Confirm this order and move to Orders Manager"
                      >
                        <CheckCircle2 size={13} className="text-amber-400" />
                        <span>{actionLoading === order.id ? 'Confirming...' : 'Confirm Order'}</span>
                      </button>

                      {/* Status Dropdown Selector */}
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value as Order['status'])}
                        className={`text-xs font-bold border rounded-xl px-2.5 py-1.5 outline-none cursor-pointer ${getStatusBadge(order.status)}`}
                      >
                        <option value="Order Placed">1. New (Placed)</option>
                        <option value="Order Confirmed">2. Confirmed</option>
                        <option value="Preparing Your Order">3. Processing (Preparing)</option>
                        <option value="Out for Delivery">4. Out for Delivery</option>
                        <option value="Delivered">5. Delivered</option>
                        <option value="Cancelled">❌ Cancelled</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 ml-auto">
                      <button
                        onClick={() => {
                          if (confirm(`Cancel order ${order.id}?`)) {
                            updateOrderStatus(order.id, 'Cancelled');
                          }
                        }}
                        className="text-red-700 hover:bg-red-50 border border-red-200 text-xs font-bold px-2.5 py-1.5 rounded-xl transition cursor-pointer"
                        title="Cancel Order"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-1.5 text-gray-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl border border-gray-200 transition cursor-pointer"
                        title="View Full Details"
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete order ${order.id}?`)) {
                            deleteOrder(order.id);
                          }
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl border border-gray-200 transition cursor-pointer"
                        title="Delete Order"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

        {/* Clean Empty State when No New Orders - Exactly as in Reference Image Ref2 */}
        {filteredNewOrders.length === 0 && (
          <div className="bg-[#f9fafb] border border-gray-200/90 rounded-2xl p-8 sm:p-12 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-2xs">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900">
              {newOrders.length === 0 
                ? 'All Caught Up! No New Orders Pending Confirmation' 
                : 'No new orders match your search query.'}
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
              {newOrders.length === 0 
                ? 'Incoming orders placed by customers appear here automatically for fast confirmation. Once confirmed, orders move to Orders Manager.' 
                : 'Try clearing your search term to see all new incoming orders.'}
            </p>
            <div className="pt-2">
              <Link 
                href="/admin/orders" 
                className="inline-flex items-center gap-2 bg-[#062e1e] text-[#f59e0b] hover:bg-[#0b482d] px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-xs"
              >
                <span>View All Orders in Orders Manager</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        )}

      </div>

      {/* Order Details Modal (No verification code) */}
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
              {/* Customer Info */}
              <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100 space-y-1.5">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  Customer Information
                </h4>
                <div><strong className="text-gray-700">Name:</strong> {selectedOrder.customerInfo?.name || 'N/A'}</div>
                <div><strong className="text-gray-700">Phone:</strong> {selectedOrder.customerInfo?.phone || 'N/A'}</div>
                <div><strong className="text-gray-700">Delivery Address:</strong> {selectedOrder.customerInfo?.address || 'N/A'}</div>
                <div className="pt-1">
                  <a 
                    href={getGoogleMapsUrl(selectedOrder.customerInfo)} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:underline"
                  >
                    <Navigation size={12} /> Open in Google Maps ↗
                  </a>
                </div>
              </div>

              {/* Items List */}
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

            <div className="mt-5 flex justify-end gap-2">
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
    </div>
  );
}
