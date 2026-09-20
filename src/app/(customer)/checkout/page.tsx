'use client';

import { useCart } from '@/context/CartContext';
import { useOrders } from '@/context/OrderContext';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, Truck, CreditCard, Banknote } from 'lucide-react';

export default function CheckoutPage() {
  const { cart, getCartTotal, clearCart } = useCart();
  const { addOrder } = useOrders();
  const router = useRouter();
  
  const [step, setStep] = useState(1); // 1: Address, 2: Payment, 3: Success
  const [paymentMethod, setPaymentMethod] = useState('cod');

  const subtotal = getCartTotal();
  const deliveryCharge = 50;
  const total = subtotal + (subtotal > 0 ? deliveryCharge : 0);

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call
    setTimeout(() => {
      const orderId = `ORD-${Math.floor(Math.random() * 900000) + 100000}`;
      addOrder({
        id: orderId,
        date: new Date().toISOString(),
        status: 'Order Placed',
        total: total,
        advancePaid: 0,
        remainingAmount: total,
        items: cart,
        customerInfo: {
          name: 'Rahul Sharma',
          address: 'Mumbai',
          phone: '+91 9876543210'
        }
      });
      clearCart();
      setStep(3);
    }, 1500);
  };

  if (step === 3) {
    return (
      <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <CheckCircle size={80} className="text-green-500 mb-6" />
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Order Placed Successfully!</h1>
        <p className="text-gray-600 mb-2">Thank you for choosing Vishwakarma Chakki.</p>
        <p className="text-gray-500 mb-8">Order ID: <span className="font-semibold text-gray-800">ORD-{Math.floor(Math.random() * 900000) + 100000}</span></p>
        
        <div className="flex gap-4">
          <button 
            onClick={() => router.push('/profile')}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium px-6 py-2 rounded transition"
          >
            View Orders
          </button>
          <button 
            onClick={() => router.push('/')}
            className="bg-green-700 hover:bg-green-800 text-white font-medium px-6 py-2 rounded transition"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Checkout</h1>
      
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Checkout Form */}
        <div className="w-full lg:w-2/3">
          <form id="checkout-form" onSubmit={handlePlaceOrder}>
            
            {/* Address Section */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm mb-6">
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Truck className="text-green-700" size={20} /> 
                Delivery Address
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input required type="text" className="w-full border border-gray-300 rounded p-2 outline-none focus:border-green-500" placeholder="Rahul Sharma" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                  <input required type="tel" className="w-full border border-gray-300 rounded p-2 outline-none focus:border-green-500" placeholder="+91 9876543210" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Complete Address</label>
                  <textarea required className="w-full border border-gray-300 rounded p-2 outline-none focus:border-green-500" rows={3} placeholder="House no, Building, Street, Area..."></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input required type="text" className="w-full border border-gray-300 rounded p-2 outline-none focus:border-green-500" placeholder="Mumbai" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                  <input required type="text" className="w-full border border-gray-300 rounded p-2 outline-none focus:border-green-500" placeholder="400053" />
                </div>
              </div>
            </div>

            {/* Payment Section */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                <CreditCard className="text-green-700" size={20} /> 
                Payment Method
              </h2>
              
              <div className="space-y-3">
                <label className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition ${paymentMethod === 'cod' ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
                  <input 
                    type="radio" 
                    name="payment" 
                    value="cod" 
                    checked={paymentMethod === 'cod'} 
                    onChange={() => setPaymentMethod('cod')}
                    className="w-4 h-4 text-green-600 focus:ring-green-500"
                  />
                  <Banknote className="text-gray-500" size={24} />
                  <div>
                    <div className="font-medium text-gray-900">Cash on Delivery</div>
                    <div className="text-sm text-gray-500">Pay when your order arrives</div>
                  </div>
                </label>
                
                <label className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition ${paymentMethod === 'upi' ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
                  <input 
                    type="radio" 
                    name="payment" 
                    value="upi" 
                    checked={paymentMethod === 'upi'} 
                    onChange={() => setPaymentMethod('upi')}
                    className="w-4 h-4 text-green-600 focus:ring-green-500"
                  />
                  <div className="font-bold italic text-blue-600">UPI</div>
                  <div>
                    <div className="font-medium text-gray-900">Google Pay / PhonePe / Paytm</div>
                    <div className="text-sm text-gray-500">Scan QR or enter UPI ID</div>
                  </div>
                </label>
              </div>
            </div>
            
          </form>
        </div>

        {/* Order Summary */}
        <div className="w-full lg:w-1/3">
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm sticky top-24">
            <h2 className="font-bold text-lg mb-4 border-b pb-4">Order Summary</h2>
            
            <div className="space-y-4 mb-4 max-h-60 overflow-y-auto pr-2">
              {cart.map((item) => (
                <div key={item.product.id} className="flex justify-between text-sm">
                  <span className="text-gray-600 w-2/3 truncate">
                    {item.quantity}x {item.product.name}
                  </span>
                  <span className="font-medium text-gray-900">₹{item.product.price * item.quantity}</span>
                </div>
              ))}
            </div>
            
            <div className="border-t pt-4 space-y-3 mb-6 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-medium text-gray-900">₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery</span>
                <span className="font-medium text-gray-900">₹{deliveryCharge}</span>
              </div>
            </div>
            
            <div className="border-t pt-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="font-bold text-lg text-gray-900">Total</span>
                <span className="font-bold text-2xl text-green-700">₹{total}</span>
              </div>
            </div>
            
            <button 
              type="submit"
              form="checkout-form"
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-green-950 font-bold py-3 rounded-lg transition"
            >
              Place Order
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
