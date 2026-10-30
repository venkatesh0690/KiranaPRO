// AI Paper-List ("Parchi") Scanner & WhatsApp List Parser
// Playbook Phase 23

// Bilingual synonym dictionary for Telugu, Hindi and English produce and kirana items
export const SYNONYM_MAP = {
  // Vegetables
  bendakaya: ['lady finger', 'bhindi', 'okra', 'ladyfinger'],
  bhindi: ['lady finger', 'bendakaya', 'okra'],
  tamata: ['tomato', 'tamatalu', 'tamatar'],
  tomato: ['tamata', 'tamatalu', 'tamatar'],
  ullipaya: ['onion', 'ullipayalu', 'pyaz', 'kanda'],
  onion: ['ullipaya', 'ullipayalu', 'pyaz'],
  bangaladumpa: ['potato', 'aloo', 'batata', 'bangaladumpalu'],
  potato: ['bangaladumpa', 'aloo', 'batata'],
  dosakaya: ['yellow cucumber', 'cucumber', 'dosa kaya'],
  cucumber: ['dosakaya', 'kheera', 'keera'],
  vankaya: ['brinjal', 'eggplant', 'baingan', 'vankayalu'],
  brinjal: ['vankaya', 'eggplant', 'baingan'],
  boodidagummadi: ['ash gourd', 'petha', 'safed petha'],
  ashgourd: ['ash gourd', 'boodida gummadi'],
  gummadikaya: ['pumpkin', 'kaddu', 'red pumpkin'],
  pumpkin: ['gummadikaya', 'kaddu'],
  allam: ['ginger', 'adrak'],
  ginger: ['allam', 'adrak'],
  vellulli: ['garlic', 'lahsun', 'lasun'],
  garlic: ['vellulli', 'lahsun'],
  pachimirchi: ['green chilli', 'chilli', 'mirchi', 'hari mirch'],
  greenchilli: ['pachi mirchi', 'chilli', 'mirchi', 'hari mirch'],
  kothimeera: ['coriander', 'dhaniya', 'hara dhania'],
  coriander: ['kothimeera', 'dhaniya', 'hara dhania'],
  karivepaku: ['curry leaves', 'kadi patta'],
  curryleaves: ['karivepaku', 'kadi patta'],
  munakkaya: ['drumstick', 'sehjan', 'saijan'],
  drumstick: ['munakkaya', 'sehjan'],
  dondakaya: ['tindora', 'ivy gourd', 'kundru'],
  tindora: ['dondakaya', 'ivy gourd', 'kundru'],
  palakura: ['spinach', 'palak'],
  spinach: ['palakura', 'palak'],
  menthikura: ['fenugreek leaves', 'methi'],
  methi: ['menthikura', 'fenugreek leaves'],

  // Kirana & Groceries
  kandipappu: ['toor dal', 'tuvar dal', 'arhar dal', 'red gram'],
  toordal: ['kandi pappu', 'tuvar dal', 'arhar dal'],
  minapappu: ['urad dal', 'black gram', 'white urad'],
  uraddal: ['minapappu', 'black gram'],
  pesarapappu: ['moong dal', 'mung dal', 'yellow moong'],
  moongdal: ['pesara pappu', 'mung dal'],
  biyyam: ['rice', 'sona masoori', 'chawal'],
  rice: ['biyyam', 'sona masoori', 'chawal'],
  godhumapindi: ['atta', 'wheat flour', 'gehu ka atta', 'godhuma pindi'],
  atta: ['wheat flour', 'godhuma pindi', 'gehu ka atta'],
  nune: ['oil', 'cooking oil', 'tel', 'sunflower oil', 'groundnut oil'],
  oil: ['nune', 'cooking oil', 'tel'],
  uppu: ['salt', 'namak'],
  salt: ['uppu', 'namak'],
  panchadara: ['sugar', 'cheeni', 'shakkar'],
  sugar: ['panchadara', 'cheeni'],
  paalu: ['milk', 'doodh'],
  milk: ['paalu', 'doodh'],
  perugu: ['curd', 'dahi', 'yogurt'],
  curd: ['perugu', 'dahi'],
  guddu: ['egg', 'eggs', 'anda'],
  eggs: ['guddu', 'anda', 'egg']
};

export function cleanWhatsAppText(rawText) {
  if (!rawText) return '';
  return rawText
    // Remove WhatsApp timestamps like [10:30 AM, 30/10/2026] Amma:
    .replace(/\[\d{1,2}:\d{2}(?::\d{2})?\s*(?:AM|PM|am|pm)?,?\s*[\d/-]*\]\s*[^:]*:\s*/g, '')
    // Remove lines like "30/10/2026, 8:15 AM - User:"
    .replace(/\d{1,2}\/\d{1,2}\/\d{2,4},?\s*\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)?\s*-\s*[^:]*:\s*/g, '')
    // Remove emoji bullets, dashes, numbered lists like 1., 2), -, *
    .replace(/^[\s*•\-–—\d.)\]]+/gm, '')
    .trim();
}

export function parseGroceryLines(text) {
  if (!text) return [];
  const lines = text
    .split(/\r?\n|,/)
    .map(l => l.trim())
    .filter(l => l.length > 1);

  return lines.map(line => {
    // Extract quantity pattern e.g., "2 kg", "500g", "1 bunch", "4 pcs", "2 packets"
    const qtyRegex = /(\d+(?:\.\d+)?)\s*(kg|kgs|g|gms|gram|grams|pcs|pc|packet|packets|pkt|pkts|bunch|bunches|liters|litre|l|ml)?/i;
    const match = line.match(qtyRegex);

    let extractedQty = 1;
    let extractedUnit = 'item';
    let cleanName = line;

    if (match) {
      extractedQty = parseFloat(match[1]) || 1;
      extractedUnit = match[2] ? match[2].toLowerCase() : 'unit';
      cleanName = line.replace(match[0], '').replace(/[()]/g, '').trim();
    }

    return {
      rawLine: line,
      cleanName: cleanName.replace(/^[0-9.\-*• ]+/, '').trim(),
      qty: extractedQty,
      unit: extractedUnit
    };
  }).filter(item => item.cleanName.length > 0);
}

export function fuzzyMatchProduct(extractedItem, catalog) {
  if (!catalog || !Array.isArray(catalog) || !extractedItem?.cleanName) return null;

  const query = extractedItem.cleanName.toLowerCase().replace(/[^a-z0-9 ]/g, '');
  const tokens = query.split(/\s+/).filter(t => t.length > 1);

  let bestMatch = null;
  let highestScore = 0;

  for (const product of catalog) {
    const prodName = String(product.name || '').toLowerCase();
    const prodCat = String(product.category || '').toLowerCase();
    let score = 0;

    // Direct substring match
    if (prodName.includes(query)) score += 50;

    // Check individual query tokens
    for (const token of tokens) {
      if (prodName.includes(token)) score += 20;

      // Check synonyms
      const synonyms = SYNONYM_MAP[token] || [];
      for (const syn of synonyms) {
        if (prodName.includes(syn)) score += 25;
      }
    }

    // Produce matching bonus
    if (prodCat.includes('produce') || prodCat.includes('veg') || prodCat.includes('grocer')) {
      score += 5;
    }

    if (score > highestScore && score >= 20) {
      highestScore = score;
      bestMatch = product;
    }
  }

  return bestMatch ? { ...bestMatch, matchScore: highestScore } : null;
}
