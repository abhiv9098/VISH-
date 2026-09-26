import { Search, Filter, Eye, Edit } from 'lucide-react';
import { sampleOrders } from '@/lib/data';

export default function OrdersPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Orders Management</h1>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search orders..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
            />
          </div>
          <button className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 flex items-center justify-center">
            <Filter size={20} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-200">
                <th className="p-4 font-medium">Order ID</th>
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Customer Details</th>
                <th className="p-4 font-medium">Items</th>
                <th className="p-4 font-medium">Amount</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sampleOrders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50 transition">
                  <td className="p-4 text-sm font-medium text-gray-900">{order.id}</td>
                  <td className="p-4 text-sm text-gray-600">
                    {new Date(order.date).toLocaleString()}
                  </td>
                  <td className="p-4">
                    <div className="text-sm font-medium text-gray-900">{order.customerInfo.name}</div>
                    <div className="text-xs text-gray-500">{order.customerInfo.phone}</div>
                    <div className="text-xs text-gray-400 truncate max-w-[200px]" title={order.customerInfo.address}>
                      {order.customerInfo.address}
                    </div>
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    {order.items.map(item => (
                      <div key={item.product.id}>
                        {item.quantity}x {item.product.name}
                      </div>
                    ))}
                  </td>
                  <td className="p-4 text-sm font-medium text-gray-900">
                    <div>₹{order.total}</div>
                    {order.advancePaid > 0 && (
                      <div className="text-xs text-green-600 font-normal">Adv: ₹{order.advancePaid}</div>
                    )}
                  </td>
                  <td className="p-4 text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                      order.status === 'Out for Delivery' ? 'bg-blue-100 text-blue-700' :
                      order.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition" title="View Details">
                        <Eye size={18} />
                      </button>
                      <button className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded transition" title="Edit Order">
                        <Edit size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {sampleOrders.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="p-4 border-t border-gray-200 flex items-center justify-between text-sm text-gray-600">
          <div>Showing 1 to {sampleOrders.length} of {sampleOrders.length} entries</div>
          <div className="flex gap-1">
            <button className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50" disabled>Previous</button>
            <button className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50" disabled>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
