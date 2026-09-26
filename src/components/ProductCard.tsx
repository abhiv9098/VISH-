'use client';

import { Product } from '@/lib/data';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { Star, ShoppingBag, CheckCircle, ArrowRight } from 'lucide-react';
import { useState } from 'react';

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const { language } = useLanguage();
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    addToCart(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const name = language === 'hi' && product.nameHi ? product.nameHi : product.name;

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md border border-gray-100 overflow-hidden flex flex-col transition-shadow duration-300 h-full">
      <Link href={`/products/${product.id}`} className="relative h-32 sm:h-48 w-full group overflow-hidden bg-gray-50">
        <Image 
          src={product.image} 
          alt={name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {product.discount > 0 && (
          <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] sm:text-xs font-bold px-1.5 py-0.5 sm:px-2 sm:py-1 rounded">
            {product.discount}% OFF
          </div>
        )}
      </Link>
      
      <div className="p-3 sm:p-4 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-1.5 sm:mb-2">
          <span className="text-[10px] sm:text-xs font-medium text-green-700 bg-green-50 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full">
            {product.weight}
          </span>
          <div className="flex items-center text-xs sm:text-sm text-yellow-500 shrink-0">
            <Star size={12} className="fill-current sm:w-3.5 sm:h-3.5" />
            <span className="ml-0.5 sm:ml-1 text-gray-600 font-medium">{product.rating}</span>
            <span className="text-gray-400 text-[10px] sm:text-xs ml-0.5 sm:ml-1">({product.reviews})</span>
          </div>
        </div>

        <Link href={`/products/${product.id}`} className="mt-0.5 block">
          <h3 className="text-sm sm:text-base font-semibold text-gray-800 line-clamp-2 hover:text-green-700 transition leading-snug">
            {name}
          </h3>
        </Link>
        
        <div className="mt-auto pt-2 sm:pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2">
          <div className="flex items-end gap-1.5 sm:gap-2">
            <span className="text-base sm:text-lg font-bold text-gray-900 leading-none">₹{product.price}</span>
            {product.originalPrice > product.price && (
              <span className="text-[10px] sm:text-sm text-gray-500 line-through leading-none mb-[1px]">₹{product.originalPrice}</span>
            )}
          </div>
          
          <Link 
            href={`/products/${product.id}`}
            className="w-full sm:w-auto px-3 py-1.5 sm:px-4 sm:py-2 rounded-md sm:rounded-full flex items-center justify-center transition-all bg-yellow-500 hover:bg-yellow-600 text-green-950 font-bold shadow-sm hover:shadow-md text-[11px] sm:text-sm gap-1 mt-1 sm:mt-0"
          >
            Order Now <ArrowRight size={14} className="sm:w-4 sm:h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
