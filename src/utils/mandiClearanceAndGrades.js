// Zero-Waste 8:00 PM Flash Clearance, Two-Tier Grading & Kitchen Combo Packs
// Playbook Phase 25

export function isEveningClearanceActive() {
  // 7:30 PM (19:30) to 10:30 PM (22:30) IST, or forced via demo flag
  if (typeof window !== 'undefined' && localStorage.getItem('kp_force_clearance') === 'true') {
    return true;
  }
  const now = new Date();
  // IST is UTC + 5:30
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const istDate = new Date(utc + (3600000 * 5.5));
  const hours = istDate.getHours();
  const minutes = istDate.getMinutes();
  const timeInMinutes = hours * 60 + minutes;

  // 19:30 = 1170, 22:30 = 1350
  return timeInMinutes >= 1170 && timeInMinutes <= 1350;
}

export function getClearanceDiscount(price) {
  // 25% extra discount for end-of-day Mandi produce
  return Math.max(1, Math.round(price * 0.75));
}

// Prompt 25.2: Two-Tier Mandi Produce Grading
export const PRODUCE_GRADES = {
  GRADE_A: {
    id: 'GRADE_A',
    label: 'Grade A (Table Pick)',
    desc: 'Uniform size, crisp salad & fry cut',
    badge: '🏆 Table Pick',
    multiplier: 1.0
  },
  ECONOMY: {
    id: 'ECONOMY',
    label: 'Economy / Curry Lot',
    desc: 'Mixed sizes, ripe & juicy for dal, sambar & chutneys',
    badge: '🍲 Curry & Chutney (Save ~35%)',
    multiplier: 0.65
  }
};

export function getPriceForGrade(basePrice, gradeId) {
  if (gradeId === 'ECONOMY') {
    return Math.max(5, Math.round(basePrice * 0.65));
  }
  return basePrice;
}

// Prompt 25.3: Pre-Built Visakhapatnam Kitchen Saver Combos
export const MANDI_SAVER_COMBOS = [
  {
    id: 'combo-veggie-trio',
    name: 'Weekly Basic Veggie Trio',
    teluguName: 'వారం కూరగాయల కాంబో',
    description: '1kg Farm Onion + 1kg Fresh Potato + 1kg Desi Tomato',
    badge: '🔥 Top Value Pack',
    mrp: 140,
    price: 99,
    savings: 41,
    weight: '3 kg total',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop&q=80',
    components: [
      { name: 'Onion / Ullipayalu', qty: '1 kg' },
      { name: 'Potato / Bangaladumpalu', qty: '1 kg' },
      { name: 'Tomato / Tamatalu', qty: '1 kg' }
    ]
  },
  {
    id: 'combo-sambar-rasam',
    name: 'South Indian Sambar & Rasam Kit',
    teluguName: 'సాంబార్ & రసం కిట్',
    description: 'Drumstick (Munakkaya) + Pumpkin + Ash Gourd + Carrot + Tomatoes + Coriander',
    badge: '🍲 Ready for Sambar',
    mrp: 130,
    price: 89,
    savings: 41,
    weight: '1.8 kg total',
    image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=500&auto=format&fit=crop&q=80',
    components: [
      { name: 'Drumstick / Munakkaya', qty: '2 pcs' },
      { name: 'Pumpkin / Gummadikaya', qty: '250 g' },
      { name: 'Ash Gourd / Boodida Gummadi', qty: '500 g' },
      { name: 'Tomato / Tamatalu', qty: '500 g' },
      { name: 'Coriander / Kothimeera', qty: '1 bunch' }
    ]
  },
  {
    id: 'combo-tadka-essentials',
    name: 'Daily Tadka & Masala Essentials',
    teluguName: 'పోపు & మసాలా కిట్',
    description: '100g Garlic + 100g Ginger + 100g Green Chillies + Fresh Curry Leaves + 4 Lemons',
    badge: '🍋 Fresh Tadka',
    mrp: 85,
    price: 59,
    savings: 26,
    weight: '500 g total',
    image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=500&auto=format&fit=crop&q=80',
    components: [
      { name: 'Garlic / Vellulli', qty: '100 g' },
      { name: 'Ginger / Allam', qty: '100 g' },
      { name: 'Green Chilli / Pachi Mirchi', qty: '100 g' },
      { name: 'Curry Leaves / Karivepaku', qty: '1 bunch' },
      { name: 'Fresh Lemons / Nimmakayalu', qty: '4 pcs' }
    ]
  }
];
