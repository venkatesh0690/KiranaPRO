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
 * Banner photography policy:
 * - Non-LocalFresh store previews and all generic checkout offers show ONLY
 *   packaged groceries, pulses, snacks, bottled drinks or household products.
 * - Fruit, vegetables and leafy produce are exclusive to LocalFresh visuals.
 * No photo is represented as the actual merchant's premises.
 *
 * All non-LocalFresh source pages were selected as retail-packaging scenes.
 * The server returns a small photo from Unsplash, not an original large image.
 */
export const NEIGHBORHOOD_BANNER_PHOTO_IDS=Object.freeze([
  'FAziP8fKUNg', // packaged rice and pulses aisle
  '3VoUDb-sVt4', // supermarket snack shelves
  'ku-iy4fOVIQ', // packaged foods and beverages
  'ivfp_yxZuYQ', // cereal, dairy and grocery aisles
  '7H-CWW3rz9U'  // Indian packet snacks
]);
const photoUrl=id =>
  `https://unsplash.com/photos/${id}/download?force=true&w=900&h=250&q=54&fm=webp`;
const OFFER_PHOTOS=Object.freeze({
  delivery:photoUrl('FAziP8fKUNg'),
  basket:photoUrl('ivfp_yxZuYQ'),
  welcome:photoUrl('3VoUDb-sVt4'),
  repeat:photoUrl('7H-CWW3rz9U'),
  tenth:photoUrl('ku-iy4fOVIQ'),
  pantry:photoUrl('FAziP8fKUNg')
});
const LOCALFRESH_PHOTO=photoUrl('wguVC8oG3qw');

export function getEditorialBannerPhoto(slide) {
  if(isLocalFreshStore(slide?.store)) {
    const verifiedRepresentative=slide?.bannerPhoto;
    return {
      src:typeof verifiedRepresentative==='string' && /^https:\/\//.test(verifiedRepresentative)
        ? verifiedRepresentative : LOCALFRESH_PHOTO,
      backup:LOCALFRESH_PHOTO,
      alt:'Representative photograph of LocalFresh fresh vegetable market'
    };
  }
  // Ignore non-LocalFresh bannerPhoto. Even if an existing store gallery is
  // accidentally configured with a produce shot, the homepage won't show it.
  let key='pantry';
  if(slide?.kind==='global')key='delivery';
  else if(slide?.kind==='automatic')key='basket';
  else if(slide?.kind==='coupon'){
    if(slide.code==='WELCOME')key='welcome';
    else if(slide.code==='REPEAT')key='repeat';
    else if(slide.code==='ADDICTED')key='tenth';
  }
  return {
    src:OFFER_PHOTOS[key],
    backup:OFFER_PHOTOS.pantry,
    alt:'Representative photograph of packaged groceries or household items'
  };
}
