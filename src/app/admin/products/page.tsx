/* eslint-disable */
'use client';

import { useState } from 'react';
import { products as initialProducts, Product } from '@/lib/data';
import Image from 'next/image';
import {
  Plus, Edit2, Trash2, X, Save, ToggleLeft, ToggleRight,
  Package, Search, AlertCircle, CheckCircle
} from 'lucide-react';

type ProductFormData = {
  name: string;
  nameHi: string;
  weight: string;
  price: number;
  description: string;
  descriptionHi: string;
  image: string;
  inStock: boolean;
  category: string;
};

const emptyForm: ProductFormData = {
  name: 'Vishwakarma Chakki Fresh Atta',
  nameHi: 'विश्वकर्मा चक्की फ्रेश आटा',
  weight: '5 KG',
  price: 299,
  description: 'Freshly milled chakki fresh flour.',
  descriptionHi: 'ताज़ा पीसा हुआ चक्की फ्रेश आटा।',
  image: '/images/wheat_flour.jpg',
  inStock: true,
  category: 'Atta',
};

export default function ProductsPage() {
  const [productsList, setProductsList] = useState<Product[]>(initialProducts);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

  const filteredProducts = productsList.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.weight.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData(emptyForm);
    setShowForm(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      nameHi: product.nameHi || '',
      weight: product.weight,
      price: product.price,
      description: product.description || '',
      descriptionHi: product.descriptionHi || '',
      image: product.image,
      inStock: product.inStock,
      category: product.category,
    });
    setShowForm(true);
  };

  const handleToggleStock = (product: Product) => {
    setProductsList(prev => prev.map(p => p.id === product.id ? { ...p, inStock: !p.inStock } : p));
    showSuccess(`Stock status updated for ${product.name}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.weight.trim() || formData.price <= 0) {
      alert('Please fill in all required fields (Name, Weight, Price > 0)');
      return;
    }

    if (editingProduct) {
      setProductsList(prev => prev.map(p => p.id === editingProduct.id ? {
        ...p,
        ...formData
      } : p));
      showSuccess(`Product "${formData.name}" updated successfully!`);
    } else {
      const newProd: Product = {
        id: `p-${Date.now()}`,
        ...formData,
        originalPrice: Math.round(formData.price * 1.15),
        discount: 15,
        rating: 4.8,
        reviews: 1,
        benefits: ['Chakki Fresh', '100% Pure'],
        ingredients: ['Natural Grain']
      };
      setProductsList(prev => [newProd, ...prev]);
      showSuccess(`New product "${formData.name}" added successfully!`);
    }

    setShowForm(false);
    setEditingProduct(null);
    setFormData(emptyForm);
  };

  const handleDelete = (id: string) => {
    setProductsList(prev => prev.filter(p => p.id !== id));
    setDeleteConfirm(null);
    showSuccess('Product deleted successfully.');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products Management</h1>
          <p className="text-xs text-gray-500 mt-1">Add, edit, change prices & manage stock availability</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition shadow-sm"
        >
          <Plus size={16} /> + Add New Product
        </button>
      </div>

      {/* Success Banner */}
      {successMsg && (
        <div className="bg-green-100 border border-green-200 text-green-800 text-xs font-bold p-4 rounded-xl flex items-center gap-2 shadow-sm animate-fadeIn">
          <CheckCircle size={18} className="text-green-600" />
          {successMsg}
        </div>
      )}

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search product by name or weight..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-green-600 shadow-sm"
        />
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map(product => (
          <div key={product.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition space-y-3">
            <div className="flex gap-3 items-start">
              <div className="w-16 h-16 bg-gray-50 rounded-xl border border-gray-100 overflow-hidden relative shrink-0 flex items-center justify-center">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <Package size={24} className="text-gray-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-1">
                  <h3 className="font-bold text-gray-900 text-sm truncate">{product.name}</h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                    product.inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {product.inStock ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>
                {product.nameHi && <p className="text-xs text-gray-500 font-medium truncate">{product.nameHi}</p>}
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-base font-extrabold text-gray-900">₹{product.price}</span>
                  <span className="text-xs text-gray-400 font-semibold">({product.weight})</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between border-t border-gray-100 pt-3 text-xs">
              <button
                onClick={() => handleToggleStock(product)}
                className={`flex items-center gap-1 font-semibold transition ${
                  product.inStock ? 'text-green-700 hover:text-green-800' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {product.inStock ? <ToggleRight size={18} className="text-green-600" /> : <ToggleLeft size={18} />}
                <span>{product.inStock ? 'In Stock' : 'Out of Stock'}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenEdit(product)}
                  className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg border border-gray-200 transition"
                  title="Edit Product"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={() => setDeleteConfirm(product.id)}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg border border-gray-200 transition"
                  title="Delete Product"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Product Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Product Name (English) *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-600"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Product Name (Hindi)</label>
                <input
                  type="text"
                  value={formData.nameHi}
                  onChange={(e) => setFormData({ ...formData, nameHi: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Weight / Unit *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 5 KG or 10 KG"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Category</label>
                <input
                  type="text"
                  placeholder="e.g. Atta, Besan, Whole Grain"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-600"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="inStock"
                  checked={formData.inStock}
                  onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                  className="w-4 h-4 accent-green-700 cursor-pointer"
                />
                <label htmlFor="inStock" className="font-bold text-gray-800 cursor-pointer">Available in Stock</label>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-green-700 hover:bg-green-800 text-white font-bold rounded-xl shadow-sm"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center space-y-4">
            <AlertCircle size={40} className="mx-auto text-red-500" />
            <h3 className="text-lg font-bold text-gray-900">Delete Product?</h3>
            <p className="text-xs text-gray-500">Are you sure you want to delete this product? This action cannot be undone.</p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
