import { useEffect, useRef, useState } from 'react';
import { getCatalogVisual } from '../utils/catalogVisual';
import { discoverProductPhoto } from '../utils/catalogPhotoClient';

export default function CatalogProductVisual({ product, className = '' }) {
  const visual=getCatalogVisual(product);
  const name=String(product?.name||'Product');
  const key=String(product?.id||'')+':'+name;
  const ref=useRef(null);
  const [visible,setVisible]=useState(false);
  const [remote,setRemote]=useState({key:null,value:null});
  const [failedUrl,setFailedUrl]=useState(null);
  const [requested,setRequested]=useState(null);

  useEffect(()=>{
    const root=ref.current;
    if(!root)return;
    if(typeof IntersectionObserver!=='function'){setVisible(true);return;}
    const observer=new IntersectionObserver(([entry])=>{
      if(entry.isIntersecting){setVisible(true);observer.disconnect();}
    },{rootMargin:'240px 0px'});
    observer.observe(root);
    return ()=>observer.disconnect();
  },[key]);

  const resolvedRemote=remote.key===key ? remote.value : null;
  const initial=visual.photo;
  const staticUsable=initial && initial!==failedUrl;
  const remoteUsable=resolvedRemote?.photo && resolvedRemote.photo!==failedUrl;
  const currentPhoto=staticUsable?initial:remoteUsable?resolvedRemote.photo:null;
  const needSearch=visible && !staticUsable && !remoteUsable &&
    requested!==key;

  useEffect(()=>{
    if(!needSearch)return;
    let mounted=true;
    setRequested(key);
    discoverProductPhoto(product).then(value=>{
      if(mounted)setRemote({key,value});
    });
    return ()=>{mounted=false};
  // Do not depend on needSearch here: setting requested would otherwise
  // clean up this effect before the network result can populate the card.
  },[key,visible,initial,failedUrl]);

  const sourceUrl=staticUsable?visual.photoCreditUrl:remoteUsable?resolvedRemote.sourceUrl:null;
  const photoSource=staticUsable?visual.photoSource:remoteUsable?resolvedRemote.photoSource:null;
  const loading=visible && !currentPhoto &&
    (requested!==key || remote.key!==key);
  return (
    <div ref={ref} className={'kp-catalog-product-visual '+className}
      style={{backgroundColor:visual.background}}
      data-photo-state={currentPhoto?'photo':loading?'loading':'unavailable'}>
      {currentPhoto ? (
        <img className="kp-catalog-photo"
          src={currentPhoto}
          srcSet={staticUsable?visual.photoSrcSet||undefined:undefined}
          sizes={className.includes('kp-modal')?'(max-width: 640px) 280px, 320px':'(max-width: 640px) 95px, 160px'}
          width="160" height="160"
          alt={'Real representative product photo: '+name}
          loading={className.includes('kp-modal')?'eager':'lazy'}
          decoding="async"
          fetchPriority={className.includes('kp-modal')?'auto':'low'}
          onError={()=>setFailedUrl(currentPhoto)}
        />
      ) : (
        <div className={'kp-catalog-image-pending'+(loading?' is-loading':'')}
          role="img" aria-label={loading?'Loading photograph of '+name:'Photograph unavailable for '+name}>
          <span className="kp-catalog-photo-label">{visual.label}</span>
          <span className="kp-catalog-photo-note">{loading?'Loading photo…':'Photo unavailable'}</span>
        </div>
      )}
      {Boolean(sourceUrl) && className.includes('kp-modal') && (
        <a className="kp-product-image-credit" href={sourceUrl}
          target="_blank" rel="noopener noreferrer"
          onClick={event=>event.stopPropagation()}>
          {photoSource==='Merchant verified image'?'Seller photo source':'Representative photo / license'}
        </a>
      )}
    </div>
  );
}
