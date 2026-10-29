/**
 * Editorial poster styling for the single homepage featured carousel.
 * Presentation-only: never changes coupon eligibility, store availability
 * or delivery calculations.
 */
export const POSTER_PALETTES=Object.freeze({
  coral:{bg:'#E86155',ink:'#FFF8EB',muted:'#FFE4D6',accent:'#F7C66A',panel:'#CD483F'},
  leaf:{bg:'#458257',ink:'#FCF7E9',muted:'#E3F0DD',accent:'#FFCF72',panel:'#315D43'},
  navy:{bg:'#505974',ink:'#FFF8EF',muted:'#E7E4EA',accent:'#FAAF93',panel:'#3A405A'},
  mustard:{bg:'#F1B74D',ink:'#2B3A31',muted:'#536147',accent:'#F9E1A4',panel:'#D9942F'},
  cream:{bg:'#F3EDE1',ink:'#263F31',muted:'#5F7164',accent:'#E36D5E',panel:'#E6DBC9'},
  mint:{bg:'#BBD9B5',ink:'#254831',muted:'#43654A',accent:'#F9E9AF',panel:'#A0C99B'}
});

export function getEditorialBannerStyle(slide, index=0) {
  const id=String(slide?.id||'');
  const store=slide?.store;
  let name='leaf';
  if(slide?.isSample) name=['coral','navy','mustard','mint'][index%4];
  else if(id.includes('mandi')) name='leaf';
  else if(id.includes('fresh')) name='coral';
  else if(slide?.kind==='global') name='navy';
  else if(slide?.kind==='automatic') name='mustard';
  else if(slide?.kind==='coupon') name=slide?.rewardEligible===false?'cream':'coral';
  else if(slide?.kind==='picks') name='mint';
  else if(store) name='navy';
  return {name,...POSTER_PALETTES[name]};
}

export function getEditorialBannerHeadline(slide) {
  if(slide?.isSample) return String(slide?.store?.name||slide?.title||'LOCAL STORE').toUpperCase();
  if(slide?.kind==='global') return 'DELIVERY.\nON US.';
  if(slide?.kind==='automatic') return 'GOOD CART.\nGOOD SAVINGS.';
  if(slide?.kind==='coupon') {
    const code=String(slide?.code||'');
    if(code==='WELCOME') return slide.rewardEligible===false?'YOUR FIRST.\nBIG HELLO.':'FIRST ORDER.\n₹30 OFF.';
    if(code==='REPEAT') return 'COME BACK.\nSAVE MORE.';
    if(code==='ADDICTED') return 'YOUR TENTH.\n₹50 OFF.';
  }
  if(slide?.kind==='picks')return 'GOOD THINGS.\nNEAR YOU.';
  if(String(slide?.id||'').includes('mandi')) return 'FRESH FROM\nTHE MANDI.';
  if(String(slide?.id||'').includes('fresh')) return 'COLOURFUL.\nNATURALLY.';
  return String(slide?.title||'SHOP LOCAL.').toUpperCase();
}

export function getEditorialBannerMarker(slide,index=0) {
  if(slide?.isSample)return 'STORE PREVIEW';
  if(slide?.kind==='coupon')return slide.rewardEligible===false?'UPCOMING REWARD':'YOUR REWARD';
  if(slide?.kind==='automatic')return 'BASKET BONUS';
  if(slide?.kind==='global')return 'NEIGHBORHOOD ONLY';
  if(slide?.kind==='picks')return 'CURATED CATALOG';
  if(slide?.kind==='store')return 'THE LOCAL EDITION';
  return 'DAILY ESSENTIALS';
}

/**
 * Every homepage poster has genuine representative food/market photography,
 * never just a flat fill. Prefer the selected store's existing photograph;
 * use small, responsive WebP images for offer and generic category posters.
 * These are editorial illustrations of the shopping theme, NOT photos of
 * registered merchants or exact branded packages.
 */
const posterPhoto = (id) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&h=500&q=58&fm=webp`;

const HERO_PHOTOS=Object.freeze({
  market:posterPhoto('photo-1578916171728-46686eac8d58'),
  fresh:posterPhoto('photo-1542838132-92c53300491e'),
  produce:posterPhoto('photo-1590779033100-9f60a05a013d'),
  pantry:posterPhoto('photo-1606787366850-de6330128bfc'),
  grocery:posterPhoto('photo-1604719312566-8912e9227c6a'),
  home:posterPhoto('photo-1556909114-f6e7ad7d3136')
});

export function getEditorialBannerPhoto(slide) {
  const id=String(slide?.id||'').toLowerCase();
  const name=String(slide?.title||'').toLowerCase();
  let photo=HERO_PHOTOS.market;
  if(slide?.bannerPhoto && /^https:\/\//.test(slide.bannerPhoto)) {
    return {src:slide.bannerPhoto,backup:HERO_PHOTOS.market,
      alt:`Representative store imagery for ${slide.store?.name||slide.title}`};
  }
  if(id.includes('mandi')||id.includes('fresh')||name.includes('fruit'))
    photo=HERO_PHOTOS.fresh;
  else if(slide?.kind==='global')photo=HERO_PHOTOS.grocery;
  else if(slide?.kind==='automatic')photo=HERO_PHOTOS.pantry;
  else if(slide?.kind==='coupon') {
    photo=slide.code==='WELCOME'?HERO_PHOTOS.produce:
      slide.code==='REPEAT'?HERO_PHOTOS.grocery:HERO_PHOTOS.pantry;
  }
  else if(slide?.kind==='picks')photo=HERO_PHOTOS.produce;
  else if(name.includes('home')||name.includes('clean'))photo=HERO_PHOTOS.home;
  return {src:photo,backup:photo===HERO_PHOTOS.market?HERO_PHOTOS.fresh:HERO_PHOTOS.market,
    alt:`Representative grocery photography for ${slide?.title||'local shopping'}`};
}
