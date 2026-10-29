/*
 * Name-first product imagery.
 * Never reuse a generic stock photograph for an unrelated product name.
 * Only explicit matches below are allowed to show photography; uncommon
 * local varieties and packaged brands receive a clearly labelled illustration
 * rather than a photo of a different SKU or flower.
 *
 * All entries remain editable through the actual product/catalog records;
 * these illustrations do not change prices, stock or store inventory.
 */
// A small first image, with optional modest 2x density. Never fetch original-size files.
const photo = id => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=240&q=52&fm=webp`;
// File names below are taken from verified Commons file pages. Wikimedia's
// width parameter requests a thumbnail instead of a multi-megabyte original.
const commons = file => `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=240`;
const exactPhotoRules = [
  [/^ash gourd$/i, commons('India Ash Gourd.jpg')],
  [/^(?:potols?|pointed gourd|parval)$/i, commons('Pointed gourd 20220828 165712.jpg')],
  [/\b(?:lady finger|bhindi|okra)\b/i, commons('Lady fingers at Gara market, Srikakulam.jpg')],
  [/^bottle gourd$/i, commons('Bottle gourd in andhra farm.jpg')],
  [/\b(?:beerakaya|ridge gourd)\b/i, commons('Ridge Gourd Southern India.jpg')],
  [/^ivy gourd$/i, commons('Ivy gourd.jpg')],
  [/^carrot$|^gaajar carrot$|^crunchy orange ooty carrots$/i, commons('Carrots ooty.JPG')],
  [/^coriander$/i, commons('Coriander Leaves.jpg')],
  [/^chana dal$/i, commons('Chana Dal (split Bengal gram).JPG')],
  [/^rajma beans$/i, commons('Chitra Rajma.jpg')],
  [/^green chilli$|^spicy andhra green chillies$/i, commons('Green-chillies.jpg')]
];
const responsivePhoto = url => {
  if (!url) return null;
  if (url.startsWith('https://images.unsplash.com/'))
    return [url, url.replace('w=240&q=52','w=420&q=56')];
  if (url.startsWith('https://commons.wikimedia.org/'))
    return [url, url.replace('width=240','width=420')];
  return [url,url];
};
// Known representative commodity photos (not claims about a particular brand/package).
const photoRules = [
  [/\b(tomato|tamatar)\b|tomato\(/i, photo('photo-1546470427-0d4db154ceb7')],
  [/\b(potato|alugadda)\b/i, photo('photo-1518977676601-b53f82aba655')],
  [/\b(onion)\b/i, photo('photo-1618512496248-a07fe83aa8cb')],
  [/\b(corn|makka)\b/i, photo('photo-1551754655-cd27e38d2076')],
  [/\b(cabbage)\b/i, photo('photo-1598030304671-5aa1d6f21128')],
  [/\b(garlic|vellulli)\b/i, photo('photo-1540148426945-6cf22a6b2383')],
  [/\b(lemon|nimmakaya)\b(?!.*pickle)/i, photo('photo-1587496679742-bad502958fbf')],
  [/\b(green chilli|bajji mirchi|red chilli|chillies)\b/i, photo('photo-1588252303782-cb80119abd6d')],
  [/\b(orange|mosambi)\b/i, photo('photo-1582979512210-99b6a53386f9')],
  [/\b(apple|royal gala)\b/i, photo('photo-1560806887-1e4cd0b6cbd6')],
  [/\b(water\s?melon)\b/i, photo('photo-1587049352846-4a222e784d38')],
  [/\b(banana)\b(?!.*raw)/i, photo('photo-1571771894821-ce9b6c11b08e')],
  [/\b(milk)\b/i, photo('photo-1550583724-b2692b85b150')],
  [/\b(eggs?)\b/i, photo('photo-1506976785307-8732e854ad03')],
  [/\b(butter)\b/i, photo('photo-1589985270826-4b7bb135bc9d')],
  [/\b(bread)\b/i, photo('photo-1509440159596-0249088772ff')],
  [/\b(spinach dock|palak)\b/i, photo('photo-1576045057995-568f588f82fb')]
];
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
  const normalized=String(name||'Product').replace(/\s+/g,' ').trim();
  return normalized.length>40 ? normalized.slice(0,37).trimEnd()+'…' : normalized;
}
export function getCatalogVisual(product) {
  const name = String(product?.name || '');
  const category = String(product?.category || '');
  const key = name.toLowerCase();
  const icon = iconRules.find(([rx])=>rx.test(key))
    || (/(flower)/i.test(category) ? [null,['💐','#f6e9ed']] : null)
    || (/(fruit)/i.test(category) ? [null,['🍎','#f3ebdf']] : null)
    || (/(vegetable|produce|leafy)/i.test(category) ? [null,['🥬','#e8f1e5']] : null)
    || [null,['🛒','#edf1e9']];
  // Restrict photos to single raw commodity names, never substitute packaged
  // products, pickles or regional specialty variants with unrelated stock photos.
  const isSpecialty = /pickle|pachadi|avakaya|dried|powder|masala|processed|flavoured|packed|package|baby corn|juice|drink|garland|small|raw banana|mango ginger|flowers|leaves|lotus|chrysanthemum|jasmine|hibiscus|betel|marigold/i.test(key);
  const photoMatch = !isSpecialty ? [...exactPhotoRules,...photoRules].find(([rx])=>rx.test(name)) : null;
  const isBrandSpecific = /\b(amul|heritage|epigamia|britannia|fortune|saffola|aashirvaad|srilalitha|double horse|tata|catch|everest|24 mantra|pri?ya|bambino|maggi|lay|haldiram|parle|pepsi|coca|sprite|thums|real activ|paper boat|pampers|himalaya|johnson|whisper|dove|colgate|vim|surf excel)\b/i.test(name);
  const matchedPhoto = !isBrandSpecific && photoMatch ? photoMatch[1] : null;
  const commonsName = matchedPhoto?.includes('/Special:FilePath/')
    ? decodeURIComponent(matchedPhoto.split('/Special:FilePath/')[1].split('?')[0])
    : null;
  const variants=responsivePhoto(matchedPhoto);
  return {
    photo: matchedPhoto,
    photoSrcSet: variants ? `${variants[0]} 240w, ${variants[1]} 420w` : null,
    photoSource: matchedPhoto?.includes('wikimedia.org') ? 'Wikimedia Commons' : matchedPhoto ? 'Unsplash' : null,
    photoCreditUrl: commonsName
      ? `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(commonsName)}`
      : null,
    emoji: icon[1][0],
    background: icon[1][1],
    label: shortLabel(name),
    isIllustration: !(!isBrandSpecific && photoMatch)
  };
}
