/**
 * Comprehensive Regional / Bilingual Synonym Dictionary (Telugu + Hindi + English)
 * for Visakhapatnam vegetable, fruit and grocery shoppers.
 */
export const REGIONAL_SYNONYMS = {
  // Telugu & Hindi Produce Names -> English Catalog Names
  bendakaya: ['lady finger', 'bhindi', 'okra'],
  bhindi: ['lady finger', 'bendakaya', 'okra'],
  okra: ['lady finger', 'bhindi', 'bendakaya'],

  dosakaya: ['yellow cucumber', 'cucumber'],
  dondakaya: ['ivy gourd', 'tindora'],
  tindora: ['ivy gourd', 'dondakaya'],

  potols: ['parwal', 'pointed gourd', 'potol'],
  potol: ['parwal', 'pointed gourd', 'potols'],
  parwal: ['potols', 'pointed gourd', 'potol'],

  vankaya: ['brinjal', 'baingan', 'eggplant'],
  baingan: ['brinjal', 'vankaya', 'eggplant'],
  brinjal: ['vankaya', 'baingan', 'eggplant'],

  ullipayalu: ['onion', 'pyaz', 'shallots'],
  ullipaya: ['onion', 'pyaz'],
  pyaz: ['onion', 'ullipayalu'],
  pyaaz: ['onion', 'ullipayalu'],

  bangaladumpa: ['potato', 'aloo', 'batata'],
  aloo: ['potato', 'bangaladumpa'],
  batata: ['potato', 'aloo'],

  tamata: ['tomato', 'tamatar'],
  tamatar: ['tomato', 'tamata'],

  mirapakayalu: ['green chilli', 'chilli', 'mirchi'],
  mirchi: ['green chilli', 'chilli', 'mirapakayalu'],

  kothimeera: ['coriander', 'dhania', 'cilantro'],
  dhania: ['coriander', 'kothimeera'],
  dhaniya: ['coriander', 'kothimeera'],

  karivepaku: ['curry leaves', 'kadi patta'],
  'kadi patta': ['curry leaves', 'karivepaku'],

  allam: ['ginger', 'adrak'],
  adrak: ['ginger', 'allam'],

  vellulli: ['garlic', 'lehsun'],
  lehsun: ['garlic', 'vellulli'],

  palu: ['milk', 'doodh'],
  doodh: ['milk', 'palu'],

  perugu: ['curd', 'dahi', 'yogurt'],
  dahi: ['curd', 'perugu'],

  neyyi: ['ghee'],
  kandi_pappu: ['toor dal', 'tuvar dal'],
  toor: ['kandi pappu', 'arhar dal'],
  pesarapappu: ['moong dal'],
  biyyam: ['rice', 'chawal'],
  chawal: ['rice', 'biyyam'],

  boodida_gummadikaya: ['ash gourd', 'petha'],
  gummadikaya: ['pumpkin'],
  kakarakaya: ['bitter gourd', 'karela'],
  karela: ['bitter gourd', 'kakarakaya'],
  sorakaya: ['bottle gourd', 'lauki'],
  lauki: ['bottle gourd', 'sorakaya'],
  beerakaya: ['ridge gourd', 'turai'],
  turai: ['ridge gourd', 'beerakaya'],
  munagakaya: ['drumstick', 'drumsticks', 'moringa'],
  moringa: ['drumsticks', 'munagakaya'],
  aratikaya: ['raw banana', 'plantain'],
  chama_dumpa: ['taro root', 'arbi'],
  chilagada_dumpa: ['sweet potato', 'shakarkand'],
  mallepuvvu: ['jasmine', 'jasmine flowers'],
  banthi: ['marigold']
};

/**
 * Normalizes query string and finds matching English/synonym equivalents.
 */
export function expandSynonyms(rawQuery) {
  if (!rawQuery) return [];
  const normalized = String(rawQuery).toLowerCase().trim();
  const tokens = normalized.split(/\s+/);
  const matches = new Set([normalized]);

  for (const token of tokens) {
    if (REGIONAL_SYNONYMS[token]) {
      REGIONAL_SYNONYMS[token].forEach(syn => matches.add(syn));
    }
  }

  // Check multi-word phrase matching
  const snake = normalized.replace(/\s+/g, '_');
  if (REGIONAL_SYNONYMS[snake]) {
    REGIONAL_SYNONYMS[snake].forEach(syn => matches.add(syn));
  }

  return Array.from(matches);
}
