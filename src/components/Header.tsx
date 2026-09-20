'use client';

import Link from 'next/link';
import { Wheat, MoreVertical, Home, Package, User } from 'lucide-react';
import { useState } from 'react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-green-900 text-white sticky top-0 z-50 shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          
          <Link href="/" className="flex items-center gap-2">
            <Wheat size={32} className="text-yellow-400" />
            <div>
              <h1 className="text-xl font-bold tracking-wide leading-tight">VISHWAKARMA</h1>
              <p className="text-xs text-yellow-400 tracking-wider font-semibold uppercase">Chakki</p>
            </div>
          </Link>

          <div className="relative">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)} 
              className="p-2 hover:bg-green-800 rounded transition flex items-center justify-center"
            >
              <MoreVertical size={24} />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 z-50 border border-gray-100 text-gray-800">
                <Link href="/" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-green-50 hover:text-green-700 transition font-medium">
                  <Home size={18} /> Home
                </Link>
                <Link href="/profile" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-green-50 hover:text-green-700 transition font-medium">
                  <Package size={18} /> My Orders
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
