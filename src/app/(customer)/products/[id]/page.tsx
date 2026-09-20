'use client';

import { use, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { products } from '@/lib/data';
import { useCart } from '@/context/CartContext';
import { Star, Truck, ShieldCheck, Minus, Plus, ShoppingBag } from 'lucide-react';

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const product = products.find(p => p.id === resolvedParams.id);
  const { addToCart } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  if (!product) return notFound();

  const handleAddToCart = () => {
    addToCart(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-500 mb-6">
        <Link href="/">Home</Link> / <Link href="/products">Products</Link> / <span className="text-gray-900">{product.name}</span>
      </div>

      <div className="bg-white rounded-2xl p-6 md:p-10 shadow-sm border border-gray-100 mb-12">
        <div className="flex flex-col md:flex-row gap-10">
          
          {/* Product Image */}
          <div className="w-full md:w-1/2">
            <div className="relative h-[400px] md:h-[500px] w-full bg-gray-50 rounded-xl overflow-hidden">
              <Image 
                src={product.image} 
                alt={product.name}
                fill
                className="object-cover"
              />
              {product.discount > 0 && (
                <div className="absolute top-4 left-4 bg-red-600 text-white text-sm font-bold px-3 py-1 rounded">
                  {product.discount}% OFF
                </div>
              )}
            </div>
          </div>

          {/* Product Details */}
          <div className="w-full md:w-1/2 flex flex-col justify-center">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
            
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center text-yellow-500">
                <Star size={18} className="fill-current" />
                <Star size={18} className="fill-current" />
                <Star size={18} className="fill-current" />
                <Star size={18} className="fill-current" />
                <Star size={18} className="fill-current text-gray-300" />
                <span className="text-gray-700 font-medium ml-2">{product.rating}</span>
                <span className="text-gray-400 text-sm ml-1">({product.reviews} reviews)</span>
              </div>
            </div>

            <div className="mb-6 flex items-end gap-3">
              <span className="text-4xl font-bold text-gray-900">₹{product.price}</span>
              {product.originalPrice > product.price && (
                <span className="text-lg text-gray-500 line-through mb-1">₹{product.originalPrice}</span>
              )}
            </div>

            <div className="mb-6">
              <h3 className="font-semibold text-gray-800 mb-2">Weight:</h3>
              <div className="inline-block border-2 border-green-700 text-green-700 bg-green-50 font-bold px-4 py-2 rounded-lg">
                {product.weight}
              </div>
            </div>

            <p className="text-gray-600 mb-8 leading-relaxed">
              {product.description}
            </p>

            <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-100">
              {/* Quantity */}
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden h-12 w-32">
                <button 
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="w-10 h-full flex items-center justify-center bg-gray-50 hover:bg-gray-100 text-gray-600 transition"
                >
                  <Minus size={18} />
                </button>
                <div className="flex-1 h-full flex items-center justify-center font-bold text-gray-900 border-x border-gray-300">
                  {qty}
                </div>
                <button 
                  onClick={() => setQty(qty + 1)}
                  className="w-10 h-full flex items-center justify-center bg-gray-50 hover:bg-gray-100 text-gray-600 transition"
                >
                  <Plus size={18} />
                </button>
              </div>

              {/* Add to Cart */}
              <button 
                onClick={handleAddToCart}
                className={`flex-1 h-12 rounded-lg font-bold flex items-center justify-center gap-2 transition ${
                  added 
                    ? 'bg-green-600 text-white' 
                    : 'bg-yellow-500 hover:bg-yellow-600 text-green-950'
                }`}
              >
                <ShoppingBag size={20} />
                {added ? 'Added to Cart!' : 'Add to Cart'}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-3 text-gray-700">
                <div className="bg-green-100 p-2 rounded-full text-green-700">
                  <ShieldCheck size={20} />
                </div>
                <span className="font-medium">100% Quality Guaranteed</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <div className="bg-green-100 p-2 rounded-full text-green-700">
                  <Truck size={20} />
                </div>
                <span className="font-medium">Freshly Milled for You</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs / Extra Details */}
      <div className="bg-white rounded-2xl p-6 md:p-10 shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div>
            <h3 className="text-xl font-bold mb-4 text-gray-900">Health Benefits</h3>
            <ul className="space-y-3">
              {product.benefits.map((benefit, i) => (
                <li key={i} className="flex items-start gap-2">
                  <ShieldCheck size={20} className="text-green-600 shrink-0 mt-0.5" />
                  <span className="text-gray-700">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4 text-gray-900">Ingredients</h3>
            <ul className="space-y-3 flex flex-wrap gap-2">
              {product.ingredients.map((ing, i) => (
                <li key={i} className="bg-gray-100 text-gray-800 px-4 py-2 rounded-full text-sm font-medium">
                  {ing}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
