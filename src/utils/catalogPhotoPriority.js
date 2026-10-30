// Product image order is centralized so storefront cards, modals and admin
// thumbnails all use the same matched asset and correct provenance label.
// 1. Verified exact seller image, 2. user-provided SKU illustration,
// 3. curated representative real photo, 4. discovered remote photo.
export function selectCatalogPhoto(visual,remote,failedUrls=[]) {
  const ok=url=>typeof url==='string' && url.length>0 && !failedUrls.includes(url);
  const real=ok(visual?.photo);
  const verified=real && visual?.photoSource==='Seller verified image';
  if(verified) return {
    photo:visual.photo,srcSet:visual.photoSrcSet||undefined,
    sourceUrl:visual.photoCreditUrl||null,
    photoSource:visual.photoSource,aiIllustration:false
  };
  if(ok(visual?.illustrativePhoto)) return {
    photo:visual.illustrativePhoto,srcSet:undefined,
    sourceUrl:null,photoSource:'AI-generated representative image',
    aiIllustration:true
  };
  if(real) return {
    photo:visual.photo,srcSet:visual.photoSrcSet||undefined,
    sourceUrl:visual.photoCreditUrl||null,
    photoSource:visual.photoSource,aiIllustration:false
  };
  if(ok(remote?.photo)) return {
    photo:remote.photo,srcSet:undefined,sourceUrl:remote.sourceUrl||null,
    photoSource:remote.photoSource||null,
    aiIllustration:remote.match==='illustrative'
  };
  return {photo:null,srcSet:undefined,sourceUrl:null,photoSource:null,aiIllustration:false};
}
