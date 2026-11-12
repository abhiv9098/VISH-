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

  // State for which section is currently opened: 'personal' | 'address' | null
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
        coordinates: { lat: geoData.lat, lng: geoData.lng },
        isVerified: true
      });

      setSuccessText(language === 'hi' ? 'GPS से लोकेशन और पता अपडेट हो गया!' : 'GPS location and address auto-filled!');
      setSaveSuccessNotification(true);
      setTimeout(() => setSaveSuccessNotification(false), 3000);
    }
  };

  // Save manual form changes (Personal Details or Address)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateCustomerProfile({
      name: formData.name.trim() || 'Customer',
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      country: formData.country.trim() || 'India',
      state: formData.state.trim(),
      district: formData.district.trim(),
      city: formData.city.trim() || 'Gurugram',
      locality: formData.locality.trim(),
      pincode: formData.pincode.trim(),
      address: formData.address.trim(),
      coordinates: formData.lat && formData.lng ? { lat: formData.lat, lng: formData.lng } : customerProfile?.coordinates,
      isVerified: true,
      avatar: formData.avatar
    });

    setIsEditing(false);
    setSuccessText(language === 'hi' ? 'विवरण सफलतापूर्वक सेव हो गया!' : 'Details saved successfully!');
    setSaveSuccessNotification(true);
    setTimeout(() => setSaveSuccessNotification(false), 3000);
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
    <div className="min-h-[85vh] bg-[#FFF8ED] py-4 sm:py-6 px-3 sm:px-6 lg:px-8 max-w-3xl mx-auto space-y-3.5 pb-32 sm:pb-36 md:pb-12">
      
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
        <div className="bg-[#174D38] text-white p-3 rounded-xl shadow-md border border-[#174D38] flex items-center justify-between gap-3 text-xs sm:text-sm font-bold animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="text-[#D6A63C] shrink-0" size={17} />
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
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-2xs border border-[#E8E0D2] flex flex-wrap items-center justify-between gap-3">
        
        {/* User Identity & Avatar */}
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="relative group shrink-0">
            {formData.avatar ? (
              <div className="relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-[#174D38] shadow-xs">
                <Image src={formData.avatar} alt="Profile Photo" fill sizes="56px" className="object-cover" />
              </div>
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#174D38] to-[#0E3526] text-[#D6A63C] ring-2 ring-[#D6A63C]/30 font-black text-2xl flex items-center justify-center shadow-xs">
                {displayName ? displayName.charAt(0).toUpperCase() : 'C'}
              </div>
            )}
            
            {/* Small Camera Button for photo upload */}
            <button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 bg-white hover:bg-[#FFF8ED] text-[#174D38] p-1 rounded-full shadow-md border border-[#E8E0D2] transition cursor-pointer"
              title="Change Profile Photo"
            >
              <Camera size={12} className="text-[#174D38]" />
            </button>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-lg font-black text-[#174D38] truncate">{displayName}</h1>
              <span className="bg-[#FFF8ED] text-[#174D38] border border-[#E8E0D2] text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 shadow-2xs">
                <ShieldCheck size={11} className="text-[#D6A63C]" /> {language === 'hi' ? 'सत्यापित ग्राहक' : 'Verified'}
              </span>
            </div>
            
            {displayPhone ? (
              <p className="text-xs text-[#777777] font-semibold flex items-center gap-1 mt-0.5">
                <Phone size={11} className="text-[#174D38] shrink-0" />
                <span>+91 {displayPhone.replace(/^\+91/, '')}</span>
              </p>
            ) : (
              <p className="text-xs text-[#777777] italic mt-0.5">
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
                ? 'bg-[#FFF8ED] hover:bg-[#F5EDDE] text-[#174D38] border border-[#E8E0D2]' 
                : 'bg-[#174D38] hover:bg-[#123d2c] text-white shadow-xs'
            }`}
          >
            <Edit3 size={13} className={isEditing ? 'text-[#174D38]' : 'text-[#D6A63C]'} />
            <span>{isEditing ? (language === 'hi' ? 'रद्द करें' : 'Cancel') : (language === 'hi' ? 'एडिट करें' : 'Edit Profile')}</span>
          </button>
        </div>

      </div>

      {/* 2. TWO SMALL CLEAN BUTTONS (CREAM BEIGE & DARK FOREST GREEN) */}
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
              ? 'bg-[#FFF8ED] hover:bg-[#F5EDDE] text-[#174D38] border-[#D6A63C] ring-2 ring-[#D6A63C]/20 shadow-xs'
              : 'bg-white hover:bg-[#FFF8ED]/50 text-[#777777] border-[#E8E0D2] hover:border-[#D6A63C]'
          }`}
        >
          <User size={15} className={activeSection === 'personal' ? 'text-[#174D38]' : 'text-[#777777]'} />
          <span>{language === 'hi' ? 'व्यक्तिगत विवरण' : 'Personal Details'}</span>
          {activeSection === 'personal' ? <ChevronUp size={13} className="text-[#174D38]" /> : <ChevronDown size={13} className="text-[#777777]" />}
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
              ? 'bg-[#FFF8ED] hover:bg-[#F5EDDE] text-[#174D38] border-[#D6A63C] ring-2 ring-[#D6A63C]/20 shadow-xs'
              : 'bg-white hover:bg-[#FFF8ED]/50 text-[#777777] border-[#E8E0D2] hover:border-[#D6A63C]'
          }`}
        >
          <MapPin size={15} className={activeSection === 'address' ? 'text-[#174D38]' : 'text-[#777777]'} />
          <span>{language === 'hi' ? 'डिलीवरी पता' : 'Delivery Address'}</span>
          {activeSection === 'address' ? <ChevronUp size={13} className="text-[#174D38]" /> : <ChevronDown size={13} className="text-[#777777]" />}
        </button>

      </div>

      {/* 3. DYNAMIC CONTENT OPENED BY THE BUTTONS */}

      {/* SECTION 1: PERSONAL DETAILS (Opened by Button 1) */}
      {activeSection === 'personal' && (
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-2xs border border-[#E8E0D2] space-y-3 animate-fadeIn">
          
          <div className="flex items-center justify-between border-b border-[#E8E0D2] pb-2.5">
            <div className="flex items-center gap-2">
              <User size={16} className="text-[#174D38]" />
              <h2 className="text-xs font-black uppercase tracking-wider text-[#174D38]">
                {language === 'hi' ? 'व्यक्तिगत विवरण' : 'Personal Details'}
              </h2>
            </div>
            
            <button 
              type="button" 
              onClick={() => setIsEditing(!isEditing)} 
              className="text-[11px] font-bold text-[#174D38] hover:text-[#123d2c] transition flex items-center gap-1 cursor-pointer bg-[#FFF8ED] hover:bg-[#F5EDDE] px-2.5 py-1 rounded-lg border border-[#E8E0D2]"
            >
              <Edit3 size={11} className="text-[#174D38]" />
              <span>{isEditing ? (language === 'hi' ? 'रद्द' : 'Cancel') : (language === 'hi' ? 'एडिट' : 'Edit')}</span>
            </button>
          </div>

          {!isEditing ? (
            /* Personal Details View */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[10px] font-bold text-[#777777] uppercase tracking-wider block">
                  {language === 'hi' ? 'पूरा नाम' : 'Full Name'}
                </span>
                <p className="font-bold text-[#174D38] text-sm mt-0.5">{displayName}</p>
              </div>

              <div>
                <span className="text-[10px] font-bold text-[#777777] uppercase tracking-wider block">
                  {language === 'hi' ? 'मोबाइल नंबर' : 'Mobile Number'}
                </span>
                <p className="font-bold text-[#174D38] text-sm mt-0.5">
                  {displayPhone || <span className="text-[#777777] font-normal italic">{language === 'hi' ? 'सेट नहीं' : 'Not set'}</span>}
                </p>
              </div>

              <div className="sm:col-span-2">
                <span className="text-[10px] font-bold text-[#777777] uppercase tracking-wider block">
                  {language === 'hi' ? 'ईमेल पता' : 'Email Address'}
                </span>
                <p className="font-semibold text-slate-700 text-xs mt-0.5">
                  {formData.email || <span className="text-[#777777] italic font-normal">{language === 'hi' ? 'वैकल्पिक (सेट नहीं)' : 'Optional (not set)'}</span>}
                </p>
              </div>
            </div>
          ) : (
            /* Personal Details Edit Form */
            <form onSubmit={handleSubmit} className="space-y-3 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#174D38] mb-1">
                    {language === 'hi' ? 'पूरा नाम' : 'Full Name'} *
                  </label>
                  <input 
                    id="profile-name"
                    required
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full border border-[#E8E0D2] rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-[#174D38] focus:border-[#174D38] font-semibold text-[#174D38]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#174D38] mb-1">
                    {language === 'hi' ? 'मोबाइल नंबर' : 'Mobile Number'} *
                  </label>
                  <input 
                    required
                    type="tel"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="10-digit mobile number"
                    className="w-full border border-[#E8E0D2] rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-[#174D38] focus:border-[#174D38] font-semibold text-[#174D38]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-[#174D38] mb-1">
                    {language === 'hi' ? 'ईमेल पता (वैकल्पिक)' : 'Email Address (Optional)'}
                  </label>
                  <input 
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@example.com"
                    className="w-full border border-[#E8E0D2] rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-[#174D38] focus:border-[#174D38] font-semibold text-[#174D38]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E8E0D2]">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-[#777777] hover:bg-[#FFF8ED] transition cursor-pointer"
                >
                  {language === 'hi' ? 'रद्द करें' : 'Cancel'}
                </button>

                <button
                  type="submit"
                  className="bg-[#174D38] hover:bg-[#123d2c] text-white font-bold text-xs px-4 py-1.5 rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Save size={13} className="text-[#D6A63C]" />
                  <span>{language === 'hi' ? 'बदलाव सेव करें' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          )}

        </div>
      )}

      {/* SECTION 2: DELIVERY ADDRESS (Opened by Button 2) */}
      {activeSection === 'address' && (
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-2xs border border-[#E8E0D2] space-y-3 animate-fadeIn">
          
          <div className="flex items-center justify-between border-b border-[#E8E0D2] pb-2.5">
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-[#174D38]" />
              <h2 className="text-xs font-black uppercase tracking-wider text-[#174D38]">
                {language === 'hi' ? 'डिलीवरी पता' : 'Delivery Address'}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              {/* Use Current Location (GPS Auto-fill) Button */}
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={isLocating}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition inline-flex items-center gap-1 cursor-pointer shadow-xs active:scale-95 ${
                  isLocating
                    ? 'bg-[#FFF8ED] text-[#174D38] cursor-not-allowed border border-[#E8E0D2]'
                    : 'bg-[#174D38] hover:bg-[#123d2c] text-white border border-[#174D38]'
                }`}
                title="Detect GPS & Auto-fill Address"
              >
                {isLocating ? (
                  <>
                    <Loader2 size={11} className="animate-spin text-[#174D38]" />
                    <span>{language === 'hi' ? 'लोकेशन...' : 'Locating...'}</span>
                  </>
                ) : (
                  <>
                    <Navigation size={11} className="text-[#D6A63C]" />
                    <span>{language === 'hi' ? 'GPS से भरें' : 'Use Current Location'}</span>
                  </>
                )}
              </button>

              <button 
                type="button" 
                onClick={() => setIsEditing(!isEditing)} 
                className="text-[11px] font-bold text-[#174D38] hover:text-[#123d2c] transition flex items-center gap-1 cursor-pointer bg-[#FFF8ED] hover:bg-[#F5EDDE] px-2.5 py-1 rounded-lg border border-[#E8E0D2]"
              >
                <Edit3 size={11} className="text-[#174D38]" />
                <span>{isEditing ? (language === 'hi' ? 'रद्द' : 'Cancel') : (language === 'hi' ? 'एडिट' : 'Edit')}</span>
              </button>
            </div>
          </div>

          {!isEditing ? (
            /* Delivery Address View */
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-[10px] font-bold text-[#777777] uppercase tracking-wider block">
                  {language === 'hi' ? 'पूरा पता' : 'Full Street Address'}
                </span>
                <p className="font-bold text-[#174D38] text-xs sm:text-sm leading-relaxed mt-0.5">
                  {formData.address || (
                    <span className="text-[#777777] italic font-normal">
                      {language === 'hi' ? 'कोई डिलीवरी पता सेट नहीं है। GPS बटन दबाएं या एडिट करें।' : 'No delivery address set yet. Click Use Current Location or Edit.'}
                    </span>
                  )}
                </p>
              </div>

              {/* Address details grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
                {formData.locality && (
                  <div>
                    <span className="text-[#777777] font-bold text-[10px] block">{language === 'hi' ? 'इलाका/लैंडमार्क' : 'Locality'}:</span>
                    <p className="font-bold text-slate-800">{formData.locality}</p>
                  </div>
                )}
                <div>
                  <span className="text-[#777777] font-bold text-[10px] block">{language === 'hi' ? 'शहर' : 'City'}:</span>
                  <p className="font-bold text-slate-800">{formData.city || 'Gurugram'}</p>
                </div>
                {formData.state && (
                  <div>
                    <span className="text-[#777777] font-bold text-[10px] block">{language === 'hi' ? 'राज्य' : 'State'}:</span>
                    <p className="font-bold text-slate-800">{formData.state}</p>
                  </div>
                )}
                <div>
                  <span className="text-[#777777] font-bold text-[10px] block">{language === 'hi' ? 'पिन कोड' : 'PIN Code'}:</span>
                  <p className="font-bold text-slate-800">{formData.pincode || '122001'}</p>
                </div>
              </div>

              {/* GPS Coordinates & Google Maps Link */}
              {currentCoords && (
                <div className="pt-2 border-t border-[#E8E0D2] flex flex-wrap items-center justify-between gap-2 text-[11px]">
                  <div className="flex items-center gap-1.5 text-[#174D38] font-bold">
                    <span className="w-2 h-2 rounded-full bg-[#D6A63C] animate-pulse" />
                    <span>GPS: {currentCoords.lat.toFixed(4)}, {currentCoords.lng.toFixed(4)}</span>
                  </div>

                  {mapsUrl && (
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-[#174D38] hover:text-[#123d2c] hover:underline"
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
                  <label className="block text-[11px] font-bold text-[#174D38] mb-1">
                    {language === 'hi' ? 'पूरा डिलीवरी पता' : 'Complete Delivery Address'} *
                  </label>
                  <textarea 
                    id="profile-address"
                    required
                    rows={2}
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                    placeholder="House / Flat No., Society / Building, Street, Area"
                    className="w-full border border-[#E8E0D2] rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-[#174D38] focus:border-[#174D38] font-semibold text-[#174D38]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#174D38] mb-1">
                    {language === 'hi' ? 'इलाका / लैंडमार्क' : 'Locality / Landmark'}
                  </label>
                  <input 
                    type="text"
                    value={formData.locality}
                    onChange={e => setFormData({ ...formData, locality: e.target.value })}
                    placeholder="e.g. Near Metro Station / Main Market"
                    className="w-full border border-[#E8E0D2] rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-[#174D38] focus:border-[#174D38] font-semibold text-[#174D38]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#174D38] mb-1">
                    {language === 'hi' ? 'शहर' : 'City'} *
                  </label>
                  <input 
                    required
                    type="text"
                    value={formData.city}
                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                    placeholder="e.g. Gurugram"
                    className="w-full border border-[#E8E0D2] rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-[#174D38] focus:border-[#174D38] font-semibold text-[#174D38]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#174D38] mb-1">
                    {language === 'hi' ? 'जिला' : 'District'}
                  </label>
                  <input 
                    type="text"
                    value={formData.district}
                    onChange={e => setFormData({ ...formData, district: e.target.value })}
                    placeholder="e.g. Dewas"
                    className="w-full border border-[#E8E0D2] rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-[#174D38] focus:border-[#174D38] font-semibold text-[#174D38]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#174D38] mb-1">
                    {language === 'hi' ? 'राज्य' : 'State'}
                  </label>
                  <input 
                    type="text"
                    value={formData.state}
                    onChange={e => setFormData({ ...formData, state: e.target.value })}
                    placeholder="e.g. Madhya Pradesh"
                    className="w-full border border-[#E8E0D2] rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-[#174D38] focus:border-[#174D38] font-semibold text-[#174D38]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#174D38] mb-1">
                    {language === 'hi' ? 'पिन कोड' : 'PIN Code'} *
                  </label>
                  <input 
                    required
                    type="text"
                    value={formData.pincode}
                    onChange={e => setFormData({ ...formData, pincode: e.target.value })}
                    placeholder="e.g. 122001"
                    className="w-full border border-[#E8E0D2] rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-[#174D38] focus:border-[#174D38] font-semibold text-[#174D38]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#174D38] mb-1">
                    {language === 'hi' ? 'देश' : 'Country'} *
                  </label>
                  <input 
                    required
                    type="text"
                    value={formData.country}
                    onChange={e => setFormData({ ...formData, country: e.target.value })}
                    placeholder="India"
                    className="w-full border border-[#E8E0D2] rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-[#174D38] focus:border-[#174D38] font-semibold text-[#174D38]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E8E0D2]">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-[#777777] hover:bg-[#FFF8ED] transition cursor-pointer"
                >
                  {language === 'hi' ? 'रद्द करें' : 'Cancel'}
                </button>

                <button
                  type="submit"
                  className="bg-[#174D38] hover:bg-[#123d2c] text-white font-bold text-xs px-4 py-1.5 rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Save size={13} className="text-[#D6A63C]" />
                  <span>{language === 'hi' ? 'बदलाव सेव करें' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          )}

        </div>
      )}

      {/* 4. MY ORDERS CARD (Clean, Non-duplicate summary) */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-2xs border border-[#E8E0D2] space-y-3">
        <div className="flex items-center justify-between border-b border-[#E8E0D2] pb-2.5">
          <div className="flex items-center gap-2">
            <ShoppingBag size={16} className="text-[#174D38]" />
            <h2 className="text-xs font-black uppercase tracking-wider text-[#174D38]">
              {language === 'hi' ? 'मेरे ऑर्डर' : 'My Orders'}
            </h2>
            <span className="bg-[#FFF8ED] text-[#174D38] text-[10.5px] font-bold px-2 py-0.2 rounded-full border border-[#E8E0D2]">
              {uniqueOrders.length}
            </span>
          </div>

          <Link 
            href="/order"
            className="text-xs font-black text-[#174D38] hover:text-[#123d2c] flex items-center gap-0.5 transition cursor-pointer"
          >
            <span>{language === 'hi' ? 'सभी ऑर्डर देखें' : 'View All'}</span>
            <ChevronRight size={13} />
          </Link>
        </div>

        {/* Latest Order Preview or Clean Empty State */}
        {uniqueOrders.length > 0 && latestOrder ? (
          <div className="bg-[#FFF8ED]/80 p-3 rounded-xl border border-[#E8E0D2] flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative w-11 h-11 rounded-lg bg-white border border-[#E8E0D2] overflow-hidden shrink-0">
                <Image 
                  src={latestOrder.items?.[0]?.product?.image || '/images/wheat_flour.jpg'} 
                  alt="Product" 
                  fill 
                  sizes="44px"
                  className="object-cover" 
                />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-[#174D38] truncate">
                  {language === 'hi' && latestOrder.items?.[0]?.product?.nameHi 
                    ? latestOrder.items[0].product.nameHi 
                    : (latestOrder.items?.[0]?.product?.name || 'Fresh Chakki Atta')}
                </p>
                <p className="text-[11px] text-[#777777]">
                  ₹{latestOrder.total} • {latestOrder.status}{latestOrder.estimatedDelivery ? ` • ⏱️ ${latestOrder.estimatedDelivery}` : ''}
                </p>
              </div>
            </div>

            <Link
              href="/order"
              className="bg-[#174D38] hover:bg-[#123d2c] text-white font-bold text-[11px] px-2.5 py-1 rounded-lg shrink-0 transition shadow-xs active:scale-95"
            >
              {language === 'hi' ? 'ट्रैक करें' : 'Track'}
            </Link>
          </div>
        ) : (
          <div className="text-center py-4 text-xs text-[#777777]">
            <p>{language === 'hi' ? 'आपने अभी तक कोई ऑर्डर नहीं दिया है।' : 'No orders placed yet.'}</p>
            <Link href="/" className="text-[#174D38] font-bold hover:underline mt-1 inline-block">
              {language === 'hi' ? 'ताज़ा आटा ऑर्डर करें' : 'Order Fresh Atta'}
            </Link>
          </div>
        )}
      </div>

      {/* 5. APP SETTINGS CARD (Small, Working Hindi/English Toggle) */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-2xs border border-[#E8E0D2] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Globe size={16} className="text-[#174D38]" />
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-[#174D38]">
              {language === 'hi' ? 'ऐप की भाषा' : 'App Language'}
            </h3>
            <p className="text-[11px] text-[#777777]">
              {language === 'hi' ? 'हिंदी या अंग्रेजी चुनें' : 'Choose Hindi or English'}
            </p>
          </div>
        </div>

        {/* Small Segmented Language Toggle Button */}
        <div 
          className="flex items-center bg-[#FFF8ED] p-0.5 rounded-xl border border-[#E8E0D2]"
          role="group"
          aria-label="Language selector"
        >
          <button 
            type="button"
            onClick={() => setLanguage('en')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              language === 'en'
                ? 'bg-[#174D38] text-white shadow-xs'
                : 'text-[#777777] hover:text-[#174D38]'
            }`}
          >
            English
          </button>
          <button 
            type="button"
            onClick={() => setLanguage('hi')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              language === 'hi'
                ? 'bg-[#174D38] text-white shadow-xs'
                : 'text-[#777777] hover:text-[#174D38]'
            }`}
          >
            हिंदी
          </button>
        </div>
      </div>

      {/* 6. ADMIN PORTAL ACCESS (Quick Entry for Store Owner / Staff) */}
      <div className="bg-gradient-to-r from-[#062e1e] to-[#0b482d] text-white rounded-2xl p-4 sm:p-5 shadow-sm border border-emerald-800/40 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-300 shrink-0">
            <ShieldCheck size={20} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-black uppercase tracking-wider text-amber-300 truncate">
                {language === 'hi' ? 'एडमिन पैनल (मालिक/स्टाफ)' : 'Admin Panel (Store Owner)'}
              </h3>
              <span className="bg-red-600 text-white text-[8px] font-black px-1.5 py-0.2 rounded-full animate-pulse shadow-2xs">
                NEW
              </span>
            </div>
            <p className="text-[11px] text-emerald-100/75 truncate">
              {language === 'hi' ? 'ऑर्डर, दाम व ग्राहक संभालें' : 'Manage orders, products & settings'}
            </p>
          </div>
        </div>

        <Link
          href="/admin"
          className="bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-[#062e1e] font-black text-xs px-3.5 py-2 rounded-xl transition shadow-xs flex items-center gap-1.5 active:scale-95 shrink-0"
        >
          <span>{language === 'hi' ? 'खोलें' : 'Open'}</span>
          <ChevronRight size={15} />
        </Link>
      </div>

    </div>
  );
}
