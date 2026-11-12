'use client';

import { useState, useEffect } from 'react';
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Active in-progress orders (not yet delivered and not cancelled)
  const activeOrdersCount = mounted
    ? orders.filter(o => o && o.status !== 'Delivered' && o.status !== 'Cancelled').length
    : 0;

  const isHome = pathname === '/';
  const isOrders = pathname.startsWith('/order');
  const isProfile = pathname.startsWith('/profile');

  return (
    <header className="relative bg-[#FFF8ED] text-[#174D38] sticky top-0 z-50 shadow-[0_4px_16px_-2px_rgba(214,166,60,0.12),0_2px_6px_rgba(0,0,0,0.03)] border-b border-[#E8E0D2] rounded-b-2xl sm:rounded-b-3xl overflow-hidden">
      
      {/* Subtle warm ambient accents */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-10 -left-10 w-44 h-44 bg-[#D6A63C]/10 rounded-full blur-2xl" />
        <div className="absolute -bottom-8 right-12 w-52 h-28 bg-[#174D38]/5 rounded-full blur-xl" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#D6A63C]/30 to-transparent" />
      </div>

      {/* Subtle Golden Wheat Illustrations on the Right Side */}
      <div className="absolute right-0 top-0 bottom-0 pointer-events-none flex items-center pr-2 sm:pr-8 overflow-hidden opacity-35 select-none text-[#D6A63C]">
        <svg 
          viewBox="0 0 120 70" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-11 sm:h-13 w-auto"
          aria-hidden="true"
        >
          {/* Stalk 1 */}
          <path d="M10 65 Q 45 40 95 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          {/* Grains on stalk 1 */}
          <ellipse cx="40" cy="40" rx="3.5" ry="7" transform="rotate(-30 40 40)" fill="currentColor" />
          <ellipse cx="46" cy="35" rx="3.5" ry="7" transform="rotate(35 46 35)" fill="currentColor" />
          <ellipse cx="56" cy="31" rx="3.5" ry="7" transform="rotate(-30 56 31)" fill="currentColor" />
          <ellipse cx="62" cy="26" rx="3.5" ry="7" transform="rotate(35 62 26)" fill="currentColor" />
          <ellipse cx="72" cy="22" rx="3.5" ry="7" transform="rotate(-30 72 22)" fill="currentColor" />
          <ellipse cx="78" cy="17" rx="3.5" ry="7" transform="rotate(35 78 17)" fill="currentColor" />
          <ellipse cx="88" cy="13" rx="3" ry="6" transform="rotate(10 88 13)" fill="currentColor" />
          {/* Awns / Whiskers */}
          <path d="M88 13 L 110 5 M 82 14 L 105 3 M 74 19 L 98 6" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
          
          {/* Stalk 2 */}
          <path d="M25 68 Q 60 50 105 30" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          {/* Grains on stalk 2 */}
          <ellipse cx="55" cy="50" rx="3" ry="6.5" transform="rotate(-20 55 50)" fill="currentColor" />
          <ellipse cx="61" cy="45" rx="3" ry="6.5" transform="rotate(40 61 45)" fill="currentColor" />
          <ellipse cx="71" cy="42" rx="3" ry="6.5" transform="rotate(-20 71 42)" fill="currentColor" />
          <ellipse cx="77" cy="37" rx="3" ry="6.5" transform="rotate(40 77 37)" fill="currentColor" />
          <ellipse cx="87" cy="34" rx="3" ry="6.5" transform="rotate(-20 87 34)" fill="currentColor" />
          <ellipse cx="93" cy="29" rx="3" ry="6.5" transform="rotate(40 93 29)" fill="currentColor" />
          <ellipse cx="101" cy="26" rx="2.5" ry="5.5" transform="rotate(15 101 26)" fill="currentColor" />
          {/* Awns */}
          <path d="M101 26 L 118 20 M 96 27 L 115 15 M 89 31 L 108 19" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
        </svg>
      </div>

      <div className="relative z-10 container mx-auto px-3.5 sm:px-6 py-2 sm:py-2.5 max-w-7xl">
        <div className="flex items-center justify-between gap-3">
          
          {/* Left: Brand with original dark green & golden emblem with golden border */}
          <div className="flex items-center shrink-0">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden border-2 border-[#D6A63C] shadow-[0_2px_8px_rgba(214,166,60,0.25)] shrink-0 bg-[#042f2e] group-hover:border-[#D6A63C] transition-all duration-200">
                <Image 
                  src="/images/logo.png" 
                  alt="Vishwakarma Atta Chakki Logo" 
                  fill 
                  sizes="40px" 
                  className="object-cover" 
                  priority 
                  loading="eager"
                />
              </div>
              <div className="flex flex-col justify-center">
                <h1 className="text-base sm:text-lg font-black tracking-wide leading-tight text-[#174D38] uppercase">
                  {language === 'hi' ? 'विश्वकर्मा' : 'VISHWAKARMA'}
                </h1>
                <p className="text-[10px] text-[#D6A63C] tracking-wider font-extrabold uppercase leading-none mt-0.5">
                  {language === 'hi' ? 'आटा चक्की' : 'ATTA CHAKKI'}
                </p>
              </div>
            </Link>
          </div>

          {/* Center/Right: Desktop Navigation Bar (Visible on Laptop & Tablet: md:flex) */}
          <nav aria-label="Desktop Navigation" className="hidden md:flex items-center gap-1.5 lg:gap-2">
            <Link 
              href="/" 
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                isHome 
                  ? 'bg-[#174D38] text-[#FFF8ED] font-black shadow-xs' 
                  : 'text-[#174D38]/80 hover:text-[#174D38] hover:bg-[#174D38]/10'
              }`}
            >
              <Home size={15} />
              <span>{t('home') || 'Home'}</span>
            </Link>

            <Link 
              href="/order" 
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 relative cursor-pointer ${
                isOrders 
                  ? 'bg-[#174D38] text-[#FFF8ED] font-black shadow-xs' 
                  : 'text-[#174D38]/80 hover:text-[#174D38] hover:bg-[#174D38]/10'
              }`}
            >
              <ShoppingBag size={15} />
              <span>{t('myOrders') || 'My Orders'}</span>
              {activeOrdersCount > 0 && (
                <span 
                  suppressHydrationWarning
                  className={`font-black text-[10px] min-w-4 h-4 px-1 rounded-full flex items-center justify-center shadow-xs ${
                    isOrders ? 'bg-[#D6A63C] text-[#174D38]' : 'bg-[#174D38] text-[#D6A63C]'
                  }`}
                >
                  {activeOrdersCount}
                </span>
              )}
            </Link>

            <Link 
              href="/profile" 
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                isProfile 
                  ? 'bg-[#174D38] text-[#FFF8ED] font-black shadow-xs' 
                  : 'text-[#174D38]/80 hover:text-[#174D38] hover:bg-[#174D38]/10'
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
