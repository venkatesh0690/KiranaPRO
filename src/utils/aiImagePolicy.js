// Conservative rules: generate AI images only for generic grocery commodities.
// Never synthesize a trademark, branded pack, exact pharmaceutical product,
// certification seal or other packaging-specific claim.
const BRANDS=/\b(amul|maggi|nestle|britannia|parle|fortune|saffola|tata|aashirvaad|surf excel|vim|colgate|dove|lifebuoy|pepsi|coca[ -]?cola|sprite|thums[ -]?up|lays|kurkure|haldiram|pampers|johnson|himalaya|cadbury|oreo|kissan|dabur|hdfc|pat[ae]njali|bambino|pri[y]+a|everest|catch|24 mantra|freedom|heritage|epigamia|real activ|paper boat|double horse|india gate|cycle pure|whisper|detto[l]?|clinic plus|santoor|tide|ariel|rin|comfort|fogg|nivea|closeup|pears)\b/i;
const RESTRICTED=/\b(medicine|tablet|capsule|syrup|injection|prescription|supplement|infant formula|baby formula|sanitary pad|diaper|drug|vitamin|protein powder|antibiotic)\b/i;
const BRAND_CATEGORIES=/\b(branded|baby care|medicine|health supplements|pharmaceutical|cosmetic|personal care)\b/i;
const GENERIC=/\b(fruit|vegetable|leafy|produce|dal|pulse|lentil|bean|rice|sugar|flour|atta|rava|ravva|spice|masala|grocery|groceries|flower|pickles|grain|seed|millet|dry fruit|nuts|oil|household|staple|fresh|egg|milk|curd|yogurt|paneer|soap|detergent|cleaning)\b/i;
export const AI_IMAGE_PROMPT_VERSION='grocery-studio-v1';
export function normalizeItem(value){
  return String(value||'').normalize('NFKC').toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu,' ').trim().replace(/\s+/g,' ').slice(0,160);
}
export function aiImageEligible(name,category){
  const n=String(name||'').trim(), c=String(category||'').trim();
  if(n.length<2||n.length>160||c.length>100) return false;
  if(BRANDS.test(n)||RESTRICTED.test(n)||BRAND_CATEGORIES.test(c)) return false;
  return GENERIC.test(c)||GENERIC.test(n);
}
export function aiImagePrompt(name,category){
  if(!aiImageEligible(name,category)) return null;
  const subject=String(name).trim().slice(0,160);
  const kind=String(category||'Groceries').trim().slice(0,80);
  return [
    'Create one photorealistic, accurate, generic Indian grocery e-commerce product photograph.',
    'Subject: '+subject+'. Product category: '+kind+'.',
    'Show the unbranded physical food or commodity in a realistic form.',
    'For loose spices, grains, pulses, powder and pickles, use a plain ceramic bowl or transparent unlabelled container.',
    'For fruits, vegetables, leaves and flowers, show a small natural grouping, not a shop scene.',
    'For generic household consumables, show a plain unlabelled container only if packaging is necessary.',
    'One centered subject, soft natural studio lighting, pale warm neutral background, square composition.',
    'Correct anatomy, color and regional product appearance.',
    'No text, logos, trademarks, labels, prices, watermarks, hands, people, barcodes or marketing claims.',
    'Do not invent a branded package or a certification badge.'
  ].join(' ');
}
