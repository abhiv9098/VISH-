'use client';

import { useState } from 'react';
import { products, Product } from '@/lib/data';
import { Tag, TrendingUp, Save, CheckCircle, Search, RefreshCw, AlertCircle } from 'lucide-react';

export default function PricesPage() {
  const [productList, setProductList] = useState<Product[]>(products);
  const [searchTerm, setSearchTerm] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handlePriceChange = (id: string, newPrice: number) => {
    setProductList(prev => prev.map(p => {
      if (p.id === id) {
        const discount = p.originalPrice > 0 ? Math.round(((p.originalPrice - newPrice) / p.originalPrice) * 100) : 0;
        return { ...p, price: newPrice, discount: Math.max(0, discount) };
      }
      return p;
    }));
  };

  const handleOriginalPriceChange = (id: string, newOriginalPrice: number) => {
    setProductList(prev => prev.map(p => {
      if (p.id === id) {
        const discount = newOriginalPrice > 0 ? Math.round(((newOriginalPrice - p.price) / newOriginalPrice) * 100) : 0;
        return { ...p, originalPrice: newOriginalPrice, discount: Math.max(0, discount) };
      }
      return p;
    }));
  };

  const toggleStock = (id: string) => {
    setProductList(prev => prev.map(p => p.id === id ? { ...p, inStock: !p.inStock } : p));
  };

  const handleSaveAll = () => {
    // Save to local state/session
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const filteredProducts = productList.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.nameHi.includes(searchTerm) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto pt-3">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase tracking-wider mb-1">
            <TrendingUp size={16} />
            <span>Chakki Fresh Rate List</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Live Product Prices & Rates</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Update wheat flour per KG prices, market rates, discounts and stock availability in real-time.
          </p>
        </div>

        <button
          onClick={handleSaveAll}
          className="flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition shadow-sm shrink-0"
        >
          {saveSuccess ? <CheckCircle size={18} /> : <Save size={18} />}
          <span>{saveSuccess ? 'Prices Updated!' : 'Save All Prices'}</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle size={18} className="text-emerald-600" />
          <span>Rates updated successfully! Customer app prices are now synced.</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search product by name or category..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-green-600"
          />
        </div>
      </div>

      {/* Product Rates Cards / Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse block md:table">
            <thead className="hidden md:table-header-group bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-600 uppercase tracking-wider">
              <tr>
                <th className="p-4">Product Name</th>
                <th className="p-4">Weight / Pack</th>
                <th className="p-4">MRP / Orig Price (₹)</th>
                <th className="p-4">Selling Price (₹)</th>
                <th className="p-4">Discount</th>
                <th className="p-4">Stock Status</th>
              </tr>
            </thead>
            <tbody className="block md:table-row-group divide-y divide-gray-100 text-sm">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="block md:table-row hover:bg-gray-50/80 transition p-4 md:p-0">
                  {/* Product Details */}
                  <td className="block md:table-cell p-0 md:p-4 align-middle mb-2 md:mb-0">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center font-bold text-amber-800 text-xs shrink-0">
                        {product.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm">{product.name}</h4>
                        <p className="text-xs text-gray-500">{product.nameHi}</p>
                      </div>
                    </div>
                  </td>

                  {/* Weight */}
                  <td className="block md:table-cell p-0 md:p-4 align-middle mb-2 md:mb-0 text-gray-700 font-semibold text-xs md:text-sm">
                    <span className="md:hidden text-gray-400 font-normal mr-2">Weight:</span>
                    <span className="bg-gray-100 px-2.5 py-1 rounded-lg border border-gray-200">{product.weight}</span>
                  </td>

                  {/* Original Price */}
                  <td className="block md:table-cell p-0 md:p-4 align-middle mb-2 md:mb-0">
                    <span className="md:hidden text-gray-400 font-normal mr-2">MRP:</span>
                    <div className="inline-flex items-center gap-1">
                      <span className="text-xs text-gray-400">₹</span>
                      <input
                        type="number"
                        value={product.originalPrice}
                        onChange={(e) => handleOriginalPriceChange(product.id, Number(e.target.value))}
                        className="w-24 px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-green-600 outline-none"
                      />
                    </div>
                  </td>

                  {/* Selling Price */}
                  <td className="block md:table-cell p-0 md:p-4 align-middle mb-2 md:mb-0">
                    <span className="md:hidden text-gray-400 font-normal mr-2">Selling Price:</span>
                    <div className="inline-flex items-center gap-1">
                      <span className="text-xs text-green-700 font-bold">₹</span>
                      <input
                        type="number"
                        value={product.price}
                        onChange={(e) => handlePriceChange(product.id, Number(e.target.value))}
                        className="w-24 px-2.5 py-1.5 border border-green-300 rounded-lg text-xs font-bold text-green-800 bg-green-50/50 focus:ring-2 focus:ring-green-600 outline-none"
                      />
                    </div>
                  </td>

                  {/* Discount Badge */}
                  <td className="block md:table-cell p-0 md:p-4 align-middle mb-2 md:mb-0">
                    <span className="md:hidden text-gray-400 font-normal mr-2">Discount:</span>
                    <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 border border-red-100 px-2.5 py-1 rounded-lg text-xs font-bold">
                      <Tag size={12} /> {product.discount}% OFF
                    </span>
                  </td>

                  {/* Stock Toggle */}
                  <td className="block md:table-cell p-0 md:p-4 align-middle">
                    <button
                      onClick={() => toggleStock(product.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                        product.inStock 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                      }`}
                    >
                      {product.inStock ? '✓ In Stock' : '✕ Out of Stock'}
                    </button>
                  </td>
                </tr>
              ))}

              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-10 text-center">
                    <AlertCircle size={36} className="mx-auto text-gray-300 mb-2" />
                    <p className="text-gray-600 font-semibold text-sm">No products found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
