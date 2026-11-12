'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Home, ShoppingBag, User } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useOrders } from '@/context/OrderContext';
import { Suspense } from 'react';

function BottomNavContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const { orders } = useOrders();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // If in pure direct checkout flow with active single product, keep checkout distraction-free
  if (pathname === '/checkout' || (pathname === '/order' && searchParams?.has('productId'))) {
    return null;
  }

  // Active in-progress orders (not yet delivered and not cancelled)
  const activeOrdersCount = mounted
    ? orders.filter(o => o && o.status !== 'Delivered' && o.status !== 'Cancelled').length
    : 0;

  // Strictly 3 navigation tabs: Home, My Orders, Profile
  const navItems = [
    { 
      label: t('home') || 'Home', 
      href: '/', 
      icon: Home 
    },
    { 
      label: t('myOrders') || 'My Orders', 
      href: '/order', 
      icon: ShoppingBag, 
      badge: activeOrdersCount 
    },
    { 
      label: t('profile') || 'Profile', 
      href: '/profile', 
      icon: User 
    },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 pointer-events-none pb-[calc(0.85rem+env(safe-area-inset-bottom,0px))] px-4 flex justify-center">
      <nav 
        aria-label="Mobile Navigation"
        className="pointer-events-auto w-full max-w-[340px] bg-white/95 backdrop-blur-md border border-[#E8E0D2] rounded-full shadow-[0_10px_25px_rgba(23,77,56,0.1)] p-1.5 transition-all duration-300"
      >
        <div className="grid grid-cols-3 items-center gap-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.href === '/' 
              ? pathname === '/' 
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center py-2 px-2 sm:px-3 rounded-full transition-all duration-200 active:scale-95 touch-manipulation select-none relative group ${
                  isActive
                    ? 'bg-[#FFF8ED] text-[#174D38] border border-[#E8E0D2] font-bold shadow-2xs'
                    : 'text-[#777777] hover:text-[#174D38] hover:bg-[#FFF8ED]/60 font-medium'
                }`}
              >
                {/* Icon Container with Badge */}
                <div className="relative flex items-center justify-center">
                  <Icon 
                    size={20} 
                    className={`transition-all duration-200 ${
                      isActive ? 'stroke-[2.4] text-[#174D38] scale-105' : 'stroke-[1.8] text-[#777777] group-hover:text-[#174D38]'
                    }`} 
                  />

                  {/* Active Orders Badge */}
                  {item.badge && item.badge > 0 ? (
                    <span 
                      suppressHydrationWarning
                      className="absolute -top-1 -right-2 bg-[#174D38] text-[#D6A63C] font-black text-[9px] min-w-4 h-4 px-1 rounded-full flex items-center justify-center shadow-xs border-2 border-white leading-none"
                    >
                      {item.badge}
                    </span>
                  ) : null}
                </div>

                {/* Text Label */}
                <span 
                  className={`text-[11px] tracking-tight leading-none mt-1 whitespace-nowrap transition-colors duration-200 ${
                    isActive
                      ? 'font-extrabold text-[#174D38]'
                      : 'font-semibold text-[#777777] group-hover:text-[#174D38]'
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export default function BottomNav() {
  return (
    <Suspense fallback={null}>
      <BottomNavContent />
    </Suspense>
  );
}
