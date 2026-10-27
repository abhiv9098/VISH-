'use client';

import { useOrders } from '@/context/OrderContext';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Search, 
  MapPin, 
  Phone, 
  ChevronDown, 
  ChevronUp, 
  Navigation,
  MessageCircle,
  Users,
  ShoppingBag,
  TrendingUp,
  RotateCcw,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react';
import { Order, getCanonicalStatus } from '@/lib/data';

export default function CustomersPage() {
  const { orders } = useOrders();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'DELIVERED' | 'CANCELLED'>('ALL');
  const [expandedCustomer, setExpandedCustomer] = useState<string | null>(null);

  // Extract unique customers from actual orders database
  const customersMap = useMemo(() => {
    const map = new Map<string, {
      name: string;
      phone: string;
      address: string;
      city: string;
      pincode: string;
      coordinates?: { lat: number; lng: number };
      liveLocationUrl?: string;
      totalOrders: number;
      completedOrders: number;
      cancelledOrders: number;
      activeOrders: number;
      totalSpent: number;
      orders: Order[];
    }>();

    orders.forEach(order => {
      const phone = order.customerInfo?.phone?.trim();
      const name = order.customerInfo?.name?.trim();
      const customerKey = phone || name || 'Unknown Customer';
      if (!customerKey) return;
      
      const rawName = (name || 'Unknown Customer').replace(/^["\s]+|["\s]+$/g, '').trim();
      const rawAddress = (order.customerInfo?.address || '').replace(/^["\s]+|["\s]+$/g, '').trim();
      const canonical = getCanonicalStatus(order.status);
      const isDelivered = canonical === 'Delivered';
      const isCancelled = canonical === 'Cancelled';
      const isActive = !isDelivered && !isCancelled;

      if (map.has(customerKey)) {
        const existing = map.get(customerKey)!;
        existing.totalOrders += 1;
        existing.totalSpent += (order.total || 0);
        if (isDelivered) existing.completedOrders += 1;
        if (isCancelled) existing.cancelledOrders += 1;
        if (isActive) existing.activeOrders += 1;
        if (!existing.coordinates && order.customerInfo?.coordinates) {
          existing.coordinates = order.customerInfo.coordinates;
        }
        if (!existing.liveLocationUrl && order.customerInfo?.liveLocationUrl) {
          existing.liveLocationUrl = order.customerInfo.liveLocationUrl;
        }
        existing.orders.push(order);
      } else {
        map.set(customerKey, {
          name: rawName || 'Unknown Customer',
          phone: phone || 'N/A',
          address: rawAddress,
          city: order.customerInfo?.city || '',
          pincode: order.customerInfo?.pincode || '',
          coordinates: order.customerInfo?.coordinates,
          liveLocationUrl: order.customerInfo?.liveLocationUrl,
          totalOrders: 1,
          completedOrders: isDelivered ? 1 : 0,
          cancelledOrders: isCancelled ? 1 : 0,
          activeOrders: isActive ? 1 : 0,
          totalSpent: order.total || 0,
          orders: [order]
        });
      }
    });

    return map;
  }, [orders]);

  const customersList = useMemo(() => Array.from(customersMap.values()), [customersMap]);

  // Aggregate stats
  const totalCustomers = customersList.length;
  const repeatCustomers = customersList.filter(c => c.totalOrders > 1).length;
  const totalOrdersAcrossCustomers = customersList.reduce((sum, c) => sum + c.totalOrders, 0);
  const totalRevenueAcrossCustomers = customersList.reduce((sum, c) => sum + c.totalSpent, 0);

  // Filtered list
  const filteredCustomers = useMemo(() => {
    return customersList.filter(c => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch = 
        !q ||
        c.name.toLowerCase().includes(q) || 
        c.phone.includes(q) ||
        c.address.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (statusFilter === 'ACTIVE') return c.activeOrders > 0;
      if (statusFilter === 'DELIVERED') return c.completedOrders > 0;
      if (statusFilter === 'CANCELLED') return c.cancelledOrders > 0;

      return true;
    });
  }, [customersList, searchTerm, statusFilter]);

  const getGoogleMapsUrl = (c: any) => {
    if (c.liveLocationUrl && c.liveLocationUrl.trim()) return c.liveLocationUrl.trim();
    if (c.coordinates?.lat && c.coordinates?.lng) {
      return `https://www.google.com/maps?q=${c.coordinates.lat},${c.coordinates.lng}`;
    }
    const full = [c.address, c.city, c.pincode].filter(Boolean).join(', ');
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(full || c.address)}`;
  };

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

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-12 w-full min-w-0">

      {/* Header Row */}
      <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-gray-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-gray-900">
            Customers Directory
          </h2>
          <p className="text-xs text-gray-500">
            View customer details, contact channels, lifetime spend, and complete order history
          </p>
        </div>
        <span className="text-xs font-bold text-emerald-900 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-300 self-start sm:self-auto">
          {totalCustomers} Registered Customers
        </span>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3">
        <div className="bg-white p-3 sm:p-3.5 rounded-2xl border border-gray-200/70 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
            <Users size={18} />
          </div>
          <div>
            <p className="text-[11px] text-gray-500 font-medium">Total Customers</p>
            <h3 className="text-base font-black text-gray-900">{totalCustomers}</h3>
          </div>
        </div>

        <div className="bg-white p-3 sm:p-3.5 rounded-2xl border border-gray-200/70 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <RotateCcw size={18} />
          </div>
          <div>
            <p className="text-[11px] text-gray-500 font-medium">Repeat Customers</p>
            <h3 className="text-base font-black text-emerald-700">{repeatCustomers}</h3>
          </div>
        </div>

        <div className="bg-white p-3 sm:p-3.5 rounded-2xl border border-gray-200/70 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
            <ShoppingBag size={18} />
          </div>
          <div>
            <p className="text-[11px] text-gray-500 font-medium">Total Orders</p>
            <h3 className="text-base font-black text-blue-700">{totalOrdersAcrossCustomers}</h3>
          </div>
        </div>

        <div className="bg-white p-3 sm:p-3.5 rounded-2xl border border-gray-200/70 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <TrendingUp size={18} />
          </div>
          <div>
            <p className="text-[11px] text-gray-500 font-medium">Total Revenue</p>
            <h3 className="text-base font-black text-gray-900">₹{totalRevenueAcrossCustomers.toLocaleString('en-IN')}</h3>
          </div>
        </div>
      </div>

      {/* Search & Filter Tabs */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-gray-200/80 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by customer name, phone, city..." 
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:bg-white transition"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {(['ALL', 'ACTIVE', 'DELIVERED', 'CANCELLED'] as const).map(tab => {
            const isSelected = statusFilter === tab;
            const label = tab === 'ALL' ? 'All Customers' : tab === 'ACTIVE' ? 'Active Orders' : tab === 'DELIVERED' ? 'Delivered' : 'Cancelled';
            return (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer shrink-0 ${
                  isSelected 
                    ? 'bg-[#062e1e] text-[#f59e0b] shadow-xs' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Customers List */}
      <div className="space-y-3">
        {filteredCustomers.map(customer => {
          const isExpanded = expandedCustomer === customer.phone;
          const phoneClean = customer.phone.replace(/[^0-9]/g, '');
          const initial = customer.name.replace(/[^a-zA-Z0-9]/g, '').charAt(0).toUpperCase() || 'C';
          const mapsUrl = getGoogleMapsUrl(customer);

          return (
            <div 
              key={customer.phone} 
              className="bg-white rounded-2xl border border-gray-200/90 shadow-2xs overflow-hidden transition-all hover:border-gray-300"
            >
              {/* Customer Row Header */}
              <div 
                className="p-3.5 sm:p-4.5 flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer hover:bg-gray-50/50 transition"
                onClick={() => setExpandedCustomer(isExpanded ? null : customer.phone)}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-900 font-black flex items-center justify-center text-base shrink-0 border border-emerald-300 shadow-2xs">
                    {initial}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-gray-900 text-sm sm:text-base">
                        {customer.name}
                      </h3>
                      {customer.totalOrders > 1 && (
                        <span className="text-[10px] font-black text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.2 rounded-md">
                          Repeat Customer
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-1 flex-wrap text-xs text-gray-500">
                      <span className="font-semibold text-gray-700">{customer.phone}</span>
                      {customer.city && <span>• {customer.city}</span>}
                    </div>

                    <p className="text-[11px] text-gray-600 line-clamp-1 mt-1 max-w-lg">
                      {customer.address || 'Address not specified'}
                    </p>
                  </div>
                </div>

                {/* Right Side Stats & Actions */}
                <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-gray-100">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="bg-gray-100 text-gray-800 font-bold px-2.5 py-1 rounded-xl">
                      {customer.totalOrders} {customer.totalOrders === 1 ? 'Order' : 'Orders'}
                    </span>
                    <span className="bg-emerald-50 text-emerald-900 font-black px-2.5 py-1 rounded-xl border border-emerald-200">
                      ₹{customer.totalSpent}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                    {customer.phone && customer.phone !== 'N/A' && (
                      <a 
                        href={`tel:${customer.phone}`}
                        className="p-2 text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-200 transition"
                        title="Call Customer"
                      >
                        <Phone size={14} />
                      </a>
                    )}
                    {phoneClean && (
                      <a 
                        href={`https://wa.me/${phoneClean.length === 10 ? `91${phoneClean}` : phoneClean}`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 text-green-700 bg-green-50 hover:bg-green-100 rounded-xl border border-green-200 transition"
                        title="WhatsApp Customer"
                      >
                        <MessageCircle size={14} />
                      </a>
                    )}
                    <a 
                      href={mapsUrl}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-2 text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-200 transition"
                      title="Open in Google Maps"
                    >
                      <Navigation size={14} />
                    </a>
                    <button 
                      onClick={() => setExpandedCustomer(isExpanded ? null : customer.phone)}
                      className="p-1.5 text-gray-500 hover:text-gray-900 rounded-xl hover:bg-gray-100 transition"
                    >
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Expandable Order History Drawer */}
              {isExpanded && (
                <div className="border-t border-gray-100 bg-[#f9fafb] p-3.5 sm:p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Order History ({customer.orders.length})
                    </h4>
                    <span className="text-[11px] text-gray-500">
                      Latest orders at top
                    </span>
                  </div>

                  <div className="space-y-2">
                    {customer.orders.map(order => {
                      const orderDate = order.date ? new Date(order.date) : new Date();
                      return (
                        <div 
                          key={order.id}
                          className="bg-white p-3 rounded-xl border border-gray-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-gray-900">{order.id}</span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getStatusBadge(order.status)}`}>
                                {order.status}
                              </span>
                            </div>
                            <p className="text-[11px] text-gray-600 font-medium">
                              {order.items?.map(i => `${i.quantity}× ${i.product?.name || 'Atta'}`).join(', ')}
                            </p>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                            <span className="text-[11px] text-gray-500 font-medium">
                              📅 {orderDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </span>
                            <span className="font-black text-sm text-gray-900">
                              ₹{order.total}
                            </span>
                            <Link
                              href="/admin/orders"
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 hover:text-emerald-950 hover:underline"
                            >
                              <span>Manage</span>
                              <ExternalLink size={11} />
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filteredCustomers.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center space-y-2 shadow-2xs">
            <Users size={36} className="mx-auto text-gray-400" />
            <h3 className="text-base font-bold text-gray-900">No customers found</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              No customers match your search criteria.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
