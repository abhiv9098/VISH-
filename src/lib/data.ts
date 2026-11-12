export type Product = {
  id: string;
  name: string;
  nameHi: string;
  weight: string;
  price: number;
  originalPrice: number;
  discount: number;
  rating: number;
  reviews: number;
  image: string;
  description: string;
  descriptionHi: string;
  benefits: string[];
  ingredients: string[];
  category: string;
  inStock: boolean;
};

export const products: Product[] = [
  {
    id: 'p1',
    name: 'Gehu ka Atta (Whole Wheat Flour)',
    nameHi: 'गेहूं का आटा (होल व्हीट)',
    weight: '5 KG',
    price: 280,
    originalPrice: 330,
    discount: 15,
    rating: 4.8,
    reviews: 1245,
    image: '/images/wheat_flour.jpg',
    description: 'Freshly milled from premium MP Sharbati wheat. Our chakki fresh gehu atta makes the softest rotis.',
    descriptionHi: 'प्रीमियम एमपी शरबती गेहूं से ताज़ा पीसा गया। हमारा चक्की फ्रेश आटा सबसे नरम रोटियां बनाता है।',
    benefits: ['High in fiber', 'No added preservatives', 'Milled upon order for freshness'],
    ingredients: ['100% Sharbati Whole Wheat'],
    category: 'Gehu Atta',
    inStock: true,
  },
  {
    id: 'p6',
    name: 'Village Atta (Desi Chakki)',
    nameHi: 'गांव का आटा (देसी चक्की)',
    weight: '5 KG',
    price: 240,
    originalPrice: 280,
    discount: 14,
    rating: 4.9,
    reviews: 2314,
    image: '/images/wheat_flour.jpg',
    description: 'Traditional village-style chakki atta, coarsely ground for authentic taste and maximum nutrition.',
    descriptionHi: 'पारंपरिक देसी चक्की आटा, असली स्वाद और भरपूर पोषण के लिए दरदरा पीसा हुआ।',
    benefits: ['Coarsely ground for fiber', 'Authentic village taste', 'Keeps rotis soft longer'],
    ingredients: ['100% Traditional Desi Wheat'],
    category: 'Gehu Atta',
    inStock: true,
  },
  {
    id: 'p2',
    name: 'Sharbati Atta (MP Sehore)',
    nameHi: 'शरबती आटा (एमपी सिहोर)',
    weight: '5 KG',
    price: 320,
    originalPrice: 380,
    discount: 16,
    rating: 4.9,
    reviews: 890,
    image: '/images/wheat_flour.jpg',
    description: 'Golden grains from the fertile fields of Sehore, MP. Known for sweet taste and ultra-soft rotis.',
    descriptionHi: 'एमपी सिहोर के उपजाऊ खेतों से सुनहरे दाने। मीठे स्वाद और बेहद नरम रोटियों के लिए प्रसिद्ध।',
    benefits: ['Naturally sweet taste', 'Rich in nutrients', 'Premium golden grain wheat'],
    ingredients: ['100% MP Sehore Sharbati Wheat'],
    category: 'Sharbati',
    inStock: true,
  },
  {
    id: 'p3',
    name: 'Chana Sattu (Roasted Gram Flour)',
    nameHi: 'चना सत्तू (भुना हुआ चना)',
    weight: '1 KG',
    price: 180,
    originalPrice: 210,
    discount: 14,
    rating: 4.7,
    reviews: 654,
    image: '/images/sattu_flour.jpg',
    description: 'Pure roasted Bengal gram sattu. High protein energy drink mix and traditional stuffing.',
    descriptionHi: 'शुद्ध भुने हुए चने का सत्तू। हाई प्रोटीन एनर्जी ड्रिंक और पारंपरिक भरावन के लिए उत्तम।',
    benefits: ['High protein energy drink', 'Cooling for stomach', 'Zero preservatives'],
    ingredients: ['100% Roasted Bengal Gram (Chana)'],
    category: 'Sattu',
    inStock: true,
  },
  {
    id: 'p4',
    name: 'Multigrain Atta (7 Grains)',
    nameHi: 'मल्टीग्रेन आटा (7 अनाज)',
    weight: '5 KG',
    price: 340,
    originalPrice: 399,
    discount: 15,
    rating: 4.9,
    reviews: 840,
    image: '/images/multigrain_flour.jpg',
    description: 'Power-packed blend of Wheat, Chana, Jowar, Bajra, Ragi, Oats, and Soya for complete family health.',
    descriptionHi: 'गेहूं, चना, ज्वार, बाजरा, रागी, ओट्स और सोया का पौष्टिक मिश्रण, पूरे परिवार के स्वास्थ्य के लिए।',
    benefits: ['Balanced glycemic index', 'Rich in 7 ancient grains', 'High dietary fiber'],
    ingredients: ['Wheat (65%)', 'Chana (10%)', 'Jowar (5%)', 'Bajra (5%)', 'Ragi (5%)', 'Oats (5%)', 'Soya (5%)'],
    category: 'Multigrain',
    inStock: true,
  },
  {
    id: 'p5',
    name: 'Jowar Atta (Sorghum Flour)',
    nameHi: 'ज्वार का आटा (सोरघम)',
    weight: '2 KG',
    price: 130,
    originalPrice: 150,
    discount: 13,
    rating: 4.6,
    reviews: 420,
    image: '/images/jowar_flour.jpg',
    description: 'Freshly ground gluten-free sorghum flour. Great for weight management and diabetics.',
    descriptionHi: 'ताज़ा पिसा हुआ ग्लूटेन-फ्री ज्वार का आटा। वजन नियंत्रण और शुगर रोगियों के लिए बेहद फायदेमंद।',
    benefits: ['Naturally gluten-free', 'Good for heart and diabetes', 'Aids easy digestion'],
    ingredients: ['100% Whole White Jowar'],
    category: 'Millets',
    inStock: true,
  },
  {
    id: 'p7',
    name: 'Bajra Atta (Pearl Millet)',
    nameHi: 'बाजरा का आटा (पर्ल मिलेट)',
    weight: '2 KG',
    price: 110,
    originalPrice: 130,
    discount: 15,
    rating: 4.7,
    reviews: 380,
    image: '/images/bajra_flour.jpg',
    description: 'Traditional winter grain packed with iron, phosphorus, and essential minerals for strength.',
    descriptionHi: 'पारंपरिक पौष्टिक बाजरा, आयरन और खनिजों से भरपूर जो शरीर को ताकत और गर्माहट देता है।',
    benefits: ['Rich in natural iron', 'Gives sustained energy', 'Traditional winter staple'],
    ingredients: ['100% Whole Green Bajra'],
    category: 'Millets',
    inStock: true,
  },
  {
    id: 'p8',
    name: 'Makka Atta (Yellow Maize)',
    nameHi: 'मक्के का आटा (येलो मेज)',
    weight: '2 KG',
    price: 120,
    originalPrice: 140,
    discount: 14,
    rating: 4.8,
    reviews: 510,
    image: '/images/maize_flour.jpg',
    description: 'Stone ground yellow maize flour for authentic Punjabi Makki ki Roti with Sarson ka Saag.',
    descriptionHi: 'देसी चक्की पर पिसा पीला मक्के का आटा, स्वादिष्ट मक्के की रोटी और सरसों के साग के लिए।',
    benefits: ['Natural carotenoids', 'Rich in dietary fiber', 'Gluten-free traditional flour'],
    ingredients: ['100% Yellow Maize Grains'],
    category: 'Millets',
    inStock: true,
  },
];

export type DeliveryFeasibility = {
  feasible: boolean;
  message: string;
  messageHi: string;
  distanceKm: number;
  deliveryType: 'instant' | 'same_day' | 'standard' | 'not_deliverable';
  estimatedTime: string;
  deliveryFee: number;
};

export const CHAKKI_LOCATION = {
  lat: 22.974471,
  lng: 76.359503,
  name: 'Vishwakarma Atta Chakki',
  address: 'Near Vishwakarma Mandir, Main Market, Sonkach, Dewas, MP 455118'
};

export function checkDeliveryFeasibility(userLat?: number, userLng?: number, address?: string): DeliveryFeasibility {
  return {
    feasible: true,
    message: 'Express Delivery Available in Sonkach & Dewas Area',
    messageHi: 'सोनकच्छ व देवास क्षेत्र में ताज़ा एक्सप्रेस डिलीवरी उपलब्ध है',
    distanceKm: 2.5,
    deliveryType: 'instant',
    estimatedTime: 'Within 45-60 Mins',
    deliveryFee: 0
  };
}

export type OrderItem = {
  product: Product;
  quantity: number;
};

export type OrderStatus = 
  | 'Order Placed'
  | 'Order Confirmed'
  | 'Preparing Your Order'
  | 'Pending'
  | 'Preparing'
  | 'New'
  | 'Confirmed'
  | 'Completed'
  | 'Complete Delivery'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled';

export type CanonicalStatus = 'New' | 'Pending' | 'Confirmed' | 'Out for Delivery' | 'Delivered' | 'Cancelled';

export function getCanonicalStatus(status?: string): CanonicalStatus {
  if (!status) return 'New';
  const s = status.toLowerCase().trim();
  if (s === 'order placed' || s === 'new' || s === 'new order') return 'New';
  if (s === 'order confirmed' || s === 'confirmed' || s === 'accepted') return 'Confirmed';
  if (s === 'pending' || s === 'preparing your order' || s === 'preparing' || s === 'processing' || s === 'ready') return 'Pending';
  if (s === 'out for delivery' || s === 'dispatched') return 'Out for Delivery';
  if (s === 'delivered' || s === 'completed' || s === 'complete delivery') return 'Delivered';
  if (s === 'cancelled' || s === 'canceled') return 'Cancelled';
  return 'New';
}

export function canonicalToDbStatus(canonical: CanonicalStatus): OrderStatus {
  switch (canonical) {
    case 'New': return 'Order Placed';
    case 'Confirmed': return 'Order Confirmed';
    case 'Pending': return 'Preparing Your Order';
    case 'Out for Delivery': return 'Out for Delivery';
    case 'Delivered': return 'Delivered';
    case 'Cancelled': return 'Cancelled';
    default: return 'Order Placed';
  }
}

export type StatusDeliveryTiming = {
  estimatedDelivery: string;
  durationMs: number | null;
};

export function getStatusDeliveryTiming(status: string): StatusDeliveryTiming | null {
  const canonical = getCanonicalStatus(status);
  switch (canonical) {
    case 'Confirmed':
      return {
        estimatedDelivery: 'within 2 hours',
        durationMs: 2 * 60 * 60 * 1000
      };
    case 'Pending':
      return {
        estimatedDelivery: 'within 1 hour',
        durationMs: 1 * 60 * 60 * 1000
      };
    case 'Out for Delivery':
      return {
        estimatedDelivery: 'within 30 mins',
        durationMs: 30 * 60 * 1000
      };
    case 'Delivered':
      return {
        estimatedDelivery: 'Delivered Successfully.',
        durationMs: 0
      };
    default:
      return null;
  }
}

export type Order = {
  id: string;
  date: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  statusUpdatedAt?: string;
  advancePaid?: number;
  remainingAmount?: number;
  deliveryCode?: string;
  deliveryType?: 'instant' | 'same_day' | 'standard' | 'express';
  paymentMethod?: 'cod' | 'online' | 'advance';
  estimatedDelivery?: string;
  estimatedDeliveryTarget?: string;
  isHiddenFromAdmin?: boolean;
  transactionId?: string;
  customerInfo: {
    name: string;
    address: string;
    phone: string;
    email?: string;
    locality?: string;
    city?: string;
    district?: string;
    state?: string;
    pincode?: string;
    country?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
    liveLocationUrl?: string;
  };
};

export const sampleOrders: Order[] = [
  {
    id: "ORD-4040649098",
    date: new Date().toISOString(),
    status: "Order Placed",
    total: 330,
    advancePaid: 330,
    remainingAmount: 0,
    deliveryType: "standard",
    estimatedDelivery: "Tomorrow Morning by 11:30 AM",
    paymentMethod: "online",
    items: [
      {
        product: products[0],
        quantity: 1
      }
    ],
    customerInfo: {
      name: "abhishek",
      phone: "9893249212",
      address: "Sonkach, Sonkatch Tahsil, Dewas, Madhya Pradesh, 455118, India",
      city: "Sonkach",
      district: "Dewas",
      state: "Madhya Pradesh",
      pincode: "455118",
      country: "India",
      coordinates: {
        lat: 22.974471,
        lng: 76.359503
      },
      liveLocationUrl: "https://www.google.com/maps?q=22.974471,76.359503"
    }
  },
  {
    id: "ORD-9045537959",
    date: new Date().toISOString(),
    status: "Order Placed",
    total: 290,
    advancePaid: 0,
    remainingAmount: 290,
    deliveryType: "express",
    estimatedDelivery: "Within 2 hours",
    paymentMethod: "cod",
    items: [
      {
        product: products[1],
        quantity: 1
      }
    ],
    customerInfo: {
      name: "abhishek",
      phone: "9893249212",
      address: "Sonkach, Sonkatch Tahsil, Dewas, Madhya Pradesh, 455118, India",
      city: "Sonkach",
      district: "Dewas",
      state: "Madhya Pradesh",
      pincode: "455118",
      country: "India",
      coordinates: {
        lat: 22.974471,
        lng: 76.359503
      },
      liveLocationUrl: "https://www.google.com/maps?q=22.974471,76.359503"
    }
  },
  {
    id: "ORD-5775723868",
    date: new Date(Date.now() - 86400000).toISOString(),
    status: "Order Confirmed",
    total: 560,
    advancePaid: 0,
    remainingAmount: 560,
    deliveryType: "standard",
    estimatedDelivery: "Tomorrow Morning by 11:30 AM",
    paymentMethod: "cod",
    items: [
      {
        product: products[0],
        quantity: 2
      }
    ],
    customerInfo: {
      name: "Rahul Sharma",
      phone: "9876543210",
      address: "Flat 402, Sunshine Heights, Sector 14, Sonkach, Dewas, 455118",
      city: "Sonkach",
      district: "Dewas",
      state: "Madhya Pradesh",
      pincode: "455118",
      country: "India"
    }
  },
  {
    id: "ORD-8812304911",
    date: new Date(Date.now() - 2 * 86400000).toISOString(),
    status: "Delivered",
    total: 560,
    advancePaid: 560,
    remainingAmount: 0,
    deliveryType: "standard",
    estimatedDelivery: "Delivered Successfully.",
    paymentMethod: "online",
    items: [
      {
        product: products[4],
        quantity: 1
      }
    ],
    customerInfo: {
      name: "Pooja Verma",
      phone: "9826054321",
      address: "Station Road, Near Bus Stand, Dewas, 455001",
      city: "Dewas",
      district: "Dewas",
      state: "Madhya Pradesh",
      pincode: "455001",
      country: "India"
    }
  }
];
