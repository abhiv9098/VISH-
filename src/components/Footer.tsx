import Link from 'next/link';
import { Wheat, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-green-950 text-gray-300 pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4 text-white">
              <Wheat size={32} className="text-yellow-400" />
              <div>
                <h1 className="text-xl font-bold tracking-wide leading-tight">VISHWAKARMA</h1>
                <p className="text-xs text-yellow-400 tracking-wider font-semibold uppercase">Chakki</p>
              </div>
            </Link>
            <p className="text-sm text-gray-400 mb-6">
              100% pure, freshly milled atta for your family. We bring the traditional chakki freshness straight to your doorstep.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 font-bold hover:text-white transition">FB</a>
              <a href="#" className="text-gray-400 font-bold hover:text-white transition">IG</a>
              <a href="#" className="text-gray-400 font-bold hover:text-white transition">X</a>
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4 text-lg">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-yellow-400 transition">Home</Link></li>
              <li><Link href="/products" className="hover:text-yellow-400 transition">Shop All Atta</Link></li>
              <li><Link href="/about" className="hover:text-yellow-400 transition">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-yellow-400 transition">Contact Us</Link></li>
              <li><Link href="/admin" className="hover:text-yellow-400 transition">Admin Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4 text-lg">Categories</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/products?category=1KG" className="hover:text-yellow-400 transition">1 KG Trial Packs</Link></li>
              <li><Link href="/products?category=5KG" className="hover:text-yellow-400 transition">5 KG Family Packs</Link></li>
              <li><Link href="/products?category=10KG" className="hover:text-yellow-400 transition">10 KG Monthly Packs</Link></li>
              <li><Link href="/products?category=25KG" className="hover:text-yellow-400 transition">25 KG Bulk Sacks</Link></li>
              <li><Link href="/products?category=multigrain" className="hover:text-yellow-400 transition">Multigrain & Speciality</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4 text-lg">Contact Us</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-yellow-400 shrink-0 mt-0.5" />
                <span>123, Mill Road, Industrial Area, Mumbai, Maharashtra 400053</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-yellow-400 shrink-0" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-yellow-400 shrink-0" />
                <span>support@vishwakarmachakki.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-green-900 pt-6 mt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <p>&copy; 2026 Vishwakarma Chakki. All rights reserved.</p>
          <div className="flex space-x-4">
            <Link href="/privacy" className="hover:text-gray-300">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-gray-300">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
