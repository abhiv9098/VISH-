import os
import json
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import urllib.request
import random

products = [
  ("Vishwakarma Chakki Fresh Wheat Atta", "Wheat Atta"), 
  ("Multigrain Atta", "Multigrain Atta"), 
  ("Sharbati Wheat Atta", "Wheat Atta"), 
  ("Whole Wheat Atta", "Wheat Atta"), 
  ("Bajra Atta", "Millet Flour"), 
  ("Jowar Atta", "Millet Flour"), 
  ("Ragi Atta", "Millet Flour"), 
  ("Maize Atta", "Corn Flour"), 
  ("Besan", "Gram Flour"), 
  ("Makki Atta", "Corn Flour"), 
  ("Barley Atta", "Other Flour"), 
  ("Sattu", "Other Flour"), 
  ("Chana Atta", "Gram Flour"), 
  ("Soybean Atta", "Other Flour"), 
  ("Oats Atta", "Other Flour"), 
  ("Kuttu Atta", "Other Flour"), 
  ("Rajgira Atta", "Other Flour"), 
  ("Rice Flour", "Other Flour"), 
  ("Moong Dal Flour", "Other Flour"), 
  ("Mixed Millet Atta", "Millet Flour")
]

colors = [
    (46, 125, 50), # Green
    (198, 40, 40), # Red
    (21, 101, 192), # Blue
    (239, 108, 0), # Orange
    (106, 27, 154), # Purple
    (0, 131, 143), # Cyan
    (173, 20, 87), # Pink
    (85, 139, 47), # Light Green
]

img_dir = os.path.join(os.getcwd(), 'public', 'images')
os.makedirs(img_dir, exist_ok=True)

# Generate a base texture image (since unsplash might be slow/rate limited for 20 requests)
def generate_base_texture(color):
    img = Image.new('RGB', (800, 800), color=color)
    # Add some noise/texture for realism
    for x in range(800):
        for y in range(800):
            if random.random() > 0.9:
                r, g, b = img.getpixel((x, y))
                img.putpixel((x, y), (min(255, r + 20), min(255, g + 20), min(255, b + 20)))
    return img.filter(ImageFilter.GaussianBlur(radius=2))

data = []
for i, (name, cat) in enumerate(products):
    filename = name.lower().replace(' ', '_').replace('(', '').replace(')', '') + '.jpg'
    filepath = os.path.join(img_dir, filename)
    
    # Create realistic looking package
    bg_color = random.choice(colors)
    img = Image.new('RGB', (800, 800), color=(240, 240, 240))
    draw = ImageDraw.Draw(img)
    
    # Draw a bag/package shape in the middle
    draw.rounded_rectangle([150, 100, 650, 750], radius=20, fill=bg_color, outline=(200,200,200), width=3)
    
    # Add a white label area
    draw.rounded_rectangle([200, 300, 600, 600], radius=10, fill=(255, 255, 255))
    
    # Add text
    try:
        font_title = ImageFont.truetype("arial.ttf", 36)
        font_sub = ImageFont.truetype("arial.ttf", 24)
        font_brand = ImageFont.truetype("arialbd.ttf", 48)
    except:
        font_title = ImageFont.load_default()
        font_sub = ImageFont.load_default()
        font_brand = ImageFont.load_default()
        
    # Brand Name
    draw.text((400, 200), "VISHWAKARMA", fill=(255,255,255), font=font_brand, anchor="mm")
    draw.text((400, 250), "CHAKKI", fill=(255,200,0), font=font_sub, anchor="mm")
    
    # Product Name (word wrap)
    words = name.split()
    lines = []
    current_line = []
    for word in words:
        current_line.append(word)
        if len(' '.join(current_line)) > 15:
            lines.append(' '.join(current_line))
            current_line = []
    if current_line:
        lines.append(' '.join(current_line))
        
    y_text = 400
    for line in lines:
        draw.text((400, y_text), line, fill=(0,0,0), font=font_title, anchor="mm")
        y_text += 50
        
    draw.text((400, 550), "PREMIUM QUALITY", fill=(100,100,100), font=font_sub, anchor="mm")
    
    # Weight
    weight = "5 KG" if i < 2 else "10 KG" if i < 4 else "1 KG"
    draw.text((400, 680), weight, fill=(255,255,255), font=font_title, anchor="mm")
    
    img.save(filepath)
    
    price = 250 if weight == "5 KG" else 480 if weight == "10 KG" else 90 + (i * 5)
    
    data.append({
      "id": f"vk-prod-{i + 1}",
      "name": name,
      "nameHi": name,
      "weight": weight,
      "price": price,
      "originalPrice": price,
      "discount": 0,
      "rating": round(4.5 + random.random() * 0.5, 1),
      "reviews": random.randint(50, 500),
      "image": f"/images/{filename}",
      "description": f"Premium quality {name}, freshly milled and packed with nutrients. Ideal for healthy daily meals.",
      "descriptionHi": f"Premium quality {name}, freshly milled and packed with nutrients. Ideal for healthy daily meals.",
      "benefits": ["Freshly milled", "High quality", "Nutritious"],
      "ingredients": [f"100% {name.split(' (')[0]}"],
      "category": cat,
      "inStock": True,
      "enabled": True
    })

with open('products_data.json', 'w') as f:
    json.dump(data, f, indent=2)

print("Images and JSON generated successfully!")
