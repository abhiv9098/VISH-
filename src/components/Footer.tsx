'use client';

import Link from 'next/link';
import { Wheat, Mail, Phone, MapPin } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-green-950 text-gray-300 pt-8 md:pt-12 pb-4 md:pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-6 md:mb-8">
          
          <div>
            <Link href="/" className="flex items-center gap-2 mb-3 md:mb-4 text-white">
              <Wheat size={28} className="text-yellow-400 md:w-8 md:h-8" />
              <div>
                <h1 className="text-lg md:text-xl font-bold tracking-wide leading-tight">VISHWAKARMA</h1>
                <p className="text-[10px] md:text-xs text-yellow-400 tracking-wider font-semibold uppercase">Chakki</p>
              </div>
            </Link>
            <p className="text-xs md:text-sm text-gray-400 mb-4 md:mb-6">
              {t('footerDesc')}
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 font-bold hover:text-white transition text-sm md:text-base">FB</a>
              <a href="#" className="text-gray-400 font-bold hover:text-white transition text-sm md:text-base">IG</a>
              <a href="#" className="text-gray-400 font-bold hover:text-white transition text-sm md:text-base">X</a>
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-2 md:mb-4 text-base md:text-lg">{t('categories')}</h3>
            <ul className="space-y-1.5 md:space-y-2 text-xs md:text-sm">
              <li><Link href="/products?category=5KG" className="hover:text-yellow-400 transition">{t('pack5kg')}</Link></li>
              <li><Link href="/products?category=10KG" className="hover:text-yellow-400 transition">{t('pack10kg')}</Link></li>
              <li><Link href="/products?category=25KG" className="hover:text-yellow-400 transition">{t('pack25kg')}</Link></li>
              <li><Link href="/products?category=multigrain" className="hover:text-yellow-400 transition">{t('packMultigrain')}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-2 md:mb-4 text-base md:text-lg">{t('contactUs')}</h3>
            <ul className="space-y-2.5 md:space-y-4 text-xs md:text-sm">
              <li className="flex items-start gap-2 md:gap-3">
                <MapPin size={16} className="text-yellow-400 shrink-0 mt-0.5 md:w-[18px] md:h-[18px]" />
                <span>123, Mill Road, Industrial Area, Mumbai, Maharashtra 400053</span>
              </li>
              <li className="flex items-center gap-2 md:gap-3">
                <Phone size={16} className="text-yellow-400 shrink-0 md:w-[18px] md:h-[18px]" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-2 md:gap-3">
                <Mail size={16} className="text-yellow-400 shrink-0 md:w-[18px] md:h-[18px]" />
                <span>support@vishwakarmachakki.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-green-900 pt-4 md:pt-6 mt-4 md:mt-6 flex flex-col md:flex-row justify-between items-center gap-3 md:gap-4 text-xs md:text-sm text-gray-500">
          <p>{t('copyright')}</p>
          <div className="flex space-x-3 md:space-x-4">
            <Link href="/privacy" className="hover:text-gray-300">{t('privacyPolicy')}</Link>
            <Link href="/terms" className="hover:text-gray-300">{t('termsOfService')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
