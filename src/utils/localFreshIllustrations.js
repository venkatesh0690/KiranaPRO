// User-uploaded, previously checked-in WebP images for exact LocalFresh SKUs.
// These are AI illustrations, not verified product packaging photographs.
// Mapping name and category in addition to ID prevents reusing a stale file
// if a catalog record is renamed or reassigned to another product.
// Asset 1204.webp from the original ZIP has no matching SKU and is excluded.
import { aiImageEligible, normalizeItem } from './aiImagePolicy.js';

export const LOCALFRESH_IMAGE_MANIFEST = Object.freeze({
  "lf-1001": ["Gongura Pickle 500 gms", "Pickles"],
  "lf-1002": ["Mosambi", "Fruits"],
  "lf-1005": ["Baby Corn Pack 200gms", "Vegetables"],
  "lf-1008": ["Water Melon", "Fruits"],
  "lf-1009": ["Yellow Cucumber Dosakaya", "Vegetables"],
  "lf-1013": ["Mint Leaves", "Leafy Green"],
  "lf-1015": ["Bachali Kura", "Leafy Green"],
  "lf-1016": ["Chukka Kura", "Leafy Green"],
  "lf-1018": ["Amla", "Vegetables"],
  "lf-1022": ["Broad Beans Ramabhadrapuram", "Vegetables"],
  "lf-1024": ["Bajji Mirchi", "Vegetables"],
  "lf-1026": ["Coconut", "Vegetables"],
  "lf-1029": ["Beans Soaked", "Vegetables"],
  "lf-1034": ["Banana(small)", "Vegetables"],
  "lf-1036": ["Brinjal (Long-White)", "Vegetables"],
  "lf-1050": ["Capsicum", "Vegetables"],
  "lf-1051": ["Coconut mango", "Fruits"],
  "lf-1053": ["Green Peas", "Vegetables"],
  "lf-1055": ["Tapioca/Cassava", "Vegetables"],
  "lf-1056": ["Muskmelon", "Fruits"],
  "lf-1057": ["Mango Ginger", "Vegetables"],
  "lf-1059": ["Raw Banana", "Vegetables"],
  "lf-1060": ["Kiwifruit", "Fruits"],
  "lf-1063": ["Thotakura", "Leafy Green"],
  "lf-1064": ["Amaranth", "Leafy Green"],
  "lf-1068": ["Broccoli", "Vegetables"],
  "lf-1074": ["White Brinjal", "Vegetables"],
  "lf-1075": ["Snake Guard", "Vegetables"],
  "lf-1076": ["Colocasia", "Vegetables"],
  "lf-1077": ["Tamarind(seed less)", "Vegetables"],
  "lf-1078": ["Spring Onions", "Vegetables"],
  "lf-1079": ["White Chrysanthemum", "Flowers"],
  "lf-1080": ["Marigold Flowers", "Flowers"],
  "lf-1085": ["Toor Dal", "Groceries"],
  "lf-1087": ["Moong Dal", "Groceries"],
  "lf-1088": ["Urad Dal", "Groceries"],
  "lf-1089": ["Ground Nuts", "Groceries"],
  "lf-1090": ["White Peas", "Groceries"],
  "lf-1091": ["Brown Chana", "Groceries"],
  "lf-1092": ["Chickpeas", "Groceries"],
  "lf-1095": ["Dry Red Chilli", "Groceries"],
  "lf-1097": ["Cashew Whole", "Groceries"],
  "lf-1098": ["Rice Flour", "Groceries"],
  "lf-1099": ["Besan Flour", "Groceries"],
  "lf-1100": ["Sugar", "Groceries"],
  "lf-1102": ["Finger Millet Flour", "Groceries"],
  "lf-1104": ["Jaggery", "Groceries"],
  "lf-1105": ["Rice flakes", "Groceries"],
  "lf-1106": ["Gongura", "Leafy Green"],
});

export function getLocalFreshIllustration(product) {
  const id=String(product?.id||'');
  const entry=LOCALFRESH_IMAGE_MANIFEST[id];
  if(!entry)return null;
  const [expectedName,expectedCategory]=entry;
  if(normalizeItem(product?.name)!==normalizeItem(expectedName) ||
     normalizeItem(product?.category)!==normalizeItem(expectedCategory))return null;
  if(!aiImageEligible(product?.name,product?.category))return null;
  return '/product-images/'+id+'.webp';
}
export const LOCALFRESH_ILLUSTRATION_COUNT=Object.keys(LOCALFRESH_IMAGE_MANIFEST).length;
