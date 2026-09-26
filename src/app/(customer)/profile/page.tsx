/* eslint-disable */
'use client';

import React, { useState } from 'react';
import { useOrders } from '@/context/OrderContext';
import { User, Package, MapPin, LogOut, Globe, MoreVertical } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import OrderTracking from '@/components/OrderTracking';

export default function ProfilePage() {
  const { orders, customerProfile, updateCustomerProfile } = useOrders();
  const { language, setLanguage, t } = useLanguage();
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'orders' | 'profile'>('orders');

  const [editProfile, setEditProfile] = useState({
    name: customerProfile?.name || 'Rahul Sharma',
    phone: customerProfile?.phone || '+91 9876543210',
    country: customerProfile?.country || 'India',
    address: customerProfile?.address || '',
    city: customerProfile?.city || '',
    pincode: customerProfile?.pincode || ''
  });
  const [saved, setSaved] = useState(false);

  React.useEffect(() => {
    if (orders.length > 0 && !expandedOrder) {
      setExpandedOrder(orders[0].id);
    }
  }, [orders]);

  const toggleTracking = (orderId: string) => {
    setExpandedOrder(prev => prev === orderId ? null : orderId);
  };

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateCustomerProfile({
      ...editProfile,
      isVerified: true
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar */}
        <div className="w-full md:w-1/4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold text-3xl mb-4">
                {editProfile.name.charAt(0).toUpperCase()}
              </div>
              <h2 className="text-xl font-bold text-gray-900">{editProfile.name}</h2>
              <p className="text-sm text-gray-500">{editProfile.phone}</p>
            </div>
            
            <nav className="space-y-1 border-t pt-4">
              <button 
                onClick={() => setActiveTab('orders')}
                className={`w-full flex items-center gap-3 px-4 py-3 font-medium rounded-lg transition ${activeTab === 'orders' ? 'bg-green-50 text-green-700' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <Package size={18} /> {t('myOrders')}
              </button>
              <button 
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center gap-3 px-4 py-3 font-medium rounded-lg transition ${activeTab === 'profile' ? 'bg-green-50 text-green-700' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <User size={18} /> {t('profileDetails')}
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 font-medium rounded-lg transition">
                <MapPin size={18} /> {t('savedAddresses')}
              </button>
              <button 
                onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
                className="w-full flex items-center gap-3 px-4 py-3 text-blue-600 hover:bg-blue-50 font-medium rounded-lg transition mt-2"
              >
                <Globe size={18} /> {language === 'en' ? 'Change Language (HI)' : 'हिन्दी (EN)'}
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 font-medium rounded-lg transition mt-4">
                <LogOut size={18} /> {t('logout')}
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="w-full md:w-3/4">
          
          {activeTab === 'profile' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Edit Profile & Address</h2>
              
              <form onSubmit={handleProfileSave}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input required type="text" value={editProfile.name} onChange={e => setEditProfile({...editProfile, name: e.target.value})} className="w-full border border-gray-300 rounded p-2 outline-none focus:border-green-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                    <input required type="tel" value={editProfile.phone} onChange={e => setEditProfile({...editProfile, phone: e.target.value})} className="w-full border border-gray-300 rounded p-2 outline-none focus:border-green-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                    <input required type="text" value={editProfile.country} onChange={e => setEditProfile({...editProfile, country: e.target.value})} className="w-full border border-gray-300 rounded p-2 outline-none focus:border-green-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                    <input required type="text" value={editProfile.pincode} onChange={e => setEditProfile({...editProfile, pincode: e.target.value})} className="w-full border border-gray-300 rounded p-2 outline-none focus:border-green-500" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Complete Address</label>
                    <textarea required value={editProfile.address} onChange={e => setEditProfile({...editProfile, address: e.target.value})} className="w-full border border-gray-300 rounded p-2 outline-none focus:border-green-500" rows={3}></textarea>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input required type="text" value={editProfile.city} onChange={e => setEditProfile({...editProfile, city: e.target.value})} className="w-full border border-gray-300 rounded p-2 outline-none focus:border-green-500" />
                  </div>
                </div>
                
                <div className="mt-6 flex items-center gap-4">
                  <button type="submit" className="bg-green-700 hover:bg-green-800 text-white font-medium px-8 py-3 rounded-lg transition">
                    Save Profile
                  </button>
                  {saved && <span className="text-green-600 font-medium">Profile saved successfully!</span>}
                </div>
              </form>
            </div>
          )}

          {activeTab === 'orders' && (
            <>
              <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('myOrders')}</h1>
              
              {orders.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 text-center">
                  <Package size={48} className="mx-auto text-gray-300 mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No orders yet</h3>
                  <p className="text-gray-500 mb-6">You haven't placed any orders with us yet.</p>
                  <Link href="/products" className="bg-yellow-500 hover:bg-yellow-600 text-green-950 font-bold px-6 py-2 rounded transition">
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map(order => (
                    <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                      <div className="bg-gray-50 p-4 border-b flex justify-between items-center gap-4">
                        <div className="flex flex-wrap gap-6">
                          <div>
                            <p className="text-xs text-gray-500 font-medium uppercase mb-1">Order Placed</p>
                            <p className="text-sm font-semibold text-gray-900">{new Date(order.date).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 font-medium uppercase mb-1">Total</p>
                            <p className="text-sm font-semibold text-gray-900">₹{order.total}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 font-medium uppercase mb-1">Order ID</p>
                            <p className="text-sm font-semibold text-gray-900">{order.id}</p>
                          </div>
                        </div>
                        <div>
                          <button 
                            onClick={() => toggleTracking(order.id)}
                            className="p-2 hover:bg-gray-200 rounded-full transition text-gray-600"
                            title="Track Order"
                          >
                            <MoreVertical size={20} />
                          </button>
                        </div>
                      </div>
                      
                      {expandedOrder === order.id && (
                        <div className="px-4 md:px-6">
                          <OrderTracking currentStatus={order.status} city={"your city"} />
                        </div>
                      )}
                      
                      <div className="p-4 md:p-6">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                          <div>
                            <h3 className="font-bold text-lg text-gray-900 mb-1">
                              Status: <span className="text-green-600">{order.status}</span>
                            </h3>
                            <p className="text-sm text-gray-600 max-w-sm">
                              <span className="font-semibold text-gray-800">Delivery Address:</span> {order.customerInfo?.address || 'N/A'}
                            </p>
                          </div>
                          {order.status === 'Delivered' && order.remainingAmount > 0 && (
                            <button className="bg-green-600 hover:bg-green-700 text-white text-sm font-bold px-5 py-2.5 rounded-lg shadow-sm transition">
                              Pay Remaining Amount (₹{order.remainingAmount})
                            </button>
                          )}
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <h4 className="text-sm font-bold text-gray-900 border-b pb-2">Items</h4>
                            {order.items.map((item, idx) => (
                              <div key={idx} className="flex gap-4 items-center">
                                <div className="relative w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                                  <Image src={item.product.image} alt={item.product.name} fill className="object-cover" />
                                </div>
                                <div className="flex-1">
                                  <Link href={`/products/${item.product.id}`} className="font-semibold text-gray-800 hover:text-green-700 transition line-clamp-1">
                                    {item.product.name}
                                  </Link>
                                  <p className="text-sm text-gray-500 mt-1">Weight: {item.product.weight} | Qty: {item.quantity}</p>
                                </div>
                                <div className="font-bold text-gray-900">
                                  ₹{item.product.price * item.quantity}
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-bold text-gray-900 border-b pb-2 mb-4">Payment Details</h4>
                            <div className="bg-gray-50 rounded-lg p-4 space-y-2 border border-gray-100">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Total Amount</span>
                                <span className="font-semibold text-gray-900">₹{order.total}</span>
                              </div>
                              <div className="flex justify-between text-sm text-green-700">
                                <span>Advance Paid</span>
                                <span className="font-semibold">-₹{order.advancePaid || 0}</span>
                              </div>
                              <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                                <span className="font-bold text-gray-900">Remaining Balance</span>
                                <span className="font-bold text-orange-600">₹{order.remainingAmount || 0}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

      </div>
    </div>
  );
}
