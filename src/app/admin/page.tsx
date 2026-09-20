import { TrendingUp, Users, Package, ShoppingBag } from 'lucide-react';
import { sampleOrders } from '@/lib/data';

export default function AdminDashboard() {
  const pendingOrders = sampleOrders.filter(o => o.status === 'Order Placed' || o.status === 'Processing').length;
  const totalRevenue = sampleOrders.reduce((sum, order) => sum + order.total, 0);

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
            <p className="text-sm text-gray-500 font-medium">Pending Orders</p>
            <h3 className="text-2xl font-bold text-gray-900">{pendingOrders}</h3>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="bg-green-100 p-4 rounded-lg text-green-700">
            <Package size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Products</p>
            <h3 className="text-2xl font-bold text-gray-900">12</h3>
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
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">Recent Orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm">
                <th className="p-4 font-medium border-b">Order ID</th>
                <th className="p-4 font-medium border-b">Customer</th>
                <th className="p-4 font-medium border-b">Date</th>
                <th className="p-4 font-medium border-b">Status</th>
                <th className="p-4 font-medium border-b">Amount</th>
                <th className="p-4 font-medium border-b">Action</th>
              </tr>
            </thead>
            <tbody>
              {sampleOrders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50 transition border-b">
                  <td className="p-4 text-sm font-medium text-gray-900">{order.id}</td>
                  <td className="p-4 text-sm text-gray-700">
                    <div>{order.customerInfo.name}</div>
                    <div className="text-xs text-gray-500">{order.customerInfo.phone}</div>
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    {new Date(order.date).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                      order.status === 'Out for Delivery' ? 'bg-blue-100 text-blue-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm font-medium text-gray-900">₹{order.total}</td>
                  <td className="p-4 text-sm">
                    <button className="text-blue-600 hover:underline">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
