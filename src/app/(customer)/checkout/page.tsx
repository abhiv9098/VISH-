/* eslint-disable */
'use client';

import { useCart } from '@/context/CartContext';
import { useOrders } from '@/context/OrderContext';
import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, Truck, CreditCard, Banknote, QrCode, ArrowLeft, MapPin } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutPage() {
  const { cart, getCartTotal, clearCart } = useCart();
  const { addOrder, customerProfile, updateCustomerProfile } = useOrders();
  const router = useRouter();
  
  // Steps: 1: Details, 2: Payment, 3: Success
  const [step, setStep] = useState(1);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    country: 'India',
    address: '',
    city: '',
    pincode: ''
  });
  const [locationVerified, setLocationVerified] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState('');
  
  const [paymentChoice, setPaymentChoice] = useState<'online' | 'cod'>('online');
  const [txnId, setTxnId] = useState('');
  const [txnError, setTxnError] = useState('');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [generatedOrderId, setGeneratedOrderId] = useState('');

  // Fixed Delivery Charge
  const deliveryCharge = 50; 
  const subtotal = getCartTotal();
  const total = subtotal + deliveryCharge;

  // Pre-fill if exists
  useEffect(() => {
    if (customerProfile && customerProfile.name) {
      setCustomerInfo({
        name: customerProfile.name || '',
        phone: customerProfile.phone || '',
        country: customerProfile.country || 'India',
        address: customerProfile.address || '',
        city: customerProfile.city || '',
        pincode: customerProfile.pincode || ''
      });
      // Optionally auto-skip step 1 if all required fields are there?
      // "ye dal de to is per Nahin dalna chahie use per ek hi bar dalna chahie"
      // If we skip automatically, they can edit in profile. Let's just prefill.
    }
  }, [customerProfile]);

  // Automatic Location Tracking
  useEffect(() => {
    if (step === 1 && !locationVerified) {
      detectLocation();
    }
  }, [step]);

  const detectLocation = () => {
    setLocationLoading(true);
    setLocationError('');
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocationVerified(true);
          setLocationLoading(false);
        },
        (error) => {
          setLocationLoading(false);
          setLocationError('Please allow location access to verify address.');
        }
      );
    } else {
      setLocationLoading(false);
      setLocationError('Geolocation not supported.');
    }
  };

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
    if (!locationVerified) {
      alert("Please allow location access to verify your address.");
      return;
    }
    
    // Save to context so it's not asked again
    updateCustomerProfile({
      ...customerInfo,
      isVerified: true
    });
    
    setStep(2);
  };

  const handlePaymentVerification = () => {
    if (paymentChoice === 'online') {
      if (txnId.trim().length < 8) {
        setTxnError('Please enter a valid Transaction ID after payment.');
        return;
      }
      setTxnError('');
    }
    
    placeOrder();
  };

  const placeOrder = () => {
    const newOrderId = `ORD-${Math.floor(Math.random() * 900000) + 100000}`;
    setGeneratedOrderId(newOrderId);
    addOrder({
      id: newOrderId,
      date: new Date().toISOString(),
      status: 'Order Placed',
      total: total,
      advancePaid: paymentChoice === 'online' ? total : 0,
      remainingAmount: paymentChoice === 'cod' ? total : 0,
      items: cart,
      customerInfo: customerInfo
    });
    clearCart();
    setOrderPlaced(true);
  };

  if (orderPlaced) {
    return (
      <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <CheckCircle size={80} className="text-green-500 mb-6" />
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Order Placed Successfully!</h1>
        <p className="text-gray-600 mb-2">Thank you for choosing Vishwakarma Chakki.</p>
        <p className="text-gray-500 mb-8">Order ID: <span className="font-semibold text-gray-800">{generatedOrderId}</span></p>
        
        <div className="bg-gray-50 p-6 rounded-lg w-full max-w-md border border-gray-200 mb-8 text-left">
          <h3 className="font-bold border-b pb-2 mb-4">Order Summary</h3>
          <div className="space-y-2 text-sm text-gray-700">
             <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₹{subtotal}</span>
             </div>
             <div className="flex justify-between">
                <span>Delivery Charge:</span>
                <span>₹{deliveryCharge}</span>
             </div>
             <div className="flex justify-between font-bold text-gray-900 border-t pt-2 mt-2">
                <span>Total:</span>
                <span>₹{total}</span>
             </div>
             <div className="flex justify-between text-green-700 mt-2">
                <span>Payment Status:</span>
                <span className="font-bold">{paymentChoice === 'online' ? 'PAID ONLINE' : 'CASH ON DELIVERY'}</span>
             </div>
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          <button 
            onClick={() => router.push('/profile')}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium px-6 py-2 rounded transition"
          >
            Track Order
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
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-bold text-lg flex items-center gap-2">
                    <Truck className="text-green-700" size={20} /> 
                    Delivery Address & Details
                  </h2>
                  <Link href="/profile" className="text-sm text-blue-600 hover:underline">
                    Edit saved profile?
                  </Link>
                </div>

                <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg mb-6 flex items-start gap-3">
                  <MapPin className="text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-blue-900 text-sm">Location Verification</h4>
                    <p className="text-xs text-blue-700 mb-2">To prevent fake orders, we need to verify your current location.</p>
                    {locationVerified ? (
                      <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded">
                        <CheckCircle size={14} /> Location Verified
                      </span>
                    ) : (
                      <button type="button" onClick={detectLocation} className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700">
                        {locationLoading ? 'Detecting...' : 'Verify Location'}
                      </button>
                    )}
                    {locationError && <p className="text-xs text-red-600 mt-1">{locationError}</p>}
                  </div>
                </div>
                
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
              <button onClick={() => setStep(1)} className="flex items-center gap-1 text-gray-500 hover:text-green-700 text-sm mb-4">
                <ArrowLeft size={16} /> Back to Details
              </button>
              
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                <CreditCard className="text-green-700" size={20} /> 
                Payment Options
              </h2>
              <p className="text-gray-600 mb-6 text-sm">Please choose how you would like to pay for your order.</p>
              
              <div className="space-y-4 mb-8">
                <label className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition ${paymentChoice === 'online' ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
                  <input 
                    type="radio" 
                    name="paymentChoice" 
                    value="online" 
                    checked={paymentChoice === 'online'} 
                    onChange={() => setPaymentChoice('online')}
                    className="w-4 h-4 text-green-600 focus:ring-green-500"
                  />
                  <div>
                    <div className="font-bold text-gray-900">Pay Online via UPI</div>
                    <div className="text-sm text-gray-500">Secure online payment</div>
                  </div>
                </label>
                
                <label className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition ${paymentChoice === 'cod' ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
                  <input 
                    type="radio" 
                    name="paymentChoice" 
                    value="cod" 
                    checked={paymentChoice === 'cod'} 
                    onChange={() => setPaymentChoice('cod')}
                    className="w-4 h-4 text-green-600 focus:ring-green-500"
                  />
                  <div>
                    <div className="font-bold text-gray-900">Cash on Delivery (COD)</div>
                    <div className="text-sm text-gray-500">Pay when your order arrives</div>
                  </div>
                </label>
              </div>
              
              {paymentChoice === 'online' && (
                <div className="bg-gray-50 p-6 rounded-lg text-center border border-gray-200 mb-6">
                  <QrCode size={64} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="font-bold text-lg mb-2">Scan & Pay ₹{total}</h3>
                  <p className="text-sm text-gray-700 mb-2">
                    UPI ID: <span className="font-bold text-blue-700 select-all">9893249212@mbk</span>
                  </p>
                  <p className="text-xs text-gray-500 mb-6">Please transfer the exact amount and enter the Transaction ID below.</p>
                  
                  <div className="max-w-xs mx-auto mb-4 text-left">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Transaction ID (UTR)</label>
                    <input 
                      type="text" 
                      value={txnId} 
                      onChange={e => setTxnId(e.target.value)} 
                      className={`w-full border rounded p-2 outline-none ${txnError ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-green-500'}`} 
                      placeholder="e.g. 123456789012" 
                    />
                    {txnError && <p className="text-xs text-red-500 mt-1">{txnError}</p>}
                  </div>
                </div>
              )}
              
              <button 
                onClick={handlePaymentVerification}
                className="bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-4 rounded-lg transition w-full md:w-auto flex items-center justify-center gap-2 mx-auto"
              >
                {paymentChoice === 'online' ? (
                  <>Verify Payment & Place Order</>
                ) : (
                  <>Confirm COD & Place Order</>
                )}
              </button>
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
