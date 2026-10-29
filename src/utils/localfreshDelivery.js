/**
 * LocalFresh transport-price calculation.
 * Do not expose the pricing formula in customer-facing copy.
 * Accurate catalog weights can replace internal estimates as vendors confirm
 * their pack/bunch/piece specifications. These estimates are not scales data.
 */
export const LOCALFRESH_RATE_PER_KG = 5;

// Estimated weights, in kg, for SKUs sold as pieces, dozens and loose bundles.
// Unknown per-piece/bunch items are handled by conservative defaults below.
const SKU_ESTIMATE_KG = Object.freeze({
  'lf-1003': 1.5,  // Ash gourd
  'lf-1007': 1.0,  // Cabbage
  'lf-1026': 0.5,  // Coconut
  'lf-1027': 0.8,  // Bottle gourd
  'lf-1033': 0.8,  // Cauliflower with leaves
  'lf-1034': 0.12, // Small banana
  'lf-1038': 0.35, // Sweet corn
  'lf-1041': 0.7,  // Cauliflower
  'lf-1059': 0.18, // Raw banana
  'lf-1068': 0.4,  // Broccoli
  'lf-1073': 0.15, // Drumsticks, per piece
  'lf-1006': 1.2,  // Banana dozen
  'lf-1008': 3.0,  // Water melon
  'lf-1056': 1.0,  // Muskmelon
  'lf-1060': 0.1,  // Kiwi
  'lf-fl-01': 0.35,
  'lf-fl-02': 0.35,
  'lf-fl-03': 0.12,
  'lf-fl-04': 0.25,
  'lf-fl-05': 0.15,
  'lf-fl-08': 0.2,
  'lf-fl-09': 0.1,
  'lf-fl-10': 0.25
});

function parseExplicitWeightKg(text) {
  // 500 g jar, 200gms pack, 1kg bag, 1.5 kg (unit and name).
  const match = String(text||'').match(/(?:^|\s|\b)(\d+(?:\.\d+)?)\s*(kg|kilograms?|gms?|grams?)\b/i);
  if (!match) return null;
  const quantity = Number(match[1]);
  if (!(quantity>0)) return null;
  return /^kg|kilogram/i.test(match[2]) ? quantity : quantity/1000;
}

export function getLineWeightKg(item) {
  if(!item || typeof item!=='object') return 0;
  if(Number.isFinite(Number(item.weightKg)) && Number(item.weightKg)>0) return Number(item.weightKg);
  const id = String(item.id||'');
  const unit = String(item.unit||'').trim();
  const name = String(item.name||'').trim();
  const explicitUnit=parseExplicitWeightKg(unit);
  if(explicitUnit!==null)return explicitUnit;
  if (/^(per\s*kg|kg|per\s*kilogram)$/i.test(unit))return 1;
  const explicitName=parseExplicitWeightKg(name);
  if(explicitName!==null)return explicitName;
  if(Object.prototype.hasOwnProperty.call(SKU_ESTIMATE_KG,id))return SKU_ESTIMATE_KG[id];
  if(/dozen/i.test(unit))return 1.2;
  if(/bunch|bundle|garland|mala|string/i.test(unit))return 0.2;
  if(/piece|pcs?/i.test(unit))return 0.5;
  return 0.5;
}

export function getCartWeightKg(items=[]) {
  if(!Array.isArray(items))return 0;
  const weight=items.reduce((sum,item)=>{
    const qty=Math.max(0,Math.floor(Number(item?.quantity)||0));
    const itemKg=getLineWeightKg(item);
    return sum+qty*itemKg;
  },0);
  return Math.round(weight*1000)/1000;
}

export function calculateLocalFreshDeliveryFee(items) {
  const totalWeight=getCartWeightKg(items);
  return Math.round((totalWeight*LOCALFRESH_RATE_PER_KG+Number.EPSILON)*100)/100;
}
