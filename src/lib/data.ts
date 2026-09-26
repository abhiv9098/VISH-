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
    price: 299,
    originalPrice: 350,
    discount: 15,
    rating: 4.8,
    reviews: 1245,
    image: '/images/wheat_flour.jpg',
    description: 'Freshly milled from premium MP Sharbati wheat. Our chakki fresh gehu atta makes the softest rotis.',
    descriptionHi: 'प्रीमियम एमपी शरबती गेहूं से ताज़ा पीसा गया। हमारा चक्की फ्रेश आटा सबसे नरम रोटियां बनाता है।',
    benefits: ['High in fiber', 'No added preservatives', 'Milled upon order for freshness'],
    ingredients: ['100% Sharbati Whole Wheat'],
    category: '5 KG Atta',
    inStock: true,
  },
  {
    id: 'p6',
    name: 'Village Atta (Desi Chakki)',
    nameHi: 'गांव का आटा (देसी चक्की)',
    weight: '10 KG',
    price: 450,
    originalPrice: 500,
    discount: 10,
    rating: 4.9,
    reviews: 2314,
    image: '/images/wheat_flour.jpg', // Placeholder
    description: 'Traditional village-style chakki atta, coarsely ground for authentic taste and maximum nutrition.',
    descriptionHi: 'पारंपरिक गांव-शैली का चक्की आटा, प्रामाणिक स्वाद और अधिकतम पोषण के लिए मोटा पिसा हुआ।',
    benefits: ['Coarse grind for better digestion', '100% Desi Wheat', 'Traditional stone milled'],
    ingredients: ['100% Desi Whole Wheat'],
    category: '10 KG Atta',
    inStock: true,
  },
  {
    id: 'p2',
    name: 'Makki ka Atta (Maize Flour)',
    nameHi: 'मक्की का आटा',
    weight: '1 KG',
    price: 90,
    originalPrice: 110,
    discount: 18,
    rating: 4.7,
    reviews: 856,
    image: '/images/maize_flour.jpg',
    description: 'Authentic yellow Makki ka Atta, perfect for making traditional winter delicacies like Makki ki Roti.',
    descriptionHi: 'शुद्ध पीली मक्की का आटा, सर्दियों के व्यंजनों जैसे मक्की की रोटी बनाने के लिए उत्तम।',
    benefits: ['Rich in iron and zinc', 'Gluten-free', 'High energy source'],
    ingredients: ['100% Yellow Maize (Corn)'],
    category: '1 KG Atta',
    inStock: true,
  },
  {
    id: 'p3',
    name: 'Chana Dal Besan (Gram Flour)',
    nameHi: 'चना दाल बेसन',
    weight: '1 KG',
    price: 130,
    originalPrice: 150,
    discount: 13,
    rating: 4.9,
    reviews: 2104,
    image: '/images/gram_flour.jpg',
    description: 'Pure, unadulterated Besan made from 100% roasted Chana Dal. Ideal for pakoras, laddoos, and curries.',
    descriptionHi: '100% भुनी हुई चना दाल से बना शुद्ध बेसन। पकौड़े, लड्डू और कढ़ी के लिए आदर्श।',
    benefits: ['High protein content', 'No artificial colors', 'Fine texture'],
    ingredients: ['100% Chana Dal (Gram)'],
    category: '1 KG Atta',
    inStock: true,
  },
  {
    id: 'p4',
    name: 'Multigrain Atta (7 Grains)',
    nameHi: 'मल्टीग्रेन आटा (7 अनाज)',
    weight: '5 KG',
    price: 349,
    originalPrice: 399,
    discount: 12,
    rating: 4.5,
    reviews: 342,
    image: '/images/multigrain_flour.jpg',
    description: 'A healthy blend of 7 wholesome grains including Wheat, Oats, Chana, Soya, Maize, Jowar, and Bajra.',
    descriptionHi: 'गेहूं, ओट्स, चना, सोया, मक्का, ज्वार और बाजरा सहित 7 पौष्टिक अनाजों का स्वस्थ मिश्रण।',
    benefits: ['Diabetic friendly', 'Improves digestion', 'Rich in minerals'],
    ingredients: ['Wheat (70%)', 'Oats', 'Chana', 'Soya', 'Maize', 'Jowar', 'Bajra'],
    category: '5 KG Atta',
    inStock: true,
  },
  {
    id: 'p5',
    name: 'Gehu ka Atta (Bulk Family Pack)',
    nameHi: 'गेहूं का आटा (25 किलो पैक)',
    weight: '25 KG',
    price: 1150,
    originalPrice: 1300,
    discount: 11,
    rating: 4.6,
    reviews: 567,
    image: '/images/wheat_flour.jpg',
    description: 'Everyday chakki fresh gehu atta for your family. Economical 25KG pack perfect for large families.',
    descriptionHi: 'आपके परिवार के लिए ताज़ा चक्की आटा। बड़े परिवारों के लिए किफायती 25 किलो का पैक।',
    benefits: ['Economical bulk pack', 'Freshly milled', 'Soft rotis'],
    ingredients: ['100% Whole Wheat'],
    category: '25 KG Atta',
    inStock: true,
  },
  {
    id: 'p7',
    name: 'Bajra ka Atta (Pearl Millet Flour)',
    nameHi: 'बाजरे का आटा',
    weight: '1 KG',
    price: 85,
    originalPrice: 100,
    discount: 15,
    rating: 4.6,
    reviews: 620,
    image: '/images/multigrain_flour.jpg', // Placeholder
    description: 'Freshly ground Bajra Atta, perfect for winter meals. Rich in fiber and essential nutrients.',
    descriptionHi: 'सर्दियों के भोजन के लिए उत्तम ताज़ा पिसा हुआ बाजरे का आटा। फाइबर और आवश्यक पोषक तत्वों से भरपूर।',
    benefits: ['Gluten-free', 'Rich in iron', 'Good for heart health'],
    ingredients: ['100% Pearl Millet'],
    category: '1 KG Atta',
    inStock: true,
  },
  {
    id: 'p8',
    name: 'Jowar ka Atta (Sorghum Flour)',
    nameHi: 'ज्वार का आटा',
    weight: '1 KG',
    price: 95,
    originalPrice: 120,
    discount: 20,
    rating: 4.7,
    reviews: 430,
    image: '/images/multigrain_flour.jpg', // Placeholder
    description: 'High-quality Jowar Atta for soft and nutritious bhakris. A great alternative to wheat for a gluten-free diet.',
    descriptionHi: 'नरम और पौष्टिक भाकरी के लिए उच्च गुणवत्ता वाला ज्वार का आटा। ग्लूटेन मुक्त आहार के लिए गेहूं का एक बेहतरीन विकल्प।',
    benefits: ['Gluten-free', 'High in protein', 'Helps in weight loss'],
    ingredients: ['100% Sorghum'],
    category: '1 KG Atta',
    inStock: true,
  }
];

export type Order = {
  id: string;
  date: string;
  status: 'Order Placed' | 'Processing' | 'Ready' | 'Out for Delivery' | 'Delivered' | 'Cancelled';
  total: number;
  advancePaid: number;
  remainingAmount: number;
  items: { product: Product; quantity: number }[];
  customerInfo: {
    name: string;
    address: string;
    phone: string;
  };
};

export const sampleOrders: Order[] = [
  {
    id: 'ORD-847291',
    date: '2026-09-10T14:30:00Z',
    status: 'Out for Delivery',
    total: 349,
    advancePaid: 174.5,
    remainingAmount: 174.5,
    items: [{ product: products[3], quantity: 1 }],
    customerInfo: {
      name: 'Rahul Sharma',
      address: '123, Rosewood Apartments, Andheri West, Mumbai',
      phone: '+91 9876543210'
    }
  }
];
