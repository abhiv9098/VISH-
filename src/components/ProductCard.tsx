'use client';

import { Product } from '@/lib/data';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { Star, ArrowRight, Minus, Plus } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart, clearCart } = useCart();
  const { language, t } = useLanguage();
  const [qty, setQty] = useState(1);
  const router = useRouter();

  const handleBuyNow = () => {
    if (!product.inStock) return;
    clearCart();
    addToCart(product, qty);
    router.push(`/order?productId=${product.id}&qty=${qty}`);
  };

  const name = language === 'hi' && product.nameHi ? product.nameHi : product.name;
  const weightDisplay = language === 'hi' ? product.weight.replace('KG', 'किलो') : product.weight;
  const buyBtnText = language === 'hi' ? 'अभी खरीदें' : 'Buy Now';

  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md border border-stone-200/80 hover:border-amber-300/60 overflow-hidden flex flex-col transition-all duration-200 h-full group">
      {/* Product Image */}
      <Link href={`/products/${product.id}`} className="relative aspect-[4/3] w-full overflow-hidden bg-stone-100 block">
        <Image 
          src={product.image} 
          alt={name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {product.discount > 0 && (
          <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] sm:text-[11px] font-black px-1.5 py-0.5 rounded-md shadow-xs tracking-tight">
            {product.discount}% {t('off')}
          </div>
        )}
        {!product.inStock && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center">
            <span className="bg-red-600 text-white font-black text-xs px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-md">
              {t('outOfStock')}
            </span>
          </div>
        )}
      </Link>
      
      {/* Content */}
      <div className="p-2.5 sm:p-3 flex flex-col flex-1 justify-between gap-1.5">
        <div>
          {/* Weight & Rating Row */}
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="text-[10px] sm:text-[11px] font-bold text-emerald-900 bg-emerald-50 border border-emerald-200/80 px-1.5 py-0.5 rounded whitespace-nowrap shrink-0">
              {weightDisplay}
            </span>
            <div className="flex items-center gap-0.5 text-[11px] font-bold text-slate-700 shrink-0">
              <Star size={11} className="fill-amber-400 text-amber-500 shrink-0" />
              <span>{product.rating}</span>
              <span className="text-slate-400 text-[10px] font-normal">({product.reviews})</span>
            </div>
          </div>

          {/* Title with uniform 2-line height */}
          <Link href={`/products/${product.id}`} className="block">
            <h3 className="text-xs sm:text-sm font-bold text-slate-800 line-clamp-2 leading-snug group-hover:text-emerald-900 transition-colors h-8 sm:h-9">
              {name}
            </h3>
          </Link>
        </div>
        
        {/* Price & Quantity & Action Controls */}
        <div className="pt-2 border-t border-stone-100 flex flex-col">
          {/* Price & Stepper Row */}
          <div className="flex items-center justify-between gap-1">
            <div className="flex flex-col leading-tight min-w-0">
              <span className="text-sm sm:text-base font-black text-slate-900 leading-none">
                ₹{product.price * qty}
              </span>
              {product.originalPrice > product.price && (
                <span className="text-[10px] sm:text-xs text-slate-400 line-through leading-tight mt-0.5">
                  ₹{product.originalPrice * qty}
                </span>
              )}
            </div>
            
            {/* Inline Stepper Quantity Controls */}
            {product.inStock && (
              <div className="flex items-center border border-stone-200 rounded-lg overflow-hidden bg-stone-50 h-6 sm:h-7 shrink-0 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="w-6 h-full flex items-center justify-center hover:bg-stone-200 active:bg-stone-300 text-stone-700 font-bold transition cursor-pointer"
                  aria-label="Decrease quantity"
                >
                  <Minus size={11} />
                </button>
                <span className="w-5 sm:w-6 text-center font-black text-[11px] sm:text-xs text-slate-900 border-x border-stone-200 leading-none">
                  {qty}
                </span>
                <button
                  type="button"
                  onClick={() => setQty(qty + 1)}
                  className="w-6 h-full flex items-center justify-center hover:bg-stone-200 active:bg-stone-300 text-stone-700 font-bold transition cursor-pointer"
                  aria-label="Increase quantity"
                >
                  <Plus size={11} />
                </button>
              </div>
            )}
          </div>
          
          {/* Buy Action Button */}
          {product.inStock ? (
            <button
              onClick={handleBuyNow}
              className="w-full mt-2 py-1.5 sm:py-2 px-2 rounded-xl flex items-center justify-center gap-1 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-emerald-950 font-black text-xs shadow-xs hover:shadow transition-all cursor-pointer"
            >
              <span>{buyBtnText}</span>
              <ArrowRight size={13} className="shrink-0" />
            </button>
          ) : (
            <button
              disabled
              className="w-full mt-2 py-1.5 sm:py-2 px-2 rounded-xl flex items-center justify-center bg-stone-100 text-stone-400 font-bold text-xs cursor-not-allowed border border-stone-200"
            >
              {t('outOfStock')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
