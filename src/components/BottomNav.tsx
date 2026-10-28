'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ShoppingBag, User } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useOrders } from '@/context/OrderContext';

export default function BottomNav() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const { orders } = useOrders();

  // Active in-progress orders (not yet delivered and not cancelled)
  const activeOrdersCount = orders.filter(
    o => o && o.status !== 'Delivered' && o.status !== 'Cancelled'
  ).length;

  const navItems = [
    { label: t('home') || 'Home', href: '/', icon: Home },
    { label: t('myOrders') || 'My Orders', href: '/order', icon: ShoppingBag, badge: activeOrdersCount },
    { label: t('profile') || 'Profile', href: '/profile', icon: User },
  ];

  return (
    <nav 
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-stone-200/90 z-40 px-2 py-1 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] pb-[calc(0.25rem+env(safe-area-inset-bottom,0px))]"
    >
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-1 px-3 sm:px-4 rounded-xl transition-all relative touch-manipulation active:scale-95 ${
                isActive
                  ? 'text-teal-950 font-black bg-teal-50/90 shadow-2xs'
                  : 'text-stone-500 hover:text-teal-900 font-semibold'
              }`}
            >
              <div className="relative">
                <Icon size={19} className={isActive ? 'stroke-[2.5] text-teal-950' : 'stroke-[1.8]'} />
                {item.badge && item.badge > 0 ? (
                  <span className="absolute -top-1 -right-2.5 bg-teal-600 text-white font-black text-[9px] min-w-3.5 h-3.5 px-1 rounded-full flex items-center justify-center shadow-xs">
                    {item.badge}
                  </span>
                ) : null}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight leading-none">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
