'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Home, ShoppingBag, User } from 'lucide-react';
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
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden border border-teal-500/50 shadow-xs shrink-0 bg-[#042f2e] group-hover:border-teal-400 transition">
                <Image 
                  src="/images/logo.png" 
                  alt="Vishwakarma Atta Chakki Logo" 
                  fill 
                  sizes="40px"
                  className="object-cover" 
                  priority 
                />
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
          </nav>

        </div>
      </div>
    </header>
  );
}
