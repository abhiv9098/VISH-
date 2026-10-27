'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useOrders } from '@/context/OrderContext';
import { useGeolocation } from '@/lib/useGeolocation';
import { 
  User, 
  MapPin, 
  Globe, 
  CheckCircle2, 
  Navigation, 
  Phone, 
  Mail, 
  ExternalLink,
  AlertTriangle,
  Loader2,
  Save,
  Package,
  X,
  Edit3,
  Camera,
  ChevronRight,
  ShieldCheck,
  ShoppingBag,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';

export default function ProfilePage() {
  const { orders, customerProfile, updateCustomerProfile } = useOrders();
  const { language, setLanguage, t } = useLanguage();
  const { loading: isLocating, error: locationError, detectLocation, clearMessages } = useGeolocation();

  // State for which section is currently opened by the two small clean buttons: 'personal' | 'address' | null
  const [activeSection, setActiveSection] = useState<'personal' | 'address' | null>('personal');
  // State for edit mode in the active section
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccessNotification, setSaveSuccessNotification] = useState(false);
  const [successText, setSuccessText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: customerProfile?.name || 'Customer',
    phone: customerProfile?.phone || '',
    email: customerProfile?.email || '',
    country: customerProfile?.country || 'India',
    state: customerProfile?.state || '',
    district: customerProfile?.district || '',
    city: customerProfile?.city || '',
    locality: customerProfile?.locality || '',
    pincode: customerProfile?.pincode || '',
    address: customerProfile?.address || '',
    lat: customerProfile?.coordinates?.lat as number | undefined,
    lng: customerProfile?.coordinates?.lng as number | undefined,
    avatar: customerProfile?.avatar || ''
  });

  // Sync form data whenever customerProfile updates from database
  useEffect(() => {
    if (customerProfile) {
      setFormData(prev => ({
        ...prev,
        name: customerProfile.name || prev.name,
        phone: customerProfile.phone || prev.phone,
        email: customerProfile.email || prev.email,
        country: customerProfile.country || prev.country || 'India',
        state: customerProfile.state || prev.state,
        district: customerProfile.district || prev.district,
        city: customerProfile.city || prev.city,
        locality: customerProfile.locality || prev.locality,
        pincode: customerProfile.pincode || prev.pincode,
        address: customerProfile.address || prev.address,
        lat: customerProfile.coordinates?.lat ?? prev.lat,
        lng: customerProfile.coordinates?.lng ?? prev.lng,
        avatar: customerProfile.avatar || prev.avatar
      }));
    }
  }, [customerProfile]);

  // Handle Photo / Avatar upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setFormData(prev => ({ ...prev, avatar: base64 }));
        updateCustomerProfile({
          ...(customerProfile || {
            name: formData.name,
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            pincode: formData.pincode,
            country: 'India',
            isVerified: true
          }),
          avatar: base64
        });
        setSuccessText(language === 'hi' ? 'प्रोफ़ाइल फ़ोटो अपडेट हो गई!' : 'Profile photo updated!');
        setSaveSuccessNotification(true);
        setTimeout(() => setSaveSuccessNotification(false), 3000);
      };
      reader.readAsDataURL(file);
    }
  };

  // "Use Current Location" GPS auto-detection handler
  const handleUseCurrentLocation = async () => {
    clearMessages();
    const geoData = await detectLocation();
    if (geoData) {
      const updatedAddress = geoData.fullAddress || formData.address;
      const updatedCity = geoData.city || formData.city || 'Gurugram';
      const updatedLocality = geoData.locality || formData.locality;
      const updatedPincode = geoData.pincode || formData.pincode;
      const updatedState = geoData.state || formData.state;
      const updatedDistrict = geoData.district || formData.district;
      const updatedCountry = geoData.country || formData.country || 'India';
      const coords = { lat: geoData.lat, lng: geoData.lng };

      setFormData(prev => ({
        ...prev,
        address: updatedAddress,
        city: updatedCity,
        locality: updatedLocality,
        pincode: updatedPincode,
        state: updatedState,
        district: updatedDistrict,
        country: updatedCountry,
        lat: geoData.lat,
        lng: geoData.lng
      }));

      // Immediately persist to database
      updateCustomerProfile({
        name: formData.name.trim() || 'Customer',
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        country: updatedCountry,
        state: updatedState,
        district: updatedDistrict,
        city: updatedCity,
        locality: updatedLocality,
        pincode: updatedPincode,
        address: updatedAddress,
        coordinates: coords,
        liveLocationUrl: geoData.liveLocationUrl || `https://www.google.com/maps?q=${coords.lat},${coords.lng}`,
        avatar: formData.avatar,
        isVerified: true,
        hasDetectedGps: true
      });

      setSuccessText(language === 'hi' ? 'GPS से लोकेशन पहचानी गई और पता भर दिया गया!' : 'Location detected & address auto-filled!');
      setSaveSuccessNotification(true);
      setTimeout(() => setSaveSuccessNotification(false), 3500);
    }
  };

  // Manual save profile
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const coordinates = (formData.lat !== undefined && formData.lng !== undefined && !isNaN(formData.lat) && !isNaN(formData.lng))
      ? { lat: Number(formData.lat), lng: Number(formData.lng) }
      : undefined;

    const liveMapUrl = coordinates
      ? `https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}`
      : formData.address
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${formData.address}, ${formData.city} ${formData.pincode}`)}`
      : undefined;

    updateCustomerProfile({
      name: formData.name.trim() || 'Customer',
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      country: formData.country.trim() || 'India',
      state: formData.state.trim(),
      district: formData.district.trim(),
      city: formData.city.trim(),
      locality: formData.locality.trim(),
      pincode: formData.pincode.trim(),
      address: formData.address.trim(),
      coordinates,
      liveLocationUrl: liveMapUrl,
      avatar: formData.avatar,
      isVerified: true,
      hasDetectedGps: !!coordinates
    });

    setIsEditing(false);
    setSuccessText(language === 'hi' ? 'प्रोफ़ाइल सफलतापूर्वक अपडेट हो गई!' : 'Profile updated successfully!');
    setSaveSuccessNotification(true);
    setTimeout(() => setSaveSuccessNotification(false), 3500);
  };

  // Deduplicate orders to guarantee clean, non-duplicate list
  const uniqueOrders = useMemo(() => {
    const seen = new Set<string>();
    return orders.filter(o => {
      if (!o || !o.id || seen.has(o.id)) return false;
      seen.add(o.id);
      return true;
    });
  }, [orders]);

  const latestOrder = uniqueOrders[0];

  const displayName = formData.name || customerProfile?.name || 'Customer';
  const displayPhone = formData.phone || customerProfile?.phone || '';
  const currentCoords = formData.lat && formData.lng ? { lat: formData.lat, lng: formData.lng } : customerProfile?.coordinates;
  const mapsUrl = currentCoords 
    ? `https://www.google.com/maps?q=${currentCoords.lat},${currentCoords.lng}`
    : formData.address 
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${formData.address}, ${formData.city} ${formData.pincode}`)}`
    : null;

  return (
    <div className="min-h-[85vh] bg-[#f8f9fa] py-4 sm:py-6 px-3 sm:px-6 lg:px-8 max-w-3xl mx-auto space-y-3.5 pb-24 md:pb-12">
      
      {/* Hidden File Input for Avatar Photo Upload */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handlePhotoUpload} 
        accept="image/*" 
        className="hidden" 
      />

      {/* Success Toast Notification */}
      {saveSuccessNotification && (
        <div className="bg-cyan-700 text-white p-3 rounded-xl shadow-md border border-cyan-600 flex items-center justify-between gap-3 text-xs sm:text-sm font-bold animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="text-cyan-200 shrink-0" size={17} />
            <span>{successText}</span>
          </div>
          <button 
            type="button"
            onClick={() => setSaveSuccessNotification(false)}
            className="text-white/80 hover:text-white p-1 rounded cursor-pointer transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* 1. SIMPLE PROFILE HEADER: Avatar, Name, Mobile Number, Edit Button */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-2xs border border-slate-200 flex flex-wrap items-center justify-between gap-3">
        
        {/* User Identity & Avatar */}
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="relative group shrink-0">
            {formData.avatar ? (
              <div className="relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-cyan-600 shadow-xs">
                <Image src={formData.avatar} alt="Profile Photo" fill className="object-cover" />
              </div>
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-cyan-700 text-white ring-2 ring-cyan-100 font-black text-2xl flex items-center justify-center shadow-xs">
                {displayName ? displayName.charAt(0).toUpperCase() : 'C'}
              </div>
            )}
            
            {/* Small Camera Button for photo upload */}
            <button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 bg-white hover:bg-slate-100 text-slate-800 p-1 rounded-full shadow-md border border-slate-200 transition cursor-pointer"
              title="Change Profile Photo"
            >
              <Camera size={12} className="text-cyan-700" />
            </button>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-lg font-black text-slate-900 truncate">{displayName}</h1>
              <span className="bg-cyan-50 text-cyan-800 border border-cyan-200 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-0.5">
                <ShieldCheck size={11} className="text-cyan-600" /> {language === 'hi' ? 'सत्यापित ग्राहक' : 'Verified'}
              </span>
            </div>
            
            {displayPhone ? (
              <p className="text-xs text-slate-600 font-semibold flex items-center gap-1 mt-0.5">
                <Phone size={11} className="text-cyan-700 shrink-0" />
                <span>+91 {displayPhone.replace(/^\+91/, '')}</span>
              </p>
            ) : (
              <p className="text-xs text-slate-400 italic mt-0.5">
                {language === 'hi' ? 'मोबाइल नंबर जोड़ें' : 'Add mobile number'}
              </p>
            )}
          </div>
        </div>

        {/* Edit Profile Button in Header */}
        <div className="shrink-0">
          <button
            type="button"
            onClick={() => {
              if (!activeSection) setActiveSection('personal');
              setIsEditing(!isEditing);
            }}
            className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-95 ${
              isEditing 
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200' 
                : 'bg-cyan-600 hover:bg-cyan-700 text-white shadow-xs'
            }`}
          >
            <Edit3 size={13} className={isEditing ? 'text-slate-600' : 'text-cyan-100'} />
            <span>{isEditing ? (language === 'hi' ? 'रद्द करें' : 'Cancel') : (language === 'hi' ? 'एडिट करें' : 'Edit Profile')}</span>
          </button>
        </div>

      </div>

      {/* 2. TWO SMALL CLEAN BUTTONS (MODERN CYAN & CLEAN WHITE STYLE) */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        
        {/* BUTTON 1: Personal Details */}
        <button
          type="button"
          onClick={() => {
            if (activeSection === 'personal') {
              setActiveSection(null);
              setIsEditing(false);
            } else {
              setActiveSection('personal');
              setIsEditing(false);
            }
          }}
          className={`py-2 px-3 sm:px-4 rounded-xl border text-xs sm:text-sm font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95 ${
            activeSection === 'personal'
              ? 'bg-cyan-600 hover:bg-cyan-700 text-white border-cyan-600 ring-2 ring-cyan-500/25 shadow-sm'
              : 'bg-white hover:bg-cyan-50/70 text-slate-800 border-slate-200 hover:border-cyan-300'
          }`}
        >
          <User size={15} className={activeSection === 'personal' ? 'text-cyan-100' : 'text-cyan-700'} />
          <span>{language === 'hi' ? 'व्यक्तिगत विवरण' : 'Personal Details'}</span>
          {activeSection === 'personal' ? <ChevronUp size={13} className="text-cyan-100" /> : <ChevronDown size={13} className="text-slate-400" />}
        </button>

        {/* BUTTON 2: Delivery Address */}
        <button
          type="button"
          onClick={() => {
            if (activeSection === 'address') {
              setActiveSection(null);
              setIsEditing(false);
            } else {
              setActiveSection('address');
              setIsEditing(false);
            }
          }}
          className={`py-2 px-3 sm:px-4 rounded-xl border text-xs sm:text-sm font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95 ${
            activeSection === 'address'
              ? 'bg-cyan-600 hover:bg-cyan-700 text-white border-cyan-600 ring-2 ring-cyan-500/25 shadow-sm'
              : 'bg-white hover:bg-cyan-50/70 text-slate-800 border-slate-200 hover:border-cyan-300'
          }`}
        >
          <MapPin size={15} className={activeSection === 'address' ? 'text-cyan-100' : 'text-cyan-700'} />
          <span>{language === 'hi' ? 'डिलीवरी पता' : 'Delivery Address'}</span>
          {activeSection === 'address' ? <ChevronUp size={13} className="text-cyan-100" /> : <ChevronDown size={13} className="text-slate-400" />}
        </button>

      </div>

      {/* 3. DYNAMIC CONTENT OPENED BY THE BUTTONS */}

      {/* SECTION 1: PERSONAL DETAILS (Opened by Button 1) */}
      {activeSection === 'personal' && (
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-2xs border border-slate-200 space-y-3 animate-fadeIn">
          
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <User size={16} className="text-cyan-700" />
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">
                {language === 'hi' ? 'व्यक्तिगत विवरण' : 'Personal Details'}
              </h2>
            </div>
            
            <button 
              type="button" 
              onClick={() => setIsEditing(!isEditing)} 
              className="text-[11px] font-bold text-cyan-800 hover:text-cyan-950 transition flex items-center gap-1 cursor-pointer bg-cyan-50 hover:bg-cyan-100 px-2.5 py-1 rounded-lg border border-cyan-200"
            >
              <Edit3 size={11} />
              <span>{isEditing ? (language === 'hi' ? 'रद्द' : 'Cancel') : (language === 'hi' ? 'एडिट' : 'Edit')}</span>
            </button>
          </div>

          {!isEditing ? (
            /* Personal Details View */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  {language === 'hi' ? 'पूरा नाम' : 'Full Name'}
                </span>
                <p className="font-bold text-slate-900 text-sm mt-0.5">{displayName}</p>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  {language === 'hi' ? 'मोबाइल नंबर' : 'Mobile Number'}
                </span>
                <p className="font-bold text-slate-900 text-sm mt-0.5">
                  {displayPhone || <span className="text-slate-400 font-normal italic">{language === 'hi' ? 'सेट नहीं' : 'Not set'}</span>}
                </p>
              </div>

              <div className="sm:col-span-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  {language === 'hi' ? 'ईमेल पता' : 'Email Address'}
                </span>
                <p className="font-semibold text-slate-700 text-xs mt-0.5">
                  {formData.email || <span className="text-slate-400 italic font-normal">{language === 'hi' ? 'वैकल्पिक (सेट नहीं)' : 'Optional (not set)'}</span>}
                </p>
              </div>
            </div>
          ) : (
            /* Personal Details Edit Form */
            <form onSubmit={handleSubmit} className="space-y-3 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    {language === 'hi' ? 'पूरा नाम' : 'Full Name'} *
                  </label>
                  <input 
                    id="profile-name"
                    required
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-cyan-600 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    {language === 'hi' ? 'मोबाइल नंबर' : 'Mobile Number'} *
                  </label>
                  <input 
                    required
                    type="tel"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="10-digit mobile number"
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-cyan-600 font-semibold"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    {language === 'hi' ? 'ईमेल पता (वैकल्पिक)' : 'Email Address (Optional)'}
                  </label>
                  <input 
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@example.com"
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-cyan-600 font-semibold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  {language === 'hi' ? 'रद्द करें' : 'Cancel'}
                </button>

                <button
                  type="submit"
                  className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs px-4 py-1.5 rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Save size={13} className="text-cyan-100" />
                  <span>{language === 'hi' ? 'बदलाव सेव करें' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          )}

        </div>
      )}

      {/* SECTION 2: DELIVERY ADDRESS (Opened by Button 2) */}
      {activeSection === 'address' && (
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-2xs border border-slate-200 space-y-3 animate-fadeIn">
          
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-cyan-700" />
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">
                {language === 'hi' ? 'डिलीवरी पता' : 'Delivery Address'}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              {/* Use Current Location (GPS Auto-fill) Button */}
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={isLocating}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition inline-flex items-center gap-1 cursor-pointer shadow-xs ${
                  isLocating
                    ? 'bg-cyan-100 text-cyan-900 cursor-not-allowed border border-cyan-200'
                    : 'bg-cyan-600 hover:bg-cyan-700 text-white border border-cyan-600'
                }`}
                title="Detect GPS & Auto-fill Address"
              >
                {isLocating ? (
                  <>
                    <Loader2 size={11} className="animate-spin text-cyan-700" />
                    <span>{language === 'hi' ? 'लोकेशन...' : 'Locating...'}</span>
                  </>
                ) : (
                  <>
                    <Navigation size={11} className="text-cyan-100" />
                    <span>{language === 'hi' ? 'GPS से भरें' : 'Use Current Location'}</span>
                  </>
                )}
              </button>

              <button 
                type="button" 
                onClick={() => setIsEditing(!isEditing)} 
                className="text-[11px] font-bold text-cyan-800 hover:text-cyan-950 transition flex items-center gap-1 cursor-pointer bg-cyan-50 hover:bg-cyan-100 px-2.5 py-1 rounded-lg border border-cyan-200"
              >
                <Edit3 size={11} />
                <span>{isEditing ? (language === 'hi' ? 'रद्द' : 'Cancel') : (language === 'hi' ? 'एडिट' : 'Edit')}</span>
              </button>
            </div>
          </div>

          {!isEditing ? (
            /* Delivery Address View */
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  {language === 'hi' ? 'पूरा पता' : 'Full Street Address'}
                </span>
                <p className="font-bold text-slate-900 text-xs sm:text-sm leading-relaxed mt-0.5">
                  {formData.address || (
                    <span className="text-slate-400 italic font-normal">
                      {language === 'hi' ? 'कोई डिलीवरी पता सेट नहीं है। GPS बटन दबाएं या एडिट करें।' : 'No delivery address set yet. Click Use Current Location or Edit.'}
                    </span>
                  )}
                </p>
              </div>

              {/* Address details grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
                {formData.locality && (
                  <div>
                    <span className="text-slate-400 font-bold text-[10px] block">{language === 'hi' ? 'इलाका/लैंडमार्क' : 'Locality'}:</span>
                    <p className="font-bold text-slate-800">{formData.locality}</p>
                  </div>
                )}
                <div>
                  <span className="text-slate-400 font-bold text-[10px] block">{language === 'hi' ? 'शहर' : 'City'}:</span>
                  <p className="font-bold text-slate-800">{formData.city || 'Gurugram'}</p>
                </div>
                {formData.state && (
                  <div>
                    <span className="text-slate-400 font-bold text-[10px] block">{language === 'hi' ? 'राज्य' : 'State'}:</span>
                    <p className="font-bold text-slate-800">{formData.state}</p>
                  </div>
                )}
                <div>
                  <span className="text-slate-400 font-bold text-[10px] block">{language === 'hi' ? 'पिन कोड' : 'PIN Code'}:</span>
                  <p className="font-bold text-slate-800">{formData.pincode || '122001'}</p>
                </div>
              </div>

              {/* GPS Coordinates & Google Maps Link */}
              {currentCoords && (
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                  <div className="flex items-center gap-1.5 text-cyan-800 font-bold">
                    <span className="w-2 h-2 rounded-full bg-cyan-600 animate-pulse" />
                    <span>GPS: {currentCoords.lat.toFixed(4)}, {currentCoords.lng.toFixed(4)}</span>
                  </div>

                  {mapsUrl && (
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      <span>{language === 'hi' ? 'गूगल मैप्स पर देखें' : 'View on Google Maps'}</span>
                      <ExternalLink size={10} />
                    </a>
                  )}
                </div>
              )}

              {locationError && (
                <div className="p-2 bg-red-50 border border-red-200 rounded-lg text-red-700 text-[11px] flex items-center gap-1.5">
                  <AlertTriangle size={13} className="shrink-0" />
                  <span>{locationError}</span>
                </div>
              )}
            </div>
          ) : (
            /* Delivery Address Edit Form */
            <form onSubmit={handleSubmit} className="space-y-3 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    {language === 'hi' ? 'पूरा डिलीवरी पता' : 'Complete Delivery Address'} *
                  </label>
                  <textarea 
                    id="profile-address"
                    required
                    rows={2}
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                    placeholder="House / Flat No., Society / Building, Street, Area"
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-cyan-600 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    {language === 'hi' ? 'इलाका / लैंडमार्क' : 'Locality / Landmark'}
                  </label>
                  <input 
                    type="text"
                    value={formData.locality}
                    onChange={e => setFormData({ ...formData, locality: e.target.value })}
                    placeholder="e.g. Near Metro Station / Main Market"
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-cyan-600 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    {language === 'hi' ? 'शहर' : 'City'} *
                  </label>
                  <input 
                    required
                    type="text"
                    value={formData.city}
                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                    placeholder="e.g. Gurugram"
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-cyan-600 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    {language === 'hi' ? 'जिला' : 'District'}
                  </label>
                  <input 
                    type="text"
                    value={formData.district}
                    onChange={e => setFormData({ ...formData, district: e.target.value })}
                    placeholder="e.g. Dewas"
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-cyan-600 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    {language === 'hi' ? 'राज्य' : 'State'}
                  </label>
                  <input 
                    type="text"
                    value={formData.state}
                    onChange={e => setFormData({ ...formData, state: e.target.value })}
                    placeholder="e.g. Madhya Pradesh"
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-cyan-600 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    {language === 'hi' ? 'पिन कोड' : 'PIN Code'} *
                  </label>
                  <input 
                    required
                    type="text"
                    value={formData.pincode}
                    onChange={e => setFormData({ ...formData, pincode: e.target.value })}
                    placeholder="e.g. 122001"
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-cyan-600 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    {language === 'hi' ? 'देश' : 'Country'} *
                  </label>
                  <input 
                    required
                    type="text"
                    value={formData.country}
                    onChange={e => setFormData({ ...formData, country: e.target.value })}
                    placeholder="India"
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-cyan-600 font-semibold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  {language === 'hi' ? 'रद्द करें' : 'Cancel'}
                </button>

                <button
                  type="submit"
                  className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs px-4 py-1.5 rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Save size={13} className="text-cyan-100" />
                  <span>{language === 'hi' ? 'बदलाव सेव करें' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          )}

        </div>
      )}

      {/* 4. MY ORDERS CARD (Clean, Non-duplicate summary) */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-2xs border border-slate-200 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <ShoppingBag size={16} className="text-cyan-700" />
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">
              {language === 'hi' ? 'मेरे ऑर्डर' : 'My Orders'}
            </h2>
            <span className="bg-slate-100 text-slate-700 text-[10.5px] font-bold px-2 py-0.2 rounded-full border border-slate-200">
              {uniqueOrders.length}
            </span>
          </div>

          <Link 
            href="/order"
            className="text-xs font-black text-cyan-700 hover:text-cyan-900 flex items-center gap-0.5 transition cursor-pointer"
          >
            <span>{language === 'hi' ? 'सभी ऑर्डर देखें' : 'View All'}</span>
            <ChevronRight size={13} />
          </Link>
        </div>

        {/* Latest Order Preview or Clean Empty State */}
        {uniqueOrders.length > 0 && latestOrder ? (
          <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-200/80 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative w-11 h-11 rounded-lg bg-white border border-slate-200 overflow-hidden shrink-0">
                <Image 
                  src={latestOrder.items?.[0]?.product?.image || '/images/wheat_flour.jpg'} 
                  alt="Product" 
                  fill 
                  className="object-cover" 
                />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-slate-900 truncate">
                  {language === 'hi' && latestOrder.items?.[0]?.product?.nameHi 
                    ? latestOrder.items[0].product.nameHi 
                    : (latestOrder.items?.[0]?.product?.name || 'Fresh Chakki Atta')}
                </p>
                <p className="text-[11px] text-slate-500">
                  ₹{latestOrder.total} • {latestOrder.status}
                </p>
              </div>
            </div>

            <Link
              href="/order"
              className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-[11px] px-2.5 py-1 rounded-lg shrink-0 transition shadow-xs"
            >
              {language === 'hi' ? 'ट्रैक करें' : 'Track'}
            </Link>
          </div>
        ) : (
          <div className="text-center py-4 text-xs text-slate-500">
            <p>{language === 'hi' ? 'आपने अभी तक कोई ऑर्डर नहीं दिया है।' : 'No orders placed yet.'}</p>
            <Link href="/" className="text-cyan-700 font-bold hover:underline mt-1 inline-block">
              {language === 'hi' ? 'ताज़ा आटा ऑर्डर करें' : 'Order Fresh Atta'}
            </Link>
          </div>
        )}
      </div>

      {/* 5. APP SETTINGS CARD (Small, Working Hindi/English Toggle) */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-2xs border border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Globe size={16} className="text-cyan-700" />
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
              {language === 'hi' ? 'ऐप की भाषा' : 'App Language'}
            </h3>
            <p className="text-[11px] text-slate-500">
              {language === 'hi' ? 'हिंदी या अंग्रेजी चुनें' : 'Choose Hindi or English'}
            </p>
          </div>
        </div>

        {/* Small Segmented Language Toggle Button */}
        <div 
          className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200"
          role="group"
          aria-label="Language selector"
        >
          <button 
            type="button"
            onClick={() => setLanguage('en')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              language === 'en'
                ? 'bg-cyan-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            English
          </button>
          <button 
            type="button"
            onClick={() => setLanguage('hi')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              language === 'hi'
                ? 'bg-cyan-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            हिंदी
          </button>
        </div>
      </div>

    </div>
  );
}
