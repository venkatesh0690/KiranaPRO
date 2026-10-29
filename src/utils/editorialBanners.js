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
