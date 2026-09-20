import Link from 'next/link';
import { LayoutDashboard, ShoppingBag, Users, Settings, LogOut, Package } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-green-950 text-white flex flex-col">
        <div className="p-4 border-b border-green-900 flex items-center gap-2">
          <div className="w-8 h-8 bg-yellow-500 rounded flex items-center justify-center font-bold text-green-950">
            V
          </div>
          <span className="font-bold tracking-wide">Admin Panel</span>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            <li>
              <Link href="/admin" className="flex items-center gap-3 px-3 py-2 rounded hover:bg-green-900 transition">
                <LayoutDashboard size={18} className="text-gray-400" /> Dashboard
              </Link>
            </li>
            <li>
              <Link href="/admin/orders" className="flex items-center gap-3 px-3 py-2 rounded hover:bg-green-900 transition">
                <ShoppingBag size={18} className="text-gray-400" /> Orders
              </Link>
            </li>
            <li>
              <Link href="/admin/products" className="flex items-center gap-3 px-3 py-2 rounded hover:bg-green-900 transition">
                <Package size={18} className="text-gray-400" /> Products
              </Link>
            </li>
            <li>
              <Link href="/admin/customers" className="flex items-center gap-3 px-3 py-2 rounded hover:bg-green-900 transition">
                <Users size={18} className="text-gray-400" /> Customers
              </Link>
            </li>
            <li>
              <Link href="/admin/settings" className="flex items-center gap-3 px-3 py-2 rounded hover:bg-green-900 transition">
                <Settings size={18} className="text-gray-400" /> Settings
              </Link>
            </li>
          </ul>
        </nav>
        
        <div className="p-4 border-t border-green-900">
          <button className="flex items-center gap-3 px-3 py-2 w-full rounded hover:bg-red-900/50 text-red-300 transition">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Admin Header */}
        <header className="h-16 bg-white border-b flex items-center justify-between px-6 shrink-0">
          <h2 className="font-semibold text-gray-800">Store Management</h2>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-800 font-bold">
              A
            </div>
            <span className="text-sm font-medium text-gray-700">Admin</span>
          </div>
        </header>
        
        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
