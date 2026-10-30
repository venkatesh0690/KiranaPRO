/**
 * Instacart-style 1-Tap Andhra & South Indian Recipe Baskets (Phase 18 Prompt 18.1)
 */
export const ANDHRA_RECIPE_BASKETS = Object.freeze([
  {
    id: 'gutti-vankaya',
    title: 'Andhra Gutti Vankaya Curry',
    tag: 'LOCAL FAVORITE',
    time: '25 mins',
    servings: '3–4 people',
    image: '🍆',
    desc: 'Rich stuffed baby brinjal curry cooked with roasted peanuts, sesame seeds, and tamarind.',
    ingredients: [
      { id: 'lf-1002', name: 'Brinjal / Vankaya (Small tender)', qty: 1, unit: '500g', price: 28 },
      { id: 'lf-1009', name: 'Onions (Medium uniform)', qty: 1, unit: '1kg', price: 34 },
      { id: 'lf-1022', name: 'Fresh Coriander / Dhaniya', qty: 1, unit: 'bunch', price: 10 },
      { id: 'staple-peanut', name: 'Roasted Peanuts Pack', qty: 1, unit: '200g', price: 32 }
    ]
  },
  {
    id: 'pappu-charu-bendakaya',
    title: 'Pappu Charu & Crispy Bendakaya Fry',
    tag: 'DAILY COMFORT',
    time: '30 mins',
    servings: '4 people',
    image: '🥣',
    desc: 'Traditional comforting Andhra tamarind rasam with crispy sliced lady finger fry.',
    ingredients: [
      { id: 'lf-1001', name: 'Lady Finger / Bendakaya (Tender fry cut)', qty: 1, unit: '500g', price: 26 },
      { id: 'lf-1008', name: 'Country Tomatoes (Naatu Tamata)', qty: 1, unit: '1kg', price: 28 },
      { id: 'staple-toor-dal', name: 'Tata Sampann Toor Dal', qty: 1, unit: '500g', price: 78 },
      { id: 'lf-1056', name: 'Curry Leaves & Green Chillies', qty: 1, unit: 'pack', price: 12 }
    ]
  },
  {
    id: 'vizag-veg-pulav',
    title: 'Visakhapatnam Sunday Veg Pulav',
    tag: 'SUNDAY SPECIAL',
    time: '35 mins',
    servings: '4–5 people',
    image: '🍚',
    desc: 'Fragrant aromatic pulav loaded with fresh carrots, beans, peas, and mint.',
    ingredients: [
      { id: 'lf-1013', name: 'Carrots & Green Beans Fresh Cut', qty: 1, unit: '500g', price: 36 },
      { id: 'lf-1009', name: 'Onions (Slicing size)', qty: 1, unit: '1kg', price: 34 },
      { id: 'lf-1024', name: 'Fresh Mint & Green Chillies', qty: 1, unit: 'pack', price: 15 },
      { id: 'staple-rice', name: 'Basmati Rice Aged 1kg', qty: 1, unit: '1kg', price: 95 }
    ]
  },
  {
    id: 'pesarattu-breakfast',
    title: 'Pesarattu & Allam Pachadi Kit',
    tag: 'HEALTHY BREAKFAST',
    time: '20 mins',
    servings: '3 people',
    image: '🥞',
    desc: 'Protein-packed green gram crepes paired with spicy tangy ginger chutney.',
    ingredients: [
      { id: 'staple-moong', name: 'Whole Green Moong Dal', qty: 1, unit: '500g', price: 65 },
      { id: 'lf-1018', name: 'Fresh Ginger Root', qty: 1, unit: '100g', price: 14 },
      { id: 'lf-1026', name: 'Green Chillies & Cumin Pack', qty: 1, unit: 'pack', price: 12 },
      { id: 'lf-1009', name: 'Onions (Fine chopped topping)', qty: 1, unit: '500g', price: 18 }
    ]
  },
  {
    id: 'dosakaya-pappu',
    title: 'Dosakaya Pappu (Yellow Cucumber Dal)',
    tag: 'AUTHENTIC ANDHRA',
    time: '25 mins',
    servings: '4 people',
    image: '🍲',
    desc: 'Tangy yellow cucumber cooked with creamy toor dal and fragrant ghee tadka.',
    ingredients: [
      { id: 'lf-1005', name: 'Yellow Cucumber (Dosakaya)', qty: 1, unit: '500g', price: 18 },
      { id: 'staple-toor-dal', name: 'Tata Sampann Toor Dal', qty: 1, unit: '500g', price: 78 },
      { id: 'lf-1008', name: 'Country Tomatoes', qty: 1, unit: '500g', price: 15 },
      { id: 'lf-1029', name: 'Garlic Bulbs (Peeled pods)', qty: 1, unit: '100g', price: 22 }
    ]
  },
  {
    id: 'mirchi-bajji-snack',
    title: 'Evening Mirchi Bajji & Chai Kit',
    tag: '4 PM TEA TIME',
    time: '15 mins',
    servings: '3–4 people',
    image: '☕',
    desc: 'Vizag beach-style large bajji chillies stuffed with ajwain and served with hot chai.',
    ingredients: [
      { id: 'lf-1034', name: 'Large Andhra Bajji Chillies', qty: 1, unit: '250g', price: 20 },
      { id: 'staple-besan', name: 'Fine Besan (Gram Flour)', qty: 1, unit: '500g', price: 48 },
      { id: 'dairy-milk', name: 'Heritage Full Cream Milk', qty: 1, unit: '500ml', price: 32 },
      { id: 'lf-1018', name: 'Fresh Ginger for Chai', qty: 1, unit: '100g', price: 14 }
    ]
  }
]);

/**
 * Under-₹25 Kitchen Impulse Shelf (Phase 14 Prompt 14.3)
 */
export const UNDER_25_IMPULSE_ITEMS = Object.freeze([
  { id: 'imp-01', name: 'Fresh Lemons (2 pcs)', price: 10, unit: '2 pcs', icon: '🍋' },
  { id: 'imp-02', name: 'Fresh Green Chillies Pack', price: 12, unit: '100g', icon: '🌶️' },
  { id: 'imp-03', name: 'Curry Leaves Fresh Bunch', price: 8, unit: 'bunch', icon: '🌿' },
  { id: 'imp-04', name: 'Pooja Incense (Agarbatti)', price: 15, unit: 'pack', icon: '🪔' },
  { id: 'imp-05', name: 'Tata Salt Mini Pack', price: 14, unit: '500g', icon: '🧂' },
  { id: 'imp-06', name: 'Coriander / Dhaniya Bunch', price: 10, unit: 'bunch', icon: '🥬' },
  { id: 'imp-07', name: 'Matchbox Multi-Pack', price: 10, unit: 'pack of 5', icon: '🔥' },
  { id: 'imp-08', name: 'Vim Dishwash Bar 125g', price: 15, unit: 'bar', icon: '🧼' }
]);
