import { isLocalFreshStore } from '../data/deliveryAreas.js';

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
  if(slide?.kind==='global') return 'FREE\nDELIVERY.';
  if(slide?.kind==='automatic') return 'SAVE UP TO\n₹30.';
  if(slide?.kind==='coupon') {
    const code=String(slide?.code||'');
    if(code==='WELCOME') return 'WELCOME.\n₹30 OFF.';
    if(code==='REPEAT') return 'REPEAT.\n₹20 OFF.';
    if(code==='ADDICTED') return '10TH ORDER.\n₹50 OFF.';
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
 * Neon offer photography, inspired by the user's pink-light-trail and
 * rain-on-glass bokeh references. Abstract backgrounds contain no store names,
 * produce, packaged food or misleading pictures of any participating merchant.
 *
 * These are public Unsplash photographs (not expensive full-resolution images).
 * Crop/size and WebP are requested at the source. Fallbacks use other neon photos.
 */
export const NEON_PHOTO_IDS=Object.freeze({
  rain:'SI2Vki55P7E',        // Dante Candal: pink/blue raindrops on glass
  ribbons:'6uJbRVYrUMw',    // Zoya Marinova: purple/red light streaks
  pink:'BYcm0lb-egA',       // Liana S: dark pink-purple light trails
  city:'0gTY-Qt00a4',       // Aleksey Cherenkevich: rain bokeh at night
  laser:'Vm0qUzxRyvU',      // Liana S: colorful neon light trails
  violet:'G17GOEl0_P0'      // Logan Voss: abstract neon wave
});
const photoUrl=(id)=>`https://unsplash.com/photos/${id}/download?force=true&w=900&h=250&q=56&fm=webp`;
const BACKGROUNDS=Object.freeze({
  delivery:NEON_PHOTO_IDS.rain,
  basket:NEON_PHOTO_IDS.ribbons,
  welcome:NEON_PHOTO_IDS.pink,
  repeat:NEON_PHOTO_IDS.city,
  tenth:NEON_PHOTO_IDS.laser
});

export function getEditorialBannerPhoto(slide) {
  let category='basket';
  if(slide?.kind==='global')category='delivery';
  else if(slide?.kind==='automatic')category='basket';
  else if(slide?.kind==='coupon'){
    if(slide.code==='WELCOME')category='welcome';
    else if(slide.code==='REPEAT')category='repeat';
    else if(slide.code==='ADDICTED')category='tenth';
  }
  return {
    src:photoUrl(BACKGROUNDS[category]),
    backup:photoUrl(NEON_PHOTO_IDS.violet),
    alt:'Abstract blue and pink neon lights, with rain bokeh or light trails'
  };
}
