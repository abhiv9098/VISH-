'use client';

import { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { products } from '@/lib/data';
import { useOrders } from '@/context/OrderContext';
import { CheckCircle, ArrowRight, ArrowLeft, QrCode, ShieldCheck, X, Banknote } from 'lucide-react';

type Step = 1 | 2 | 3 | 4 | 5 | 6;

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
    country: '',
    address: customerProfile?.address || '',
    city: '',
    pincode: ''
  });
  
  const [otp, setOtp] = useState(['', '', '', '']);
  const [orderId, setOrderId] = useState<string>('');
  
  const [paymentChoice, setPaymentChoice] = useState<'50' | '100'>('100');
  
  const selectedProduct = products.find(p => p.id === selectedProductId) || products[0];
  
  // Dynamic Delivery Calculation
  const itemTotal = selectedProduct.price * quantity;
  const deliveryCharge = itemTotal > deliverySettings.threshold ? deliverySettings.chargeAbove : deliverySettings.chargeBelow;
  const totalAmount = itemTotal + deliveryCharge;
  const advanceAmount = paymentChoice === '50' ? totalAmount / 2 : totalAmount;
  const remainingAmount = totalAmount - advanceAmount;

  const handleNext = () => setStep((prev) => (prev + 1) as Step);
  const handleBack = () => setStep((prev) => (prev - 1) as Step);
  const handleExit = () => router.push('/');

  const proceedFromStep1 = () => {
    setStep(2);
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
        address: `${customerInfo.address}, ${customerInfo.city}, ${customerInfo.pincode}, ${customerInfo.country}`,
        isVerified: true
      });
      handleNext(); // go to step 4 Payment
    } else {
      alert("Please enter a 4-digit OTP.");
    }
  };

  const handlePaymentSimulation = () => {
    setTimeout(() => {
      if (paymentChoice === '50') {
        setStep(5); // Confirm COD
      } else {
        placeOrder(totalAmount, 0); // 100% Paid
      }
    }, 1000);
  };

  const confirmCOD = () => {
    placeOrder(advanceAmount, remainingAmount);
  };

  const placeOrder = (paid: number, remaining: number) => {
    const newOrderId = `ORD-${Math.floor(Math.random() * 900000) + 100000}`;
    
    addOrder({
      id: newOrderId,
      date: new Date().toISOString(),
      status: 'Order Placed',
      total: totalAmount,
      advancePaid: paid,
      remainingAmount: remaining,
      items: [{ product: selectedProduct, quantity }],
      customerInfo: {
        name: customerInfo.name,
        phone: customerInfo.phone,
        address: `${customerInfo.address}, ${customerInfo.city}, ${customerInfo.pincode}, ${customerInfo.country}`
      }
    });
    
    router.push('/profile?newOrder=' + newOrderId);
  };

  return (
    <div className="min-h-[80vh] bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        
        {/* Header with Exit option */}
        {step < 6 && (
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Place Order</h1>
            <button onClick={handleExit} className="flex items-center gap-1 text-gray-500 hover:text-red-600 transition font-medium">
              <X size={18} /> Exit
            </button>
          </div>
        )}

        {/* Progress Bar */}
        {step < 6 && (
          <div className="mb-8">
            <div className="flex justify-between items-center relative">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 z-0 rounded-full"></div>
              <div 
                className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-green-600 z-0 rounded-full transition-all duration-300"
                style={{ width: `${((Math.min(step, 4) - 1) / 3) * 100}%` }}
              ></div>
              
              {[1, 2, 3, 4].map((s) => (
                <div key={s} className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= s ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                  {s}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs font-medium text-gray-500 mt-2">
              <span>Details</span>
              <span>Address</span>
              <span>Verify</span>
              <span>Payment</span>
            </div>
          </div>
        )}

        <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100 relative">
          
          {/* STEP 1: ORDER DETAILS */}
          {step === 1 && (
            <div className="p-6 md:p-8">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">{selectedProduct.name}</h3>
                    <div className="mt-2 inline-block border-2 border-green-700 text-green-700 bg-green-50 font-bold px-3 py-1 text-sm rounded-lg">
                      {selectedProduct.weight}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900 text-xl">₹{selectedProduct.price}</p>
                  </div>
                </div>
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
                <span className="text-gray-600">Delivery Charge</span>
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
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Country</label>
                  <input 
                    required 
                    type="text" 
                    value={customerInfo.country}
                    onChange={(e) => setCustomerInfo({...customerInfo, country: e.target.value})}
                    className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-green-500" 
                    placeholder="India" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Complete Delivery Address</label>
                  <textarea 
                    required 
                    rows={2}
                    value={customerInfo.address}
                    onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})}
                    className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-green-500" 
                    placeholder="House no, Building, Street, Area"
                  ></textarea>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">City</label>
                    <input 
                      required 
                      type="text" 
                      value={customerInfo.city}
                      onChange={(e) => setCustomerInfo({...customerInfo, city: e.target.value})}
                      className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-green-500" 
                      placeholder="Mumbai" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">PIN Code</label>
                    <input 
                      required 
                      type="text" 
                      value={customerInfo.pincode}
                      onChange={(e) => setCustomerInfo({...customerInfo, pincode: e.target.value})}
                      className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-green-500" 
                      placeholder="400001" 
                    />
                  </div>
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

          {/* STEP 4: PAYMENT SELECTION */}
          {step === 4 && (
            <div className="p-6 md:p-8">
              <div className="flex items-center mb-6">
                <button onClick={handleBack} className="mr-3 text-gray-500 hover:text-gray-900 bg-gray-100 p-2 rounded-full">
                  <ArrowLeft size={20} />
                </button>
                <h2 className="text-xl font-bold text-gray-900">Advance Payment Required</h2>
              </div>
              
              <p className="text-gray-600 mb-6 text-sm">To process your order, please make an advance payment. Cash on Delivery is available for the remaining 50% balance.</p>

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
                    <div className="text-sm text-gray-500">Pay ₹{totalAmount / 2} via UPI/QR, remaining on delivery</div>
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
                    <div className="text-sm text-gray-500">Pay full ₹{totalAmount} via UPI/QR</div>
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
                  I have paid ₹{advanceAmount}
                </button>
              </div>

            </div>
          )}

          {/* STEP 5: CONFIRM COD */}
          {step === 5 && (
            <div className="p-6 md:p-8 text-center">
              <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
              <h2 className="font-bold text-2xl mb-2">Payment of ₹{advanceAmount} Successful!</h2>
              <p className="text-gray-600 mb-6">Your advance payment has been received.</p>
              
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-100 mb-8 inline-block text-left w-full max-w-md mx-auto">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-700">Total Order Value:</span>
                  <span className="font-semibold">₹{totalAmount}</span>
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
              
              <button 
                onClick={confirmCOD}
                className="bg-yellow-500 hover:bg-yellow-600 text-green-950 font-bold px-8 py-4 rounded-lg transition w-full flex items-center justify-center gap-2 mx-auto"
              >
                <Banknote size={20} />
                Confirm Cash on Delivery for ₹{remainingAmount}
              </button>
            </div>
          )}

          {/* STEP 6: CONFIRMATION (Summary) */}
          {step === 6 && (
            <div className="p-8 md:p-12 text-center">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle size={40} className="text-green-600" />
                </div>
              </div>
              
              <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Order Placed Successfully!</h2>
              <p className="text-gray-600 mb-8">Thank you for your order.</p>
              
              <div className="bg-white rounded-2xl p-6 w-full max-w-lg mx-auto border border-gray-200 text-left mb-8 shadow-sm">
                <div className="mb-4 pb-4 border-b border-gray-200 text-center">
                  <p className="text-sm text-gray-500 mb-1">Order ID</p>
                  <p className="text-2xl font-bold text-gray-900">{orderId}</p>
                </div>
                
                <h3 className="font-bold text-lg mb-4">Order Summary</h3>
                <div className="space-y-4 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {quantity}x {selectedProduct.name}
                    </span>
                    <span className="font-medium text-gray-900">₹{itemTotal}</span>
                  </div>
                </div>
                
                <div className="border-t pt-4 space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery Charge</span>
                    <span className="font-medium">₹{deliveryCharge}</span>
                  </div>
                  <div className="flex justify-between font-bold text-gray-900 text-base pt-2">
                    <span>Total Amount</span>
                    <span>₹{totalAmount}</span>
                  </div>
                </div>
                
                <div className="border-t mt-4 pt-4 space-y-2 text-sm bg-gray-50 p-4 rounded">
                  <div className="flex justify-between text-green-700 font-medium">
                    <span>Amount Paid</span>
                    <span>₹{advanceAmount}</span>
                  </div>
                  {remainingAmount > 0 && (
                    <div className="flex justify-between text-red-600 font-bold mt-2">
                      <span>Remaining (Cash on Delivery)</span>
                      <span>₹{remainingAmount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-600 mt-2">
                    <span>Payment Status</span>
                    <span className="font-medium capitalize">{remainingAmount > 0 ? 'Partially Paid' : 'Fully Paid'}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  href="/profile"
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 px-8 rounded-xl transition text-center"
                >
                  View Orders
                </Link>
                <Link 
                  href="/"
                  className="bg-green-700 hover:bg-green-800 text-white font-bold py-3 px-8 rounded-xl transition text-center"
                >
                  Continue Shopping
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
