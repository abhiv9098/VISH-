'use client';

import { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { products } from '@/lib/data';
import { useOrders } from '@/context/OrderContext';
import { CheckCircle, ArrowRight, ArrowLeft, QrCode, ShieldCheck, X } from 'lucide-react';

type Step = 1 | 2 | 3 | 4 | 5;

function OrderFlowContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryProductId = searchParams.get('productId');
  
  const { addOrder, deliverySettings, customerProfile, updateCustomerProfile } = useOrders();
  
  const [step, setStep] = useState<Step>(1);
  const [selectedProductId, setSelectedProductId] = useState<string>(
    queryProductId && products.some(p => p.id === queryProductId) 
      ? queryProductId 
      : products[0].id
  );
  const [quantity, setQuantity] = useState<number>(1);
  
  const [customerInfo, setCustomerInfo] = useState({
    name: customerProfile?.name || '',
    phone: customerProfile?.phone || '',
    address: customerProfile?.address || ''
  });
  
  const [otp, setOtp] = useState(['', '', '', '']);
  const [orderId, setOrderId] = useState<string>('');
  
  const selectedProduct = products.find(p => p.id === selectedProductId) || products[0];
  
  // Dynamic Delivery Calculation
  const itemTotal = selectedProduct.price * quantity;
  const deliveryCharge = itemTotal > deliverySettings.threshold ? deliverySettings.chargeAbove : deliverySettings.chargeBelow;
  const totalAmount = itemTotal + deliveryCharge;
  const advanceAmount = totalAmount / 2;
  const remainingAmount = totalAmount - advanceAmount;

  const handleNext = () => setStep((prev) => (prev + 1) as Step);
  const handleBack = () => setStep((prev) => (prev - 1) as Step);
  const handleExit = () => router.push('/');

  const proceedFromStep1 = () => {
    if (customerProfile?.isVerified && customerProfile.name && customerProfile.phone && customerProfile.address) {
      setCustomerInfo({
        name: customerProfile.name,
        phone: customerProfile.phone,
        address: customerProfile.address
      });
      // Skip straight to Review & Payment
      setStep(4);
    } else {
      setStep(2);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value[0];
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    if (value && index < 3) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.join('').length === 4) {
      updateCustomerProfile({
        name: customerInfo.name,
        phone: customerInfo.phone,
        address: customerInfo.address,
        isVerified: true
      });
      handleNext();
    } else {
      alert("Please enter a 4-digit OTP.");
    }
  };

  const handleConfirmOrder = () => {
    const newOrderId = `ORD-${Math.floor(Math.random() * 900000) + 100000}`;
    setOrderId(newOrderId);
    
    addOrder({
      id: newOrderId,
      date: new Date().toISOString(),
      status: 'Order Placed',
      total: totalAmount,
      advancePaid: advanceAmount,
      remainingAmount: remainingAmount,
      items: [{ product: selectedProduct, quantity }],
      customerInfo
    });
    
    handleNext();
  };

  return (
    <div className="min-h-[80vh] bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        
        {/* Header with Exit option */}
        {step < 5 && (
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Place Order</h1>
            <button onClick={handleExit} className="flex items-center gap-1 text-gray-500 hover:text-red-600 transition font-medium">
              <X size={18} /> Exit
            </button>
          </div>
        )}

        {/* Progress Bar */}
        {step < 5 && (
          <div className="mb-8">
            <div className="flex justify-between items-center relative">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 z-0 rounded-full"></div>
              <div 
                className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-green-600 z-0 rounded-full transition-all duration-300"
                style={{ width: `${((step - 1) / 3) * 100}%` }}
              ></div>
              
              {[1, 2, 3, 4].map((s) => (
                <div key={s} className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= s ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                  {s}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs font-medium text-gray-500 mt-2">
              <span>Details</span>
              <span>Delivery</span>
              <span>Verify</span>
              <span>Payment</span>
            </div>
          </div>
        )}

        <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100 relative">
          
          {/* STEP 1: ORDER DETAILS */}
          {step === 1 && (
            <div className="p-6 md:p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Select Atta & Quantity</h2>
              
              <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2">
                {products.filter(p => p.name.includes('Gehu') || p.name.includes('Wheat') || p.name.includes('Village')).map(product => (
                  <label 
                    key={product.id} 
                    className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${selectedProductId === product.id ? 'border-green-500 bg-green-50/50 shadow-sm' : 'border-gray-200 hover:border-green-300'}`}
                  >
                    <input 
                      type="radio" 
                      name="product" 
                      className="w-5 h-5 text-green-600 border-gray-300 focus:ring-green-500"
                      checked={selectedProductId === product.id}
                      onChange={() => setSelectedProductId(product.id)}
                    />
                    <div className="ml-4 flex-1">
                      <h3 className="font-semibold text-gray-900">{product.name}</h3>
                      <p className="text-sm text-gray-500">{product.weight}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">₹{product.price}</p>
                    </div>
                  </label>
                ))}
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-6">
                <span className="font-medium text-gray-700">Quantity</span>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-l-lg">-</button>
                  <span className="px-4 font-semibold">{quantity}</span>
                  <button type="button" onClick={() => setQuantity(quantity + 1)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-r-lg">+</button>
                </div>
              </div>

              <div className="mt-8 bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Items Total ({quantity}x)</span>
                  <span className="font-medium">₹{itemTotal}</span>
                </div>
                <div className="flex justify-between text-sm">
                <span className="text-gray-600">Delivery Charge (Orders &gt; ₹{deliverySettings.threshold} get discounted delivery)</span>
                  <span className="font-medium text-orange-600">+₹{deliveryCharge}</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
                  <span className="font-bold text-gray-900">Total Amount</span>
                  <span className="font-bold text-xl text-green-700">₹{totalAmount}</span>
                </div>
              </div>

              <button 
                onClick={proceedFromStep1}
                className="w-full mt-6 bg-yellow-500 hover:bg-yellow-600 text-green-950 text-lg font-bold py-4 rounded-xl transition flex justify-center items-center gap-2"
              >
                Proceed to Address <ArrowRight size={20} />
              </button>
            </div>
          )}

          {/* STEP 2: CUSTOMER INFO */}
          {step === 2 && (
            <div className="p-6 md:p-8">
              <div className="flex items-center mb-6">
                <button onClick={handleBack} className="mr-3 text-gray-500 hover:text-gray-900 bg-gray-100 p-2 rounded-full">
                  <ArrowLeft size={20} />
                </button>
                <h2 className="text-xl font-bold text-gray-900">Delivery Details</h2>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleNext(); }} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                  <input 
                    required 
                    type="text" 
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                    className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-green-500" 
                    placeholder="Enter your full name" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Mobile Number</label>
                  <div className="flex">
                    <span className="inline-flex items-center px-4 rounded-l-xl border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                      +91
                    </span>
                    <input 
                      required 
                      type="tel" 
                      pattern="[0-9]{10}"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                      className="flex-1 border border-gray-300 rounded-r-xl p-3 outline-none focus:ring-2 focus:ring-green-500" 
                      placeholder="10-digit mobile number" 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Complete Delivery Address</label>
                  <textarea 
                    required 
                    rows={3}
                    value={customerInfo.address}
                    onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})}
                    className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-green-500" 
                    placeholder="House no, Building, Street, Area, Pincode"
                  ></textarea>
                </div>

                <button 
                  type="submit"
                  className="w-full mt-4 bg-yellow-500 hover:bg-yellow-600 text-green-950 text-lg font-bold py-4 rounded-xl transition flex justify-center items-center gap-2"
                >
                  Verify Mobile Number
                </button>
              </form>
            </div>
          )}

          {/* STEP 3: OTP VERIFICATION */}
          {step === 3 && (
            <div className="p-6 md:p-8 text-center">
              <div className="absolute top-6 left-6">
                <button onClick={handleBack} className="text-gray-500 hover:text-gray-900 bg-gray-100 p-2 rounded-full">
                  <ArrowLeft size={20} />
                </button>
              </div>
              <div className="flex items-center justify-center mb-4 text-green-600 mt-4">
                <ShieldCheck size={48} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Mobile Number</h2>
              <p className="text-gray-500 mb-8">We've sent a 4-digit OTP to <br/><span className="font-bold text-gray-800">+91 {customerInfo.phone}</span></p>

              <form onSubmit={handleVerifyOtp} className="max-w-xs mx-auto">
                <div className="flex justify-between gap-3 mb-8">
                  {[0, 1, 2, 3].map((index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      maxLength={1}
                      value={otp[index]}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      className="w-14 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-xl outline-none focus:border-green-500 focus:ring-2"
                    />
                  ))}
                </div>

                <button 
                  type="submit"
                  className="w-full bg-green-700 hover:bg-green-800 text-white text-lg font-bold py-4 rounded-xl transition flex justify-center items-center gap-2"
                >
                  Confirm & Proceed
                </button>
                
                <p className="mt-4 text-sm text-gray-500">
                  Didn't receive OTP? <button type="button" className="text-green-600 font-semibold hover:underline">Resend</button>
                </p>
              </form>
            </div>
          )}

          {/* STEP 4: 50% ADVANCE PAYMENT & FINAL REVIEW */}
          {step === 4 && (
            <div className="p-6 md:p-8">
              <div className="flex items-center mb-6">
                <button onClick={() => setStep(1)} className="mr-3 text-gray-500 hover:text-gray-900 bg-gray-100 p-2 rounded-full">
                  <ArrowLeft size={20} />
                </button>
                <h2 className="text-xl font-bold text-gray-900">Final Order Review</h2>
              </div>

              {/* Explicit Final Order Review as requested */}
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 mb-6">
                <h3 className="font-bold text-gray-800 mb-4 border-b border-gray-200 pb-2 text-sm uppercase">Order Details</h3>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Selected Atta</span>
                    <span className="font-medium text-gray-900 text-right">{selectedProduct.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Quantity</span>
                    <span className="font-medium text-gray-900">{quantity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Product Price</span>
                    <span className="font-medium text-gray-900">₹{selectedProduct.price} x {quantity} = ₹{itemTotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery Charge</span>
                    <span className="font-medium text-orange-600">₹{deliveryCharge}</span>
                  </div>
                  <div className="flex justify-between bg-white p-2 rounded border border-gray-200">
                    <span className="font-bold text-gray-900">Total Amount</span>
                    <span className="font-bold text-gray-900">₹{totalAmount}</span>
                  </div>
                </div>

                <h3 className="font-bold text-gray-800 mt-6 mb-4 border-b border-gray-200 pb-2 text-sm uppercase">Delivery Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name</span>
                    <span className="font-medium text-gray-900">{customerInfo.name}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-600">Delivery Address</span>
                    <span className="font-medium text-gray-900 mt-1">{customerInfo.address}</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 text-center">
                <p className="text-sm text-blue-800 font-medium">
                  Please pay <span className="font-bold">50% advance (₹{advanceAmount})</span> to confirm your order. The remaining <span className="font-bold">₹{remainingAmount}</span> will be paid on delivery.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 items-center">
                <div className="space-y-4">
                  <div className="bg-green-50 rounded-xl p-4 border border-green-200 flex justify-between items-center">
                    <div>
                      <p className="text-sm text-green-800 font-medium mb-1">Advance Payment</p>
                      <p className="text-xs text-green-700">Pay Now</p>
                    </div>
                    <p className="text-2xl font-bold text-green-700">₹{advanceAmount}</p>
                  </div>
                  <div className="bg-orange-50 rounded-xl p-4 border border-orange-200 flex justify-between items-center">
                    <div>
                      <p className="text-sm text-orange-800 font-medium mb-1">Remaining Amount</p>
                      <p className="text-xs text-orange-700">Pay on Delivery</p>
                    </div>
                    <p className="text-xl font-bold text-orange-700">₹{remainingAmount}</p>
                  </div>
                </div>

                <div className="flex flex-col items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                  <div className="bg-gray-100 p-2 rounded-lg mb-2">
                    <div className="w-32 h-32 bg-white border-2 border-dashed border-gray-300 flex flex-col items-center justify-center rounded-lg">
                      <QrCode size={40} className="text-gray-400 mb-2" />
                      <span className="text-[10px] text-gray-500 font-medium uppercase">UPI QR Code</span>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-gray-800">Scan & Pay ₹{advanceAmount}</p>
                </div>
              </div>

              <div className="mt-8 border-t border-gray-200 pt-6">
                <label className="flex items-start mb-6 cursor-pointer">
                  <input type="checkbox" required className="mt-1 w-5 h-5 text-green-600 rounded border-gray-300 focus:ring-green-500" />
                  <span className="ml-3 text-sm text-gray-600 font-medium">
                    I confirm my details and have completed the advance payment of ₹{advanceAmount}.
                  </span>
                </label>
                
                <button 
                  onClick={handleConfirmOrder}
                  className="w-full bg-green-700 hover:bg-green-800 text-white text-lg font-bold py-4 rounded-xl transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Confirm Order
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: CONFIRMATION */}
          {step === 5 && (
            <div className="p-8 md:p-12 text-center">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle size={40} className="text-green-600" />
                </div>
              </div>
              
              <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Order Confirmed!</h2>
              <p className="text-gray-600 mb-8">Thank you for your order. We have received your advance payment.</p>
              
              <div className="bg-gray-50 rounded-2xl p-6 max-w-sm mx-auto border border-gray-200 text-left mb-8">
                <div className="mb-4 pb-4 border-b border-gray-200 text-center">
                  <p className="text-sm text-gray-500 mb-1">Order ID</p>
                  <p className="text-2xl font-bold text-gray-900">{orderId}</p>
                </div>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Amount</span>
                    <span className="font-semibold">₹{totalAmount}</span>
                  </div>
                  <div className="flex justify-between text-green-700">
                    <span>Advance Paid</span>
                    <span className="font-semibold">-₹{advanceAmount}</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-gray-200">
                    <span className="font-bold text-gray-900">Remaining Amount</span>
                    <span className="font-bold text-orange-600">₹{remainingAmount}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  href="/profile"
                  className="bg-green-700 hover:bg-green-800 text-white font-bold py-3 px-8 rounded-xl transition text-center"
                >
                  Track My Order
                </Link>
                <Link 
                  href="/"
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 px-8 rounded-xl transition text-center"
                >
                  Back to Home
                </Link>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default function OrderFlow() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-[80vh]">Loading...</div>}>
      <OrderFlowContent />
    </Suspense>
  );
}
