/**
 * Search identities for real product photography. Deliberately separate from
 * labels, selling units, discounts and the old, misleading catalog image field.
 * Sources are public Commons photographs; packaged goods use an ingredient /
 * product-type photograph unless an exact seller-verified image is supplied.
 */
const exceptions = [
  [/potols?|parval|pointed gourd/i, "pointed gourd Trichosanthes dioica"],
  [/baby corn/i, "baby corn cob vegetables"],
  [/dosakaya/i, "dosakaya yellow cucumber Andhra"],
  [/lady fingers?|bhindi|okra/i, "okra pods vegetable"],
  [/barabati|barbati/i, "yardlong beans vegetable"],
  [/broad beans/i, "broad beans vegetable"],
  [/cluster beans/i, "guar cluster beans"],
  [/beans.?pencil|french beans/i, "green beans vegetable"],
  [/beans soaked/i, "soaked green legumes bowl"],
  [/rajma/i, "red kidney beans"],
  [/bajji mirchi/i, "large green chilli peppers"],
  [/brinjal|eggplant/i, "eggplant aubergine vegetable"],
  [/beera.?kaya|ridge gourd/i, "ridge gourd luffa vegetable"],
  [/snake guard|snake gourd/i, "snake gourd vegetable"],
  [/bottle gourd/i, "bottle gourd vegetable"],
  [/ash gourd/i, "winter melon ash gourd vegetable"],
  [/ivy gourd/i, "ivy gourd tindora vegetables"],
  [/bitter gourd/i, "bitter melon karela"],
  [/tapioca|cassava/i, "cassava tuber roots"],
  [/colocasia/i, "taro colocasia root"],
  [/yam/i, "elephant foot yam root"],
  [/tamarind/i, "tamarind pods"],
  [/mango ginger/i, "mango ginger Curcuma amada rhizomes"],
  [/raw banana/i, "green plantain unripe banana"],
  [/small banana/i, "small banana fruit"],
  [/coconut mango/i, "ripe mango fruit"],
  [/muskmelon/i, "cantaloupe melon fruit"],
  [/water ?melon/i, "watermelon fruit"],
  [/kiwifruit|kiwi/i, "kiwifruit slices"],
  [/mosambi/i, "sweet lime citrus fruit"],
  [/baby oranges|pulpy orange/i, "orange citrus fruit"],
  [/dragon fruit/i, "pitaya dragon fruit"],
  [/amla/i, "Indian gooseberry amla fruit"],
  [/gongura.*pickle|gongura.*pachadi/i, "gongura sorrel leaf Indian pickle"],
  [/gongura/i, "gongura sorrel leaves"],
  [/chukka kura/i, "sorrel leafy greens"],
  [/bachali kura/i, "malabar spinach leaves"],
  [/thotakura|amaranth/i, "amaranth leafy greens"],
  [/curry leaves/i, "curry leaves Murraya koenigii"],
  [/spinach dock/i, "spinach green leaves"],
  [/mint leaves/i, "mint leaves herb"],
  [/jasmine|malli|mallepoolu/i, "jasmine flowers garland"],
  [/marigold|banthi/i, "marigold flowers orange yellow"],
  [/chrysanthemum|sevvanthi/i, "chrysanthemum flowers"],
  [/hibiscus|mandaram/i, "red hibiscus flower"],
  [/lotus|kamalam/i, "pink lotus flower"],
  [/tulasi|holy basil/i, "holy basil tulsi leaves"],
  [/betel leaves|tamalapaku/i, "betel leaves"],
  [/mango leaves|toran/i, "mango leaf toran"],
  [/pooja flower box/i, "mixed colorful Indian flowers"],
  [/avakaya|mango.*pickle|maagaya/i, "Indian mango pickle achaar"],
  [/lemon.*pickle/i, "Indian lemon pickle achaar"],
  [/ginger.*pickle/i, "Indian ginger pickle achaar"],
  [/tomato.*pickle/i, "Indian tomato pickle achaar"],
  [/chilli.*pickle/i, "Indian red chilli pickle"],
  [/garlic.*pickle/i, "garlic Indian pickle"],
  [/gongura/i, "gongura sorrel leaves"],
  [/idly ravva|idli rava/i, "idli rava rice semolina"],
  [/minapagundlu|urad gota/i, "urad dal white lentils"],
  [/toor dal/i, "toor dal pigeon peas"],
  [/chana dal/i, "chana dal split chickpeas"],
  [/moong dal/i, "yellow mung dal lentils"],
  [/urad dal/i, "urad dal black gram"],
  [/brown chana|chickpea/i, "brown chickpeas legumes"],
  [/white peas/i, "dried white peas"],
  [/ground nut|peanut/i, "peanuts shelled"],
  [/cashew/i, "cashew nuts"],
  [/sesame/i, "sesame seeds"],
  [/mustard seeds/i, "black mustard seeds spice"],
  [/finger millet/i, "ragi finger millet flour"],
  [/rice flakes/i, "poha flattened rice"],
  [/rice flour/i, "rice flour bowl"],
  [/besan/i, "gram chickpea flour"],
  [/sugar/i, "white sugar crystals"],
  [/jaggery/i, "jaggery gur blocks"],
  [/vermicelli/i, "vermicelli pasta strands"],
  [/basmati rice/i, "basmati rice grains"],
  [/sona masoori/i, "white rice grains"],
  [/atta|chakki/i, "whole wheat flour atta"],
  [/sunflower oil/i, "sunflower cooking oil bottle"],
  [/gingelly|sesame oil/i, "sesame oil bottle"],
  [/ghee/i, "clarified butter ghee jar"],
  [/turmeric/i, "turmeric powder bowl"],
  [/red chilli powder/i, "red chilli spice powder"],
  [/coriander.*powder/i, "coriander powder spice"],
  [/garam masala/i, "garam masala spices powder"],
  [/milk/i, "milk carton dairy"],
  [/curd|dahi/i, "yogurt curd bowl"],
  [/butter/i, "salted butter"],
  [/eggs?/i, "chicken eggs"],
  [/bread/i, "sliced wheat bread loaf"],
  [/guava.*drink/i, "guava juice drink bottle"],
  [/orange juice/i, "orange juice glass"],
  [/sugarcane.*juice/i, "sugarcane juice glass"],
  [/pepsi|coca cola|sprite|soft drink/i, "cola soft drink can"],
  [/bhujia/i, "aloo bhujia Indian snack"],
  [/lays|lay.s|potato chips/i, "masala potato chips"],
  [/good day|cookies/i, "butter cookies biscuits"],
  [/maggi|instant noodles/i, "instant noodles bowl"],
  [/diaper|pampers/i, "baby diaper pack"],
  [/baby wipes/i, "baby wet wipes pack"],
  [/soap|beauty bar/i, "bath soap bar"],
  [/sanitary pads|whisper/i, "sanitary pad package"],
  [/toothpaste/i, "toothpaste tube"],
  [/detergent|surf excel/i, "laundry detergent powder pack"],
  [/dishwash|vim/i, "dishwashing liquid bottle"],
  [/agarbatti|incense/i, "incense sticks"],
  [/camphor|karpuram/i, "camphor tablets"]
];
export const BRAND_NAMES=/\b(amul|heritage|epigamia|britannia|fortune|freedom|saffola|aashirvaad|srilalitha|double horse|tata|catch|everest|24 mantra|priya|bambino|maggi|lay'?s?|haldiram|parle|pepsi|coca|sprite|thums|real activ|paper boat|pampers|himalaya|johnson|whisper|dove|colgate|vim|surf excel|idhayam|india gate|cycle pure|raw pressery|ocean pink|bhimseni)\b/i;
export const cleanPhotoSearch = text => String(text||"").replace(/[^\p{L}\p{N}\s-]/gu," ").replace(/\s+/g," ").trim().slice(0,100);
export function getPhotoQueries(product) {
  const name=String(product?.name||"").trim();
  const rule=exceptions.find(([regex])=>regex.test(name));
  const primary=cleanPhotoSearch(rule?.[1]||name.replace(/\([^)]*\)/g,"").replace(/\b\d+(?:\.\d+)?\s*(?:kg|gms?|grams?|ml|l|litre|pcs|pack)\b/gi,""));
  const fallback=cleanPhotoSearch(primary.split(/\s+/).slice(0,3).join(" "));
  const isPackaged=BRAND_NAMES.test(name)||/pickle|pachadi|avakaya|pack|bar|soap|bottle|powder|masala|juice|curd|detergent|oil/i.test(name);
  return {
    primary:primary||"grocery product",
    fallback:fallback||"food grocery",
    branded:BRAND_NAMES.test(name),
    packaged:isPackaged,
    exactName:cleanPhotoSearch(name),
    category:cleanPhotoSearch(product?.category||"")
  };
}
export function scoreCommonsPhoto(item,terms) {
  const title=String(item?.title||"").replace(/^File:/i,"").replace(/\.[^.]+$/,"").replace(/[_-]/g," ").toLowerCase();
  if(!title||/logo|icon|svg|clipart|drawing|illustration|diagram|painting|cartoon|flag|symbol|poster|screenshot|certificate|map|watermark|banner|advertisement|vector|packaging design/i.test(title))return -100;
  const info=item.imageinfo?.[0];
  if(!info||!/image\/(jpeg|png|webp)/i.test(info.mime||"")||!info.thumburl)return -100;
  if(info.width<200||info.height<150)return -100;
  if(info.width/Math.max(info.height,1)>4||info.height/Math.max(info.width,1)>4)return -100;
  const words=cleanPhotoSearch(terms).toLowerCase().split(" ").filter(w=>w.length>2);
  if(!words.length)return -100;
  let match=0;
  for(const term of words){if(title.includes(term))match+=1}
  // Query titles need a meaningful subject overlap, not just "food" / "India".
  const minMatch=words.length>3?2:1;
  if(match<minMatch)return -100;
  return match*4-(title.length>95?3:0)+(info.mime==="image/jpeg"?2:0);
}
