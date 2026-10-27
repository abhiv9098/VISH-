'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Wheat, Home, ShoppingBag, User, ShieldCheck } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useOrders } from '@/context/OrderContext';

export default function Header() {
  const { language, t } = useLanguage();
  const { orders } = useOrders();
  const pathname = usePathname();

  // Active in-progress orders (not yet delivered and not cancelled)
  const activeOrdersCount = orders.filter(
    o => o && o.status !== 'Delivered' && o.status !== 'Cancelled'
  ).length;

  const isHome = pathname === '/';
  const isOrders = pathname.startsWith('/order');
  const isProfile = pathname.startsWith('/profile');

  return (
    <header className="bg-teal-950 text-white sticky top-0 z-50 shadow-md border-b border-teal-800/60">
      <div className="container mx-auto px-3.5 sm:px-6 py-2 sm:py-2.5 max-w-7xl">
        <div className="flex items-center justify-between gap-3">
          
          {/* Left: Brand */}
          <div className="flex items-center shrink-0">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="bg-teal-800/60 p-1.5 rounded-lg border border-teal-600/50 group-hover:bg-teal-700/60 transition shrink-0">
                <Wheat size={22} className="text-teal-300" />
              </div>
              <div className="flex flex-col justify-center">
                <h1 className="text-base sm:text-lg font-black tracking-wide leading-tight text-white">
                  {language === 'hi' ? 'विश्वकर्मा' : 'VISHWAKARMA'}
                </h1>
                <p className="text-[10px] text-teal-300 tracking-wider font-extrabold uppercase leading-none">
                  {language === 'hi' ? 'आटा चक्की' : 'Atta Chakki'}
                </p>
              </div>
            </Link>
          </div>

          {/* Center: Desktop Navigation Bar (Visible on Laptop & Tablet: md:flex) */}
          <nav aria-label="Desktop Navigation" className="hidden md:flex items-center gap-1.5 lg:gap-2">
            <Link 
              href="/" 
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                isHome 
                  ? 'bg-teal-400 text-teal-950 shadow-xs' 
                  : 'text-teal-100/90 hover:text-white hover:bg-teal-900/70'
              }`}
            >
              <Home size={15} />
              <span>{t('home') || 'Home'}</span>
            </Link>

            <Link 
              href="/order" 
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 relative cursor-pointer ${
                isOrders 
                  ? 'bg-teal-400 text-teal-950 shadow-xs' 
                  : 'text-teal-100/90 hover:text-white hover:bg-teal-900/70'
              }`}
            >
              <ShoppingBag size={15} />
              <span>{t('myOrders') || 'My Orders'}</span>
              {activeOrdersCount > 0 && (
                <span className="bg-teal-400 text-teal-950 font-black text-[10px] min-w-4 h-4 px-1 rounded-full flex items-center justify-center shadow-xs">
                  {activeOrdersCount}
                </span>
              )}
            </Link>

            <Link 
              href="/profile" 
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                isProfile 
                  ? 'bg-teal-400 text-teal-950 shadow-xs' 
                  : 'text-teal-100/90 hover:text-white hover:bg-teal-900/70'
              }`}
            >
              <User size={15} />
              <span>{t('profile') || 'Profile'}</span>
            </Link>

            {/* Quick Link to Admin Panel on Laptop */}
            <Link 
              href="/admin" 
              className="ml-2 px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 bg-teal-900/90 hover:bg-teal-400 hover:text-teal-950 text-teal-100 border border-teal-600/50 shadow-xs cursor-pointer group"
              title="Open Admin Panel"
            >
              <ShieldCheck size={14} className="text-teal-300 group-hover:text-teal-950 transition-colors" />
              <span>{language === 'hi' ? 'एडमिन पैनल' : 'Admin Panel'}</span>
            </Link>
          </nav>

          {/* Right: Mobile Admin Button */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            
            {/* Mobile Admin Icon Button */}
            <Link
              href="/admin"
              className="md:hidden flex items-center gap-1 bg-teal-900/90 text-teal-100 border border-teal-700/70 p-1.5 rounded-lg text-xs font-bold hover:text-white hover:bg-teal-800 transition cursor-pointer"
              title="Admin Panel"
            >
              <ShieldCheck size={15} className="text-teal-300" />
            </Link>
          </div>

        </div>
      </div>
    </header>
  );
}
