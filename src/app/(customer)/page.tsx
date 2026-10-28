'use client';

import { useState } from "react";
import { products } from "@/lib/data";
import ProductCard from "@/components/ProductCard";
import { Package } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function Home() {
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  const categoryPills = ["ALL", "Gehu Atta", "Multigrain Atta", "Makka Atta", "Besan", "Bajra Atta", "Jowar Atta"];

  // Filter products based on selected category
  const filteredProducts = products.filter(p => {
    return selectedCategory === "ALL" || p.category.toLowerCase() === selectedCategory.toLowerCase();
  });

  return (
    <div className="flex flex-col min-h-screen bg-[#fcfaf5]">
      
      {/* Main Products Listing */}
      <section id="products-section" className="py-3.5 sm:py-5 container mx-auto px-3 sm:px-4 max-w-6xl flex-1">
        
        {/* Category Horizontal Filter Pills Bar */}
        <div className="mb-3 sm:mb-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {categoryPills.map((cat) => {
              const isSelected = selectedCategory === cat;
              const translatedLabel = t('cat_' + cat);
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-lg sm:rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer border touch-manipulation active:scale-95 ${
                    isSelected
                      ? 'bg-teal-600 text-white border-teal-600 shadow-xs ring-2 ring-teal-500/20'
                      : 'bg-white text-stone-700 border-stone-200/90 hover:bg-teal-50/60 hover:text-teal-900 hover:border-teal-300 shadow-2xs'
                  }`}
                >
                  {translatedLabel}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section Heading & Result Count */}
        <div className="flex justify-between items-center mb-3">
          <div>
            <h2 className="text-base sm:text-xl font-black text-slate-900 tracking-tight leading-tight">
              {selectedCategory !== "ALL" 
                ? t('productsCategory', { category: t('cat_' + selectedCategory) }) 
                : t('allProducts')}
            </h2>
            <p className="text-[11px] sm:text-xs text-stone-500 mt-0.5">
              {t('showingItems', { count: filteredProducts.length })}
            </p>
          </div>
          {selectedCategory !== "ALL" && (
            <button 
              onClick={() => setSelectedCategory("ALL")}
              className="text-[11px] sm:text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200/80 px-2.5 py-1 rounded-full transition cursor-pointer"
            >
              {t('clearFilter')}
            </button>
          )}
        </div>

        {/* Product 2-Column Mobile & Responsive Desktop Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-5 pb-6">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}

          {filteredProducts.length === 0 && (
            <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-stone-200/80 p-8 space-y-3">
              <Package size={36} className="mx-auto text-stone-300" />
              <p className="text-slate-800 font-bold text-base">{t('noProductsFound')}</p>
              <button
                onClick={() => setSelectedCategory("ALL")}
                className="px-4 py-2 bg-teal-600 text-white font-bold text-xs rounded-xl hover:bg-teal-700 transition cursor-pointer shadow-xs"
              >
                {t('allProducts')}
              </button>
            </div>
          )}
        </div>

      </section>

    </div>
  );
}
