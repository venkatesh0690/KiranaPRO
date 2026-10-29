import { localFreshStore, localFreshProductsByCategory, localFreshProductsList } from './localfresh.js';
import { sampleAreaStores } from './sampleAreaStores.js';

export const stores = [
  localFreshStore,
  ...sampleAreaStores,
  {
    id: 1,
    name: "Sharma General Store",
    owner: "Rajesh Sharma",
    rating: 4.8,
    reviewCount: 312,
    deliveryTime: "Within 20 mins",
    deliveryFee: 15,
    distance: "0.4 km",
    minOrder: 99,
    address: "Shop 4, Maddilapalem Main Road, Vizag",
    isOpen: true,
    isFeatured: true,
    offer: "Free delivery above ₹300",
    tags: ["Daily Groceries", "Dairy & Eggs", "Snacks"],
    image: "🏪",
    posterImage: "https://unsplash.com/photos/bAKYjjvAQIE/download?force=true&w=960",
    posterBadge: "⚡ 20-30 mins delivery",
    posterTagline: "Your Trusted Neighborhood Kirana • Daily Dairy & Breakfast",
    coverFrom: "#FF6E40",
    coverTo: "#FF3D00",
    categories: ["Dairy & Breakfast", "Fresh Produce", "Snacks & Munchies", "Cold Drinks & Juices", "Household Staples", "Personal Care"],
  },
  {
    id: 2,
    name: "Sri Lakshmi Provisions",
    owner: "Lakshmi Devi",
    rating: 4.9,
    reviewCount: 428,
    deliveryTime: "Within 20 mins",
    deliveryFee: 20,
    distance: "0.3 km",
    minOrder: 79,
    address: "Near Hanuman Temple, MVP Colony, Vizag",
    isOpen: true,
    isFeatured: true,
    offer: "Free delivery above ₹300",
    tags: ["Authentic Spices", "Pulses & Grains", "Ghee & Oils"],
    image: "🛒",
    posterImage: "https://unsplash.com/photos/Gwf6GRmkT1Y/download?force=true&w=960",
    posterBadge: "⚡ 20-30 mins delivery",
    posterTagline: "Handpicked South Indian Spices, Cold-Pressed Oils & Heritage Grains",
    serviceAreas: ["MVP Colony"],
    coverFrom: "#00A86B",
    coverTo: "#0C8A4E",
    categories: ["Pulses & Grains", "Spices & Masala", "Oils & Ghee", "Dairy & Breakfast", "Pickles & Chutneys"],
  },
  {
    id: 3,
    name: "Venkateswara Kirana",
    owner: "Venkat Rao",
    rating: 4.7,
    reviewCount: 540,
    deliveryTime: "Within 30 mins",
    deliveryFee: 20,
    distance: "0.8 km",
    minOrder: 129,
    address: "Sector 3, Seethammadhara, Vizag",
    isOpen: true,
    isFeatured: false,
    offer: "Free delivery above ₹300",
    tags: ["All-in-One", "Beverages", "Instant Food"],
    image: "🏬",
    posterImage: "https://unsplash.com/photos/7H-CWW3rz9U/download?force=true&w=960",
    posterBadge: "⚡ 20-30 mins delivery",
    posterTagline: "Instant Munchies, Chilled Drinks & Everyday Household Needs",
    coverFrom: "#0284C7",
    coverTo: "#0369A1",
    categories: ["Dairy & Breakfast", "Cold Drinks & Juices", "Snacks & Munchies", "Household Staples", "Baby & Hygiene"],
  },
  {
    id: 4,
    name: "Ramaiah Supermart",
    owner: "Ramaiah Naidu",
    rating: 4.6,
    reviewCount: 215,
    deliveryTime: "Within 30 mins",
    deliveryFee: 25,
    distance: "1.2 km",
    minOrder: 149,
    address: "Dwaraka Nagar 2nd Lane, Vizag",
    isOpen: true,
    isFeatured: false,
    offer: "Free delivery above ₹300",
    tags: ["Supermart", "Organic Produce", "Packaged Snacks"],
    image: "🛍️",
    posterImage: "https://unsplash.com/photos/FAziP8fKUNg/download?force=true&w=600&h=370&q=54&fm=webp",
    posterBadge: "⚡ 20-30 mins delivery",
    posterTagline: "Modern Supermart Selection • Organic Produce & Packaged Delights",
    coverFrom: "#7C3AED",
    coverTo: "#6D28D9",
    categories: ["Fresh Produce", "Dairy & Breakfast", "Cold Drinks & Juices", "Snacks & Munchies", "Cleaning & Pooja"],
  },
  {
    id: 5,
    name: "Annapurna Departmental",
    owner: "Suresh Kumar",
    rating: 4.3,
    reviewCount: 94,
    deliveryTime: "Within 30 mins",
    deliveryFee: 30,
    distance: "1.8 km",
    minOrder: 199,
    address: "Gopalapatnam Junction, Vizag",
    isOpen: false,
    isFeatured: false,
    offer: null,
    tags: ["Departmental", "Stationery", "Cleaning"],
    image: "🏪",
    posterImage: "https://unsplash.com/photos/48gk2I7mRs8/download?force=true&w=960",
    posterBadge: "⚡ 20-30 mins delivery",
    posterTagline: "Complete Home Cleaning, Pooja Essentials & Kitchen Staples",
    coverFrom: "#64748B",
    coverTo: "#475569",
    categories: ["Household Staples", "Cleaning & Pooja", "Personal Care"],
  }
];

export const allCategories = [
  { id: "vegetables", name: "Vegetables", icon: "🥦", bg: "var(--pastel-green)", tag: "Direct Mandi" },
  { id: "fruits", name: "Fruits", icon: "🍎", bg: "var(--pastel-orange)", tag: "Farm Fresh" },
  { id: "leafy", name: "Leafy Green", icon: "🌿", bg: "var(--pastel-teal)", tag: "Crisp Greens" },
  { id: "groceries", name: "Groceries", icon: "🌾", bg: "var(--pastel-yellow)", tag: "Wholesale" },
  { id: "flowers", name: "Flowers", icon: "🌼", bg: "var(--pastel-pink)", tag: "Pooja Fresh" },
  { id: "pickles", name: "Pickles", icon: "🫙", bg: "var(--pastel-coral)", tag: "Andhra Special" },
  { id: "dairy", name: "Dairy & Breakfast", icon: "🥛", bg: "var(--pastel-blue)", tag: "Daily Needs" },
  { id: "produce", name: "Fresh Produce", icon: "🥦", bg: "var(--pastel-green)", tag: "Farm Fresh" },
  { id: "snacks", name: "Snacks & Munchies", icon: "🍿", bg: "var(--pastel-orange)", tag: "Instant" },
  { id: "drinks", name: "Cold Drinks & Juices", icon: "🧃", bg: "var(--pastel-pink)", tag: "Chilled" },
  { id: "staples", name: "Household Staples", icon: "🌾", bg: "var(--pastel-yellow)", tag: "Kitchen" },
  { id: "pulses", name: "Pulses & Grains", icon: "🫘", bg: "var(--pastel-yellow)", tag: "Wholesale" },
  { id: "spices", name: "Spices & Masala", icon: "🌶️", bg: "var(--pastel-coral)", tag: "Aromatic" },
  { id: "oils", name: "Oils & Ghee", icon: "🫙", bg: "var(--pastel-teal)", tag: "Pure" },
  { id: "care", name: "Personal Care", icon: "🧴", bg: "var(--pastel-purple)", tag: "Wellness" },
  { id: "cleaning", name: "Cleaning & Pooja", icon: "🧹", bg: "var(--pastel-teal)", tag: "Home" },
  { id: "baby", name: "Baby & Hygiene", icon: "👶", bg: "var(--pastel-pink)", tag: "Gentle" },
];

export const categoryMeta = {
  "Vegetables": { icon: "🥦", bg: "var(--pastel-green)" },
  "Fruits": { icon: "🍎", bg: "var(--pastel-orange)" },
  "Leafy Green": { icon: "🌿", bg: "var(--pastel-teal)" },
  "Flowers": { icon: "🌼", bg: "var(--pastel-pink)" },
  "Groceries": { icon: "🌾", bg: "var(--pastel-yellow)" },
  "Pickles": { icon: "🫙", bg: "var(--pastel-coral)" },
  "Dairy & Breakfast": { icon: "🥛", bg: "var(--pastel-blue)" },
  "Fresh Produce": { icon: "🥦", bg: "var(--pastel-green)" },
  "Snacks & Munchies": { icon: "🍿", bg: "var(--pastel-orange)" },
  "Cold Drinks & Juices": { icon: "🧃", bg: "var(--pastel-pink)" },
  "Household Staples": { icon: "🌾", bg: "var(--pastel-yellow)" },
  "Pulses & Grains": { icon: "🫘", bg: "var(--pastel-yellow)" },
  "Spices & Masala": { icon: "🌶️", bg: "var(--pastel-coral)" },
  "Oils & Ghee": { icon: "🫙", bg: "var(--pastel-teal)" },
  "Personal Care": { icon: "🧴", bg: "var(--pastel-purple)" },
  "Cleaning & Pooja": { icon: "🧹", bg: "var(--pastel-teal)" },
  "Baby & Hygiene": { icon: "👶", bg: "var(--pastel-pink)" },
  "Pickles & Chutneys": { icon: "🫙", bg: "var(--pastel-yellow)" },
};

export const productsByCategory = {
  ...localFreshProductsByCategory,
  "Dairy & Breakfast": [
    {
      id: 101,
      name: "Amul Taaza Homogenised Toned Milk",
      price: 54,
      mrp: 58,
      unit: "1 Litre",

      fallbackEmoji: "🥛",
      inStock: true,
      rating: 4.9,
      reviewsCount: 284,
      brand: "Amul",
      badge: "Best Seller",
      description: "Pasteurised fresh toned milk enriched with Vitamin A & D. Perfect for tea, coffee, breakfast cereal and healthy smoothies.",
      specs: { Volume: "1000 ml", ShelfLife: "2 Days", Fat: "3.0% min" }
    },
    {
      id: 102,
      name: "Fresh Farm Eggs (Golden Yolk)",
      price: 75,
      mrp: 85,
      unit: "6 pcs pack",

      fallbackEmoji: "🥚",
      inStock: true,
      rating: 4.8,
      reviewsCount: 192,
      brand: "Eggoz Farm",
      badge: "High Protein",
      description: "Naturally enriched farm-fresh eggs sourced directly from clean poultry farms around Vizag. Guaranteed fresh daily.",
      specs: { Pack: "6 Pieces", Type: "White Shell", Protein: "6g per egg" }
    },
    {
      id: 103,
      name: "Heritage Thick Set Curd (Dahi)",
      price: 35,
      mrp: 40,
      unit: "450 g pouch",

      fallbackEmoji: "🥣",
      inStock: true,
      rating: 4.7,
      reviewsCount: 145,
      brand: "Heritage",
      badge: "Probiotic",
      description: "Thick, creamy, homestyle set curd rich in live active cultures for optimal gut health and great taste.",
      specs: { Weight: "450 g", ShelfLife: "5 Days", Type: "Pure Cow Milk" }
    },
    {
      id: 104,
      name: "Amul Salted Butter",
      price: 56,
      mrp: 60,
      unit: "100 g pack",

      fallbackEmoji: "🧈",
      inStock: true,
      rating: 4.9,
      reviewsCount: 310,
      brand: "Amul",
      badge: "Original",
      description: "The classic Utterly Butterly Delicious salted butter. Ideal for toasts, dosas, parathas and baking.",
      specs: { Weight: "100 g", Storage: "Refrigerated", Type: "Pasteurised" }
    },
    {
      id: 105,
      name: "Britannia 100% Whole Wheat Bread",
      price: 45,
      mrp: 50,
      unit: "400 g loaf",

      fallbackEmoji: "🍞",
      inStock: true,
      rating: 4.6,
      reviewsCount: 98,
      brand: "Britannia",
      badge: "Zero Maida",
      description: "Wholesome brown bread baked with 100% whole wheat flour, rich in dietary fiber and essential micronutrients.",
      specs: { Weight: "400 g", Slices: "14 slices", Fiber: "3.2g / 100g" }
    }
  ,
    {
        "id": 106,
        "name": "Amul Fresh Malai Paneer",
        "price": 85,
        "mrp": 95,
        "unit": "200 g pack",

        "fallbackEmoji": "\ud83e\uddc0",
        "inStock": true,
        "rating": 4.9,
        "reviewsCount": 210,
        "brand": "Amul",
        "badge": "Rich Protein",
        "description": "Soft and succulent cubes of fresh cottage cheese, ideal for paneer tikka, butter masala and curries.",
        "specs": {
            "Weight": "200 g",
            "Protein": "18g / 100g",
            "Type": "Pasteurised"
        }
    },
    {
        "id": 107,
        "name": "Epigamia Greek Yogurt Natural (No Added Sugar)",
        "price": 60,
        "mrp": 65,
        "unit": "100 g cup",

        "fallbackEmoji": "\ud83e\udd63",
        "inStock": true,
        "rating": 4.8,
        "reviewsCount": 115,
        "brand": "Epigamia",
        "badge": "2x Protein",
        "description": "Strained Greek yogurt offering double the protein of regular dahi, ultra thick and creamy.",
        "specs": {
            "Weight": "100 g",
            "Protein": "7.5g",
            "LiveCultures": "Yes"
        }
    },
    {
        "id": 108,
        "name": "Amul Processed Cheese Slices",
        "price": 140,
        "mrp": 150,
        "unit": "10 slices pack",

        "fallbackEmoji": "\ud83e\uddc0",
        "inStock": true,
        "rating": 4.9,
        "reviewsCount": 380,
        "brand": "Amul",
        "badge": "Melt in Mouth",
        "description": "Individually wrapped creamy cheese slices for sandwiches, burgers, and morning toast.",
        "specs": {
            "Count": "10 Slices",
            "Weight": "200 g",
            "Calcium": "Rich"
        }
    },
    {
        "id": 109,
        "name": "Heritage Gold High Fat Cow Milk",
        "price": 38,
        "mrp": 40,
        "unit": "500 ml pouch",

        "fallbackEmoji": "\ud83e\udd5b",
        "inStock": true,
        "rating": 4.9,
        "reviewsCount": 420,
        "brand": "Heritage",
        "badge": "Full Cream",
        "description": "Rich 4.5% fat pasteurised fresh milk, ideal for thick morning coffee, tea and boiling khoya.",
        "specs": {
            "Volume": "500 ml",
            "Fat": "4.5% Min",
            "SNF": "8.5% Min"
        }
    }],
  "Fresh Produce": [
    {
      id: 201,
      name: "Hybrid Juicy Red Tomatoes",
      price: 36,
      mrp: 45,
      unit: "1 kg",

      fallbackEmoji: "🍅",
      inStock: true,
      rating: 4.8,
      reviewsCount: 420,
      brand: "Mandi Fresh",
      badge: "Mandi Fresh",
      description: "Locally grown plump red tomatoes with rich pulp, perfect for curries, rasam, salads, and gravies.",
      specs: { Quantity: "1000 g", Farm: "Anandapuram Farms", Origin: "Local Vizag" }
    },
    {
      id: 202,
      name: "Fresh Red Onions (Medium Size)",
      price: 38,
      mrp: 44,
      unit: "1 kg",

      fallbackEmoji: "🧅",
      inStock: true,
      rating: 4.7,
      reviewsCount: 380,
      brand: "Mandi Fresh",
      badge: "Kitchen Staple",
      description: "Crisp and flavorful pink-red onions, cleaned and handpicked for cooking base pastes and salads.",
      specs: { Quantity: "1000 g", Grade: "A-Grade", ShelfLife: "2 Weeks" }
    },
    {
      id: 203,
      name: "Jyoti Smooth Skin Potatoes",
      price: 32,
      mrp: 38,
      unit: "1 kg",

      fallbackEmoji: "🥔",
      inStock: true,
      rating: 4.9,
      reviewsCount: 215,
      brand: "Mandi Fresh",
      badge: "Crispy Frying",
      description: "Clean, unblemished potatoes with high starch content, great for boiling, fries, and aloo curries.",
      specs: { Quantity: "1000 g", Origin: "Andhra Pradesh", Storage: "Cool dry place" }
    },
    {
      id: 204,
      name: "Spicy Andhra Green Chillies",
      price: 18,
      mrp: 24,
      unit: "200 g",

      fallbackEmoji: "🌶️",
      inStock: true,
      rating: 4.8,
      reviewsCount: 160,
      brand: "Mandi Fresh",
      badge: "Fiery",
      description: "Freshly plucked vibrant green chillies with sharp pungency, an essential seasoning in every south Indian meal.",
      specs: { Weight: "200 g", HeatLevel: "Hot", Type: "Guntur Origin" }
    },
    {
      id: 205,
      name: "Robusta Sweet Bananas",
      price: 45,
      mrp: 55,
      unit: "6 pcs",

      fallbackEmoji: "🍌",
      inStock: true,
      rating: 4.7,
      reviewsCount: 110,
      brand: "Mandi Fresh",
      badge: "Natural Sweetness",
      description: "Naturally ripened, sweet robusta bananas rich in potassium and instant energy. Delivered at ideal ripeness.",
      specs: { Count: "6 Bananas", Ripeness: "Ready to Eat", Preservatives: "None" }
    }
  ,
    {
        "id": 206,
        "name": "Crunchy Orange Ooty Carrots",
        "price": 42,
        "mrp": 50,
        "unit": "500 g",

        "fallbackEmoji": "\ud83e\udd55",
        "inStock": true,
        "rating": 4.8,
        "reviewsCount": 165,
        "brand": "Mandi Fresh",
        "badge": "Sweet Crunch",
        "description": "Cleaned, sweet tender hill carrots rich in beta carotene, great for salads, juicing and halwa.",
        "specs": {
            "Weight": "500 g",
            "Origin": "Ooty Hills",
            "Grade": "Grade A"
        }
    },
    {
        "id": 207,
        "name": "Vibrant Green Capsicum (Shimla Mirch)",
        "price": 35,
        "mrp": 42,
        "unit": "500 g",

        "fallbackEmoji": "\ud83e\uded1",
        "inStock": true,
        "rating": 4.7,
        "reviewsCount": 130,
        "brand": "Mandi Fresh",
        "badge": "Crisp",
        "description": "Glossy, thick-walled bell peppers ideal for Indo-Chinese noodles, fried rice and paneer curries.",
        "specs": {
            "Weight": "500 g",
            "Taste": "Mildly Sweet & Crisp"
        }
    },
    {
        "id": 208,
        "name": "Fresh Earthy Ginger (Allam)",
        "price": 32,
        "mrp": 38,
        "unit": "250 g",

        "fallbackEmoji": "\ud83e\udeda",
        "inStock": true,
        "rating": 4.8,
        "reviewsCount": 210,
        "brand": "Mandi Fresh",
        "badge": "Spicy Zest",
        "description": "Fiber-rich, pungent organic ginger roots cleaned and packed for chai, tadka and ginger pachadi.",
        "specs": {
            "Weight": "250 g",
            "Pungency": "High",
            "Type": "Old Ginger (High Juice)"
        }
    },
    {
        "id": 209,
        "name": "Desi Small Garlic Bulbs (Vellulli)",
        "price": 45,
        "mrp": 55,
        "unit": "250 g",

        "fallbackEmoji": "\ud83e\uddc4",
        "inStock": true,
        "rating": 4.9,
        "reviewsCount": 190,
        "brand": "Mandi Fresh",
        "badge": "Aromatic",
        "description": "Small pungent country garlic cloves packed with allicin and rich medical benefits.",
        "specs": {
            "Weight": "250 g",
            "Type": "Naatu Desi Garlic",
            "Cloves": "Tight Packed"
        }
    }],
  "Cold Drinks & Juices": [
    {
      id: 301,
      name: "Raw Pressery Sugarcane Cold Pressed Juice",
      price: 99,
      mrp: 120,
      unit: "250 ml bottle",

      fallbackEmoji: "🥤",
      inStock: true,
      rating: 4.9,
      reviewsCount: 310,
      brand: "Raw Pressery",
      badge: "15% OFF",
      description: "100% cold pressed sugarcane juice with a hint of lemon and ginger. No added sugar or artificial preservatives.",
      specs: { Volume: "250 ml", Processing: "High Pressure (HPP)", Sugar: "Natural only" }
    },
    {
      id: 302,
      name: "Ocean Pink Guava Fruit Drink",
      price: 95,
      mrp: 110,
      unit: "240 ml bottle",

      fallbackEmoji: "🧃",
      inStock: true,
      rating: 4.8,
      reviewsCount: 185,
      brand: "Ocean Beverages",
      badge: "Refreshing",
      description: "Crisp tropical pink guava beverage blended with purified mountain water and electrolytes.",
      specs: { Volume: "240 ml", Flavor: "Pink Guava", Caffeine: "0 mg" }
    },
    {
      id: 303,
      name: "Real Activ 100% Orange Juice",
      price: 130,
      mrp: 145,
      unit: "1 Litre tetra",

      fallbackEmoji: "🍊",
      inStock: true,
      rating: 4.7,
      reviewsCount: 220,
      brand: "Real Activ",
      badge: "Zero Added Sugar",
      description: "Pure pressed orange juice containing the wholesome goodness of 16 sun-ripened oranges. Enriched with Vitamin C.",
      specs: { Volume: "1000 ml", FruitContent: "100%", VitaminC: "50mg / serving" }
    },
    {
      id: 304,
      name: "Pepsi Carbonated Soft Drink Chilled Can",
      price: 40,
      mrp: 40,
      unit: "250 ml can",

      fallbackEmoji: "🥫",
      inStock: true,
      rating: 4.8,
      reviewsCount: 380,
      brand: "PepsiCo",
      badge: "Ice Chilled",
      description: "Classic sparkling cola delivered ice-cold from store refrigerators straight to your doorstep.",
      specs: { Volume: "250 ml", Temperature: "Chilled (4°C)", Packaging: "Recyclable Can" }
    },
    {
      id: 305,
      name: "Coca Cola Classic Can",
      price: 40,
      mrp: 40,
      unit: "250 ml can",

      fallbackEmoji: "🥤",
      inStock: true,
      rating: 4.9,
      reviewsCount: 450,
      brand: "Coca-Cola",
      badge: "Ice Chilled",
      description: "The world's favorite sparkling beverage. Enjoy the crisp, uplifting taste chilled to perfection.",
      specs: { Volume: "250 ml", Temperature: "Chilled (4°C)", Packaging: "Aluminum Can" }
    }
  ,
    {
        "id": 306,
        "name": "Thums Up Charged Carbonated Drink Can",
        "price": 40,
        "mrp": 40,
        "unit": "250 ml can",

        "fallbackEmoji": "\u26a1",
        "inStock": true,
        "rating": 4.9,
        "reviewsCount": 480,
        "brand": "Thums Up",
        "badge": "Strong Fizz",
        "description": "Toofani strong taste cola packed with intense fizz and bold Indian flavor.",
        "specs": {
            "Volume": "250 ml",
            "Serve": "Chilled 4\u00b0C"
        }
    },
    {
        "id": 307,
        "name": "Sprite Crisp Lemon-Lime Drink Can",
        "price": 40,
        "mrp": 40,
        "unit": "250 ml can",

        "fallbackEmoji": "\ud83c\udf4b",
        "inStock": true,
        "rating": 4.8,
        "reviewsCount": 350,
        "brand": "Sprite",
        "badge": "Clear Refreshment",
        "description": "Sparkling clear lemon and lime flavored beverage delivering total refreshment.",
        "specs": {
            "Volume": "250 ml",
            "Taste": "Crisp Citrus"
        }
    },
    {
        "id": 308,
        "name": "Paper Boat Aamras Mango Drink",
        "price": 35,
        "mrp": 40,
        "unit": "200 ml pouch",

        "fallbackEmoji": "\ud83e\udd6d",
        "inStock": true,
        "rating": 4.9,
        "reviewsCount": 290,
        "brand": "Paper Boat",
        "badge": "45% Real Pulp",
        "description": "Authentic Indian mango juice made from 45% ripe mango pulp, nostalgic homestyle taste.",
        "specs": {
            "Volume": "200 ml",
            "Preservatives": "Zero Artificial"
        }
    }],
  "Snacks & Munchies": [
    {
      id: 401,
      name: "Haldiram's Nagpur Aloo Bhujia",
      price: 52,
      mrp: 58,
      unit: "200 g pack",

      fallbackEmoji: "🍟",
      inStock: true,
      rating: 4.9,
      reviewsCount: 520,
      brand: "Haldiram's",
      badge: "Crunchy",
      description: "Iconic spicy potato and chickpea noodles seasoned with authentic Indian herbs and aromatic spices.",
      specs: { Weight: "200 g", SpiceLevel: "Mild Spicy", Diet: "100% Vegetarian" }
    },
    {
      id: 402,
      name: "Lay's India's Magic Masala",
      price: 20,
      mrp: 20,
      unit: "50 g pack",

      fallbackEmoji: "🥔",
      inStock: true,
      rating: 4.8,
      reviewsCount: 640,
      brand: "Lay's",
      badge: "All-Time Fav",
      description: "Thinly sliced crunchy potato chips tossed in an irresistible blend of exotic Indian spices.",
      specs: { Weight: "50 g", Taste: "Spicy & Tangy", ShelfLife: "4 Months" }
    },
    {
      id: 403,
      name: "Britannia Good Day Butter Cookies",
      price: 32,
      mrp: 35,
      unit: "150 g pack",

      fallbackEmoji: "🍪",
      inStock: true,
      rating: 4.7,
      reviewsCount: 310,
      brand: "Britannia",
      badge: "Smile Cookie",
      description: "Crunchy butter biscuits made with rich butter drops that dissolve in your mouth with every bite.",
      specs: { Weight: "150 g", Type: "Butter Biscuit", Serving: "Pairs with Chai" }
    },
    {
      id: 404,
      name: "Maggi 2-Minute Masala Instant Noodles",
      price: 14,
      mrp: 14,
      unit: "70 g pack",

      fallbackEmoji: "🍜",
      inStock: true,
      rating: 4.9,
      reviewsCount: 890,
      brand: "Nestle",
      badge: "Quick 2-Min",
      description: "India's beloved comfort food. Classic roasted spice blend tastemaker with quick-cooking noodles.",
      specs: { Weight: "70 g", PrepTime: "2 Minutes", Includes: "Tastemaker Sachet" }
    }
  ,
    {
        "id": 405,
        "name": "Kurkure Masala Munch Crunchy Snack",
        "price": 20,
        "mrp": 20,
        "unit": "75 g pack",

        "fallbackEmoji": "\ud83c\udf7f",
        "inStock": true,
        "rating": 4.8,
        "reviewsCount": 520,
        "brand": "Kurkure",
        "badge": "Tedha Par Mera",
        "description": "Spicy, crunchy corn and rice puffs cooked in authentic Indian spices.",
        "specs": {
            "Weight": "75 g",
            "Taste": "Chatpata Masala"
        }
    },
    {
        "id": 406,
        "name": "Parle-G Gold Glucose Biscuits",
        "price": 30,
        "mrp": 30,
        "unit": "250 g pack",

        "fallbackEmoji": "\ud83c\udf6a",
        "inStock": true,
        "rating": 4.9,
        "reviewsCount": 890,
        "brand": "Parle",
        "badge": "The Original",
        "description": "India's beloved tea companion biscuit baked with milk and wheat glucose goodness.",
        "specs": {
            "Weight": "250 g",
            "Energy": "460 kcal / 100g"
        }
    },
    {
        "id": 407,
        "name": "Cadbury Oreo Original Vanilla Sandwich Biscuits",
        "price": 35,
        "mrp": 40,
        "unit": "120 g pack",

        "fallbackEmoji": "\ud83c\udf6b",
        "inStock": true,
        "rating": 4.8,
        "reviewsCount": 420,
        "brand": "Cadbury",
        "badge": "Twist Lick Dunk",
        "description": "Rich dark chocolate cookie sandwich filled with smooth sweet vanilla cream.",
        "specs": {
            "Weight": "120 g",
            "Flavor": "Rich Chocolate & Vanilla"
        }
    }],
  "Household Staples": [
    {
      id: 501,
      name: "Tata Sampann High-Protein Toor Dal",
      price: 142,
      mrp: 165,
      unit: "1 kg pack",

      fallbackEmoji: "🫘",
      inStock: true,
      rating: 4.9,
      reviewsCount: 310,
      brand: "Tata Sampann",
      badge: "Unpolished",
      description: "Naturally grown, unpolished yellow pigeon peas rich in wholesome plant protein and zero cholesterol.",
      specs: { Weight: "1000 g", Polish: "Unpolished", Protein: "22g / 100g" }
    },
    {
      id: 502,
      name: "Fortune Sunlite Refined Sunflower Oil",
      price: 155,
      mrp: 175,
      unit: "1 Litre pouch",

      fallbackEmoji: "🌻",
      inStock: true,
      rating: 4.8,
      reviewsCount: 410,
      brand: "Fortune",
      badge: "Enriched A&D",
      description: "Light and healthy cooking oil processed with H.A.R.T. technology, keeping food crisp and heart-healthy.",
      specs: { Volume: "1000 ml", SmokePoint: "High", Fortified: "Vitamin A, D & E" }
    },
    {
      id: 503,
      name: "Aashirvaad Shudh Chakki Atta",
      price: 245,
      mrp: 275,
      unit: "5 kg pack",

      fallbackEmoji: "🌾",
      inStock: true,
      rating: 4.9,
      reviewsCount: 650,
      brand: "ITC Aashirvaad",
      badge: "100% Whole Wheat",
      description: "Traditional stone-ground chakki whole wheat flour that retains bran, ensuring ultra-soft and fluffy rotis.",
      specs: { Weight: "5000 g", Grain: "MP Sharbati Blend", Texture: "Extra Soft" }
    }
  ],
  "Personal Care": [
    {
      id: 601,
      name: "Dove Deeply Nourishing Beauty Bar",
      price: 52,
      mrp: 60,
      unit: "100 g",

      fallbackEmoji: "🧼",
      inStock: true,
      rating: 4.9,
      reviewsCount: 320,
      brand: "Dove",
      badge: "1/4th Cream",
      description: "Gentle skin cleanser containing 1/4th moisturizing cream for smooth, radiant and nourished skin all day long.",
      specs: { Weight: "100 g", SkinType: "All Skin Types", ParabenFree: "Yes" }
    },
    {
      id: 602,
      name: "Colgate MaxFresh Peppermint Toothpaste",
      price: 98,
      mrp: 115,
      unit: "150 g tube",

      fallbackEmoji: "🪥",
      inStock: true,
      rating: 4.8,
      reviewsCount: 280,
      brand: "Colgate",
      badge: "Cooling Crystals",
      description: "Blue cooling gel with power-packed refreshing breath strips that delivers long-lasting freshness and cavity protection.",
      specs: { Weight: "150 g", Flavor: "Peppermint", Type: "Cooling Gel" }
    }
  ],
  "Pulses & Grains": [
    {
      id: 701,
      name: "Tata Sampann High-Protein Toor Dal",
      price: 142,
      mrp: 165,
      unit: "1 kg pack",

      fallbackEmoji: "🫘",
      inStock: true,
      rating: 4.9,
      reviewsCount: 380,
      brand: "Tata Sampann",
      badge: "Unpolished",
      description: "Naturally grown, unpolished yellow pigeon peas rich in wholesome plant protein and zero cholesterol.",
      specs: { Weight: "1000 g", Polish: "Unpolished", Protein: "22g / 100g" }
    },
    {
      id: 702,
      name: "Fortune Premium Yellow Moong Dal",
      price: 128,
      mrp: 145,
      unit: "1 kg pack",

      fallbackEmoji: "🫘",
      inStock: true,
      rating: 4.8,
      reviewsCount: 240,
      brand: "Fortune",
      badge: "Easy Digest",
      description: "Nutritious and easily digestible split yellow moong lentils, perfect for khichdi and healthy dals.",
      specs: { Weight: "1000 g", Grade: "A-Grade", ShelfLife: "6 Months" }
    },
    {
      id: 703,
      name: "Double Horse Minapagundlu (Urad Gota)",
      price: 158,
      mrp: 175,
      unit: "1 kg pack",

      fallbackEmoji: "⚪",
      inStock: true,
      rating: 4.9,
      reviewsCount: 410,
      brand: "Double Horse",
      badge: "Idly Special",
      description: "Premium white whole black gram lentils, giving maximum batter rise and fluffy idlis & crisp dosas.",
      specs: { Weight: "1000 g", BatterYield: "Ultra Fluffy", Type: "Whole Gota" }
    },
    {
      id: 704,
      name: "Srilalitha Classic Sona Masoori Rice",
      price: 310,
      mrp: 350,
      unit: "5 kg bag",

      fallbackEmoji: "🌾",
      inStock: true,
      rating: 4.9,
      reviewsCount: 520,
      brand: "Srilalitha",
      badge: "Aged Rice",
      description: "Aged Andhra Sona Masoori raw rice, lightweight, aromatic and non-sticky when cooked.",
      specs: { Weight: "5000 g", Aging: "12 Months Aged", Grain: "Medium Grain" }
    },
    {
      id: 705,
      name: "India Gate Feast Rozzana Basmati Rice",
      price: 115,
      mrp: 135,
      unit: "1 kg pack",

      fallbackEmoji: "🍚",
      inStock: true,
      rating: 4.7,
      reviewsCount: 290,
      brand: "India Gate",
      badge: "Long Grain",
      description: "Fragrant long-grain basmati rice suitable for everyday pulao, fried rice, and biryani.",
      specs: { Weight: "1000 g", GrainLength: "Long", Aroma: "Subtle Fragrance" }
    }
  ],
  "Spices & Masala": [
    {
      id: 801,
      name: "Everest Turmeric Powder (Haldi)",
      price: 48,
      mrp: 55,
      unit: "200 g pack",

      fallbackEmoji: "🟡",
      inStock: true,
      rating: 4.9,
      reviewsCount: 460,
      brand: "Everest",
      badge: "High Curcumin",
      description: "Golden aromatic turmeric powder sourced from prime Salem turmeric roots, naturally rich in curcumin.",
      specs: { Weight: "200 g", Curcumin: "3.5% Min", Purity: "100% Pure" }
    },
    {
      id: 802,
      name: "Aashirvaad Guntur Red Chilli Powder",
      price: 65,
      mrp: 75,
      unit: "200 g pack",

      fallbackEmoji: "🌶️",
      inStock: true,
      rating: 4.8,
      reviewsCount: 510,
      brand: "ITC Aashirvaad",
      badge: "Guntur Fiery",
      description: "Authentic Andhra red chilli powder made from handpicked Guntur chillies, providing vibrant red color and spicy punch.",
      specs: { Weight: "200 g", Origin: "Guntur, AP", Heat: "Medium-Hot" }
    },
    {
      id: 803,
      name: "Catch Coriander (Dhania) Powder",
      price: 52,
      mrp: 60,
      unit: "200 g pack",

      fallbackEmoji: "🌿",
      inStock: true,
      rating: 4.7,
      reviewsCount: 220,
      brand: "Catch",
      badge: "Aroma Locked",
      description: "Freshly roasted and ground green coriander seeds, enhancing curry aromas and depth of flavor.",
      specs: { Weight: "200 g", Grinding: "Low Temp Grinding", Type: "Pure Dhania" }
    },
    {
      id: 804,
      name: "Everest Shahi Garam Masala",
      price: 85,
      mrp: 95,
      unit: "100 g pack",

      fallbackEmoji: "🥣",
      inStock: true,
      rating: 4.9,
      reviewsCount: 630,
      brand: "Everest",
      badge: "Royal Blend",
      description: "Exquisite blend of 13 authentic spices including green cardamom, clove, cinnamon, and mace.",
      specs: { Weight: "100 g", Spices: "13 Rare Spices", Aroma: "Rich & Warm" }
    },
    {
      id: 805,
      name: "24 Mantra Organic Mustard Seeds (Avalu)",
      price: 32,
      mrp: 38,
      unit: "100 g pack",

      fallbackEmoji: "⚫",
      inStock: true,
      rating: 4.8,
      reviewsCount: 180,
      brand: "24 Mantra",
      badge: "100% Organic",
      description: "Tiny, pungent organic small mustard seeds for authentic south Indian tadka and seasoning.",
      specs: { Weight: "100 g", Pesticides: "Zero Chemicals", Type: "Small Black Rai" }
    }
  ],
  "Oils & Ghee": [
    {
      id: 901,
      name: "Freedom Refined Sunflower Oil",
      price: 138,
      mrp: 155,
      unit: "1 Litre pouch",

      fallbackEmoji: "🌻",
      inStock: true,
      rating: 4.9,
      reviewsCount: 710,
      brand: "Freedom",
      badge: "Heart Friendly",
      description: "Low-absorb refined sunflower oil enriched with Vitamins A & D, ideal for everyday Indian cooking and frying.",
      specs: { Volume: "1000 ml", Vitamins: "A, D, E", SmokePoint: "230°C" }
    },
    {
      id: 902,
      name: "Amul Pure Cow Ghee",
      price: 325,
      mrp: 355,
      unit: "500 ml tin",

      fallbackEmoji: "🧈",
      inStock: true,
      rating: 4.9,
      reviewsCount: 840,
      brand: "Amul",
      badge: "Danedar Ghee",
      description: "Traditional granular cow ghee with wholesome rich aroma, prepared from fresh cow milk fat.",
      specs: { Volume: "500 ml", Texture: "Granular (Danedar)", Aroma: "Traditional" }
    },
    {
      id: 903,
      name: "Saffola Gold Pro Healthy Heart Oil",
      price: 165,
      mrp: 185,
      unit: "1 Litre pouch",

      fallbackEmoji: "🫙",
      inStock: true,
      rating: 4.8,
      reviewsCount: 420,
      brand: "Saffola",
      badge: "Dual Seed Blend",
      description: "Advanced dual seed oil blending rice bran oil and sunflower oil with natural oryzanol antioxidants.",
      specs: { Volume: "1000 ml", Oryzanol: "Triple Anti-Oxidant", LOSORB: "Up to 33% Less" }
    },
    {
      id: 904,
      name: "Idhayam Pure Gingelly / Sesame Oil",
      price: 195,
      mrp: 220,
      unit: "500 ml bottle",

      fallbackEmoji: "🫒",
      inStock: true,
      rating: 4.8,
      reviewsCount: 310,
      brand: "Idhayam",
      badge: "Traditional Cold Pressed",
      description: "Authentic sesame oil crushed with natural palm jaggery, essential for Andhra rasam, dosas, and pooja.",
      specs: { Volume: "500 ml", Process: "Wood Pressed / Expeller", Flavor: "Nutty Rich" }
    }
  ],
  "Pickles & Chutneys": [
    {
      id: 1001,
      name: "Priya Andhra Avakaya (Mango) Pickle",
      price: 85,
      mrp: 95,
      unit: "300 g bottle",

      fallbackEmoji: "🫙",
      inStock: true,
      rating: 4.9,
      reviewsCount: 650,
      brand: "Priya Foods",
      badge: "Andhra Classic",
      description: "Iconic spicy raw mango pickle prepared with mustard powder, red chillies and pure sesame oil.",
      specs: { Weight: "300 g", ShelfLife: "12 Months", Oil: "Gingelly Oil" }
    },
    {
      id: 1002,
      name: "Priya Tangy Gongura Pickle with Garlic",
      price: 85,
      mrp: 95,
      unit: "300 g bottle",

      fallbackEmoji: "🌿",
      inStock: true,
      rating: 4.9,
      reviewsCount: 580,
      brand: "Priya Foods",
      badge: "Signature Vizag",
      description: "The pride of Andhra culinary heritage. Tangy sorrel leaves (Gongura) cooked with pungent garlic cloves.",
      specs: { Weight: "300 g", Specialty: "Garlic Sautéed", Taste: "Tangy & Spicy" }
    },
    {
      id: 1003,
      name: "Priya Spicy Tomato Pickle",
      price: 82,
      mrp: 90,
      unit: "300 g bottle",

      fallbackEmoji: "🍅",
      inStock: true,
      rating: 4.7,
      reviewsCount: 320,
      brand: "Priya Foods",
      badge: "All-Time Fav",
      description: "Juicy sun-ripened tomatoes simmered in tamarind and spicy mustard oil, pairs heavenly with hot rice and ghee.",
      specs: { Weight: "300 g", Taste: "Sweet, Sour & Hot", Preservatives: "Minimal" }
    }
  ],
  "Baby & Hygiene": [
    {
      id: 1101,
      name: "Pampers All Round Protection Pants (M)",
      price: 299,
      mrp: 349,
      unit: "20 pcs pack",

      fallbackEmoji: "👶",
      inStock: true,
      rating: 4.8,
      reviewsCount: 420,
      brand: "Pampers",
      badge: "12hr Absorb",
      description: "Anti-rash baby diaper pants with magic gel technology and soothing aloe vera lotion for baby comfort.",
      specs: { Size: "Medium (M, 7-12 kg)", Count: "20 Diapers", Feature: "Aloe Vera Lotion" }
    },
    {
      id: 1102,
      name: "Himalaya Gentle Baby Wipes (Aloe & Lotus)",
      price: 125,
      mrp: 140,
      unit: "72 wipes pack",

      fallbackEmoji: "🧻",
      inStock: true,
      rating: 4.9,
      reviewsCount: 310,
      brand: "Himalaya Herbals",
      badge: "Alcohol Free",
      description: "Ultra-soft baby wipes formulated with Indian Lotus and Aloe Vera to soothe and gently clean delicate skin.",
      specs: { Count: "72 Wipes", pH: "Balanced 5.5", Alcohol: "0% Free" }
    },
    {
      id: 1103,
      name: "Johnson's Baby Bath Soap Bar",
      price: 58,
      mrp: 65,
      unit: "100 g bar",

      fallbackEmoji: "🧼",
      inStock: true,
      rating: 4.8,
      reviewsCount: 260,
      brand: "Johnson's",
      badge: "No More Tears",
      description: "Gentle baby cleansing bar enriched with 1/4th baby lotion and Vitamin E for soft skin.",
      specs: { Weight: "100 g", DermatologistTested: "Yes", Scent: "Mild Blossom" }
    },
    {
      id: 1104,
      name: "Whisper Choice Ultra Sanitary Pads (XL)",
      price: 48,
      mrp: 52,
      unit: "6 pads pack",

      fallbackEmoji: "🌸",
      inStock: true,
      rating: 4.9,
      reviewsCount: 680,
      brand: "Whisper",
      badge: "Zero Leakage",
      description: "Extra-long wings with gel core locks fluid instantly, offering all-day stain protection and comfort.",
      specs: { Length: "Extra Large (XL, 284mm)", Count: "6 Pads", Wings: "Double Wings" }
    }
  ],
  "Cleaning & Pooja": [
    {
      id: 1201,
      name: "Surf Excel Easy Wash Detergent Powder",
      price: 140,
      mrp: 155,
      unit: "1 kg pack",

      fallbackEmoji: "🧺",
      inStock: true,
      rating: 4.9,
      reviewsCount: 780,
      brand: "Surf Excel",
      badge: "Stain Remover",
      description: "Advanced powder formulation dissolves easily in cold water and removes tough stains without scrubbing.",
      specs: { Weight: "1000 g", Fragrance: "Fresh Flower Bloom", WashType: "Hand & Machine" }
    },
    {
      id: 1202,
      name: "Vim Dishwash Gel with Lemon",
      price: 115,
      mrp: 130,
      unit: "500 ml bottle",

      fallbackEmoji: "🍋",
      inStock: true,
      rating: 4.8,
      reviewsCount: 540,
      brand: "Vim",
      badge: "Power of 100 Lemons",
      description: "Thick degreasing liquid gel that cleans tough oily vessels with just 1 spoonful.",
      specs: { Volume: "500 ml", Action: "Grease Removal", Fragrance: "Natural Lemon" }
    },
    {
      id: 1203,
      name: "Cycle Pure Sandalwood Agarbatti (Pack of 3)",
      price: 65,
      mrp: 75,
      unit: "3 packs",

      fallbackEmoji: "🪔",
      inStock: true,
      rating: 4.9,
      reviewsCount: 420,
      brand: "Cycle Pure",
      badge: "Pooja Special",
      description: "Sacred incense sticks rolled with pure sandalwood essential oils for serene morning and evening prayers.",
      specs: { Count: "3 x 20 Sticks", BurningTime: "45 mins per stick", Ash: "White Ash" }
    },
    {
      id: 1204,
      name: "Bhimseni Pure Camphor (Karpuram) Jar",
      price: 45,
      mrp: 55,
      unit: "50 g jar",

      fallbackEmoji: "🔥",
      inStock: true,
      rating: 4.9,
      reviewsCount: 390,
      brand: "Mangaldeep",
      badge: "Pure Bhimseni",
      description: "100% pure organic camphor flakes for spiritual aarti. Leaves zero residue or dark smoke.",
      specs: { Weight: "50 g", Smoke: "Clean White", Residue: "0% Residue" }
    }
  ]
};

export function getStoreDeliveryETA(store) {
  if (!store) return "Within 30 mins";
  if (store.id === 'localfresh' || store.isAdminManaged || (typeof store.name === 'string' && store.name.toLowerCase().includes('localfresh'))) {
    return "Within 2 hours";
  }
  const dist = parseFloat(store.distance || "1.0");
  if (!isNaN(dist) && dist <= 0.5) {
    return "Within 20 mins";
  }
  return "Within 30 mins";
}
