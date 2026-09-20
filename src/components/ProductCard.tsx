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
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md border border-gray-100 overflow-hidden flex flex-col transition-shadow duration-300">
      <Link href={`/products/${product.id}`} className="relative h-48 sm:h-56 w-full group overflow-hidden bg-gray-50">
        <Image 
          src={product.image} 
          alt={name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {product.discount > 0 && (
          <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
            {product.discount}% OFF
          </div>
        )}
      </Link>
      
      <div className="p-4 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-1">
          <span className="text-xs font-medium text-green-700 bg-green-50 px-2 py-1 rounded-full">
            {product.weight}
          </span>
          <div className="flex items-center text-sm text-yellow-500">
            <Star size={14} className="fill-current" />
            <span className="ml-1 text-gray-600">{product.rating}</span>
            <span className="text-gray-400 text-xs ml-1">({product.reviews})</span>
          </div>
        </div>

        <Link href={`/products/${product.id}`} className="mt-2 block">
          <h3 className="font-semibold text-gray-800 line-clamp-2 hover:text-green-700 transition">
            {name}
          </h3>
        </Link>
        
        <div className="mt-auto pt-4 flex items-center justify-between">
          <div>
            <div className="flex items-end gap-2">
              <span className="text-lg font-bold text-gray-900">₹{product.price}</span>
              {product.originalPrice > product.price && (
                <span className="text-sm text-gray-500 line-through mb-0.5">₹{product.originalPrice}</span>
              )}
            </div>
          </div>
          
          <Link 
            href={`/order?productId=${product.id}`}
            className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-full flex items-center justify-center transition-all bg-yellow-500 hover:bg-yellow-600 text-green-950 font-semibold shadow-sm hover:shadow-md text-xs sm:text-sm gap-1 whitespace-nowrap"
          >
            Order Now <ArrowRight size={14} className="sm:w-4 sm:h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
