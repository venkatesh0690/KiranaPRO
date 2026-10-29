/*
 * Catalog-wide product-image audit.
 * Product.image contained reused, mismatched generic stock photos; NEVER
 * display it until a seller supplies an explicit verifiedImageUrl and source.
 * Genuine produce photography is whitelist-matched to actual commodities.
 * Packaged brands or unmatched specialty items use distinct labelled
 * product icons rather than misleading photographs.
 * Images load as small thumbnails, with a modest larger modal variant.
 */
const commons = (file,w) => "https://commons.wikimedia.org/wiki/Special:FilePath/"+encodeURIComponent(file)+"?width="+w;
const unsplash = (id,w,q) => "https://images.unsplash.com/"+id+"?auto=format&fit=crop&w="+w+"&q="+q+"&fm=webp";
const COMMONS_DATA=[["^ash gourd$","India Ash Gourd.jpg"],["^(potols?|pointed gourd|parval)$","Pointed gourds at a market.jpg"],["^(lady finger(?:\\s*/\\s*bhindi)?|bhindi|okra)$","Lady fingers at Gara market, Srikakulam.jpg"],["^(beerakaya|ridge gourd)$","Beerakaayalu.JPG"],["^bottle gourd$","Bottle gourd in andhra farm.jpg"],["^ivy gourd$","Ivy gourd.jpg"],["^bitter gourd$","Bitter gourd at Hyderabad market.jpg"],["^cluster beans?$","Cluster bean.jpg"],["^white radish(?: 3 piece)?$","White Radish.jpg"],["^drumsticks$","Munaga kaayalu.JPG"],["^yam$","Local variety of Yam at Anandapuram 02.jpg"],["^coriander$","Coriander Leaves.jpg"],["^curry leaves$","Fresh curry leaves.jpg"],["^chana dal$","Chana Dal (split Bengal gram).JPG"],["^rajma beans$","Chitra Rajma.jpg"],["^sesame seeds$","Sesame-Seeds.jpg"],["^guava$","Guava Slices.jpg"],["^avocado$","Avocado fruit.jpg"],
["^pomegranate$","Pomegranate fruit - whole and piece with arils.jpg"],
["^red dragon fruit$","Dragon Fruit Sliced.jpg"],["^(carrot|gaajar carrot|crunchy orange ooty carrots)$","Carrots ooty.JPG"],["^(bajji mirchi|green chilli|spicy andhra green chillies)$","Green-chillies.jpg"],["^(black brinjal|black eggplant|brinjal\\(long\\)|brinjal \\(long-white\\)|white brinjal)$","Brinjal of Tamilnadu.jpg"],["^garlic$","Garlic of Chinna Salem.jpg"],["^(french beans|beans\\(pencil\\)|barabati|barbati)$","Beans for sale.JPG"]];
const UNSPLASH_DATA=[["^(tomato(?:\\(small\\))?|hybrid juicy red tomatoes)$","photo-1546470427-0d4db154ceb7"],["^(potato|jyoti smooth skin potatoes)$","photo-1518977676601-b53f82aba655"],["^(onion|fresh red onions(?: \\(medium size\\))?)$","photo-1618512496248-a07fe83aa8cb"],["^cabbage$","photo-1598030304671-5aa1d6f21128"],["^sweet corn$","photo-1551754655-cd27e38d2076"],["^lemon$","photo-1587496679742-bad502958fbf"],["^(apple|apple royal gala)$","photo-1560806887-1e4cd0b6cbd6"],["^water\\s?melon$","photo-1587049352846-4a222e784d38"],["^(banana|robusta sweet bananas)$","photo-1571771894821-ce9b6c11b08e"],["^(mosambi|baby oranges|pulpy orange)$","photo-1582979512210-99b6a53386f9"],["^spinach dock$","photo-1576045057995-568f588f82fbf"],["^fresh farm eggs(?: \\(golden yolk\\))?$","photo-1506976785307-8732e854ad03"]];
const commonsRules=COMMONS_DATA.map(([pattern,file])=>[new RegExp(pattern,"i"),{kind:"commons",file}]);
const unsplashRules=UNSPLASH_DATA.map(([pattern,id])=>[new RegExp(pattern,"i"),{kind:"unsplash",id}]);
const knownPhotos=[...commonsRules,...unsplashRules];
const blockedBranded=/\b(amul|heritage|epigamia|britannia|fortune|freedom|saffola|aashirvaad|srilalitha|double horse|tata|catch|everest|24 mantra|priya|bambino|maggi|lay|haldiram|parle|pepsi|coca|sprite|thums|real activ|paper boat|pampers|himalaya|johnson|whisper|dove|colgate|vim|surf excel|idhayam|india gate|cycle pure|raw pressery|ocean pink)\b/i;
const blockedProcessed=/pickle|pachadi|avakaya|chutney|sauce|powder|masala|flour|dried|dehydrated|juice|drink|garland|pack|pouch|soap|wipes|detergent|biscuit|baby corn|raw banana|mango ginger|coconut mango/i;
function thumbSource(item,w) {
  return item.kind==="commons"?commons(item.file,w):unsplash(item.id,w,w<200?42:50);
}
function imageCredit(item) {
  return item.kind==="commons"
    ? "https://commons.wikimedia.org/wiki/File:"+encodeURIComponent(item.file)
    : "https://unsplash.com/photos/"+item.id.replace(/^photo-/,"");
}
const iconRules = [
  [/lady finger|bhindi|okra|barabati|barbati/i, ['🫛','#e8f1e3']],
  [/^coriander$|betel leaves?|tamalapaku/i, ['🌿','#e8f1e1']],
  [/coriander \(dhania\) powder|coriander powder/i, ['🌶️','#f6ebdf']],
  [/beauty bar|body bar|bath soap/i, ['🧼','#eaf0ee']],
  [/lotus|kamalam/i, ['🪷','#f8e9f2']],
  [/hibiscus|mandaram/i, ['🌺','#fae8e7']],
  [/jasmine|malli|mallepoolu/i, ['🌼','#f8f3e5']],
  [/marigold|banthi|sevvanthi|chrysanthemum/i, ['🌼','#fff1cf']],
  [/pooja flower|flower box|flowers/i, ['💐','#f4e8ed']],
  [/tulasi|holy basil|betel leaf|mango leaves|toran/i, ['🌿','#e8f1e3']],
  [/pickle|pachadi|avakaya|chutney/i, ['🫙','#f8efdd']],
  [/gongura|chukka kura|thotakura|bachali|amaranth|spinach|curry leaves|mint leaves|coriander leaves|leafy/i, ['🥬','#e9f2e7']],
  [/mango ginger/i, ['🫚','#f4e9d6']],
  [/ginger|allam/i, ['🫚','#f1e8d8']],
  [/garlic|vellulli/i, ['🧄','#f1ede3']],
  [/spring onions|onion/i, ['🧅','#f0e6e9']],
  [/potato|alugadda|sweet potato/i, ['🥔','#eee4d3']],
  [/tomato/i, ['🍅','#f8e8e4']],
  [/radish|carrot|gaajar/i, ['🥕','#f7e9dc']],
  [/bajji mirchi|chilli|mirapa/i, ['🌶️','#f6e7df']],
  [/brinjal|eggplant/i, ['🍆','#f1e8f4']],
  [/bottle gourd|ash gourd|bitter gourd|ivy gourd|beerakaya|snake guard|dosakaya|potols|cucumber|zucchini/i, ['🥒','#eaf2df']],
  [/broad beans|cluster beans|barabati|french beans|pencil beans|soaked beans|drumsticks|green peas|white peas/i, ['🫛','#edf3e4']],
  [/broccoli/i, ['🥦','#e6f0e3']],
  [/cauliflower|cabbage/i, ['🥬','#edf3e5']],
  [/mushroom/i, ['🍄','#f0e5d8']],
  [/corn/i, ['🌽','#fff1ce']],
  [/capsicum|bell pepper/i, ['🫑','#ecf2e4']],
  [/beetroot/i, ['🫜','#f3e4eb']],
  [/yam|colocasia|cassava|tapioca/i, ['🥔','#eee6d7']],
  [/tamarind/i, ['🫘','#f3e9d8']],
  [/coconut mango/i, ['🥭','#f8eed5']],
  [/coconut/i, ['🥥','#ede9e0']],
  [/dragon fruit/i, ['🍈','#f7e5ee']],
  [/pomegranate/i, ['🔴','#f7e5e6']],
  [/avocado/i, ['🥑','#e7efe0']],
  [/kiwi/i, ['🥝','#edf0dd']],
  [/guava/i, ['🍐','#e8f0df']],
  [/water\s?melon/i, ['🍉','#f8e9e1']],
  [/muskmelon/i, ['🍈','#f5ead8']],
  [/mosambi|orange/i, ['🍊','#f9ebd8']],
  [/lemon/i, ['🍋','#faf1d9']],
  [/amla|gooseberry/i, ['🟢','#ecf3e3']],
  [/mango/i, ['🥭','#f8eed5']],
  [/banana/i, ['🍌','#fbf4d9']],
  [/apple/i, ['🍎','#f8e6e3']],
  [/butter|ghee/i, ['🧈','#fff1d4']],
  [/milk|curd|yogurt|paneer|cheese/i, ['🥛','#eaf0f1']],
  [/eggs?/i, ['🥚','#f3ede2']],
  [/bread|biscuit|cookies|toast/i, ['🍞','#f3eadc']],
  [/toor dal|chana dal|moong dal|urad dal|lentil|pulses|rajma|chickpeas|brown chana|beans/i, ['🫘','#efe4d8']],
  [/rice|ravva|rava|atta|flour|besan|millet|vermicelli|flakes/i, ['🌾','#f1ebdc']],
  [/ground nut|peanut|cashew|sesame|mustard seed|jaggery|sugar/i, ['🥜','#f2e9d9']],
  [/chilli powder|spice|turmeric|coriander powder|masala/i, ['🌶️','#f6ebe0']],
  [/oil|sunflower/i, ['🫙','#f5eedb']],
  [/juice|soda|cola|pepsi|sprite|drink|water bottle/i, ['🥤','#e8f1ec']],
  [/vermicelli/i, ['🍝','#f3e9d7']],
  [/idly ravva|minapagundlu/i, ['🌾','#efe7d7']],
  [/avakaya|gongura pickle|pachadi/i, ['🫙','#f9ebdf']],
  [/biscuit|parle-g|cookies/i, ['🍪','#f4eadd']],
  [/cucumber|dosakaya|beerakaya|potols/i, ['🥒','#e8f1de']],
  [/chrysanthemum|marigold/i, ['🌼','#fff1cf']],
  [/amla/i, ['🟢','#e6f0e2']],
  [/noodle|maggi/i, ['🍜','#f3e9d7']],
  [/snack|bhujia|kurkure|chips|lay's/i, ['🍿','#faebdf']],
  [/chocolate|oreo|sweet/i, ['🍫','#f4e6dd']],
  [/soap|body wash|shampoo|toothpaste|detergent|dishwash|surf excel|vim/i, ['🧴','#e8eef1']],
  [/diaper|pampers|baby wipes|sanitary pads/i, ['🧸','#f4e7ef']],
  [/agarbatti|camphor|pooja|incense/i, ['🪔','#f4ebdd']],
  [/cleaning|broom|brush/i, ['🧹','#e9f0ed']]
];
function shortLabel(name) {
  const text=String(name||"Product").replace(/\s+/g," ").trim();
  return text.length>40 ? text.slice(0,37).trimEnd()+"…" : text;
}
export function getCatalogVisual(product) {
  const name=String(product?.name||"").trim();
  const category=String(product?.category||"");
  const icon=iconRules.find(([rx])=>rx.test(name.toLowerCase()))
    || (/(flower)/i.test(category)?[null,["💐","#f6e9ed"]]:null)
    || (/(fruit)/i.test(category)?[null,["🍎","#f3ebdf"]]:null)
    || (/(vegetable|produce|leafy)/i.test(category)?[null,["🥬","#e8f1e5"]]:null)
    || [null,["🛒","#edf1e9"]];
  // Verified, provenance-backed merchant images can provide exact packaging.
  const merchant=product?.verifiedImageUrl;
  const exactPhoto=typeof merchant==="string" && /^https:\/\//.test(merchant)
    && typeof product.imageSourceUrl==="string" && /^https:\/\//.test(product.imageSourceUrl);
  const allowed=!blockedBranded.test(name) && !blockedProcessed.test(name);
  const item=allowed?knownPhotos.find(([pattern])=>pattern.test(name))?.[1]:null;
  const photo=exactPhoto ? merchant : item ? thumbSource(item,160) : null;
  const highRes=item && !exactPhoto ? thumbSource(item,320) : null;
  return {
    photo,
    photoSrcSet: highRes ? photo+" 160w, "+highRes+" 320w" : null,
    photoSource:exactPhoto ? "Seller verified image"
      : item?.kind==="commons" ? "Wikimedia Commons" : item ? "Unsplash" : null,
    photoCreditUrl:exactPhoto ? product.imageSourceUrl : item ? imageCredit(item) : null,
    emoji: icon[1][0]==="🛒" && typeof product?.fallbackEmoji==="string" ? product.fallbackEmoji : icon[1][0],
    background:icon[1][1],
    label:shortLabel(name),
    isIllustration:!photo
  };
}
