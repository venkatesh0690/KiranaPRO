// Hyperlocal Address, Apartment Gate Instructions & Bag Packing Sequence
// Playbook Phases 19 & 20

export const GATE_INSTRUCTION_OPTIONS = [
  {
    id: 'HAND_TO_ME',
    icon: '🤝',
    label: 'Hand to me & collect COD cash',
    riderNote: 'Deliver in hand to customer and verify 4-digit PIN.'
  },
  {
    id: 'MYGATE_SECURITY',
    icon: '🛡️',
    label: 'MyGate / Security Guard entry',
    riderNote: 'Tell gate security guard "KiranaPRO delivery partner".'
  },
  {
    id: 'DO_NOT_RING',
    icon: '🤫',
    label: 'Do not ring bell (Baby/Elders sleeping)',
    riderNote: 'Do NOT press doorbell. Call phone upon reaching door.'
  },
  {
    id: 'PET_AT_GATE',
    icon: '🐕',
    label: 'Pet / Dog at gate',
    riderNote: 'Watch for pet; please call from outside gate.'
  }
];

export function validateStructuredAddress(address) {
  if (!address) return { isValid: false, error: 'Address is required.' };
  if (!address.street_and_landmark || address.street_and_landmark.trim().length < 5) {
    return { isValid: false, error: 'Street & Landmark is required (min 5 characters).' };
  }
  if (!address.flat_or_house_no || address.flat_or_house_no.trim().length < 1) {
    return { isValid: false, error: 'Flat / House number is required.' };
  }
  return { isValid: true, error: null };
}

export function formatAddressForDisplay(addr) {
  if (!addr) return '';
  if (typeof addr === 'string') return addr;
  const parts = [
    addr.flat_or_house_no,
    addr.building_or_society_name,
    addr.street_and_landmark,
    addr.floor_number ? `Floor ${addr.floor_number}` : null,
    addr.has_lift === false ? '(No Lift)' : null,
    addr.area_id ? addr.area_id.replace(/_/g, ' ').toUpperCase() : null,
    'Visakhapatnam'
  ].filter(Boolean);
  return parts.join(', ');
}

// Instacart "Bag-Smart Picking Order" 3-Layer Sequence (Prompt 20.1)
export function categorizeItemPackingLayer(item) {
  const name = String(item?.name || item?.product_name || '').toLowerCase();
  const cat = String(item?.category || '').toLowerCase();

  // Layer 3: Top of Bag / Fragile & Crush-Prone
  if (
    name.includes('tomato') ||
    name.includes('mushroom') ||
    name.includes('coriander') ||
    name.includes('curry leaf') ||
    name.includes('dhaniya') ||
    name.includes('karivepaku') ||
    name.includes('flower') ||
    name.includes('pooja') ||
    name.includes('bread') ||
    name.includes('egg') ||
    name.includes('leafy') ||
    name.includes('spinach') ||
    name.includes('palak') ||
    name.includes('methi') ||
    cat.includes('leafy') ||
    cat.includes('flower')
  ) {
    return {
      layer: 3,
      name: 'Layer 3 — Top of Bag / Separate Pouch',
      tag: 'FRAGILE',
      warning: '⚠️ Pack on VERY TOP so items are never bruised during bike transit!',
      color: '#DC2626'
    };
  }

  // Layer 1: Bottom of Bag / Heavy & Sturdy
  if (
    name.includes('rice') ||
    name.includes('atta') ||
    name.includes('dal') ||
    name.includes('oil') ||
    name.includes('onion') ||
    name.includes('potato') ||
    name.includes('coconut') ||
    name.includes('ash gourd') ||
    name.includes('pumpkin') ||
    name.includes('watermelon') ||
    name.includes('sugar') ||
    name.includes('salt') ||
    cat.includes('staple') ||
    cat.includes('flour') ||
    cat.includes('dal') ||
    cat.includes('oil')
  ) {
    return {
      layer: 1,
      name: 'Layer 1 — Bottom of Bag (Heavy & Sturdy)',
      tag: 'HEAVY',
      warning: 'Sturdy foundation — place flat at bottom of crate/bag.',
      color: '#1E3A2B'
    };
  }

  // Layer 2: Middle of Bag / Firm Produce & Boxes
  return {
    layer: 2,
    name: 'Layer 2 — Middle of Bag (Firm Produce & Boxes)',
    tag: 'FIRM',
    warning: 'Pack in middle layer above heavy sacks.',
    color: '#D97706'
  };
}

export function sortItemsByPackingLayer(items) {
  if (!Array.isArray(items)) return [];
  return [...items].sort((a, b) => {
    const layerA = categorizeItemPackingLayer(a).layer;
    const layerB = categorizeItemPackingLayer(b).layer;
    return layerA - layerB; // 1 (Heavy) -> 2 (Firm) -> 3 (Fragile Top)
  });
}

// Color-coded bag tags for batched rider deliveries (Prompt 20.3)
export const BATCH_COLOR_TAGS = [
  { id: 'BLUE_BAG', name: '🔵 BLUE BAG', hex: '#2563EB', bg: '#EFF6FF', border: '#93C5FD' },
  { id: 'GREEN_BAG', name: '🟢 GREEN BAG', hex: '#16A34A', bg: '#F0FDF4', border: '#86EFAC' },
  { id: 'RED_BAG', name: '🔴 RED BAG', hex: '#DC2626', bg: '#FEF2F2', border: '#FCA5A5' },
  { id: 'AMBER_BAG', name: '🟡 AMBER BAG', hex: '#D97706', bg: '#FFFBEB', border: '#FDE68A' }
];

export function getBatchBagTag(orderIndex) {
  return BATCH_COLOR_TAGS[orderIndex % BATCH_COLOR_TAGS.length];
}
