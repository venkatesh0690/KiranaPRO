import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { getCatalogVisual } from '../utils/catalogVisual';
import { discoverProductPhoto, CATALOG_PHOTO_REFRESH_EVENT } from '../utils/catalogPhotoClient';
import {aiImageEligible} from '../utils/aiImagePolicy';

function CatalogProductVisual({ product, className = '' }) {
  const visual=useMemo(() => getCatalogVisual(product), [product]);
  const name=String(product?.name||'Product');
  const needsVerifiedPackaging=!aiImageEligible(name,product?.category);
  const key=String(product?.id||'')+':'+name;
  const ref=useRef(null);
  const [visible,setVisible]=useState(false);
  const [remote,setRemote]=useState({key:null,value:null});
  const [failedUrl,setFailedUrl]=useState(null);
  const [requested,setRequested]=useState(null);
  const [refreshTick,setRefreshTick]=useState(0);

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

  // When an administrator saves images or a new app version invalidates the
  // photo cache, mounted product tiles should refetch without a page reload.
  useEffect(()=>{
    const refresh=()=>{
      setRequested(null);
      setRemote({key:null,value:null});
      setFailedUrl(null);
      setRefreshTick(t=>t+1);
    };
    window.addEventListener(CATALOG_PHOTO_REFRESH_EVENT,refresh);
    return ()=>window.removeEventListener(CATALOG_PHOTO_REFRESH_EVENT,refresh);
  },[]);

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
  },[key,visible,initial,failedUrl,refreshTick]);

  const sourceUrl=staticUsable?visual.photoCreditUrl:remoteUsable?resolvedRemote.sourceUrl:null;
  const photoSource=staticUsable?visual.photoSource:remoteUsable?resolvedRemote.photoSource:null;
  const aiIllustration=Boolean(currentPhoto && !staticUsable && remoteUsable && resolvedRemote.match==='illustrative');
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
          alt={(aiIllustration?'AI-generated illustrative image of ':'Representative product photo of ')+name}
          loading={className.includes('kp-modal')?'eager':'lazy'}
          decoding="async"
          fetchPriority={className.includes('kp-modal')?'auto':'low'}
          onError={()=>setFailedUrl(currentPhoto)}
        />
      ) : (
        <div className={'kp-catalog-image-pending'+(loading?' is-loading':'')}
          role="img" aria-label={loading?'Loading photograph of '+name:'Photograph unavailable for '+name}>
          {!loading && <svg className="kp-catalog-placeholder-drawing"
            viewBox="0 0 72 72" aria-hidden="true" fill="none">
            <rect x="16" y="16" width="40" height="44" rx="5" stroke="currentColor" strokeWidth="2.4"/>
            <path d="M16 29h40M29 16v13M28 42h16M28 48h11"
              stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"/>
            <circle cx="49" cy="52" r="2" fill="currentColor"/>
          </svg>}
          <span className="kp-catalog-photo-label">{visual.label}</span>
          <span className="kp-catalog-photo-note">
            {loading?'Finding image…':needsVerifiedPackaging
              ? 'Verified product photo pending'
              : 'Representative image coming soon'}
          </span>
        </div>
      )}
      {aiIllustration && <span className="kp-ai-image-disclosure" aria-label="AI-generated representative image">AI illustration</span>}
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

// Prevent photo discovery and expensive visual lookup from rerunning when an
// unrelated basket quantity or search filter causes surrounding cards to rerender.
export default memo(CatalogProductVisual);
