import { useMemo, useRef, useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { getDisplayProducts, getOrderHighlights, getProductImage } from '../utils/storeMerchandising';
import { getCatalogVisual } from '../utils/catalogVisual';
import { navigateWithStoreTransition } from '../utils/storeTransition';

function ProductArt({ items }) {
  return (
    <div className="kp-promo-art" aria-hidden="true">
      {items.slice(0,3).map((p,i) => (
        <div className="kp-promo-product" key={p.id} style={{'--item':i}}>
          {getProductImage(p)
            ? <img src={getProductImage(p)} alt="" loading="lazy" onError={event => { event.currentTarget.style.display='none'; }} />
            : <span aria-label={p.name} title={p.name}>{getCatalogVisual(p).emoji}</span>}
        </div>
      ))}
    </div>
  );
}

export function StoreOffersCarousel({ store, catalog, orders, onOpenCategory, onOpenProduct }) {
  const heroProducts = useMemo(() => getDisplayProducts(store,catalog,8),[store,catalog]);
  const highlights = useMemo(() => getOrderHighlights(store,catalog,orders,3),[store,catalog,orders]);
  const budget = heroProducts.filter(p => Number(p.price) > 0 && Number(p.price) <= 100);
  const featured = highlights.items.length ? highlights.items : heroProducts.slice(0,3);
  const firstCategory = store.categories?.[0];
  const slides = [
    {
      id:'deal',tag:'FROM YOUR STORE',title:store.offer && !store.isAdminManaged ? store.offer : 'Fresh everyday essentials',
      subtitle:store.isAdminManaged ? 'Market-fresh vegetables and fruits' : store.posterTagline || 'Browse your neighborhood favorites',
      cta:'Shop now',items:heroProducts.slice(0,3),category:firstCategory,tone:'sand'
    },
    {
      id:'popular',tag:highlights.basedOnOrders ? 'BASED ON AVAILABLE ORDERS' : 'CUSTOMER FAVOURITES',
      title:highlights.label,subtitle:featured.map(p=>p.name).slice(0,2).join(' · '),
      cta:'Explore products',items:featured,category:featured[0]?.category || firstCategory,tone:'sage'
    },
    ...(budget.length ? [{
      id:'budget',tag:'VALUE PICKS',title:'Essentials under ₹100',
      subtitle:'Real prices from this store’s catalog',
      cta:'See products',items:budget.slice(0,3),category:budget[0]?.category || firstCategory,tone:'lilac'
    }] : [])
  ];
  return <SwipeBanners slides={slides} onAction={slide => {
    if (slide.id==='popular' && slide.items?.[0] && onOpenProduct) {
      onOpenProduct(slide.items[0]);
    } else onOpenCategory(slide.category || firstCategory);
  }} label={`Offers and popular picks at ${store.name}`}/>;
}

export function HomeOffersCarousel({ stores, catalog, navigate }) {
  const slides = stores.filter(s=>s.isOpen !== false).slice(0,5).map((store,i)=>{
    const picks=getDisplayProducts(store,catalog,3);
    return {
      id:String(store.id),tag:store.isAdminManaged?'DIRECT MARKET':'LOCAL STORE OFFER',
      title:store.offer && !store.isAdminManaged ? store.offer : (store.isAdminManaged ? 'Fresh from the mandi' : store.name),
      subtitle:store.name,cta:'Explore store',items:picks,tone:['sage','sand','lilac'][i%3],store
    };
  });
  return <SwipeBanners slides={slides} label="Offers and featured stores" onAction={slide => navigateWithStoreTransition(navigate,`/store/${slide.store.id}`)}/>;
}

function SwipeBanners({ slides, onAction, label }) {
  const listRef=useRef(null);
  const [current,setCurrent]=useState(0);
  const slideTo = (index) => {
    const safe=Math.max(0,Math.min(index,slides.length-1));
    listRef.current?.children[safe]?.scrollIntoView({behavior:'smooth',block:'nearest',inline:'center'});
    setCurrent(safe);
  };
  const onScroll=()=>{
    const el=listRef.current;
    if(!el || !el.firstElementChild) return;
    const width=el.firstElementChild.getBoundingClientRect().width + (parseFloat(getComputedStyle(el).columnGap)||0);
    if(width>0) setCurrent(Math.max(0,Math.min(slides.length-1,Math.round(el.scrollLeft/width))));
  };
  if(!slides.length) return null;
  return (
    <section className="kp-promo-section" aria-label={label}>
      <div className="kp-promo-top">
        <span><Sparkles size={15} aria-hidden="true"/> Offers & popular picks</span>
        <div className="kp-promo-arrows">
          <button type="button" aria-label="Previous banner" onClick={()=>slideTo(current-1)} disabled={current===0}><ChevronLeft size={18}/></button>
          <button type="button" aria-label="Next banner" onClick={()=>slideTo(current+1)} disabled={current===slides.length-1}><ChevronRight size={18}/></button>
        </div>
      </div>
      <div className="kp-promo-track" ref={listRef} onScroll={onScroll} role="region" aria-roledescription="carousel" aria-label={label} tabIndex={0}>
        {slides.map((slide,i) => (
          <article className={`kp-promo-slide kp-promo-${slide.tone}`} key={slide.id}
            role="group" aria-roledescription="slide" aria-label={`${i+1} of ${slides.length}: ${slide.title}`}>
            <div className="kp-promo-text">
              <span className="kp-promo-eyebrow">{slide.tag}</span>
              <h3>{slide.title}</h3>
              <p>{slide.subtitle}</p>
              <button type="button" className="kp-promo-shop" onClick={()=>onAction(slide)}>
                {slide.cta}<ArrowRight size={15}/>
              </button>
            </div>
            <ProductArt items={slide.items || []}/>
          </article>
        ))}
      </div>
      <div className="kp-promo-dots" aria-label="Choose offer banner">
        {slides.map((slide,i)=>(
          <button type="button" key={slide.id} className={`kp-promo-dot ${current===i?'active':''}`}
            aria-label={`Go to offer ${i+1}`} aria-current={current===i ? 'true' : undefined} onClick={()=>slideTo(i)} />
        ))}
      </div>
    </section>
  );
}
