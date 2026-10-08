'use client';

import { useOrders } from '@/context/OrderContext';
import { useState } from 'react';
import { Search, MapPin, Phone, ShoppingBag, ChevronDown, ChevronUp, Package, MessageSquare, Navigation } from 'lucide-react';

export default function CustomersPage() {
  const { orders } = useOrders();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCustomer, setExpandedCustomer] = useState<string | null>(null);

  // Extract unique customers
  const customersMap = new Map();
  orders.forEach(order => {
    const phone = order.customerInfo?.phone;
    if (!phone) return;
    
    if (customersMap.has(phone)) {
      const existing = customersMap.get(phone);
      existing.totalOrders += 1;
      existing.totalSpent += (order.total || 0);
      existing.orders.push(order);
    } else {
      customersMap.set(phone, {
        name: order.customerInfo?.name || 'Unknown',
        phone: phone,
        address: order.customerInfo?.address || '',
        city: order.customerInfo?.city || '',
        pincode: order.customerInfo?.pincode || '',
        totalOrders: 1,
        totalSpent: order.total || 0,
        orders: [order]
      });
    }
  });

  const customersList = Array.from(customersMap.values());

  const filteredCustomers = customersList.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone.includes(searchTerm) ||
    c.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customer Directory</h1>
          <p className="text-xs text-gray-500 mt-1">View customer contact details, delivery addresses, and past order history</p>
        </div>
        <div className="bg-purple-50 text-purple-700 text-xs font-bold px-3 py-1.5 rounded-xl">
          Total Customers: {customersList.length}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search customer by name, phone number, address..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-600 shadow-sm"
        />
      </div>

      {/* Customers List */}
      <div className="space-y-3">
        {filteredCustomers.map(customer => {
          const isExpanded = expandedCustomer === customer.phone;
          const phoneClean = customer.phone.replace(/[^0-9]/g, '');

          return (
            <div key={customer.phone} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition">
              <div 
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-purple-50/20"
                onClick={() => setExpandedCustomer(isExpanded ? null : customer.phone)}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-base shrink-0">
                    {customer.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">{customer.name}</h3>
                    <div className="flex items-center gap-2 mt-1 flex-wrap text-xs text-gray-500">
                      <span className="flex items-center gap-1 font-semibold text-gray-700">
                        <Phone size={12} className="text-green-600" /> {customer.phone}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin size={12} className="text-red-500" /> {customer.address}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0">
                  <div className="text-left sm:text-right">
                    <p className="text-xs text-gray-400 font-medium">Orders / Total Spent</p>
                    <p className="text-sm font-bold text-gray-900">
                      {customer.totalOrders} Orders (<span className="text-emerald-600">₹{customer.totalSpent}</span>)
                    </p>
                  </div>
                  <button className="p-2 text-gray-400 hover:text-purple-600 transition">
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                </div>
              </div>

              {/* Expanded Order History */}
              {isExpanded && (
                <div className="bg-gray-50 p-4 border-t border-gray-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Order History for {customer.name}</h4>
                    {phoneClean && (
                      <a 
                        href={`https://wa.me/${phoneClean.length === 10 ? `91${phoneClean}` : phoneClean}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded-lg transition"
                      >
                        <MessageSquare size={13} /> Chat on WhatsApp
                      </a>
                    )}
                  </div>

                  <div className="space-y-2">
                    {customer.orders.map((ord: any) => (
                      <div key={ord.id} className="bg-white p-3 rounded-xl border border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900 text-xs">{ord.id}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              ord.status === 'Delivered' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                            }`}>
                              {ord.status}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-500 mt-0.5">
                            {new Date(ord.date).toLocaleString()} • {ord.items?.length || 1} items
                          </p>
                        </div>
                        <span className="font-extrabold text-sm text-gray-900">₹{ord.total}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filteredCustomers.length === 0 && (
          <div className="bg-white p-8 rounded-2xl border border-gray-100 text-center">
            <p className="text-gray-500 text-sm font-medium">No customers found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}