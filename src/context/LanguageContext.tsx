/* eslint-disable */
'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';

type LanguageContextType = {
  language: 'en' | 'hi';
  setLanguage: (lang: 'en' | 'hi') => void;
  t: (key: string) => string;
};

const translations = {
  en: {
    searchPlaceholder: "Search atta and flour...",
    deliverTo: "Deliver to",
    profile: "Profile",
    cart: "Cart",
    shopNow: "Shop Now",
    bestSellers: "Best Sellers",
    home: "Home",
    allProducts: "All Products",
    tagline: "Taaza Aata, Har Din!",
    langSwitch: "हिंदी",
    heroTitle: "Taaza Aata,",
    heroTitleHighlight: "Har Din",
    heroDesc: "Experience the authentic taste of chakki fresh atta, milled only after you order. 100% pure with zero preservatives.",
    feature1Title: "Freshly Milled",
    feature1Desc: "Milled only after your order",
    feature2Title: "100% Pure",
    feature2Desc: "No preservatives or additives",
    feature3Title: "Free Delivery",
    feature3Desc: "On orders above ₹500",
    shopBySize: "Shop by Size",
    viewAll: "View All",
    bulkTitle: "Bulk Order Discount!",
    bulkDesc: "Get flat 15% off on our 25 KG family packs. Perfect for joint families and caterers.",
    shopBulk: "Shop 25 KG Pack",
    addToCart: "Add to Cart",
    addedToCart: "Added to Cart!",
    buyNow: "Buy Now",
    reviews: "reviews",
    weight: "Weight",
    healthBenefits: "Health Benefits",
    ingredients: "Ingredients",
    qualityGuaranteed: "100% Quality Guaranteed",
    freshlyMilledForYou: "Freshly Milled for You",
    shoppingCart: "Shopping Cart",
    orderSummary: "Order Summary",
    subtotal: "Subtotal",
    deliveryCharge: "Delivery Charge",
    discount: "Discount",
    grandTotal: "Grand Total",
    proceedToCheckout: "Proceed to Checkout",
    checkout: "Checkout",
    deliveryAddress: "Delivery Address",
    paymentMethod: "Payment Method",
    placeOrder: "Place Order",
    myOrders: "My Orders",
    profileDetails: "Profile Details",
    savedAddresses: "Saved Addresses",
    logout: "Logout",
    emptyCartTitle: "Your cart is empty",
    emptyCartDesc: "Looks like you haven't added any fresh atta yet.",
    startShopping: "Start Shopping",
    footerDesc: "100% pure, freshly milled atta for your family. We bring the traditional chakki freshness straight to your doorstep.",
    quickLinks: "Quick Links",
    shopAllAtta: "Shop All Atta",
    aboutUs: "About Us",
    contactUs: "Contact Us",
    adminDashboard: "Admin Dashboard",
    categories: "Categories",
    pack1kg: "1 KG Trial Packs",
    pack5kg: "5 KG Family Packs",
    pack10kg: "10 KG Monthly Packs",
    pack25kg: "25 KG Bulk Sacks",
    packMultigrain: "Multigrain & Speciality",
    copyright: "© 2026 Vishwakarma Chakki. All rights reserved.",
    privacyPolicy: "Privacy Policy",
    termsOfService: "Terms of Service",
  },
  hi: {
    searchPlaceholder: "आटा और अन्य उत्पाद खोजें...",
    deliverTo: "डिलीवर करें:",
    profile: "प्रोफ़ाइल",
    cart: "कार्ट",
    shopNow: "अभी खरीदें",
    bestSellers: "सर्वाधिक बिकने वाले",
    home: "होम",
    allProducts: "सभी उत्पाद",
    tagline: "ताज़ा आटा, हर दिन!",
    langSwitch: "English",
    heroTitle: "ताज़ा आटा,",
    heroTitleHighlight: "हर दिन",
    heroDesc: "चक्की के ताज़ा आटे के असली स्वाद का अनुभव करें, जो आपके ऑर्डर के बाद ही पीसा जाता है। 100% शुद्ध और बिना मिलावट के।",
    feature1Title: "ताज़ा पीसा हुआ",
    feature1Desc: "आपके ऑर्डर के बाद ही पीसा जाता है",
    feature2Title: "100% शुद्ध",
    feature2Desc: "कोई प्रिजर्वेटिव या मिलावट नहीं",
    feature3Title: "मुफ़्त डिलीवरी",
    feature3Desc: "₹500 से ऊपर के ऑर्डर पर",
    shopBySize: "वजन के अनुसार खरीदें",
    viewAll: "सभी देखें",
    bulkTitle: "थोक ऑर्डर पर छूट!",
    bulkDesc: "हमारे 25 किलो के फैमिली पैक पर फ्लैट 15% की छूट पाएं। बड़े परिवारों के लिए बिल्कुल सही।",
    shopBulk: "25 किलो पैक खरीदें",
    addToCart: "कार्ट में डालें",
    addedToCart: "कार्ट में डाल दिया!",
    buyNow: "अभी खरीदें",
    reviews: "समीक्षाएं",
    weight: "वजन",
    healthBenefits: "स्वास्थ्य लाभ",
    ingredients: "सामग्री",
    qualityGuaranteed: "100% गुणवत्ता की गारंटी",
    freshlyMilledForYou: "आपके लिए ताज़ा पीसा गया",
    shoppingCart: "शॉपिंग कार्ट",
    orderSummary: "ऑर्डर सारांश",
    subtotal: "उप-कुल",
    deliveryCharge: "डिलीवरी शुल्क",
    discount: "छूट",
    grandTotal: "कुल राशि",
    proceedToCheckout: "चेकआउट करें",
    checkout: "चेकआउट",
    deliveryAddress: "डिलीवरी का पता",
    paymentMethod: "भुगतान का तरीका",
    placeOrder: "ऑर्डर दें",
    myOrders: "मेरे ऑर्डर",
    profileDetails: "प्रोफ़ाइल विवरण",
    savedAddresses: "सहेजे गए पते",
    logout: "लॉग आउट",
    emptyCartTitle: "आपका कार्ट खाली है",
    emptyCartDesc: "ऐसा लगता है कि आपने अभी तक कोई ताज़ा आटा नहीं जोड़ा है।",
    startShopping: "खरीदारी शुरू करें",
    footerDesc: "100% शुद्ध, आपके परिवार के लिए ताज़ा पिसा आटा। हम पारंपरिक चक्की की ताज़गी सीधे आपके दरवाज़े तक लाते हैं।",
    quickLinks: "त्वरित लिंक",
    shopAllAtta: "सभी आटा खरीदें",
    aboutUs: "हमारे बारे में",
    contactUs: "संपर्क करें",
    adminDashboard: "एडमिन डैशबोर्ड",
    categories: "श्रेणियां",
    pack1kg: "1 किलो ट्रायल पैक",
    pack5kg: "5 किलो फैमिली पैक",
    pack10kg: "10 किलो मंथली पैक",
    pack25kg: "25 किलो बल्क पैक",
    packMultigrain: "मल्टीग्रेन और स्पेशियलिटी",
    copyright: "© 2026 विश्वकर्मा चक्की। सर्वाधिकार सुरक्षित।",
    privacyPolicy: "गोपनीयता नीति",
    termsOfService: "सेवा की शर्तें",
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<'en' | 'hi'>('en');

  useEffect(() => {
    const saved = localStorage.getItem('vishwakarma_lang');
    if (saved === 'hi' || saved === 'en') setLanguage(saved);
  }, []);

  const changeLanguage = (lang: 'en' | 'hi') => {
    setLanguage(lang);
    localStorage.setItem('vishwakarma_lang', lang);
  };

  const t = (key: string) => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
}

