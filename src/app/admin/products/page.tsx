'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { products as initialProducts, Product } from '@/lib/data';
import Image from 'next/image';
import {
  Plus, Edit2, Trash2, X, Save,
  Package, Search, CheckCircle2, AlertCircle,
  Tag, Layers, Check, ArrowUpDown
} from 'lucide-react';

type ProductFormData = {
  name: string;
  nameHi: string;
  weight: string;
  price: number;
  originalPrice: number;
  discount: number;
  description: string;
  descriptionHi: string;
  image: string;
  inStock: boolean;
  category: string;
};

const emptyForm: ProductFormData = {
  name: '',
  nameHi: '',
  weight: '5 KG',
  price: 280,
  originalPrice: 320,
  discount: 12,
  description: 'Freshly stone-ground chakki flour milled upon order.',
  descriptionHi: 'ऑर्डर पर ताज़ा पीसा गया शुद्ध चक्की आटा।',
  image: '/images/wheat_flour.jpg',
  inStock: true,
  category: 'Gehu Atta',
};

const CATEGORIES = [
  'All Categories',
  'Gehu Atta',
  'Multigrain Atta',
  'Makka Atta',
  'Besan',
  'Bajra Atta',
  'Jowar Atta'
];

export default function ProductsPage() {
  const [productsList, setProductsList] = useState<Product[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('vishwakarma_admin_products');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch {}
      }
    }
    return initialProducts;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [stockFilter, setStockFilter] = useState<'ALL' | 'IN_STOCK' | 'OUT_OF_STOCK'>('ALL');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>(emptyForm);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Persist products to localStorage
  const saveProducts = (updated: Product[]) => {
    setProductsList(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('vishwakarma_admin_products', JSON.stringify(updated));
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filteredProducts = useMemo(() => {
    return productsList.filter(p => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = 
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.nameHi && p.nameHi.includes(q)) ||
        p.category.toLowerCase().includes(q) ||
        p.weight.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (selectedCategory !== 'All Categories' && p.category !== selectedCategory) {
        return false;
      }

      if (stockFilter === 'IN_STOCK' && !p.inStock) return false;
      if (stockFilter === 'OUT_OF_STOCK' && p.inStock) return false;

      return true;
    });
  }, [productsList, searchQuery, selectedCategory, stockFilter]);

  // KPI counts
  const totalProducts = productsList.length;
  const inStockCount = productsList.filter(p => p.inStock).length;
  const outOfStockCount = totalProducts - inStockCount;
  const totalCategories = new Set(productsList.map(p => p.category)).size;

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData(emptyForm);
    setShowModal(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      nameHi: product.nameHi || '',
      weight: product.weight,
      price: product.price,
      originalPrice: product.originalPrice || Math.round(product.price * 1.15),
      discount: product.discount || 10,
      description: product.description || '',
      descriptionHi: product.descriptionHi || '',
      image: product.image || '/images/wheat_flour.jpg',
      inStock: product.inStock,
      category: product.category,
    });
    setShowModal(true);
  };

  const handleToggleStock = (product: Product) => {
    const updated = productsList.map(p => p.id === product.id ? { ...p, inStock: !p.inStock } : p);
    saveProducts(updated);
    showToast(`${product.name} is now ${!product.inStock ? 'In Stock' : 'Out of Stock'}`);
  };

  const handleDelete = (product: Product) => {
    if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
      const updated = productsList.filter(p => p.id !== product.id);
      saveProducts(updated);
      showToast(`Product "${product.name}" deleted successfully.`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.weight.trim() || formData.price <= 0) {
      alert('Please fill in product name, weight and a valid price (> 0).');
      return;
    }

    if (editingProduct) {
      const updated = productsList.map(p => p.id === editingProduct.id ? {
        ...p,
        ...formData
      } : p);
      saveProducts(updated);
      showToast(`Product "${formData.name}" updated successfully!`);
    } else {
      const newProduct: Product = {
        id: `p-${Date.now()}`,
        ...formData,
        rating: 4.8,
        reviews: 1,
        benefits: ['Chakki Fresh', '100% Pure', 'Stone Milled'],
        ingredients: ['Natural Grain']
      };
      saveProducts([newProduct, ...productsList]);
      showToast(`Product "${formData.name}" added successfully!`);
    }

    setShowModal(false);
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-12 w-full min-w-0">

      {/* Header Row */}
      <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-gray-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-gray-900">
            Products Management
          </h2>
          <p className="text-xs text-gray-500">
            Manage your store catalogue, prices, categories, and live stock availability
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 bg-[#062e1e] hover:bg-[#0b482d] text-[#f59e0b] font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-xs cursor-pointer self-start sm:self-auto active:scale-95"
        >
          <Plus size={16} />
          <span>+ Add New Product</span>
        </button>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="bg-emerald-100 border border-emerald-300 text-emerald-950 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs animate-fadeIn">
          <CheckCircle2 size={16} className="text-emerald-700 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3">
        <div className="bg-white p-3 sm:p-3.5 rounded-2xl border border-gray-200/70 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
            <Package size={18} />
          </div>
          <div>
            <p className="text-[11px] text-gray-500 font-medium">Total Products</p>
            <h3 className="text-base font-black text-gray-900">{totalProducts}</h3>
          </div>
        </div>

        <div className="bg-white p-3 sm:p-3.5 rounded-2xl border border-gray-200/70 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <Check size={18} />
          </div>
          <div>
            <p className="text-[11px] text-gray-500 font-medium">In Stock</p>
            <h3 className="text-base font-black text-emerald-700">{inStockCount}</h3>
          </div>
        </div>

        <div className="bg-white p-3 sm:p-3.5 rounded-2xl border border-gray-200/70 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
            <AlertCircle size={18} />
          </div>
          <div>
            <p className="text-[11px] text-gray-500 font-medium">Out of Stock</p>
            <h3 className="text-base font-black text-red-600">{outOfStockCount}</h3>
          </div>
        </div>

        <div className="bg-white p-3 sm:p-3.5 rounded-2xl border border-gray-200/70 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
            <Layers size={18} />
          </div>
          <div>
            <p className="text-[11px] text-gray-500 font-medium">Categories</p>
            <h3 className="text-base font-black text-purple-700">{totalCategories}</h3>
          </div>
        </div>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-gray-200/80 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products by name, weight, category..." 
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:bg-white transition"
            />
          </div>

          <div className="flex items-center gap-1.5 self-start md:self-auto">
            {(['ALL', 'IN_STOCK', 'OUT_OF_STOCK'] as const).map(f => (
              <button
                key={f}
                onClick={() => setStockFilter(f)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  stockFilter === f
                    ? 'bg-[#062e1e] text-[#f59e0b] shadow-xs'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {f === 'ALL' ? 'All' : f === 'IN_STOCK' ? 'In Stock' : 'Out of Stock'}
              </button>
            ))}
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer shrink-0 ${
                selectedCategory === cat
                  ? 'bg-emerald-800 text-white shadow-2xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
        {filteredProducts.map(product => {
          return (
            <div 
              key={product.id}
              className="bg-white rounded-2xl border border-gray-200/90 shadow-2xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
            >
              <div>
                {/* Product Image & Badges */}
                <div className="relative h-44 bg-amber-50/30 overflow-hidden border-b border-gray-100">
                  <Image 
                    src={product.image || '/images/wheat_flour.jpg'} 
                    alt={product.name} 
                    fill 
                    className="object-cover transition-transform duration-300 hover:scale-105" 
                  />
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    <span className="bg-emerald-950/90 text-amber-300 font-bold text-[10px] px-2 py-0.5 rounded-md backdrop-blur-xs">
                      {product.category}
                    </span>
                  </div>

                  <div className="absolute top-2.5 right-2.5">
                    <button
                      onClick={() => handleToggleStock(product)}
                      className={`text-[10px] font-black px-2.5 py-1 rounded-full cursor-pointer shadow-xs transition ${
                        product.inStock 
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' 
                          : 'bg-red-100 text-red-900 border border-red-300'
                      }`}
                      title="Click to toggle stock status"
                    >
                      {product.inStock ? '● In Stock' : '✕ Out of Stock'}
                    </button>
                  </div>
                </div>

                {/* Details */}
                <div className="p-3.5 space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-1">
                      {product.name}
                    </h3>
                    <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md shrink-0">
                      {product.weight}
                    </span>
                  </div>

                  {product.nameHi && (
                    <p className="text-xs text-gray-500 font-medium line-clamp-1">
                      {product.nameHi}
                    </p>
                  )}

                  <div className="flex items-baseline gap-2 pt-1">
                    <span className="text-base font-black text-gray-900">
                      ₹{product.price}
                    </span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <>
                        <span className="text-xs text-gray-400 line-through">
                          ₹{product.originalPrice}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                          {product.discount || Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="p-3 bg-gray-50/80 border-t border-gray-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleToggleStock(product)}
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                    product.inStock 
                      ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100' 
                      : 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100'
                  }`}
                >
                  {product.inStock ? 'Mark Out of Stock' : 'Mark In Stock'}
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(product)}
                    className="p-1.5 text-gray-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg border border-gray-200 transition cursor-pointer"
                    title="Edit Product"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(product)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg border border-gray-200 transition cursor-pointer"
                    title="Delete Product"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {filteredProducts.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center space-y-2 shadow-2xs">
          <Package size={36} className="mx-auto text-gray-400" />
          <h3 className="text-base font-bold text-gray-900">No products found</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Try adjusting your search query or category filter.
          </p>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100 transition"
            >
              <X size={20} />
            </button>

            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              {editingProduct ? `Updating product: ${editingProduct.name}` : 'Add a new product to your atta chakki catalogue'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Product Name (English) *</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Gehu ka Atta (Whole Wheat Flour)"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-700 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Product Name (Hindi)</label>
                <input 
                  type="text" 
                  value={formData.nameHi}
                  onChange={e => setFormData({ ...formData, nameHi: e.target.value })}
                  placeholder="e.g. गेहूं का आटा"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-700 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-700 outline-none bg-white"
                  >
                    {CATEGORIES.filter(c => c !== 'All Categories').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Weight / Pack *</label>
                  <input 
                    type="text" 
                    value={formData.weight}
                    onChange={e => setFormData({ ...formData, weight: e.target.value })}
                    placeholder="e.g. 5 KG or 25 KG"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-700 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Selling Price (₹) *</label>
                  <input 
                    type="number" 
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-700 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Original Price (₹)</label>
                  <input 
                    type="number" 
                    value={formData.originalPrice}
                    onChange={e => setFormData({ ...formData, originalPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-700 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Discount %</label>
                  <input 
                    type="number" 
                    value={formData.discount}
                    onChange={e => setFormData({ ...formData, discount: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-700 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Image URL</label>
                <input 
                  type="text" 
                  value={formData.image}
                  onChange={e => setFormData({ ...formData, image: e.target.value })}
                  placeholder="/images/wheat_flour.jpg"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-700 outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input 
                  type="checkbox" 
                  id="stockCheck"
                  checked={formData.inStock}
                  onChange={e => setFormData({ ...formData, inStock: e.target.checked })}
                  className="w-4 h-4 accent-emerald-700 cursor-pointer"
                />
                <label htmlFor="stockCheck" className="font-bold text-gray-800 cursor-pointer">
                  Available in Stock
                </label>
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#062e1e] hover:bg-[#0b482d] text-[#f59e0b] font-black rounded-xl transition shadow-xs cursor-pointer"
                >
                  {editingProduct ? 'Save Changes' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
