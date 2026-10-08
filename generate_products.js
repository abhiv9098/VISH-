const fs = require('fs');
const path = require('path');

const products = [
  { name: "Vishwakarma Chakki Fresh Wheat Atta", cat: "Wheat Atta", color: "2E7D32" },
  { name: "Multigrain Atta", cat: "Multigrain Atta", color: "8D6E63" },
  { name: "Sharbati Wheat Atta", cat: "Wheat Atta", color: "D84315" },
  { name: "Whole Wheat Atta", cat: "Wheat Atta", color: "4E342E" },
  { name: "Bajra Atta (Pearl Millet Flour)", cat: "Millet Flour", color: "558B2F" },
  { name: "Jowar Atta (Sorghum Flour)", cat: "Millet Flour", color: "F9A825" },
  { name: "Ragi Atta (Finger Millet Flour)", cat: "Millet Flour", color: "4527A0" },
  { name: "Maize Atta (Corn Flour)", cat: "Corn Flour", color: "F57F17" },
  { name: "Besan (Gram Flour)", cat: "Gram Flour", color: "FBC02D" },
  { name: "Makki Atta", cat: "Corn Flour", color: "F9A825" },
  { name: "Barley Atta (Jau Flour)", cat: "Other Flour", color: "9E9D24" },
  { name: "Sattu", cat: "Other Flour", color: "AFB42B" },
  { name: "Chana Atta", cat: "Gram Flour", color: "FBC02D" },
  { name: "Soybean Atta", cat: "Other Flour", color: "7CB342" },
  { name: "Oats Atta", cat: "Other Flour", color: "BCAAA4" },
  { name: "Kuttu Atta (Buckwheat Flour)", cat: "Other Flour", color: "5D4037" },
  { name: "Rajgira Atta (Amaranth Flour)", cat: "Other Flour", color: "8D6E63" },
  { name: "Rice Flour", cat: "Other Flour", color: "757575" },
  { name: "Moong Dal Flour", cat: "Other Flour", color: "C0CA33" },
  { name: "Mixed Millet Atta", cat: "Millet Flour", color: "6D4C41" }
];

const data = products.map((p, index) => {
  const weight = index < 2 ? "5 KG" : index < 4 ? "10 KG" : index === 19 ? "5 KG" : "1 KG";
  const price = weight === "5 KG" ? 250 : weight === "10 KG" ? 480 : 90 + (index * 5);
  
  // Create a placeholder that looks a bit like a package with the brand and name
  const text = encodeURIComponent(`VISHWAKARMA\nCHAKKI\n\n${p.name.replace(' (', '\n(')}\n\n${weight} - Premium Quality`);
  const imgUrl = `https://placehold.co/600x800/${p.color}/FFFFFF?text=${text}&font=Montserrat`;

  return {
    id: `vk-prod-${index + 1}`,
    name: p.name,
    nameHi: p.name,
    weight: weight,
    price: price,
    originalPrice: price,
    discount: 0,
    rating: parseFloat((4.5 + Math.random() * 0.5).toFixed(1)),
    reviews: Math.floor(Math.random() * 500) + 50,
    image: imgUrl,
    description: `Premium quality ${p.name}, freshly milled and packed with nutrients. Ideal for healthy daily meals.`,
    descriptionHi: `Premium quality ${p.name}, freshly milled and packed with nutrients. Ideal for healthy daily meals.`,
    benefits: ["Freshly milled", "High quality", "Nutritious"],
    ingredients: [`100% ${p.name.split(' (')[0]}`],
    category: p.cat,
    inStock: true,
    enabled: true
  };
});

fs.writeFileSync(path.join(process.cwd(), 'products_data.json'), JSON.stringify(data, null, 2));
console.log("Products generated successfully!");
