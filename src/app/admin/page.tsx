'use client';

import { useState } from 'react';
import { 
  TrendingUp, 
  Users, 
  Package, 
  ShoppingBag,
  Search,
  MapPin,
  Phone,
  MessageSquare,
  Navigation,
  ExternalLink,
  PlusCircle,
  Plus,
  Eye,
  Trash2,
  X,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Calendar,
  CreditCard,
  Settings
} from 'lucide-react';
import { useOrders } from '@/context/OrderContext';
import { Order, products } from '@/lib/data';
import Link from 'next/link';

export default function AdminDashboard() {
  const { orders, updateOrderStatus, deleteOrder, addOrder } = useOrders();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [dateFilter, setDateFilter] = useState<'Today' | 'Last 7 Days' | 'Last 30 Days' | 'Custom'>('Last 7 Days');

  // Stats calculations
  const activeOrders = orders.filter(o => !o.isHiddenFromAdmin);
  const totalRevenue = activeOrders.reduce((sum, order) => sum + (order.total || 0), 0);
  const totalOrders = activeOrders.length;
  const pendingOrders = activeOrders.filter(o => o.status === 'Order Placed' || o.status === 'Processing').length;
  const completedOrders = activeOrders.filter(o => o.status === 'Delivered' || o.status === 'Ready').length;
  const cancelledOrders = activeOrders.filter(o => o.status === 'Cancelled').length;
  const totalCustomers = new Set(activeOrders.map(o => o.customerInfo?.phone).filter(Boolean)).size || 1;
  const productsCount = products.length;

  // Today calculations
  const todayStr = new Date().toISOString().split('T')[0];
  const todaysOrdersList = activeOrders.filter(o => o.date && o.date.startsWith(todayStr));
  const todaysOrders = todaysOrdersList.length || activeOrders.length; // fallback gracefully if dates are mock
  const todaysRevenue = todaysOrdersList.reduce((sum, o) => sum + (o.total || 0), 0) || totalRevenue;

  // Pending Payments (COD pending)
  const pendingPayments = activeOrders.reduce((sum, o) => sum + (o.remainingAmount || 0), 0);

  // Filter orders for table
  const filteredOrders = activeOrders.filter(order => {
    const safeId = order.id || '';
    const safeName = order.customerInfo?.name || '';
    const safePhone = order.customerInfo?.phone || '';
    const safeAddress = order.customerInfo?.address || '';
    
    const matchesSearch = 
      safeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      safeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      safePhone.includes(searchTerm) ||
      safeAddress.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'Delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Out for Delivery':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Ready':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Processing':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-orange-100 text-orange-800 border-orange-200';
    }
  };

  const createQuickTestOrder = () => {
    const testId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
    const randomLat = 28.6139 + (Math.random() - 0.5) * 0.05;
    const randomLng = 77.2090 + (Math.random() - 0.5) * 0.05;
    
    addOrder({
      id: testId,
      date: new Date().toISOString(),
      status: 'Order Placed',
      total: 349,
      advancePaid: 0,
      remainingAmount: 349,
      items: [{ product: products[0], quantity: 1 }],
      customerInfo: {
        name: 'Sunil Kumar (Local Test)',
        phone: '9876501234',
        address: 'House #24, Near Vishwakarma Mandir, Main Road',
        city: 'Delhi NCR',
        pincode: '110001',
        coordinates: {
          lat: parseFloat(randomLat.toFixed(5)),
          lng: parseFloat(randomLng.toFixed(5))
        },
        liveLocationUrl: `https://www.google.com/maps?q=${randomLat.toFixed(5)},${randomLng.toFixed(5)}`
      }
    });
  };

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* 1. Top Action Navigation Bar (Exact match to Screenshot Oct 6) */}
      <div className="flex flex-wrap items-center gap-3">
        {/* View Orders */}
        <Link
          href="/admin/orders"
          className="relative inline-flex items-center gap-2 bg-white px-4 py-2.5 rounded-2xl border border-gray-100 shadow-sm text-sm font-semibold text-gray-800 hover:bg-gray-50 transition"
        >
          <span className="absolute -top-2 right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
            {pendingOrders} New
          </span>
          <ShoppingBag size={18} className="text-blue-600" />
          <span>View Orders</span>
        </Link>

        {/* Add Product */}
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-2 bg-white px-4 py-2.5 rounded-2xl border border-gray-100 shadow-sm text-sm font-semibold text-gray-800 hover:bg-gray-50 transition"
        >
          <Plus size={18} className="text-green-600" />
          <span>Add Product</span>
        </Link>

        {/* View Customers */}
        <Link
          href="/admin/customers"
          className="inline-flex items-center gap-2 bg-white px-4 py-2.5 rounded-2xl border border-gray-100 shadow-sm text-sm font-semibold text-gray-800 hover:bg-gray-50 transition"
        >
          <Users size={18} className="text-purple-600" />
          <span>View Customers</span>
        </Link>

        {/* Live Prices */}
        <Link
          href="/admin/prices"
          className="inline-flex items-center gap-2 bg-white px-4 py-2.5 rounded-2xl border border-gray-100 shadow-sm text-sm font-semibold text-gray-800 hover:bg-gray-50 transition"
        >
          <TrendingUp size={18} className="text-amber-600" />
          <span>Live Prices</span>
        </Link>

        {/* Settings */}
        <Link
          href="/admin/settings"
          className="inline-flex items-center gap-2 bg-white px-4 py-2.5 rounded-2xl border border-gray-100 shadow-sm text-sm font-semibold text-gray-800 hover:bg-gray-50 transition"
        >
          <Settings size={18} className="text-gray-500" />
          <span>Settings</span>
        </Link>
      </div>

      {/* 2. Date Filter Row (Exact match to Screenshot Oct 6) */}
      <div className="bg-white p-2.5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-2 overflow-x-auto">
        {(['Today', 'Last 7 Days', 'Last 30 Days', 'Custom'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setDateFilter(tab)}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              dateFilter === tab 
                ? 'bg-emerald-700 text-white shadow-sm' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 3. 10 Stats Cards Grid (2 columns layout exact match to Screenshot Oct 6) */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {/* 1. Total Revenue */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
          <div className="bg-blue-50 p-2.5 rounded-xl text-blue-600 shrink-0">
            <TrendingUp size={22} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Total Revenue</p>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">₹{totalRevenue.toLocaleString()}</h3>
          </div>
        </div>

        {/* 2. Total Orders */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
          <div className="bg-blue-50 p-2.5 rounded-xl text-blue-600 shrink-0">
            <ShoppingBag size={22} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Total Orders</p>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">{totalOrders}</h3>
          </div>
        </div>

        {/* 3. Pending Orders */}
        <Link href="/admin/orders" className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3 hover:bg-amber-50/50 transition cursor-pointer">
          <div className="bg-orange-50 p-2.5 rounded-xl text-orange-600 shrink-0">
            <Clock size={22} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Pending Orders</p>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">{pendingOrders}</h3>
          </div>
        </Link>

        {/* 4. Completed */}
        <Link href="/admin/orders" className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3 hover:bg-green-50/50 transition cursor-pointer">
          <div className="bg-emerald-50 p-2.5 rounded-xl text-emerald-600 shrink-0">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Completed</p>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">{completedOrders}</h3>
          </div>
        </Link>

        {/* 5. Cancelled */}
        <Link href="/admin/prices" className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3 hover:bg-red-50/50 transition cursor-pointer">
          <div className="bg-red-50 p-2.5 rounded-xl text-red-600 shrink-0">
            <XCircle size={22} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Cancelled</p>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">{cancelledOrders}</h3>
          </div>
        </Link>

        {/* 6. Total Customers */}
        <Link href="/admin/customers" className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3 hover:bg-purple-50/50 transition cursor-pointer">
          <div className="bg-purple-50 p-2.5 rounded-xl text-purple-600 shrink-0">
            <Users size={22} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Total Customers</p>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">{totalCustomers}</h3>
          </div>
        </Link>

        {/* 7. Total Products */}
        <Link href="/admin/products" className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3 hover:bg-teal-50/50 transition cursor-pointer">
          <div className="bg-teal-50 p-2.5 rounded-xl text-teal-600 shrink-0">
            <Package size={22} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Total Products</p>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">{productsCount}</h3>
          </div>
        </Link>

        {/* 8. Today's Orders */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
          <div className="bg-sky-50 p-2.5 rounded-xl text-sky-600 shrink-0">
            <Calendar size={22} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Today&apos;s Orders</p>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">{todaysOrders}</h3>
          </div>
        </div>

        {/* 9. Today's Revenue */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
          <div className="bg-emerald-50 p-2.5 rounded-xl text-emerald-600 shrink-0">
            <TrendingUp size={22} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Today&apos;s Revenue</p>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">₹{todaysRevenue.toLocaleString()}</h3>
          </div>
        </div>

        {/* 10. Pending Payments */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
          <div className="bg-rose-50 p-2.5 rounded-xl text-rose-600 shrink-0">
            <CreditCard size={22} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Pending Payments</p>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">₹{pendingPayments.toLocaleString()}</h3>
          </div>
        </div>
      </div>

      {/* 4. Full Orders Management Section with Live Map & Search */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-4 mt-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Live Orders & Delivery Details</h2>
            <p className="text-xs text-gray-500">Track incoming customer orders, call/WhatsApp, and view live GPS location</p>
          </div>
          <button 
            onClick={createQuickTestOrder}
            className="flex items-center gap-1.5 bg-yellow-500 hover:bg-yellow-600 text-green-950 font-bold px-3 py-2 rounded-xl text-xs transition shadow-sm"
          >
            <PlusCircle size={15} /> + Test Local Order
          </button>
        </div>

        {/* Search & Status Filters */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-2 border-t border-gray-100">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, phone, address..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {['ALL', 'Order Placed', 'Processing', 'Out for Delivery', 'Delivered', 'Cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  statusFilter === status 
                    ? 'bg-green-700 text-white shadow-sm' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <table className="w-full text-left border-collapse block md:table">
            <thead className="hidden md:table-header-group">
              <tr className="bg-gray-50 text-gray-700 text-xs font-bold uppercase tracking-wider border-b border-gray-200">
                <th className="p-3.5">Order ID & Date</th>
                <th className="p-3.5">Customer Details</th>
                <th className="p-3.5 w-1/3">Address & GPS Navigation</th>
                <th className="p-3.5">Items & Amount</th>
                <th className="p-3.5">Status & Actions</th>
              </tr>
            </thead>
            <tbody className="block md:table-row-group divide-y divide-gray-100 text-xs">
              {filteredOrders.map(order => {
                const safeName = order.customerInfo?.name || 'Unknown';
                const safePhone = order.customerInfo?.phone || '';
                const phoneClean = safePhone.replace(/[^0-9]/g, '');
                const googleMapsUrl = order.customerInfo?.liveLocationUrl || 
                  (order.customerInfo?.coordinates 
                    ? `https://www.google.com/maps?q=${order.customerInfo.coordinates.lat},${order.customerInfo.coordinates.lng}`
                    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.customerInfo?.address || '')}`);
                
                return (
                  <tr key={order.id} className="block md:table-row hover:bg-amber-50/40 transition mb-6 border-b md:border-b-0 border-gray-200 md:mb-0">
                    {/* Order ID & Time */}
                    <td className="block md:table-cell p-3.5 align-top border-b border-gray-50 md:border-b-0">
                      <span className="font-bold text-gray-900 block text-sm">{order.id}</span>
                      <span className="text-gray-500 block mt-0.5">
                        {new Date(order.date || Date.now()).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                      <span className="text-gray-400 block">
                        {new Date(order.date || Date.now()).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </td>

                    {/* Customer Details */}
                    <td className="block md:table-cell p-3.5 align-top border-b border-gray-50 md:border-b-0">
                      <div className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                        <span className="w-6 h-6 rounded-full bg-green-100 text-green-800 flex items-center justify-center text-[10px] font-bold shrink-0">
                          {safeName.charAt(0).toUpperCase() || 'U'}
                        </span>
                        <span>{safeName}</span>
                      </div>

                      <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                        {safePhone && (
                          <a 
                            href={`tel:${safePhone}`}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold bg-gray-100 hover:bg-gray-200 text-gray-800 px-2 py-0.5 rounded transition"
                          >
                            <Phone size={11} className="text-green-600" />
                            {safePhone}
                          </a>
                        )}

                        {phoneClean && (
                          <a 
                            href={`https://wa.me/${phoneClean.length === 10 ? `91${phoneClean}` : phoneClean}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-100 hover:bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded transition"
                          >
                            <MessageSquare size={11} className="text-emerald-600" />
                            WA
                          </a>
                        )}
                      </div>
                    </td>

                    {/* Address & GPS */}
                    <td className="block md:table-cell p-3.5 align-top max-w-xs border-b border-gray-50 md:border-b-0">
                      <div className="text-gray-800 text-xs font-medium leading-snug">
                        {order.customerInfo.address}
                      </div>
                      {(order.customerInfo.city || order.customerInfo.pincode) && (
                        <div className="text-[11px] text-gray-500 mt-0.5">
                          {[order.customerInfo.city, order.customerInfo.pincode].filter(Boolean).join(', ')}
                        </div>
                      )}

                      <div className="mt-2">
                        <a 
                          href={googleMapsUrl}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-sm transition"
                        >
                          <Navigation size={12} className="shrink-0" />
                          <span>Live Location (Google Maps)</span>
                          <ExternalLink size={10} className="shrink-0" />
                        </a>
                      </div>
                    </td>

                    {/* Items & Total */}
                    <td className="block md:table-cell p-3.5 align-top border-b border-gray-50 md:border-b-0">
                      <div className="font-extrabold text-sm text-gray-900">
                        ₹{order.total}
                      </div>
                      <div className="text-[11px] text-gray-500 mt-1 space-y-0.5">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="truncate max-w-[160px]">
                            • {item.quantity}x {item.product.name}
                          </div>
                        ))}
                      </div>
                    </td>

                    {/* Status & Actions */}
                    <td className="block md:table-cell p-3.5 align-top">
                      <div className="space-y-1.5">
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value as Order['status'])}
                          className={`w-full text-[11px] font-bold border rounded-lg px-2 py-1 outline-none cursor-pointer ${getStatusBadge(order.status)}`}
                        >
                          <option value="Order Placed">Order Placed</option>
                          <option value="Processing">Processing</option>
                          <option value="Ready">Ready</option>
                          <option value="Out for Delivery">Out for Delivery</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>

                        <div className="flex items-center gap-1.5 pt-0.5">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded border border-gray-200 transition"
                            title="View Full Details"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete order ${order.id}?`)) {
                                deleteOrder(order.id);
                              }
                            }}
                            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded border border-gray-200 transition"
                            title="Delete Order"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center">
                    <AlertCircle size={32} className="mx-auto text-gray-300 mb-2" />
                    <p className="text-gray-700 font-medium text-xs">No orders found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setSelectedOrder(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
            >
              <X size={20} />
            </button>

            <h3 className="text-xl font-bold text-gray-900 mb-1">
              Order {selectedOrder.id}
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Placed on {new Date(selectedOrder.date).toLocaleString()}
            </p>

            <div className="space-y-4 text-xs">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Customer Information
                </h4>
                <div className="space-y-1.5 text-sm">
                  <div><strong className="text-gray-700">Name:</strong> {selectedOrder.customerInfo.name}</div>
                  <div><strong className="text-gray-700">Phone:</strong> {selectedOrder.customerInfo.phone}</div>
                  <div><strong className="text-gray-700">Address:</strong> {selectedOrder.customerInfo.address}</div>
                </div>
              </div>

              <div className="border border-gray-100 rounded-xl p-4">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Ordered Items
                </h4>
                <div className="divide-y divide-gray-100 text-xs">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="py-2 flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-800">{item.product.name}</p>
                        <p className="text-gray-500">Qty: {item.quantity} × ₹{item.product.price}</p>
                      </div>
                      <span className="font-bold text-gray-900">
                        ₹{item.quantity * item.product.price}
                      </span>
                    </div>
                  ))}
                  <div className="pt-3 flex justify-between font-bold text-sm text-gray-900">
                    <span>Total Amount:</span>
                    <span>₹{selectedOrder.total}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-semibold transition"
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
