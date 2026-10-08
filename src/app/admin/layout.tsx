'use client';

import Link from 'next/link';
import { LayoutDashboard, ShoppingBag, Users, Settings, LogOut, Package, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    document.title = "vishwakarma admin app";
  }, []);

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden relative w-full">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-green-950 text-white flex flex-col transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-4 border-b border-green-900 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-yellow-500 rounded flex items-center justify-center font-bold text-green-950">
              V
            </div>
            <span className="font-bold tracking-wide">Atta Admin</span>
          </div>
          <button className="md:hidden text-gray-300 hover:text-white" onClick={() => setSidebarOpen(false)}>
            <X size={24} />
          </button>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            <li>
              <Link href="/admin" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 px-3 py-2 rounded hover:bg-green-900 transition">
                <LayoutDashboard size={18} className="text-gray-400" /> Dashboard
              </Link>
            </li>
            <li>
              <Link href="/admin/orders" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 px-3 py-2 rounded hover:bg-green-900 transition">
                <ShoppingBag size={18} className="text-gray-400" /> Orders
              </Link>
            </li>
            <li>
              <Link href="/admin/products" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 px-3 py-2 rounded hover:bg-green-900 transition">
                <Package size={18} className="text-gray-400" /> Products
              </Link>
            </li>
            <li>
              <Link href="/admin/customers" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 px-3 py-2 rounded hover:bg-green-900 transition">
                <Users size={18} className="text-gray-400" /> Customers
              </Link>
            </li>
            <li>
              <Link href="/admin/settings" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 px-3 py-2 rounded hover:bg-green-900 transition">
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
      <main className="flex-1 flex flex-col overflow-hidden w-full max-w-full">
        {/* Modern Admin Header / Top Bar */}
        <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-4 sm:px-6 shrink-0 shadow-sm">
          <h1 className="text-base font-bold text-gray-900 tracking-tight">Dashboard</h1>
          
          <div className="flex items-center gap-4">
            <Link 
              href="/admin" 
              className="text-xs font-semibold text-green-700 hover:text-green-800 hover:underline transition flex items-center gap-1"
            >
              ← Back to Dashboard
            </Link>
            <div className="w-8 h-8 rounded-full bg-green-100 text-green-800 font-bold flex items-center justify-center text-xs shadow-sm border border-green-200">
              A
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto p-4 md:p-6 w-full max-w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
