'use client';

import { useState, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, useRouter } from 'next/navigation';
import { products } from '@/lib/data';
import { useCart } from '@/context/CartContext';
import { Star, Truck, ShieldCheck, Minus, Plus, ShoppingBag, ArrowLeft } from 'lucide-react';
import ProductCard from '@/components/ProductCard';

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const product = products.find(p => p.id === resolvedParams.id);
  const { addToCart, clearCart } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const router = useRouter();

  if (!product) return notFound();

  const handleAddToCart = () => {
    addToCart(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    clearCart();
    addToCart(product, qty);
    router.push('/checkout');
  };

  return (
    <div className="container mx-auto px-4 py-4 md:py-8">
      {/* Back Button */}
      <button 
        onClick={() => router.back()} 
        className="flex items-center gap-2 mb-4 text-gray-600 hover:text-green-700 font-medium transition"
      >
        <ArrowLeft size={18} /> Back
      </button>

      {/* Breadcrumb */}
      <div className="text-xs md:text-sm text-gray-500 mb-4 md:mb-6">
        <Link href="/">Home</Link> / <Link href="/products">Products</Link> / <span className="text-gray-900">{product.name}</span>
      </div>

      <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-10 shadow-sm border border-gray-100 mb-6 md:mb-12">
        <div className="flex flex-col md:flex-row gap-5 md:gap-10">
          
          {/* Product Image */}
          <div className="w-full md:w-1/2">
            <div className="relative h-[250px] sm:h-[350px] md:h-[500px] w-full bg-gray-50 rounded-xl overflow-hidden">
              <Image 
                src={product.image} 
                alt={product.name}
                fill
                className="object-cover"
              />
              {product.discount > 0 && (
                <div className="absolute top-3 left-3 md:top-4 md:left-4 bg-red-600 text-white text-xs md:text-sm font-bold px-2 py-1 md:px-3 rounded">
                  {product.discount}% OFF
                </div>
              )}
            </div>
          </div>

          {/* Product Details */}
          <div className="w-full md:w-1/2 flex flex-col justify-center">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 md:mb-2">{product.name}</h1>
            
            <div className="flex items-center gap-2 md:gap-4 mb-3 md:mb-4">
              <div className="flex items-center text-yellow-500">
                <Star size={16} className="fill-current md:w-[18px] md:h-[18px]" />
                <Star size={16} className="fill-current md:w-[18px] md:h-[18px]" />
                <Star size={16} className="fill-current md:w-[18px] md:h-[18px]" />
                <Star size={16} className="fill-current md:w-[18px] md:h-[18px]" />
                <Star size={16} className="fill-current text-gray-300 md:w-[18px] md:h-[18px]" />
                <span className="text-gray-700 font-medium ml-2 text-sm md:text-base">{product.rating}</span>
                <span className="text-gray-400 text-xs md:text-sm ml-1">({product.reviews} reviews)</span>
              </div>
            </div>

            <div className="mb-4 md:mb-6 flex items-end gap-3 md:gap-4 flex-wrap">
              <span className="text-3xl md:text-4xl font-bold text-gray-900">₹{product.price}</span>
              {product.originalPrice > product.price && (
                <span className="text-base md:text-lg text-gray-500 line-through mb-1">₹{product.originalPrice}</span>
              )}
              <div className="inline-flex border-2 border-green-700 text-green-700 bg-green-50 font-bold px-3 py-1 text-xs md:text-sm rounded-lg mb-1">
                {product.weight}
              </div>
            </div>

            <p className="text-sm md:text-base text-gray-600 mb-6 md:mb-8 leading-relaxed">
              {product.description}
            </p>

            <div className="flex flex-row items-center gap-2 md:gap-3 mb-6 md:mb-8 pb-6 md:pb-8 border-b border-gray-100">
              {/* Quantity */}
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden h-10 sm:h-12 w-28 shrink-0 bg-white">
                <button 
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="w-8 sm:w-10 h-full flex items-center justify-center hover:bg-gray-50 text-gray-700 transition font-bold"
                >
                  <Minus size={16} />
                </button>
                <div className="flex-1 h-full flex items-center justify-center font-bold text-gray-900 border-x border-gray-200 text-sm sm:text-base">
                  {qty}
                </div>
                <button 
                  onClick={() => setQty(qty + 1)}
                  className="w-8 sm:w-10 h-full flex items-center justify-center hover:bg-gray-50 text-gray-700 transition font-bold"
                >
                  <Plus size={16} />
                </button>
              </div>

              {/* Buy Now */}
              <button 
                onClick={handleBuyNow}
                className="flex-1 h-10 sm:h-12 rounded-lg font-bold flex items-center justify-center transition text-sm sm:text-base bg-yellow-500 hover:bg-yellow-600 text-green-950 shadow-sm px-4"
              >
                Buy Now
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 md:gap-4 text-xs md:text-sm">
              <div className="flex items-center gap-2 md:gap-3 text-gray-700">
                <div className="bg-green-100 p-1.5 md:p-2 rounded-full text-green-700">
                  <ShieldCheck size={16} className="md:w-[20px] md:h-[20px]" />
                </div>
                <span className="font-medium leading-tight">100% Quality Guaranteed</span>
              </div>
              <div className="flex items-center gap-2 md:gap-3 text-gray-700">
                <div className="bg-green-100 p-1.5 md:p-2 rounded-full text-green-700">
                  <Truck size={16} className="md:w-[20px] md:h-[20px]" />
                </div>
                <span className="font-medium leading-tight">Freshly Milled for You</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs / Extra Details */}
      <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-10 shadow-sm border border-gray-100 mb-6 md:mb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
          <div>
            <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4 text-gray-900">Health Benefits</h3>
            <ul className="space-y-2 md:space-y-3 text-sm md:text-base">
              {product.benefits.map((benefit, i) => (
                <li key={i} className="flex items-start gap-2">
                  <ShieldCheck size={18} className="text-green-600 shrink-0 mt-0.5 md:w-[20px] md:h-[20px]" />
                  <span className="text-gray-700">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4 text-gray-900">Ingredients</h3>
            <ul className="space-y-2 flex flex-wrap gap-2">
              {product.ingredients.map((ing, i) => (
                <li key={i} className="bg-gray-100 text-gray-800 px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-medium">
                  {ing}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Related Products */}
      <div className="mt-8">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">Other Options</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {products.filter(p => p.id !== product.id).slice(0, 4).map(relatedProduct => (
            <ProductCard key={relatedProduct.id} product={relatedProduct} />
          ))}
        </div>
      </div>
    </div>
  );
}
