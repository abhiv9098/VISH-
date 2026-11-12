'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Users, 
  Settings, 
  LogOut, 
  Package, 
  Menu, 
  X, 
  Bell,
  DoorOpen,
  Store,
  Sparkles
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useOrders } from '@/context/OrderContext';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { newOrdersCount } = useOrders();
  const prevCountRef = useRef(newOrdersCount);
  const [mounted, setMounted] = useState(false);

  // Set page title & track client mount
  useEffect(() => {
    setMounted(true);
    document.title = "Vishwakarma Atta Chakki - Admin Panel";
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Close mobile sidebar on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSidebarOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Prevent background scrolling when mobile sidebar is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

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

  // Admin View Navigation States
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
      badge: mounted && newOrdersCount > 0 ? `${newOrdersCount} New` : null,
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
      {/* Mobile Sidebar Overlay with smooth fade */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden transition-opacity duration-300 ease-in-out cursor-pointer ${
          sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={(e) => {
          e.stopPropagation();
          setSidebarOpen(false);
        }}
        role="button"
        tabIndex={sidebarOpen ? 0 : -1}
        aria-hidden={!sidebarOpen}
        aria-label="Close sidebar overlay"
      />

      {/* Sidebar - Forest Green Background (Identical to Laptop, Smooth Mobile Drawer) */}
      <aside 
        className={`fixed md:static inset-y-0 left-0 z-50 w-72 max-w-[85vw] md:w-64 bg-[#062e1e] text-white flex flex-col transition-transform duration-300 ease-in-out shrink-0 shadow-2xl md:shadow-none ${
          sidebarOpen 
            ? 'translate-x-0 pointer-events-auto' 
            : '-translate-x-full pointer-events-none md:translate-x-0 md:pointer-events-auto'
        }`}
        aria-label="Admin Navigation Sidebar"
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-[#0b482d] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-400 text-[#062e1e] flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
              V
            </div>
            <div>
              <span className="font-bold text-base tracking-wide text-white block leading-tight">Atta Admin</span>
            </div>
          </div>
          <button 
            type="button"
            className="md:hidden text-gray-300 hover:text-white p-2 rounded-xl hover:bg-white/10 active:bg-white/20 active:scale-95 transition-all duration-150 touch-manipulation cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center" 
            onClick={(e) => {
              e.stopPropagation();
              setSidebarOpen(false);
            }}
            aria-label="Close Sidebar"
          >
            <X size={22} className="shrink-0" />
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
        
        {/* Footer Actions: Exit Admin / Logout */}
        <div className="p-4 border-t border-[#0b482d]">
          <Link 
            href="/"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-2.5 px-3.5 py-2.5 w-full rounded-xl hover:bg-red-950/40 text-red-300 hover:text-red-200 text-xs font-medium transition cursor-pointer touch-manipulation group"
            title="Exit Admin Panel"
          >
            <DoorOpen size={16} className="text-red-400 group-hover:scale-110 transition-transform" />
            <span>Logout</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden w-full max-w-full min-w-0">
        {/* Top Header / App Bar */}
        <header className="h-14 sm:h-16 bg-white border-b border-gray-200/80 flex items-center justify-between px-3.5 sm:px-6 shrink-0 shadow-2xs z-10">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            {/* Mobile Hamburger Menu Button */}
            <button 
              type="button"
              className="md:hidden text-gray-700 hover:text-gray-900 active:text-gray-950 p-2 -ml-1 rounded-xl hover:bg-gray-100 active:bg-gray-200 active:scale-95 transition-all duration-150 touch-manipulation cursor-pointer flex items-center justify-center min-w-[42px] min-h-[42px]" 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setSidebarOpen(prev => !prev);
              }}
              aria-label="Open menu"
              aria-expanded={sidebarOpen}
            >
              <Menu size={24} className="shrink-0" />
            </button>
            
            <div className="min-w-0">
              <h1 className="text-base sm:text-xl font-bold text-gray-900 tracking-tight truncate leading-tight">
                {getTitle()}
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Real-time Incoming New Order Pill - Identical to Laptop */}
            {newOrdersCount > 0 && (
              <Link
                href="/admin/orders"
                className="inline-flex items-center gap-1.5 bg-[#fef3c7] hover:bg-amber-200 text-amber-950 border border-amber-300 px-3 py-1 rounded-full text-xs font-bold shadow-2xs touch-manipulation"
                title={`${newOrdersCount} orders waiting for confirmation`}
              >
                <Bell size={13} className="text-amber-800" />
                <span>{newOrdersCount} New Orders</span>
              </Link>
            )}

            {/* Admin Avatar Circle */}
            <div 
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#d1fae5] text-[#065f46] font-black flex items-center justify-center text-xs sm:text-sm shadow-2xs border border-emerald-300 shrink-0 select-none"
              title="Vishwakarma Admin"
            >
              A
            </div>
          </div>
        </header>

        {/* Scrollable Main Viewport with pb-6 (Clean view, exactly like laptop) */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-5 md:p-6 pb-6 w-full max-w-full min-w-0 bg-[#f8fafc]">
          {children}
        </div>
      </main>
    </div>
  );
}
