import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { getDisplayProducts, getOrderHighlights } from '../utils/storeMerchandising';
import CatalogProductVisual from './CatalogProductVisual';
import { buildHomepageBanners } from '../utils/homepageBanners';
import { isLocalFreshStore } from '../data/deliveryAreas';
import { getStoreGallery } from '../data/storeGallery';
import { navigateWithStoreTransition } from '../utils/storeTransition';
import { getEditorialBannerStyle, getEditorialBannerHeadline, getEditorialBannerMarker, getEditorialBannerPhoto } from '../utils/editorialBanners.js';

function ProductArt({ items }) {
  return (
    <div className="kp-promo-art" aria-hidden="true">
      {(items || []).slice(0,3).map((p,i) => (
        <div className="kp-promo-product" key={p.id} style={{ '--item': i }}>
          <CatalogProductVisual product={p} className="kp-promo-product-visual" />
        </div>
      ))}
    </div>
  );
}

export function StoreOffersCarousel({ store, catalog, orders, onOpenCategory, onOpenProduct }) {
  const heroProducts = useMemo(() => getDisplayProducts(store,catalog,8),[store,catalog]);
  const highlights = useMemo(() => getOrderHighlights(store,catalog,orders,3),[store,catalog,orders]);
  const featured = highlights.items.length ? highlights.items : heroProducts.slice(0,3);
  const firstCategory = store.categories?.[0];
  const gallery=getStoreGallery(store).slice(0,3);
  const isSample=Boolean(store.isSample);

  // No unimplemented discount claims. Base delivery applies up to ₹300.
  const slides = [
    ...gallery.map((photo,index)=>({
      id:`photo-${index}`,kind:'store',bannerPhoto:photo.src,
      tag:isSample?'SAMPLE SHOP · PHOTO PREVIEW':`STORE PHOTO ${index+1} / ${gallery.length}`,
      title:isSample?store.name:`Explore ${store.name}`,
      subtitle:isSample?'Illustrative image — store not registered yet'
        : 'Representative store photography, not a verified shop photo',
      cta:isSample?'Preview catalog':'Shop products',
      category:firstCategory,tone:index%2?'sand':'sage',isSample
    })),
    {
      id:'store',tag:isSample?'SAMPLE SHOP · PREVIEW':'FROM YOUR STORE',title:store.isAdminManaged ? 'Fresh mandi essentials' : `Shop ${store.name}`,
      subtitle:isSample?'Sample storefront — orders unavailable' :
        isLocalFreshStore(store) ? 'Delivery fee shown at checkout' : 'Free delivery on carts above ₹300',
      cta:'Shop now',items:heroProducts.slice(0,3),category:firstCategory,tone:'sand'
    },
    {
      id:'popular',tag:isSample?'SAMPLE CATALOG · PREVIEW' :
        highlights.basedOnOrders ? 'BASED ON AVAILABLE ORDERS' : 'CATALOG PICKS',
      title:highlights.label,subtitle:featured.map(p=>p.name).slice(0,2).join(' · '),
      cta:'Explore products',items:featured,category:featured[0]?.category || firstCategory,tone:'sage'
    }
  ];
  return <SwipeBanners slides={slides} onAction={slide => {
    if (slide.id==='popular' && slide.items?.[0] && onOpenProduct) {
      onOpenProduct(slide.items[0]);
    } else onOpenCategory(slide.category || firstCategory);
  }} label={`Featured products at ${store.name}`}/>;
}

export function HomeOffersCarousel({ stores, catalog, navigate, area, totalItems = 0, orderCount = 0 }) {
  const slides = useMemo(() => buildHomepageBanners(stores,catalog,area,orderCount),[stores,catalog,area,orderCount]);
  const openSlide = slide => {
    if (slide.kind==='store' && slide.store) {
      navigateWithStoreTransition(navigate,`/store/${slide.store.id}`);
    } else if (slide.kind==='picks' && slide.productTarget) {
      const pick=slide.productTarget;
      navigate(`/store/${pick.storeId}`,{state:{category:pick.category,productId:pick.id}});
    } else if (slide.kind==='global' && slide.store) {
      navigate(totalItems > 0 ? '/cart' : `/store/${slide.store.id}`);
    } else if (slide.kind==='coupon' || slide.kind==='automatic') {
      navigate(totalItems > 0 ? '/cart' : '/store/localfresh');
    }
  };
  return <SwipeBanners slides={slides} onAction={openSlide}
    label={`Delivery, basket savings and coupon offers for ${area}`}
    autoAdvance editorial />;
}

function EditorialPoster({ slide, index, total, onAction }) {
  const theme=getEditorialBannerStyle(slide,index);
  const headline=getEditorialBannerHeadline(slide);
  const photo=getEditorialBannerPhoto(slide);
  const longHeadline=headline.replace(/\n/g,' ').length>24;
  const value=slide.kind==='global' ? '₹0'
    : slide.kind==='automatic' ? '5%'
    : slide.kind==='coupon' ? slide.highlight?.match(/₹\d+/)?.[0] || 'REWARD'
    : null;

  return (
    <div className={`kp-ed-poster kp-ed-${theme.name} kp-ed-photographic`}
      style={{
        '--kp-ed-accent':theme.accent,
        '--kp-ed-panel':theme.panel
      }}>
      <div className="kp-ed-backdrop" aria-hidden="true">
        <img src={photo.src} alt="" loading={index===0?'eager':'lazy'}
          decoding="async" width="900" height="500"
          onError={event=>{
            const img=event.currentTarget;
            if(img.dataset.fallback) {
              img.style.opacity='0';
              return;
            }
            img.dataset.fallback='true';
            img.src=photo.backup;
          }}/>
      </div>
      <div className="kp-ed-photo-scrim" aria-hidden="true"/>
      <div className="kp-ed-head">
        <span className="kp-ed-brand">KIRANA<span>PRO</span> / GOODS NEAR YOU</span>
        <span className="kp-ed-edition">VIZAG LOCAL EDITION <strong>{String(index+1).padStart(2,'0')}</strong></span>
      </div>
      <div className="kp-ed-body">
        <div className="kp-ed-copy">
          <span className="kp-ed-label">{getEditorialBannerMarker(slide,index)}</span>
          <h3 className={longHeadline?'kp-ed-title-long':''}>
            {headline.split('\n').map((line,i)=><span key={i}>{line}</span>)}
          </h3>
          <p>{slide.subtitle}</p>
          {slide.code && <span className="kp-ed-coupon">{slide.rewardEligible===false?'REWARD UPCOMING · ':''}CODE {slide.code}</span>}
          <button type="button" className="kp-ed-action" onClick={()=>onAction(slide)}
            aria-label={`${slide.cta||'Explore'}: ${slide.title}`}>
            <span>{slide.cta||'Explore stores'}</span><ArrowRight size={16} aria-hidden="true"/>
          </button>
        </div>
        <div className="kp-ed-visual" aria-hidden="true">
          {value ? (
            <div className="kp-ed-price-art">
              <span className="kp-ed-price-decoration">KP / PERKS</span>
              <strong>{value}</strong>
              <span>{slide.kind==='global'?'DELIVERY FEE':slide.kind==='automatic'?'UP TO ₹30 OFF':'OFF YOUR ORDER'}</span>
            </div>
          ) : (
            <div className="kp-ed-scene-stamp">
              <span>{slide.isSample?'PHOTO PREVIEW':'KIRANA / LOCAL'}</span>
              <strong>{slide.isSample?'SAMPLE':'FRESH'}</strong>
              <small>{slide.isSample?'UNREGISTERED STORE':'EVERYDAY ESSENTIALS'}</small>
            </div>
          )}
          <span className="kp-ed-accent-square"/>
        </div>
      </div>
      <div className="kp-ed-footer">
        <span>{slide.isSample?'REPRESENTATIVE PHOTO · NO ORDERS':'REAL GROCERY & MARKET PHOTOGRAPHY'}</span>
        <span>{String(index+1).padStart(2,'0')} / {String(total).padStart(2,'0')}</span>
      </div>
    </div>
  );
}

function SwipeBanners({ slides, onAction, label, autoAdvance = false, editorial = false }) {
  const listRef = useRef(null);
  const activeRef = useRef(0);
  const pausedUntil = useRef(0);
  const isHover = useRef(false);
  const [current,setCurrent] = useState(0);
  const [visible,setVisible] = useState(!('IntersectionObserver' in window));

  const slideTo = (index,manual=false) => {
    const rail = listRef.current;
    if (!rail || !slides.length) return;
    const safe=(index+slides.length)%slides.length;
    const target=rail.children[safe];
    const first=rail.children[0];
    if(!target || !first) return;
    if(manual) pausedUntil.current=Date.now()+12000;
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    rail.scrollTo({left:target.offsetLeft-first.offsetLeft,behavior:reduced?'instant':'smooth'});
    activeRef.current=safe;
    setCurrent(safe);
  };

  useEffect(() => {
    const root=listRef.current;
    if (!root || !('IntersectionObserver' in window)) return undefined;
    const observer=new IntersectionObserver(([entry])=>setVisible(Boolean(entry?.isIntersecting)),{threshold:.15});
    observer.observe(root);
    return ()=>observer.disconnect();
  }, []);

  useEffect(() => {
    if (!autoAdvance || !visible || slides.length < 2 ||
        window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined;
    const timer=window.setInterval(() => {
      if(!document.hidden && !isHover.current && Date.now() > pausedUntil.current)
        slideTo(activeRef.current+1);
    },6000);
    return ()=>window.clearInterval(timer);
  }, [autoAdvance,visible,slides.length]);

  useEffect(() => {
    activeRef.current=0;
    setCurrent(0);
    if(listRef.current) listRef.current.scrollLeft=0;
  }, [label]);

  const onScroll = () => {
    const rail=listRef.current;
    if(!rail?.children?.length) return;
    const first=rail.children[0].offsetLeft;
    let index=0,dist=Infinity;
    Array.from(rail.children).forEach((el,i)=>{
      const d=Math.abs(el.offsetLeft-first-rail.scrollLeft);
      if(d<dist){dist=d;index=i;}
    });
    activeRef.current=index;
    setCurrent(index);
  };

  if (!slides.length) return null;
  return (
    <section className={`kp-promo-section kp-combined-featured ${editorial?'kp-editorial-rail':''}`} aria-label={label}>
      <div className="kp-promo-top">
        <span><Sparkles size={15} aria-hidden="true"/> {editorial ? 'Offers' : 'Offers & rewards'}</span>
        <div className="kp-promo-arrows">
          <span className="kp-promo-counter">{current+1} / {slides.length}</span>
          <button type="button" aria-label="Previous banner" onClick={()=>slideTo(current-1,true)} disabled={slides.length<2}><ChevronLeft size={18}/></button>
          <button type="button" aria-label="Next banner" onClick={()=>slideTo(current+1,true)} disabled={slides.length<2}><ChevronRight size={18}/></button>
        </div>
      </div>
      <div className="kp-promo-track" ref={listRef} onScroll={onScroll}
        onTouchStart={()=>{pausedUntil.current=Date.now()+12000;}}
        onPointerEnter={()=>{isHover.current=true;}}
        onPointerLeave={()=>{isHover.current=false;}}
        onFocus={()=>{isHover.current=true;}}
        onBlur={()=>{isHover.current=false;}}
        onKeyDown={e=>{
          if(e.key==='ArrowLeft'){e.preventDefault();slideTo(current-1,true);}
          if(e.key==='ArrowRight'){e.preventDefault();slideTo(current+1,true);}
        }}
        role="region" aria-roledescription="carousel" aria-label={label} tabIndex={0}>
        {slides.map((slide,i) => (
          <article className={`kp-promo-slide kp-promo-${slide.tone || 'sage'} ${editorial?'kp-editorial-slide':''}`} key={slide.id}
            role="group" aria-roledescription="slide"
            aria-label={`${i+1} of ${slides.length}: ${slide.title}`}>
            {editorial ? (
              <EditorialPoster slide={slide} index={i} total={slides.length} onAction={onAction}/>
            ) : (
              <>
            <div className="kp-promo-text">
              <span className="kp-promo-eyebrow">{slide.tag || 'FEATURED'}</span>
              <h3>{slide.title}</h3>
              <p>{slide.subtitle}</p>
              {slide.code && <span className="kp-promo-code">
                {slide.rewardEligible===false ? 'NEXT-ORDER MILESTONE' : 'CODE'} {slide.code}
              </span>}
              <button type="button" className="kp-promo-shop" onClick={()=>onAction(slide)}>
                {slide.cta || 'Shop now'}<ArrowRight size={15}/>
              </button>
            </div>
            {slide.bannerPhoto ? (
              <div className="kp-promo-store-art">
                <img src={slide.bannerPhoto}
                  alt={`Representative shop photo for ${slide.store?.name || slide.title}`}
                  loading="lazy" decoding="async"
                  onError={event => {
                    const image=event.currentTarget;
                    if (image.dataset.fallback) {
                      image.style.visibility='hidden';
                      return;
                    }
                    const alternate=getStoreGallery(slide.store).find(photo=>photo.src !== slide.bannerPhoto)?.src;
                    if (alternate) {
                      image.dataset.fallback='true';
                      image.src=alternate;
                    } else image.style.visibility='hidden';
                  }}
                />
                {slide.isSample && <span>Sample shop · representative photo</span>}
              </div>
            ) : slide.kind==='coupon' || slide.kind==='global' || slide.kind==='automatic'
              ? <div className="kp-promo-offer-art" aria-hidden="true">
                  <div className="kp-promo-offer-symbol">{slide.icon || '🛍️'}</div>
                  <span>{slide.highlight}</span>
                </div>
              : <ProductArt items={slide.items || []}/>}
              </>
            )}
          </article>
        ))}
      </div>
      <div className="kp-promo-dots" aria-label="Choose promotional banner">
        {slides.map((slide,i)=>(
          <button type="button" key={slide.id} className={`kp-promo-dot ${current===i?'active':''}`}
            aria-label={`Go to banner ${i+1}`} aria-current={current===i?'true':undefined}
            onClick={()=>slideTo(i,true)} />
        ))}
      </div>
    </section>
  );
}
