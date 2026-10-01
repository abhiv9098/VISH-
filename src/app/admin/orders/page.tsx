'use client';

import { useState } from 'react';
import { 
  Search, 
  MapPin, 
  Phone, 
  Navigation, 
  CheckCircle2, 
  Clock, 
  Truck, 
  AlertCircle,
  ExternalLink,
  MessageSquare,
  PlusCircle,
  Eye,
  Trash2,
  X
} from 'lucide-react';
import { useOrders } from '@/context/OrderContext';
import { Order, products } from '@/lib/data';
import Link from 'next/link';

export default function OrdersPage() {
  const { orders, updateOrderStatus, deleteOrder, addOrder } = useOrders();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Filter orders
  const filteredOrders = orders.filter(order => {
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
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders & Live Tracking</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Local app orders, customer contact details & live GPS delivery location
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button 
            onClick={createQuickTestOrder}
            className="flex items-center gap-1.5 bg-yellow-500 hover:bg-yellow-600 text-green-950 font-bold px-3 py-2 rounded-lg text-sm transition shadow-sm"
          >
            <PlusCircle size={16} /> + Test Local Order
          </button>
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-1.5 bg-green-700 hover:bg-green-800 text-white font-medium px-3 py-2 rounded-lg text-sm transition"
          >
            Open Store / Place Order <ExternalLink size={14} />
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, phone, address, or order ID..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {['ALL', 'Order Placed', 'Processing', 'Out for Delivery', 'Delivered', 'Cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
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
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse block md:table">
            <thead className="hidden md:table-header-group">
              <tr className="bg-gray-50 text-gray-700 text-xs font-bold uppercase tracking-wider border-b border-gray-200">
                <th className="p-4">Order ID & Date</th>
                <th className="p-4">Customer Details (Name & Phone)</th>
                <th className="p-4">Delivery Address & Live GPS Location</th>
                <th className="p-4">Items & Price</th>
                <th className="p-4">Status & Actions</th>
              </tr>
            </thead>
            <tbody className="block md:table-row-group divide-y divide-gray-100 text-sm">
              {filteredOrders.map(order => {
                const safeName = order.customerInfo?.name || 'Unknown';
                const safePhone = order.customerInfo?.phone || '';
                const phoneClean = safePhone.replace(/[^0-9]/g, '');
                const googleMapsUrl = order.customerInfo?.liveLocationUrl || 
                  (order.customerInfo?.coordinates 
                    ? `https://www.google.com/maps?q=${order.customerInfo.coordinates.lat},${order.customerInfo.coordinates.lng}`
                    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.customerInfo?.address || '')}`);
                
                return (
                  <tr key={order.id} className="block md:table-row hover:bg-amber-50/40 transition mb-6 border-b md:border-b-0 border-gray-300 md:mb-0">
                    {/* Order ID & Time */}
                    <td className="block md:table-cell p-4 align-top border-b border-gray-50 md:border-b-0">
                      <span className="font-bold text-gray-900 block">{order.id}</span>
                      <span className="text-xs text-gray-500 block mt-1">
                        {new Date(order.date).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                      <span className="text-xs text-gray-400 block">
                        {new Date(order.date).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </td>

                    {/* Customer Details: Name & Phone */}
                    <td className="block md:table-cell p-4 align-top border-b border-gray-50 md:border-b-0">
                      <div className="font-bold text-gray-900 text-base flex items-center gap-1.5">
                        <span className="w-7 h-7 rounded-full bg-green-100 text-green-800 flex items-center justify-center text-xs font-bold shrink-0">
                          {safeName.charAt(0).toUpperCase() || 'U'}
                        </span>
                        <span>{safeName}</span>
                      </div>

                      <div className="mt-2 flex items-center gap-2 flex-wrap">
                        {safePhone && (
                          <a 
                            href={`tel:${safePhone}`}
                            className="inline-flex items-center gap-1 text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-800 px-2 py-1 rounded transition"
                            title="Click to Call"
                          >
                            <Phone size={12} className="text-green-600" />
                            {safePhone}
                          </a>
                        )}

                        {phoneClean && (
                          <a 
                            href={`https://wa.me/${phoneClean.length === 10 ? `91${phoneClean}` : phoneClean}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-semibold bg-emerald-100 hover:bg-emerald-200 text-emerald-800 px-2 py-1 rounded transition"
                            title="Chat on WhatsApp"
                          >
                            <MessageSquare size={12} className="text-emerald-600" />
                            WhatsApp
                          </a>
                        )}
                      </div>
                    </td>

                    {/* Address & Live GPS Location */}
                    <td className="block md:table-cell p-4 align-top max-w-xs border-b border-gray-50 md:border-b-0">
                      <div className="text-gray-800 text-sm font-medium leading-snug">
                        {order.customerInfo.address}
                      </div>
                      {(order.customerInfo.city || order.customerInfo.pincode) && (
                        <div className="text-xs text-gray-500 mt-0.5">
                          {[order.customerInfo.city, order.customerInfo.pincode].filter(Boolean).join(', ')}
                        </div>
                      )}

                      {/* Live Location Navigation Button */}
                      <div className="mt-2.5">
                        <a 
                          href={googleMapsUrl}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm transition"
                        >
                          <Navigation size={13} className="shrink-0" />
                          <span>Live Location (Google Maps)</span>
                          <ExternalLink size={12} className="shrink-0" />
                        </a>

                        {order.customerInfo.coordinates && (
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            <span className="text-[11px] font-mono text-green-700 font-bold">
                              GPS: {order.customerInfo.coordinates.lat.toFixed(4)}, {order.customerInfo.coordinates.lng.toFixed(4)}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Items & Total */}
                    <td className="block md:table-cell p-4 align-top border-b border-gray-50 md:border-b-0">
                      <div className="font-extrabold text-base text-gray-900">
                        ₹{order.total}
                      </div>
                      <div className="text-xs text-gray-500 mt-1 space-y-1">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="truncate max-w-[180px]">
                            • {item.quantity}x {item.product.name}
                          </div>
                        ))}
                      </div>
                      {order.remainingAmount > 0 ? (
                        <span className="inline-block mt-2 text-[11px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                          COD Pending: ₹{order.remainingAmount}
                        </span>
                      ) : (
                        <span className="inline-block mt-2 text-[11px] font-bold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded">
                          Paid Online
                        </span>
                      )}
                    </td>

                    {/* Status & Actions */}
                    <td className="block md:table-cell p-4 align-top border-b border-gray-50 md:border-b-0">
                      <div className="space-y-2">
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value as Order['status'])}
                          className={`w-full text-xs font-bold border rounded-lg px-2.5 py-1.5 outline-none cursor-pointer ${getStatusBadge(order.status)}`}
                        >
                          <option value="Order Placed">Order Placed</option>
                          <option value="Processing">Processing</option>
                          <option value="Ready">Ready</option>
                          <option value="Out for Delivery">Out for Delivery</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>

                        <div className="flex items-center gap-2 pt-1">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded border border-gray-200 transition"
                            title="View Full Details"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete order ${order.id}?`)) {
                                deleteOrder(order.id);
                              }
                            }}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded border border-gray-200 transition"
                            title="Delete Order"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-10 text-center">
                    <AlertCircle size={40} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-700 font-medium">No orders found.</p>
                    <p className="text-gray-400 text-xs mt-1 mb-4">
                      Place an order on the customer app or click below to create a quick test order.
                    </p>
                    <button
                      onClick={createQuickTestOrder}
                      className="bg-green-700 hover:bg-green-800 text-white font-bold text-xs px-4 py-2 rounded-lg transition"
                    >
                      + Create Test Order
                    </button>
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

            <div className="space-y-4">
              {/* Customer Box */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Customer Information
                </h4>
                <div className="space-y-1.5 text-sm">
                  <div><strong className="text-gray-700">Name:</strong> {selectedOrder.customerInfo.name}</div>
                  <div><strong className="text-gray-700">Phone:</strong> {selectedOrder.customerInfo.phone}</div>
                  <div><strong className="text-gray-700">Address:</strong> {selectedOrder.customerInfo.address}</div>
                  {selectedOrder.customerInfo.city && (
                    <div><strong className="text-gray-700">City / Pincode:</strong> {selectedOrder.customerInfo.city} {selectedOrder.customerInfo.pincode}</div>
                  )}
                </div>
              </div>

              {/* Live Location Navigation */}
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Navigation size={14} /> Live GPS Location
                </h4>
                {selectedOrder.customerInfo.coordinates ? (
                  <p className="text-xs text-blue-800 mb-3">
                    Customer&apos;s exact live GPS coordinates: 
                    <span className="font-mono font-bold block mt-1 text-sm">
                      {selectedOrder.customerInfo.coordinates.lat}, {selectedOrder.customerInfo.coordinates.lng}
                    </span>
                  </p>
                ) : (
                  <p className="text-xs text-blue-800 mb-3">
                    Street Address mapping for delivery navigation:
                  </p>
                )}
                
                <a
                  href={selectedOrder.customerInfo.liveLocationUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedOrder.customerInfo.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg text-sm transition"
                >
                  <Navigation size={16} /> Open in Google Maps (Live Navigation)
                </a>
              </div>

              {/* Items List */}
              <div className="border border-gray-100 rounded-xl p-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Ordered Items
                </h4>
                <div className="divide-y divide-gray-100 text-sm">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="py-2 flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-800">{item.product.name}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity} × ₹{item.product.price}</p>
                      </div>
                      <span className="font-bold text-gray-900">
                        ₹{item.quantity * item.product.price}
                      </span>
                    </div>
                  ))}
                  <div className="pt-3 flex justify-between font-bold text-base text-gray-900">
                    <span>Total Amount:</span>
                    <span>₹{selectedOrder.total}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-sm font-semibold transition"
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
