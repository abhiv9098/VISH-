'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ShoppingBag, Users, Settings, LogOut, Package, Menu, X, Bell } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useOrders } from '@/context/OrderContext';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { newOrdersCount } = useOrders();
  const prevCountRef = useRef(newOrdersCount);

  useEffect(() => {
    document.title = "Vishwakarma Atta Chakki - Admin Panel";
  }, []);

  // Play subtle chime when a new order arrives
  useEffect(() => {
    if (newOrdersCount > prevCountRef.current) {
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
        osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.35);
      } catch {}
    }
    prevCountRef.current = newOrdersCount;
  }, [newOrdersCount]);

  const isDashboardActive = pathname === '/admin' || pathname === '/admin/';
  const isOrdersActive = pathname.startsWith('/admin/orders');
  const isProductsActive = pathname.startsWith('/admin/products');
  const isCustomersActive = pathname.startsWith('/admin/customers');
  const isSettingsActive = pathname.startsWith('/admin/settings');

  const getTitle = () => {
    if (isOrdersActive) return 'Orders';
    if (isProductsActive) return 'Products';
    if (isCustomersActive) return 'Customers';
    if (isSettingsActive) return 'Settings';
    return 'Dashboard';
  };

  const navItems = [
    {
      name: 'Dashboard',
      href: '/admin',
      active: isDashboardActive,
      icon: LayoutDashboard,
      badge: null,
    },
    {
      name: 'Orders',
      href: '/admin/orders',
      active: isOrdersActive,
      icon: ShoppingBag,
      badge: newOrdersCount > 0 ? `${newOrdersCount} New` : null,
    },
    {
      name: 'Products',
      href: '/admin/products',
      active: isProductsActive,
      icon: Package,
      badge: null,
    },
    {
      name: 'Customers',
      href: '/admin/customers',
      active: isCustomersActive,
      icon: Users,
      badge: null,
    },
    {
      name: 'Settings',
      href: '/admin/settings',
      active: isSettingsActive,
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <div className="flex h-screen h-[100dvh] bg-[#f3f4f6] text-gray-900 overflow-hidden relative w-full font-sans antialiased">
      {/* Mobile Sidebar Overlay with guaranteed touch & click handling */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden transition-opacity cursor-pointer" 
          onClick={() => setSidebarOpen(false)}
          onTouchEnd={() => setSidebarOpen(false)}
          role="button"
          tabIndex={0}
          aria-label="Close sidebar"
        />
      )}

      {/* Sidebar - Forest Green Background */}
      <aside 
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-[#062e1e] text-white flex flex-col transform transition-transform duration-300 ease-in-out shrink-0 ${
          sidebarOpen 
            ? 'translate-x-0 pointer-events-auto visible' 
            : '-translate-x-full pointer-events-none invisible md:translate-x-0 md:pointer-events-auto md:visible'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-[#0b482d] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative w-9 h-9 rounded-lg overflow-hidden border border-teal-500/40 shadow-xs shrink-0 bg-[#042f2e]">
              <Image 
                src="/images/logo.png" 
                alt="Vishwakarma Logo" 
                fill 
                sizes="36px"
                className="object-cover" 
              />
            </div>
            <span className="font-bold text-lg tracking-wide text-white">Atta Admin</span>
          </div>
          <button 
            className="md:hidden text-gray-300 hover:text-white p-2 rounded-xl active:bg-white/10 transition touch-manipulation cursor-pointer" 
            onClick={() => setSidebarOpen(false)}
            aria-label="Close Sidebar"
          >
            <X size={22} />
          </button>
        </div>
        
        {/* Nav Links - Five Sidebar Sections */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <ul className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.name}>
                  <Link 
                    href={item.href} 
                    onClick={() => setSidebarOpen(false)} 
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all group touch-manipulation ${
                      item.active 
                        ? 'bg-[#0b482d] text-white shadow-xs' 
                        : 'text-emerald-100/75 hover:bg-[#093a25] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon 
                        size={20} 
                        className={`transition-colors ${
                          item.active ? 'text-white' : 'text-emerald-300/70 group-hover:text-white'
                        }`} 
                      />
                      <span>{item.name}</span>
                    </div>
                    {item.badge && (
                      <span className="bg-[#f59e0b] text-[#062e1e] font-black text-[11px] px-2 py-0.5 rounded-full animate-pulse shadow-xs">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        
        {/* Logout / Storefront Button */}
        <div className="p-4 border-t border-[#0b482d]">
          <Link 
            href="/"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 px-3.5 py-2.5 w-full rounded-xl hover:bg-red-900/40 text-red-300/90 hover:text-red-200 text-sm font-medium transition cursor-pointer touch-manipulation"
          >
            <LogOut size={18} />
            <span>Customer Storefront</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden w-full max-w-full min-w-0">
        {/* Top Header / App Bar */}
        <header className="h-14 sm:h-16 bg-white border-b border-gray-200/80 flex items-center justify-between px-3.5 sm:px-6 shrink-0 shadow-2xs z-10">
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile Hamburger Menu Button */}
            <button 
              className="md:hidden text-gray-700 hover:text-gray-900 p-2 -ml-1 rounded-xl hover:bg-gray-100 active:bg-gray-200 transition touch-manipulation cursor-pointer" 
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight truncate">
              {getTitle()}
            </h1>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Real-time Incoming New Order Pill */}
            {newOrdersCount > 0 && (
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-black animate-pulse shadow-2xs touch-manipulation"
                title={`${newOrdersCount} orders waiting for confirmation`}
              >
                <Bell size={13} className="text-red-600 fill-red-600" />
                <span className="hidden xs:inline">{newOrdersCount} New</span>
              </Link>
            )}

            {/* Admin Avatar Circle */}
            <div 
              className="w-9 h-9 rounded-full bg-[#d1fae5] text-[#065f46] font-bold flex items-center justify-center text-sm shadow-2xs border border-emerald-200 shrink-0 select-none"
              title="Vishwakarma Admin"
            >
              A
            </div>
          </div>
        </header>

        {/* Scrollable Main Viewport */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-5 md:p-6 pb-6 w-full max-w-full min-w-0 bg-[#f8fafc]">
          {children}
        </div>
      </main>
    </div>
  );
}
