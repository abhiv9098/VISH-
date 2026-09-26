'use client';

import { TrendingUp, Users, Package, ShoppingBag, MapPin } from 'lucide-react';
import { useOrders } from '@/context/OrderContext';

export default function AdminDashboard() {
  const { orders } = useOrders();
  
  const pendingOrders = orders.filter(o => o.status === 'Order Placed' || o.status === 'Processing').length;
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard Overview</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="bg-blue-100 p-4 rounded-lg text-blue-700">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Revenue</p>
            <h3 className="text-2xl font-bold text-gray-900">₹{totalRevenue.toLocaleString()}</h3>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="bg-orange-100 p-4 rounded-lg text-orange-700">
            <ShoppingBag size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Orders</p>
            <h3 className="text-2xl font-bold text-gray-900">{orders.length}</h3>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="bg-green-100 p-4 rounded-lg text-green-700">
            <Package size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Pending Orders</p>
            <h3 className="text-2xl font-bold text-gray-900">{pendingOrders}</h3>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="bg-purple-100 p-4 rounded-lg text-purple-700">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Customers</p>
            <h3 className="text-2xl font-bold text-gray-900">1,248</h3>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-800">All Recent Orders</h2>
        </div>
        <div className="overflow-x-auto">
          {orders.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No orders have been placed yet.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-sm">
                  <th className="p-4 font-medium border-b">Order ID / Date</th>
                  <th className="p-4 font-medium border-b">Customer Info</th>
                  <th className="p-4 font-medium border-b w-1/3">Location / Address</th>
                  <th className="p-4 font-medium border-b">Items & Amount</th>
                  <th className="p-4 font-medium border-b">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50 transition border-b">
                    <td className="p-4 text-sm">
                      <div className="font-medium text-gray-900">{order.id}</div>
                      <div className="text-xs text-gray-500">{new Date(order.date).toLocaleString()}</div>
                    </td>
                    <td className="p-4 text-sm text-gray-700">
                      <div className="font-medium text-gray-900">{order.customerInfo.name}</div>
                      <div className="text-xs font-semibold text-gray-600">{order.customerInfo.phone}</div>
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      <div className="flex items-start gap-1">
                        <MapPin size={14} className="mt-0.5 text-red-500 shrink-0" />
                        <span className="line-clamp-2">{order.customerInfo.address}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm">
                      <div className="font-medium text-gray-900 mb-1">₹{order.total}</div>
                      <div className="text-xs text-gray-500 truncate max-w-[150px]">
                        {order.items.map(i => `${i.quantity}x ${i.product.name}`).join(', ')}
                      </div>
                    </td>
                    <td className="p-4 text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                        order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                        order.status === 'Out for Delivery' ? 'bg-blue-100 text-blue-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {order.status}
                      </span>
                      {order.remainingAmount > 0 && (
                        <div className="text-[10px] text-red-500 font-bold mt-1">
                          COD Pending: ₹{order.remainingAmount}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
