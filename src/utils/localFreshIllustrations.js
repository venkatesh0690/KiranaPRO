// Reviewed LocalFresh illustrations supplied for this catalog update.
// These are illustrative assets, NOT photographs of exact branded packaging.
// Only approved catalog IDs resolve; 1204.webp was excluded (no matching SKU).
import { aiImageEligible } from './aiImagePolicy.js';

const APPROVED_ILLUSTRATIONS=new Set([
  "lf-1001",
  "lf-1002",
  "lf-1005",
  "lf-1008",
  "lf-1009",
  "lf-1013",
  "lf-1015",
  "lf-1016",
  "lf-1018",
  "lf-1022",
  "lf-1024",
  "lf-1026",
  "lf-1029",
  "lf-1034",
  "lf-1036",
  "lf-1050",
  "lf-1051",
  "lf-1053",
  "lf-1055",
  "lf-1056",
  "lf-1057",
  "lf-1059",
  "lf-1060",
  "lf-1063",
  "lf-1064",
  "lf-1068",
  "lf-1074",
  "lf-1075",
  "lf-1076",
  "lf-1077",
  "lf-1078",
  "lf-1079",
  "lf-1080",
  "lf-1085",
  "lf-1087",
  "lf-1088",
  "lf-1089",
  "lf-1090",
  "lf-1091",
  "lf-1092",
  "lf-1095",
  "lf-1097",
  "lf-1098",
  "lf-1099",
  "lf-1100",
  "lf-1102",
  "lf-1104",
  "lf-1105",
  "lf-1106"
]);
export function getLocalFreshIllustration(product) {
  const id=String(product?.id||'');
  if(!APPROVED_ILLUSTRATIONS.has(id))return null;
  if(!aiImageEligible(product?.name,product?.category))return null;
  return '/product-images/'+id+'.webp';
}
export const LOCALFRESH_ILLUSTRATION_COUNT=APPROVED_ILLUSTRATIONS.size;
