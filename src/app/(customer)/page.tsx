'use client';

import Image from "next/image";
import Link from "next/link";
import { products } from "@/lib/data";
import ProductCard from "@/components/ProductCard";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function Home() {
  const { t } = useLanguage();
  const bestSellers = products.slice(0, 4);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Banner */}
      <section className="relative w-full h-[300px] md:h-[450px] bg-green-950 flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-40">
          <Image 
            src="/images/wheat_flour.jpg" 
            alt="Wheat field" 
            fill 
            className="object-cover"
          />
        </div>
        <div className="container mx-auto px-4 relative z-10 text-white flex flex-col items-center text-center">

          <Link href="/order" className="bg-yellow-500 hover:bg-yellow-600 text-green-950 text-xl font-bold px-10 py-4 rounded-full shadow-lg hover:shadow-xl transition inline-flex items-center gap-2 transform hover:scale-105">
            Order Atta <ArrowRight size={24} />
          </Link>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="py-12 bg-white flex-1">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">{t('bestSellers')}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {bestSellers.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
