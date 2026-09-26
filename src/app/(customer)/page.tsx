'use client';

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { products } from "@/lib/data";
import ProductCard from "@/components/ProductCard";
import { Search } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function Home() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  
  const displayedProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.nameHi.includes(searchQuery) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen">
      
      <div className="bg-green-900 pb-6 pt-2">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="relative shadow-lg rounded-full">
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchPlaceholder')} 
              className="w-full bg-white rounded-full py-3.5 pl-12 pr-4 outline-none focus:ring-2 focus:ring-yellow-500 text-gray-900 font-medium"
            />
            <Search className="absolute left-4 top-4 text-gray-400" size={20} />
          </div>
        </div>
      </div>

      <section className="py-8 bg-white flex-1">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">
            {searchQuery ? "Search Results" : t('allProducts')}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {displayedProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
            {displayedProducts.length === 0 && (
              <p className="col-span-full text-center text-gray-500 py-8">
                No products found matching "{searchQuery}"
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
