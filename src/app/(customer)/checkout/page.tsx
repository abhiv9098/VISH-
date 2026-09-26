/* eslint-disable */
'use client';

import { useCart } from '@/context/CartContext';
import { useOrders } from '@/context/OrderContext';
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, Truck, CreditCard, Banknote, QrCode, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutPage() {
  const { cart, getCartTotal, clearCart } = useCart();
  const { addOrder } = useOrders();
  const router = useRouter();
  
  // Steps: 1: Details, 2: Payment (50% or 100%), 3: Success
  const [step, setStep] = useState(1);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    country: 'India',
    address: '',
    city: '',
    pincode: ''
  });
  
  const [paymentChoice, setPaymentChoice] = useState<'50' | '100'>('50');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [generatedOrderId, setGeneratedOrderId] = useState('');

  // Fixed Delivery Charge
  const deliveryCharge = 50; 
  const subtotal = getCartTotal();
  const total = subtotal + deliveryCharge;
  
  const advanceAmount = paymentChoice === '50' ? total / 2 : total;
  const remainingAmount = total - advanceAmount;

  if (cart.length === 0 && !orderPlaced) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
        <button onClick={() => router.push('/')} className="bg-yellow-500 hover:bg-yellow-600 text-green-950 font-bold px-6 py-2 rounded transition">
          Go Shopping
        </button>
      </div>
    );
  }

  const handleDetailsSubmit = (e: FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handlePaymentSimulation = () => {
    // Simulate successful payment delay
    setTimeout(() => {
      setStep(3);
    }, 1500);
  };

  const confirmCOD = () => {
    placeOrder();
  };

  const placeOrder = () => {
    const newOrderId = `ORD-${Math.floor(Math.random() * 900000) + 100000}`;
    addOrder({
      id: newOrderId,
      date: new Date().toISOString(),
      status: 'Order Placed',
      total: total,
      advancePaid: advanceAmount,
      remainingAmount: remainingAmount,
      items: cart,
      customerInfo: customerInfo
    });
    clearCart();
    router.push('/profile?newOrder=' + newOrderId);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      {step === 1 && (
        <button 
          onClick={() => router.back()} 
          className="flex items-center gap-2 mb-4 text-gray-600 hover:text-green-700 font-medium transition"
        >
          <ArrowLeft size={18} /> Back
        </button>
      )}
      
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Checkout</h1>
      
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Checkout Form */}
        <div className="w-full lg:w-2/3">
          
          {step === 1 && (
            <form id="checkout-details-form" onSubmit={handleDetailsSubmit}>
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm mb-6">
                <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Truck className="text-green-700" size={20} /> 
                  Delivery Address & Details
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input required type="text" value={customerInfo.name} onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})} className="w-full border border-gray-300 rounded p-2 outline-none focus:border-green-500" placeholder="Rahul Sharma" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                    <input required type="tel" value={customerInfo.phone} onChange={e => setCustomerInfo({...customerInfo, phone: e.target.value})} className="w-full border border-gray-300 rounded p-2 outline-none focus:border-green-500" placeholder="+91 9876543210" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                    <input required type="text" value={customerInfo.country} onChange={e => setCustomerInfo({...customerInfo, country: e.target.value})} className="w-full border border-gray-300 rounded p-2 outline-none focus:border-green-500" placeholder="India" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                    <input required type="text" value={customerInfo.pincode} onChange={e => setCustomerInfo({...customerInfo, pincode: e.target.value})} className="w-full border border-gray-300 rounded p-2 outline-none focus:border-green-500" placeholder="400053" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Complete Address</label>
                    <textarea required value={customerInfo.address} onChange={e => setCustomerInfo({...customerInfo, address: e.target.value})} className="w-full border border-gray-300 rounded p-2 outline-none focus:border-green-500" rows={3} placeholder="House no, Building, Street, Area..."></textarea>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input required type="text" value={customerInfo.city} onChange={e => setCustomerInfo({...customerInfo, city: e.target.value})} className="w-full border border-gray-300 rounded p-2 outline-none focus:border-green-500" placeholder="Mumbai" />
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end">
                  <button type="submit" className="bg-green-700 hover:bg-green-800 text-white font-medium px-8 py-3 rounded-lg transition w-full md:w-auto">
                    Proceed to Payment
                  </button>
                </div>
              </div>
            </form>
          )}

          {step === 2 && (
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                <CreditCard className="text-green-700" size={20} /> 
                Advance Payment Required
              </h2>
              <p className="text-gray-600 mb-6 text-sm">To process your order, please make an advance payment.</p>
              
              <div className="space-y-4 mb-8">
                <label className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition ${paymentChoice === '50' ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
                  <input 
                    type="radio" 
                    name="paymentAmount" 
                    value="50" 
                    checked={paymentChoice === '50'} 
                    onChange={() => setPaymentChoice('50')}
                    className="w-4 h-4 text-green-600 focus:ring-green-500"
                  />
                  <div>
                    <div className="font-bold text-gray-900">Pay 50% Now</div>
                    <div className="text-sm text-gray-500">Pay ₹{total / 2} via UPI/QR, remaining on delivery</div>
                  </div>
                </label>
                
                <label className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition ${paymentChoice === '100' ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
                  <input 
                    type="radio" 
                    name="paymentAmount" 
                    value="100" 
                    checked={paymentChoice === '100'} 
                    onChange={() => setPaymentChoice('100')}
                    className="w-4 h-4 text-green-600 focus:ring-green-500"
                  />
                  <div>
                    <div className="font-bold text-gray-900">Pay 100% Now</div>
                    <div className="text-sm text-gray-500">Pay full ₹{total} via UPI/QR</div>
                  </div>
                </label>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg text-center border border-gray-200">
                <QrCode size={64} className="mx-auto text-gray-400 mb-4" />
                <h3 className="font-bold text-lg mb-2">Scan & Pay ₹{advanceAmount}</h3>
                <p className="text-sm text-gray-500 mb-6">Use any UPI app (GPay, PhonePe, Paytm, etc.)</p>
                <button 
                  onClick={handlePaymentSimulation}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-lg transition w-full md:w-auto"
                >
                  Confirm Payment of ₹{advanceAmount}
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm text-center">
              <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
              <h2 className="font-bold text-2xl mb-2">Payment of ₹{advanceAmount} Successful!</h2>
              <p className="text-gray-600 mb-6">Your advance payment has been received.</p>
              
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-100 mb-8 inline-block text-left w-full max-w-md mx-auto">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-700">Total Order Value:</span>
                  <span className="font-semibold">₹{total}</span>
                </div>
                <div className="flex justify-between items-center mb-2 text-green-700">
                  <span>Advance Paid:</span>
                  <span>- ₹{advanceAmount}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-orange-200 mt-2 font-bold text-lg">
                  <span>Remaining Amount:</span>
                  <span>₹{remainingAmount}</span>
                </div>
              </div>
              
              {remainingAmount > 0 ? (
                <button 
                  onClick={confirmCOD}
                  className="bg-yellow-500 hover:bg-yellow-600 text-green-950 font-bold px-8 py-4 rounded-lg transition w-full md:w-auto flex items-center justify-center gap-2 mx-auto"
                >
                  <Banknote size={20} />
                  Confirm Cash on Delivery for ₹{remainingAmount}
                </button>
              ) : (
                <button 
                  onClick={placeOrder}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-4 rounded-lg transition w-full md:w-auto flex items-center justify-center gap-2 mx-auto"
                >
                  <CheckCircle size={20} />
                  Complete Order
                </button>
              )}
            </div>
          )}
        </div>

        {/* Order Summary Sidebar */}
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
                <span>Delivery Charge</span>
                <span className="font-medium text-gray-900">₹{deliveryCharge}</span>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="font-bold text-lg text-gray-900">Total</span>
                <span className="font-bold text-2xl text-green-700">₹{total}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
