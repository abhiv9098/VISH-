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
  X
} from 'lucide-react';
import { useOrders } from '@/context/OrderContext';
import { Order, products, checkDeliveryFeasibility, getCanonicalStatus } from '@/lib/data';

function extractUrl(text?: string) {
  if (!text) return null;
  const match = text.match(new RegExp('https?:\\/\\/[^\\s]+'));
  return match ? match[0] : null;
}

export default function OrdersPage() {
  const { 
    orders, 
    updateOrderStatus, 
    deleteOrder, 
    addOrder, 
    markOrdersAsSeen 
  } = useOrders();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

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
    if (order.estimatedDelivery) return order.estimatedDelivery;
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
        <button
          onClick={createQuickTestOrder}
          className="inline-flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold text-xs px-3.5 py-2 rounded-xl transition cursor-pointer self-start sm:self-auto shadow-2xs"
        >
          <PlusCircle size={15} />
          <span>+ Create Test Order</span>
        </button>
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
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
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

      {/* Orders Listing: Clean Order Cards */}
      <div className="space-y-3">
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
              className={`bg-white rounded-2xl border transition-all ${
                isNewOrder 
                  ? 'border-amber-400 ring-1 ring-amber-400/40 shadow-xs bg-gradient-to-b from-amber-50/20 to-white' 
                  : 'border-gray-200 shadow-2xs hover:shadow-xs'
              }`}
            >
              {/* 1. Header Bar: Order ID, Status, Speed, Date */}
              <div className="flex flex-wrap items-center justify-between border-b border-gray-100 px-3.5 sm:px-4 py-2 sm:py-2.5 gap-2 bg-gray-50/60 rounded-t-2xl">
                
                <div className="flex flex-wrap items-center gap-2 min-w-0">
                  <span className="font-mono font-black text-gray-900 text-xs sm:text-sm tracking-tight">{order.id}</span>
                  
                  {isNewOrder && (
                    <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse flex items-center gap-1 shrink-0 shadow-2xs">
                      <Bell size={10} className="fill-white" /> NEW
                    </span>
                  )}

                  <span className={`text-[10.5px] font-black px-2.5 py-0.5 rounded-lg border shrink-0 ${getStatusBadge(order.status)}`}>
                    {canonical === 'Pending' ? 'Preparing' : canonical === 'Delivered' ? 'Delivered' : canonical}
                  </span>

                  {/* Speed & ETA Pill */}
                  <span className={`inline-flex items-center gap-1 text-[10.5px] font-bold px-2 py-0.5 rounded-lg border ${
                    isExpress 
                      ? 'bg-amber-100 text-amber-950 border-amber-300' 
                      : 'bg-blue-50 text-blue-900 border-blue-200'
                  }`}>
                    {isExpress ? <Zap size={11} className="text-amber-700" /> : <Clock size={11} className="text-blue-700" />}
                    <span className="truncate max-w-[130px] sm:max-w-none">{currentEta}</span>
                  </span>
                </div>

                <div className="text-xs text-gray-500 font-semibold shrink-0">
                  📅 {formattedDate}, {formattedTime}
                </div>

              </div>

              {/* 2. 3-Column Info Row (Customer, Delivery Address, Items & Payment) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 px-3.5 sm:px-4 py-3 text-xs">
                
                {/* Col 1: Customer Details */}
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

                {/* Col 2: Delivery Address & Google Maps */}
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Delivery Address</p>
                    {order.customerInfo?.coordinates && (
                      <span className="text-[9px] font-black text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-300">
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

                {/* Col 3: Items & Payment Breakdown */}
                <div className="space-y-1 bg-gray-50/90 p-2.5 rounded-xl border border-gray-100 min-w-0">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Items & Payment</p>
                  
                  <div className="space-y-0.5 text-[11px]">
                    <div className="truncate text-gray-800 font-medium">
                      {order.items?.map((item, i) => (
                        <span key={i}>
                          {i > 0 && ', '}
                          {item.quantity}× {item.product?.name || 'Atta'}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between pt-1 border-t border-gray-200">
                      <span className="font-black text-sm text-emerald-950">₹{order.total}</span>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${
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
                          : 'CASH ON DELIVERY'}
                      </span>
                    </div>
                  </div>
                </div>

              </div>

              {/* 3. Bottom Toolbar: 1-Click Order Stage Progression & Status Selector */}
              <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 sm:px-4 py-2 border-t border-gray-100 bg-gray-50/60 rounded-b-2xl">
                
                {/* One-Click Sequential Action Progression */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {canonical === 'New' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'Order Confirmed')}
                      className="bg-[#062e1e] hover:bg-[#0b482d] text-white font-black text-xs px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                    >
                      <CheckCircle2 size={13} className="text-amber-400" />
                      <span>1. Accept & Confirm Order</span>
                    </button>
                  )}

                  {canonical === 'Confirmed' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'Preparing Your Order')}
                      className="bg-purple-800 hover:bg-purple-900 text-white font-black text-xs px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                    >
                      <ChefHat size={13} />
                      <span>2. Start Preparing / Milling</span>
                    </button>
                  )}

                  {canonical === 'Pending' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'Out for Delivery')}
                      className="bg-blue-700 hover:bg-blue-800 text-white font-black text-xs px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                    >
                      <Truck size={13} />
                      <span>3. Dispatch (Out for Delivery)</span>
                    </button>
                  )}

                  {canonical === 'Out for Delivery' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'Delivered')}
                      className="bg-emerald-800 hover:bg-emerald-900 text-white font-black text-xs px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                    >
                      <CheckCircle2 size={13} />
                      <span>4. Mark as Delivered</span>
                    </button>
                  )}

                  {canonical === 'Delivered' && (
                    <span className="text-emerald-900 font-bold text-xs flex items-center gap-1.5 bg-emerald-100 px-3 py-1 rounded-xl border border-emerald-300">
                      <CheckCircle2 size={13} className="text-emerald-700" />
                      <span>Completed & Delivered</span>
                    </span>
                  )}

                  {canonical === 'Cancelled' && (
                    <span className="text-red-900 font-bold text-xs flex items-center gap-1.5 bg-red-100 px-3 py-1 rounded-xl border border-red-300">
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
                      className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold text-xs px-2.5 py-1.5 rounded-xl transition flex items-center gap-1 cursor-pointer"
                    >
                      <XCircle size={12} /> Cancel
                    </button>
                  )}
                </div>

                {/* Status Selector Dropdown & Actions */}
                <div className="flex items-center gap-2 ml-auto">
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-bold text-gray-500 uppercase">Status:</span>
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value as Order['status'])}
                      className={`text-xs font-bold border rounded-xl px-2.5 py-1 outline-none cursor-pointer ${getStatusBadge(order.status)}`}
                    >
                      <option value="Order Placed">New (Placed)</option>
                      <option value="Order Confirmed">Confirmed</option>
                      <option value="Preparing Your Order">Preparing / Milling</option>
                      <option value="Out for Delivery">Out for Delivery</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>

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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
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

    </div>
  );
}
