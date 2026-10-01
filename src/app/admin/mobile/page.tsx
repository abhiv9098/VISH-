import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export default async function MobileAdminPage() {
  let orders = [];
  try {
    const filePath = path.join(process.cwd(), 'orders_data.json');
    if (fs.existsSync(filePath)) {
      const fileData = fs.readFileSync(filePath, 'utf-8');
      orders = JSON.parse(fileData);
    }
  } catch (error) {
    console.error('Error reading orders:', error);
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <h1 className="text-2xl font-bold mb-4 text-green-800">Mobile Admin Orders</h1>
      <div className="bg-blue-50 p-2 text-xs mb-4 border border-blue-200">
        <p>Debug Path: {path.join(process.cwd(), 'orders_data.json')}</p>
        <p>Total Orders Array Length: {orders.length}</p>
      </div>
      <p className="text-gray-600 mb-6 font-bold">Total Orders Found: {orders.length}</p>
      
      {orders.length === 0 ? (
        <div className="p-8 bg-white rounded-lg text-center shadow">
          <p className="text-gray-500 font-medium">No orders found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order: any) => (
            <div key={order.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-gray-900">{order.id}</span>
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-bold">
                  {order.status}
                </span>
              </div>
              <div className="text-sm text-gray-700 mb-2">
                <p><strong>Customer:</strong> {order.customerInfo?.name}</p>
                <p><strong>Phone:</strong> {order.customerInfo?.phone}</p>
                <p><strong>Total:</strong> ₹{order.total}</p>
              </div>
              <div className="text-xs text-gray-500">
                <p>{order.customerInfo?.address}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
