import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { getDisplayProducts, getOrderHighlights, getProductImage } from '../utils/storeMerchandising';
import { getCatalogVisual } from '../utils/catalogVisual';
import { buildHomepageBanners } from '../utils/homepageBanners';
import { navigateWithStoreTransition } from '../utils/storeTransition';

function ProductArt({ items }) {
  return (
    <div className="kp-promo-art" aria-hidden="true">
      {(items || []).slice(0,3).map((p,i) => (
        <div className="kp-promo-product" key={p.id} style={{ '--item': i }}>
          {getProductImage(p)
            ? <img src={getProductImage(p)} alt="" loading="lazy"
                onError={event => { event.currentTarget.style.display = 'none'; }} />
            : <span title={p.name}>{getCatalogVisual(p).emoji}</span>}
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

  // No unimplemented discount claims. Base delivery applies up to ₹300.
  const slides = [
    {
      id:'store',tag:'FROM YOUR STORE',title:store.isAdminManaged ? 'Fresh mandi essentials' : `Shop ${store.name}`,
      subtitle:'Free delivery on carts above ₹300',
      cta:'Shop now',items:heroProducts.slice(0,3),category:firstCategory,tone:'sand'
    },
    {
      id:'popular',tag:highlights.basedOnOrders ? 'BASED ON AVAILABLE ORDERS' : 'CATALOG PICKS',
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
    } else if (slide.kind==='coupon' || slide.kind==='global' || slide.kind==='automatic') {
      navigate(totalItems > 0 ? '/cart' : '/store/localfresh');
    }
  };
  return <SwipeBanners slides={slides} onAction={openSlide}
    label={`Offers, featured stores and grocery picks for ${area}`}
    autoAdvance />;
}

function SwipeBanners({ slides, onAction, label, autoAdvance = false }) {
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
    <section className="kp-promo-section kp-combined-featured" aria-label={label}>
      <div className="kp-promo-top">
        <span><Sparkles size={15} aria-hidden="true"/> Offers & store specials</span>
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
          <article className={`kp-promo-slide kp-promo-${slide.tone || 'sage'}`} key={slide.id}
            role="group" aria-roledescription="slide"
            aria-label={`${i+1} of ${slides.length}: ${slide.title}`}>
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
            {slide.kind==='coupon' || slide.kind==='global' || slide.kind==='automatic'
              ? <div className="kp-promo-offer-art" aria-hidden="true">
                  <div className="kp-promo-offer-symbol">{slide.icon || '🛍️'}</div>
                  <span>{slide.highlight}</span>
                </div>
              : <ProductArt items={slide.items || []}/>}
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
