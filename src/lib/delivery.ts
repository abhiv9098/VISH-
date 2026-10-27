import { Product } from './data';

export type DeliveryFeasibility = {
  isExpressAvailable: boolean;
  expressReason?: string;
  estimatedDeliveryTime: string;
  standardDeliveryTime: string;
};

export function checkDeliveryFeasibility(
  items: { product: Product; quantity: number }[] = [],
  city?: string,
  pincode?: string,
  baseDate: Date = new Date()
): DeliveryFeasibility {
  const safeItems = Array.isArray(items) ? items : [];

  // 1. Stock check: Are all items in stock?
  const allInStock = safeItems.length > 0 && safeItems.every(item => item?.product?.inStock !== false);

  // 2. Preparation capacity:
  // Calculate total kilograms. If > 15 kg (or bulk pack), chakki milling and packaging takes longer.
  const totalWeightKg = safeItems.reduce((acc, item) => {
    const wStr = item?.product?.weight || '5 KG';
    const match = wStr.match(/(\d+)/);
    const kg = match ? parseInt(match[1], 10) : 5;
    return acc + (kg * (item?.quantity || 1));
  }, 0);

  const millingCapacityOk = totalWeightKg <= 15;

  // 3. Operating hours & Delivery capacity (8:00 AM to 7:00 PM)
  const currentHour = baseDate instanceof Date && !isNaN(baseDate.getTime()) ? baseDate.getHours() : new Date().getHours();
  const isOperatingHours = currentHour >= 8 && currentHour < 19;

  // 4. Distance / Location: Gurugram, Delhi NCR, or pincodes 122xxx, 110xxx
  const normalizedCity = (city || '').toLowerCase().trim();
  const normalizedPin = (pincode || '').trim();
  const isLocalNCR = 
    !city || 
    normalizedCity.includes('gurugram') || 
    normalizedCity.includes('gurgaon') || 
    normalizedCity.includes('delhi') || 
    normalizedCity.includes('noida') || 
    normalizedPin.startsWith('122') || 
    normalizedPin.startsWith('110');

  const isExpressAvailable = allInStock && millingCapacityOk && isOperatingHours && isLocalNCR;

  let expressReason = '';
  if (!allInStock) {
    expressReason = 'Some items require fresh milling restock';
  } else if (!millingCapacityOk) {
    expressReason = `Bulk order (${totalWeightKg} KG) requires standard milling cycle`;
  } else if (!isOperatingHours) {
    expressReason = 'Express 2-hr delivery operates between 8:00 AM and 7:00 PM';
  } else if (!isLocalNCR && city) {
    expressReason = 'Express 2-hr delivery available in Gurugram / Delhi NCR';
  }

  const formatTime = (d: Date) => {
    try {
      return d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });
    } catch {
      return 'soon';
    }
  };

  const validDate = baseDate instanceof Date && !isNaN(baseDate.getTime()) ? baseDate : new Date();
  const expressTarget = new Date(validDate.getTime() + 2 * 60 * 60 * 1000);
  const standardTarget = new Date(validDate.getTime() + 4 * 60 * 60 * 1000);

  let estimatedDeliveryTime = `Today within 2 hrs (by ${formatTime(expressTarget)})`;
  let standardDeliveryTime = `Today in 3-4 hrs (by ${formatTime(standardTarget)})`;

  if (currentHour >= 19) {
    estimatedDeliveryTime = 'Tomorrow Morning by 10:00 AM';
    standardDeliveryTime = 'Tomorrow Morning by 11:30 AM';
  } else if (currentHour < 8) {
    estimatedDeliveryTime = 'Today Morning by 10:30 AM';
    standardDeliveryTime = 'Today Afternoon by 1:00 PM';
  }

  return {
    isExpressAvailable,
    expressReason,
    estimatedDeliveryTime,
    standardDeliveryTime
  };
}
