/* eslint-disable */
'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';

type LanguageContextType = {
  language: 'en' | 'hi';
  setLanguage: (lang: 'en' | 'hi') => void;
  toggleLanguage: () => void;
  t: (key: string, params?: Record<string, string | number>) => string;
};

const translations: Record<'en' | 'hi', Record<string, string>> = {
  en: {
    // Header & Branding
    brandName: "VISHWAKARMA",
    brandSubtitle: "Atta Chakki",
    langSwitch: "हिंदी",
    switchLanguageTitle: "Switch to Hindi",

    // Home Page
    searchPlaceholder: "Search Gehu Atta, Besan, Multigrain...",
    all: "ALL",
    allProducts: "All Products",
    showingItems: "Showing {count} available items",
    searchResultsFor: 'Search Results for "{query}"',
    productsCategory: "{category} Products",
    clearFilter: "Clear Category Filter ✕",
    noProductsFound: "No products found",
    trySearching: 'Try searching for "Gehu Atta", "Besan", or "Multigrain"',
    resetSearch: "Reset Search",

    // Category Names
    "cat_ALL": "ALL",
    "cat_Gehu Atta": "Gehu Atta",
    "cat_Multigrain Atta": "Multigrain Atta",
    "cat_Makka Atta": "Makka Atta",
    "cat_Besan": "Besan",
    "cat_Bajra Atta": "Bajra Atta",
    "cat_Jowar Atta": "Jowar Atta",

    // Product Card
    orderNow: "Order Now",
    outOfStock: "Out of Stock",
    off: "OFF",
    reviews: "reviews",
    pack: "Pack",

    // Bottom Navigation
    home: "Home",
    myOrders: "My Orders",
    profile: "Profile",

    // Cart
    shoppingCart: "Shopping Cart",
    cartCountTitle: "Shopping Cart ({count} Items)",
    emptyCartTitle: "Your cart is empty",
    emptyCartDesc: "Looks like you haven't added any fresh atta yet.",
    startShopping: "Start Shopping",
    product: "Product",
    price: "Price",
    quantity: "Quantity",
    total: "Total",
    remove: "Remove",
    orderSummary: "Order Summary",
    subtotal: "Subtotal",
    deliveryCharge: "Delivery Charge",
    discount: "Discount",
    grandTotal: "Grand Total",
    inclusiveTaxes: "Inclusive of all taxes",
    proceedToCheckout: "Proceed to Checkout",

    // Checkout Flow
    orderCheckout: "Order Checkout",
    placeOrder: "Place Order",
    stepOf: "Step {current} of {total}",
    step1Title: "1. Order Details",
    step2Title: "2. Delivery Address",
    step3Title: "3. Payment",
    step4Title: "4. Payment",
    selectedPacks: "Selected Flour Packs",
    proceedToAddress: "Proceed to Address",
    proceedToPayment: "Proceed to Payment",
    proceedToVerification: "Proceed to Payment",
    verifyContinue: "Verify & Continue",
    confirmPlaceOrder: "Confirm & Place Order",
    back: "Back",
    personalInformation: "Personal Information",
    fullName: "Full Name *",
    fullNamePlaceholder: "e.g. Rahul Sharma",
    mobileNumber: "Mobile Number *",
    mobileNumberPlaceholder: "10-digit mobile number",
    emailAddress: "Email Address (Optional)",
    emailPlaceholder: "name@example.com",
    completeDeliveryAddress: "Complete / Full Delivery Address *",
    addressPlaceholder: "House / Flat No., Society / Building, Street, Area",
    localityLandmark: "Locality / Landmark",
    localityPlaceholder: "e.g. Near Metro Station / Sadar Bazar",
    city: "City *",
    cityPlaceholder: "e.g. Gurugram",
    district: "District",
    districtPlaceholder: "e.g. Gurugram",
    state: "State",
    statePlaceholder: "e.g. Haryana",
    pincode: "PIN Code *",
    pincodePlaceholder: "e.g. 122001",
    country: "Country",
    useCurrentLocation: "Use My Current Location",
    detectingGps: "Detecting GPS...",
    autoGpsNotice: "Automatic GPS Location Detection",
    autoGpsDesc: "Click below to automatically detect your coordinates and auto-fill address details.",
    verifyOtpTitle: "Verify Mobile Number",
    enterOtpDesc: "Enter the 4-digit code sent to",
    selectPaymentMode: "Select Payment Mode",
    upiOnline: "UPI / Online Payment",
    cod: "Cash on Delivery (COD)",
    freeDelivery: "FREE DELIVERY",

    // Delivery & Express
    expressDelivery: "⚡ Express Delivery (Within 2 Hours)",
    standardDelivery: "Standard Delivery (Today in 3-4 Hours)",
    expressBadge: "⚡ Express 2-Hour",
    standardBadge: "Standard Delivery",
    estDeliveryTime: "Estimated Delivery",
    withinTwoHours: "Within 2 Hours",
    viewDetails: "View Details",
    hideDetails: "Hide Details",
    showTracking: "Show Tracking",
    orderStatus: "Order Status",
    newOrderBadge: "NEW ORDER",
    statusNewOrder: "New Order",
    statusConfirmed: "Confirmed",
    statusPreparing: "Preparing",
    statusOutForDelivery: "Out for Delivery",
    statusDelivered: "Delivered",
    statusCancelled: "Cancelled",

    // My Orders
    myOrdersTitle: "My Orders",
    myOrdersSubtitle: "Track live chakki fresh flour milling & delivery status, and view past orders.",
    totalOrdersCount: "Total Orders: {count}",
    noOrdersYet: "No Orders Yet",
    noOrdersDesc: "You haven't placed any orders yet. Order fresh atta today!",
    exploreFreshAtta: "Explore Fresh Atta on Home",
    orderId: "Order ID",
    dateTime: "Date & Time",
    totalAmount: "Total Amount",
    trackOrder: "Track Order",
    hideTracking: "Hide Tracking",
    orderedProducts: "Ordered Products",
    deliveryDetails: "Delivery Details",
    gpsVerified: "GPS Verified",
    openMaps: "Open Maps",
    paymentBreakdown: "Payment Breakdown",
    itemsSubtotal: "Items Subtotal:",
    deliveryChargeColon: "Delivery Charge:",
    finalAmount: "Final Amount:",
    paymentStatus: "Payment Status:",
    paidOnline: "✅ PAID ONLINE",
    cashOnDeliveryStatus: "💵 CASH ON DELIVERY",

    // Delivery Verification Code & ETA Notifications
    deliveryCodeTitle: "Delivery Verification",
    deliveryCodeBadge: "Required",
    deliveryCodeDesc: "Share this code with your delivery partner.",
    deliveryCodeNote: "Verify upon arrival.",
    deliveryCodeVerified: "Code Verified • Delivered",
    deliveryCodeProtected: "Protected • Visible only to verified customer",
    copyDeliveryCode: "Copy",
    deliveryCodeCopied: "Copied!",
    etaNotificationTitle: "Delivery ETA Notification",
    etaNotificationNotice: "Your order is scheduled for delivery {eta}. Fresh chakki flour is on schedule!",
    etaUpdatedAlert: "Delivery ETA updated to: {eta}",
    notifyPartnerDelivery: "Verified handoff ensures fresh chakki delivery",

    // Order Tracking Stages
    liveOrderStatus: "Live Order Status",
    currentStatusLabel: "Current Status:",
    orderPlaced: "Order Placed",
    orderConfirmed: "Order Confirmed",
    preparingOrder: "Preparing Your Order",
    outForDelivery: "Out for Delivery",
    delivered: "Delivered",
    orderCancelled: "Order Cancelled",
    cancelledDesc: "This order has been cancelled by the customer or admin.",
    estDelivery: "Est. Delivery: Freshly Milled & Delivered Today",
    processingOnChakki: "Your order is being processed freshly on chakki!",
    deliveryPartnerNotice: "Our delivery partner will bring your fresh flour directly to your address in {city}.",

    // Profile Page
    myLocation: "My Location",
    appLanguage: "App Language",
    deliveryAddress: "Delivery Address",
    saveChanges: "Save Changes",
    openInGoogleMaps: "Open in Google Maps",
    locationSavedSuccess: "Location detected & address auto-filled!",
    personalInfo: "Personal Information",
    deliveryGpsDetails: "Delivery & GPS Details",
    manageProfile: "Manage Profile",
    verifiedCustomer: "Verified Customer",
    active: "Active",
    fullNameLabel: "Full Name",
    mobileNumberLabel: "Mobile Number",
    emailLabel: "Email Address",
    accountStanding: "Account Standing",
    chakkiCustomer: "Vishwakarma Chakki Customer",
    streetAddress: "Street / Full Address",
    localityArea: "Locality / Area",
    cityLabel: "City",
    districtLabel: "District",
    stateLabel: "State",
    pincodeLabel: "PIN Code",
    countryLabel: "Country",
    yourFreshAttaOrders: "Your Fresh Atta Orders",
    ordersSnapshotDesc: "You currently have {count} order(s) recorded. Track preparation and delivery in real time.",
    trackViewOrders: "Track & View Orders",
    saveUpdateProfile: "Save & Update Profile",
    profileUpdatedSuccess: "Profile and delivery details updated successfully!",
    noAddressSet: "No Delivery Address Set",
    noAddressDesc: "Click Manage Profile to auto-detect your location with GPS or enter your address details.",
    setDeliveryAddress: "Set Delivery Address",
    cancel: "Cancel",
    gpsLinked: "GPS Linked",
    manualEntry: "Manual Entry",
    viewMap: "View Map",
    gpsCoordinates: "GPS Coordinates:",
    notRecordedGpsNotice: "Coordinates not yet recorded. Use Manage Profile to detect via GPS.",
    notSpecifiedOptional: "Not specified (optional)",
    manageProfileModalTitle: "Manage Profile & Delivery Details",
    manageProfileModalDesc: "Update your contact details and default delivery address for faster flour ordering.",
    sectionPersonalTitle: "1. Personal Information",
    sectionDeliveryTitle: "2. Delivery Address",
    gpsDetectionTitle: "Automatic GPS Location Detection",
    gpsDetectionDesc: "Click below to automatically detect your coordinates and auto-fill address details.",
    useCurrentLocationBtn: "Use Current Location",
    detectingGpsBtn: "Detecting GPS...",
    locationNoticeTitle: "Location Permission or GPS Notice:",
    manualAddressNotice: "You can easily fill or edit your complete address fields manually below.",
    notDetectedYet: "Not detected yet (Use button above or enter address)",

    // Product Details Page
    buyNow: "Buy Now",
    qualityGuaranteed: "100% Quality Guaranteed",
    freshlyMilledForYou: "Freshly Milled for You",
    healthBenefits: "Health Benefits",
    ingredients: "Ingredients",
    otherOptions: "Other Options",

    // Footer
    footerDesc: "100% pure, freshly milled atta for your family. We bring the traditional chakki freshness straight to your doorstep.",
    categories: "Categories",
    pack5kg: "5 KG Family Packs",
    pack10kg: "10 KG Monthly Packs",
    pack25kg: "25 KG Bulk Sacks",
    packMultigrain: "Multigrain & Speciality",
    contactUs: "Contact Us",
    copyright: "© 2026 Vishwakarma Chakki. All rights reserved.",
    privacyPolicy: "Privacy Policy",
    termsOfService: "Terms of Service"
  },
  hi: {
    // Header & Branding
    brandName: "विश्वकर्मा",
    brandSubtitle: "आटा चक्की",
    langSwitch: "English",
    switchLanguageTitle: "Switch to English",

    // Home Page
    searchPlaceholder: "गेहूं का आटा, बेसन, मल्टीग्रेन खोजें...",
    all: "सभी",
    allProducts: "सभी उत्पाद",
    showingItems: "{count} ताज़ा आटा उत्पाद उपलब्ध",
    searchResultsFor: '"{query}" के लिए सर्च परिणाम',
    productsCategory: "{category} उत्पाद",
    clearFilter: "फ़िल्टर हटाएं ✕",
    noProductsFound: "कोई उत्पाद नहीं मिला",
    trySearching: '"गेहूं आटा", "चना बेसन", या "मल्टीग्रेन" खोजें',
    resetSearch: "सर्च रीसेट करें",

    // Category Names
    "cat_ALL": "सभी",
    "cat_Gehu Atta": "गेहूं आटा",
    "cat_Multigrain Atta": "मल्टीग्रेन आटा",
    "cat_Makka Atta": "मक्का आटा",
    "cat_Besan": "चना बेसन",
    "cat_Bajra Atta": "बाजरा आटा",
    "cat_Jowar Atta": "ज्वार आटा",

    // Product Card
    orderNow: "अभी ऑर्डर करें",
    outOfStock: "स्टॉक में नहीं",
    off: "छूट",
    reviews: "समीक्षाएं",
    pack: "पैक",

    // Bottom Navigation
    home: "होम",
    myOrders: "मेरे ऑर्डर",
    profile: "प्रोफ़ाइल",

    // Cart
    shoppingCart: "शॉपिंग कार्ट",
    cartCountTitle: "शॉपिंग कार्ट ({count} आइटम)",
    emptyCartTitle: "आपका कार्ट खाली है",
    emptyCartDesc: "ऐसा लगता है कि आपने अभी तक कोई ताज़ा आटा नहीं जोड़ा है।",
    startShopping: "खरीदारी शुरू करें",
    product: "उत्पाद",
    price: "मूल्य",
    quantity: "मात्रा",
    total: "कुल",
    remove: "हटाएं",
    orderSummary: "ऑर्डर सारांश",
    subtotal: "उप-कुल",
    deliveryCharge: "डिलीवरी शुल्क",
    discount: "छूट",
    grandTotal: "कुल राशि",
    inclusiveTaxes: "सभी कर सहित",
    proceedToCheckout: "चेकआउट करें",

    // Checkout Flow
    orderCheckout: "ऑर्डर चेकआउट",
    placeOrder: "ऑर्डर दें",
    stepOf: "चरण {current} / {total}",
    step1Title: "1. ऑर्डर विवरण",
    step2Title: "2. डिलीवरी पता",
    step3Title: "3. भुगतान",
    step4Title: "4. भुगतान",
    selectedPacks: "चुने हुए आटा पैक",
    proceedToAddress: "पते पर आगे बढ़ें",
    proceedToPayment: "भुगतान पर आगे बढ़ें",
    proceedToVerification: "भुगतान पर आगे बढ़ें",
    verifyContinue: "सत्यापित करें और आगे बढ़ें",
    confirmPlaceOrder: "ऑर्डर कन्फ़र्म करें",
    back: "पीछे जाएं",
    personalInformation: "व्यक्तिगत जानकारी",
    fullName: "पूरा नाम *",
    fullNamePlaceholder: "उदा. राहुल शर्मा",
    mobileNumber: "मोबाइल नंबर *",
    mobileNumberPlaceholder: "10 अंकों का मोबाइल नंबर",
    emailAddress: "ईमेल पता (वैकल्पिक)",
    emailPlaceholder: "name@example.com",
    completeDeliveryAddress: "पूरा डिलीवरी पता *",
    addressPlaceholder: "मकान / फ्लैट नं., सोसायटी / बिल्डिंग, सड़क, इलाका",
    localityLandmark: "इलाका / लैंडमार्क",
    localityPlaceholder: "उदा. मेट्रो स्टेशन के पास / सदर बाज़ार",
    city: "शहर *",
    cityPlaceholder: "उदा. गुरुग्राम",
    district: "जिला",
    districtPlaceholder: "उदा. गुरुग्राम",
    state: "राज्य",
    statePlaceholder: "उदा. हरियाणा",
    pincode: "पिन कोड *",
    pincodePlaceholder: "उदा. 122001",
    country: "देश",
    useCurrentLocation: "मेरा वर्तमान स्थान पहचानें",
    detectingGps: "जीपीएस खोज रहे हैं...",
    autoGpsNotice: "स्वचालित जीपीएस स्थान पहचान",
    autoGpsDesc: "अपने निर्देशांक खोजने और पता स्वतः भरने के लिए नीचे क्लिक करें।",
    verifyOtpTitle: "मोबाइल नंबर सत्यापित करें",
    enterOtpDesc: "दर्ज करें 4-अंकों का कोड जो भेजा गया है",
    selectPaymentMode: "भुगतान का तरीका चुनें",
    upiOnline: "यूपीआई / ऑनलाइन भुगतान",
    cod: "कैश ऑन डिलीवरी (COD)",
    freeDelivery: "मुफ़्त डिलीवरी",

    // Delivery & Express
    expressDelivery: "⚡ एक्सप्रेस डिलीवरी (2 घंटे के भीतर)",
    standardDelivery: "सामान्य डिलीवरी (आज 3-4 घंटों में)",
    expressBadge: "⚡ एक्सप्रेस 2 घंटे",
    standardBadge: "सामान्य डिलीवरी",
    estDeliveryTime: "अनुमानित डिलीवरी",
    withinTwoHours: "2 घंटे के भीतर",
    viewDetails: "विवरण देखें",
    hideDetails: "विवरण छुपाएं",
    showTracking: "ट्रैकिंग देखें",
    orderStatus: "ऑर्डर स्थिति",
    newOrderBadge: "नया ऑर्डर",
    statusNewOrder: "नया ऑर्डर",
    statusConfirmed: "कन्फ़र्म हुआ",
    statusPreparing: "तैयार हो रहा है",
    statusOutForDelivery: "डिलीवरी के लिए निकला",
    statusDelivered: "डिलीवर हो गया",
    statusCancelled: "रद्द किया गया",

    // My Orders
    myOrdersTitle: "मेरे ऑर्डर",
    myOrdersSubtitle: "चक्की के ताज़ा आटे की पिसाई और डिलीवरी स्थिति ट्रैक करें, और पुराने ऑर्डर देखें।",
    totalOrdersCount: "कुल ऑर्डर: {count}",
    noOrdersYet: "अभी तक कोई ऑर्डर नहीं",
    noOrdersDesc: "आपने अभी तक कोई ऑर्डर नहीं दिया है। आज ही ताज़ा आटा ऑर्डर करें!",
    exploreFreshAtta: "होम पर ताज़ा आटा देखें",
    orderId: "ऑर्डर आईडी",
    dateTime: "दिनांक और समय",
    totalAmount: "कुल राशि",
    trackOrder: "ऑर्डर ट्रैक करें",
    hideTracking: "ट्रैकिंग छुपाएं",
    orderedProducts: "ऑर्डर किए गए उत्पाद",
    deliveryDetails: "डिलीवरी विवरण",
    gpsVerified: "जीपीएस सत्यापित",
    openMaps: "मैप्स खोलें",
    paymentBreakdown: "भुगतान विवरण",
    itemsSubtotal: "सामग्री उप-कुल:",
    deliveryChargeColon: "डिलीवरी शुल्क:",
    finalAmount: "कुल देय राशि:",
    paymentStatus: "भुगतान स्थिति:",
    paidOnline: "✅ ऑनलाइन भुगतान किया",
    cashOnDeliveryStatus: "💵 कैश ऑन डिलीवरी",

    // Delivery Verification Code & ETA Notifications
    deliveryCodeTitle: "डिलीवरी वेरिफिकेशन",
    deliveryCodeBadge: "अनिवार्य",
    deliveryCodeDesc: "यह कोड डिलीवरी पार्टनर को बताएं।",
    deliveryCodeNote: "पहुंचने पर सत्यापित करें।",
    deliveryCodeVerified: "कोड सत्यापित • डिलीवर हुआ",
    deliveryCodeProtected: "सुरक्षित • केवल सत्यापित ग्राहक को दृश्य",
    copyDeliveryCode: "कॉपी",
    deliveryCodeCopied: "कॉपी हो गया!",
    etaNotificationTitle: "डिलीवरी समय सूचना",
    etaNotificationNotice: "आपका ऑर्डर {eta} में पहुंचने वाला है। ताज़ा चक्की आटा समय पर पहुंच रहा है!",
    etaUpdatedAlert: "डिलीवरी समय अपडेट हुआ: {eta}",
    notifyPartnerDelivery: "सत्यापित डिलीवरी से ताज़ा चक्की आटा सुरक्षित पहुंचता है",

    // Order Tracking Stages
    liveOrderStatus: "लाइव ऑर्डर स्थिति",
    currentStatusLabel: "वर्तमान स्थिति:",
    orderPlaced: "ऑर्डर दिया गया",
    orderConfirmed: "ऑर्डर कन्फ़र्म हुआ",
    preparingOrder: "ऑर्डर तैयार हो रहा है",
    outForDelivery: "डिलीवरी के लिए निकला",
    delivered: "डिलीवर हो गया",
    orderCancelled: "ऑर्डर रद्द किया गया",
    cancelledDesc: "यह ऑर्डर ग्राहक या एडमिन द्वारा रद्द कर दिया गया है।",
    estDelivery: "अनुमानित डिलीवरी: ताज़ा पीसकर आज ही डिलीवरी",
    processingOnChakki: "आपका ऑर्डर चक्की पर ताज़ा पीसा जा रहा है!",
    deliveryPartnerNotice: "हमारा डिलीवरी पार्टनर आपका ताज़ा आटा सीधे आपके {city} पते पर लाएगा।",

    // Profile Page
    myLocation: "मेरा स्थान",
    appLanguage: "ऐप की भाषा",
    deliveryAddress: "डिलीवरी पता",
    saveChanges: "बदलाव सहेजें",
    openInGoogleMaps: "गूगल मैप्स में खोलें",
    locationSavedSuccess: "स्थान पहचाना गया और पता स्वतः भर गया!",
    personalInfo: "व्यक्तिगत जानकारी",
    deliveryGpsDetails: "डिलीवरी और जीपीएस विवरण",
    manageProfile: "प्रोफ़ाइल प्रबंधित करें",
    verifiedCustomer: "सत्यापित ग्राहक",
    active: "सक्रिय",
    fullNameLabel: "पूरा नाम",
    mobileNumberLabel: "मोबाइल नंबर",
    emailLabel: "ईमेल पता",
    accountStanding: "खाता स्थिति",
    chakkiCustomer: "विश्वकर्मा चक्की ग्राहक",
    streetAddress: "पूरा डिलीवरी पता",
    localityArea: "इलाका / क्षेत्र",
    cityLabel: "शहर",
    districtLabel: "जिला",
    stateLabel: "राज्य",
    pincodeLabel: "पिन कोड",
    countryLabel: "देश",
    yourFreshAttaOrders: "आपके ताज़ा आटा ऑर्डर",
    ordersSnapshotDesc: "आपके वर्तमान में {count} ऑर्डर दर्ज हैं। रीयल-टाइम में तैयारी और डिलीवरी ट्रैक करें।",
    trackViewOrders: "ऑर्डर ट्रैक करें और देखें",
    saveUpdateProfile: "प्रोफ़ाइल सहेजें और अपडेट करें",
    profileUpdatedSuccess: "प्रोफ़ाइल और डिलीवरी विवरण सफलतापूर्वक अपडेट हो गया!",
    noAddressSet: "कोई डिलीवरी पता सेट नहीं है",
    noAddressDesc: "जीपीएस के साथ अपना स्थान खोजने या पता दर्ज करने के लिए प्रोफ़ाइल प्रबंधित करें पर क्लिक करें।",
    setDeliveryAddress: "डिलीवरी पता सेट करें",
    cancel: "रद्द करें",
    gpsLinked: "जीपीएस लिंक",
    manualEntry: "मैन्युअल पता",
    viewMap: "मैप्स देखें",
    gpsCoordinates: "जीपीएस निर्देशांक:",
    notRecordedGpsNotice: "निर्देशांक अभी दर्ज नहीं हैं। जीपीएस द्वारा पता लगाने के लिए 'प्रोफ़ाइल प्रबंधित करें' का उपयोग करें।",
    notSpecifiedOptional: "दर्ज नहीं (वैकल्पिक)",
    manageProfileModalTitle: "प्रोफ़ाइल और डिलीवरी विवरण प्रबंधित करें",
    manageProfileModalDesc: "तेज़ आटा ऑर्डर करने के लिए अपना संपर्क विवरण और डिफ़ॉल्ट डिलीवरी पता अपडेट करें।",
    sectionPersonalTitle: "1. व्यक्तिगत जानकारी",
    sectionDeliveryTitle: "2. डिलीवरी पता",
    gpsDetectionTitle: "स्वचालित जीपीएस स्थान पहचान",
    gpsDetectionDesc: "अपने निर्देशांक खोजने और पता स्वतः भरने के लिए नीचे क्लिक करें।",
    useCurrentLocationBtn: "मेरा वर्तमान स्थान पहचानें",
    detectingGpsBtn: "जीपीएस खोज रहे हैं...",
    locationNoticeTitle: "स्थान अनुमति या जीपीएस सूचना:",
    manualAddressNotice: "आप नीचे आसानी से अपना पूरा पता मैन्युअल रूप से भर या बदल सकते हैं।",
    notDetectedYet: "अभी तक पहचाना नहीं गया (ऊपर दिए गए बटन का उपयोग करें या पता दर्ज करें)",

    // Product Details Page
    buyNow: "अभी खरीदें",
    qualityGuaranteed: "100% गुणवत्ता की गारंटी",
    freshlyMilledForYou: "आपके लिए ताज़ा पीसा गया",
    healthBenefits: "स्वास्थ्य लाभ",
    ingredients: "सामग्री",
    otherOptions: "अन्य विकल्प",

    // Footer
    footerDesc: "100% शुद्ध, आपके परिवार के लिए ताज़ा पिसा आटा। हम पारंपरिक चक्की की ताज़गी सीधे आपके दरवाज़े तक लाते हैं।",
    categories: "श्रेणियां",
    pack5kg: "5 किलो फैमिली पैक",
    pack10kg: "10 किलो मंथली पैक",
    pack25kg: "25 किलो बल्क पैक",
    packMultigrain: "मल्टीग्रेन और स्पेशियलिटी",
    contactUs: "संपर्क करें",
    copyright: "© 2026 विश्वकर्मा चक्की। सर्वाधिकार सुरक्षित।",
    privacyPolicy: "गोपनीयता नीति",
    termsOfService: "सेवा की शर्तें"
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<'en' | 'hi'>('en');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('vishwakarma_lang');
      if (saved === 'hi' || saved === 'en') {
        setLanguage(saved);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const changeLanguage = (lang: 'en' | 'hi') => {
    setLanguage(lang);
    try {
      localStorage.setItem('vishwakarma_lang', lang);
    } catch (e) {
      // ignore
    }
  };

  const toggleLanguage = () => {
    changeLanguage(language === 'en' ? 'hi' : 'en');
  };

  const t = (key: string, params?: Record<string, string | number>) => {
    let str = translations[language]?.[key] || translations['en']?.[key] || key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      });
    }
    return str;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: changeLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
}
