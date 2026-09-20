/* eslint-disable */
'use client';

import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import Image from 'next/image';
import { Minus, Plus, Trash2, ArrowRight } from 'lucide-react';

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, getCartTotal, getCartCount } = useCart();
  const deliveryCharge = 50;
  
  const subtotal = getCartTotal();
  const total = subtotal + (subtotal > 0 ? deliveryCharge : 0);

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="bg-gray-100 p-8 rounded-full mb-6">
          <Trash2 size={48} className="text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-8">Looks like you haven't added any fresh atta yet.</p>
        <Link href="/products" className="bg-yellow-500 hover:bg-yellow-600 text-green-950 font-bold px-8 py-3 rounded-md transition inline-flex items-center gap-2">
          Start Shopping <ArrowRight size={20} />
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Shopping Cart ({getCartCount()} Items)</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Cart Items */}
        <div className="w-full lg:w-2/3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="hidden md:grid grid-cols-6 gap-4 p-4 border-b bg-gray-50 text-sm font-semibold text-gray-600">
              <div className="col-span-3">Product</div>
              <div className="text-center">Price</div>
              <div className="text-center">Quantity</div>
              <div className="text-right">Total</div>
            </div>
            
            <div className="divide-y divide-gray-100">
              {cart.map((item) => (
                <div key={item.product.id} className="p-4 flex flex-col md:grid md:grid-cols-6 gap-4 items-center">
                  
                  <div className="col-span-3 flex items-center gap-4 w-full">
                    <div className="relative w-20 h-20 bg-gray-50 rounded flex-shrink-0">
                      <Image src={item.product.image} alt={item.product.name} fill className="object-cover rounded" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 line-clamp-2">{item.product.name}</h3>
                      <p className="text-sm text-green-700 font-medium mt-1">{item.product.weight}</p>
                      <button 
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-red-500 text-xs font-medium mt-2 flex items-center gap-1 hover:underline"
                      >
                        <Trash2 size={12} /> Remove
                      </button>
                    </div>
                  </div>

                  <div className="hidden md:block text-center font-medium text-gray-900">
                    ₹{item.product.price}
                  </div>

                  <div className="flex justify-between md:justify-center w-full md:w-auto">
                    <span className="md:hidden font-medium">Quantity:</span>
                    <div className="flex items-center border border-gray-300 rounded overflow-hidden h-8 w-24">
                      <button 
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="w-8 h-full flex items-center justify-center bg-gray-50 hover:bg-gray-100 text-gray-600 transition"
                      >
                        <Minus size={14} />
                      </button>
                      <div className="flex-1 h-full flex items-center justify-center font-bold text-sm text-gray-900 border-x border-gray-300">
                        {item.quantity}
                      </div>
                      <button 
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="w-8 h-full flex items-center justify-center bg-gray-50 hover:bg-gray-100 text-gray-600 transition"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between md:block w-full md:w-auto text-right font-bold text-gray-900 text-lg">
                    <span className="md:hidden">Total:</span>
                    ₹{item.product.price * item.quantity}
                  </div>

                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="w-full lg:w-1/3">
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm sticky top-24">
            <h2 className="font-bold text-lg mb-6 border-b pb-4">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-medium text-gray-900">₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery Charge</span>
                <span className="font-medium text-gray-900">₹{deliveryCharge}</span>
              </div>
              <div className="flex justify-between text-green-600 font-medium">
                <span>Discount</span>
                <span>- ₹0</span>
              </div>
            </div>
            
            <div className="border-t pt-4 mb-8">
              <div className="flex justify-between items-center">
                <span className="font-bold text-lg text-gray-900">Grand Total</span>
                <span className="font-bold text-2xl text-green-700">₹{total}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1 text-right">Inclusive of all taxes</p>
            </div>
            
            <Link 
              href="/checkout"
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-green-950 font-bold py-3 rounded-lg transition flex justify-center"
            >
              Proceed to Checkout
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

