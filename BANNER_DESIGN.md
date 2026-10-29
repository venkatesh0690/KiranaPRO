# KiranaPRO landing banner redesign

The existing single first-position homepage swiper now uses the supplied food-brand editorial design direction: bold uppercase display type, solid print-poster coral/leaf/navy/mustard/mint/cream palettes, slim top/bottom issue labels, a geometric accent, small documentary product or store photographs, and a minimalist CTA.

- Existing swipe, arrow navigation, pagination dots, keyboard navigation, manual-touch pause, in-view autoplay and reduced-motion behavior are retained.
- All five Vizag zones show their own store-preview posters, LocalFresh and area-specific catalog picks. Sample listings remain plainly marked as non-orderable.
- Checkout promotions retain eligibility and exact thresholds: no promotions for baskets at or below ₹300, non-LocalFresh free delivery above ₹300 only, automatic basket discount above ₹500, and WELCOME/REPEAT/ADDICTED based on account order number.
- Store detail product pages do not receive image or offer slides.
- Shop discovery cards retain their store-photo slideshow. Promo posters use representative imagery, never claim the photographed shop is the real merchant.
- CSS is imported after all older banner styles to avoid changing the underlying layout outside the homepage.
- Verify using `npm run test:editorial`, `npm run build`.

The reference image was used as visual direction, not as a pixel-for-pixel copy.

## Photo-led revision (October 29, 2026)

The landing banners are NOT plain-color posters. The same editorial typography is placed over full-bleed representative real photos of vegetable markets, grocery stores, pantry shelves and household retail, with gradient contrast overlays and restrained outline accents. The name, offer amount, CTA and sample-store disclosure stay readable at narrow phone widths.

Every generated homepage banner resolves to an HTTPS real-photography URL using `getEditorialBannerPhoto`, with a second representative URL as a backup if the first is unavailable. Generic offer images use compressed 900×500 WebP Unsplash assets; registered and sample storefront slides prefer the store's own existing representative gallery image. Store product-list pages remain banner-free. The ₹300 delivery exclusions and loyalty promo terms are unchanged.

## Offers-only photo banners (October 29, 2026)

The landing carousel contains **only checkout offers**: free delivery for participating neighborhood stores above ₹300 (not LocalFresh), the automatic 5% basket discount capped at ₹30 above ₹500, and the WELCOME, REPEAT, ADDICTED order-milestone codes above ₹300. There are no store names, store previews, unverified merchant offers, catalog suggestions or sample listings in its slides. All banners use full-bleed representative real photographs and a readable editorial text overlay, not plain color panels. Store names and gallery photos continue in the **store discovery cards** beneath the carousel. The product-list page remains banner-free.

## Compact half-height offer banners
The homepage featured photo-backed banner is now half the original height: desktop uses 133–163 px instead of 265–325 px, and phone cards use 139 px instead of 278 px. **Carousel width and swipe behavior are unchanged.** Banner copy has been compacted to the verified offer and eligibility terms so it fits the shallower layout. The photo renderer now requests 900×250 WebP instead of 900×500, reducing image transfer. No merchant/store names appear inside the banner rail, and individual store product-list pages remain banner-free.

## Neighborhood-store image restriction

For all non-LocalFresh store discovery banners and swipeable shop cards, only
real representative photographs of packaged groceries, rice, pulses, snack
packets, bottled drinks, spices, dairy shelves, cleaning products and household
goods are permitted. The previous vegetable-market images in the demo shop
photo groups (including demo stores labeled 'fresh') and Ramaiah Supermart's
three-photo gallery have been replaced.

LocalFresh retains its vegetable/fruit market photography. The compact homepage
promotional rail stays *offers only* (no merchant names, no store previews,
same width, 139px mobile and 133–163px desktop). Generic offer backgrounds now
use documented Unsplash photos of packaged groceries, snack shelves and drinks;
they cannot accidentally inherit a vegetable photograph from a selected
non-LocalFresh store. These are representative photos, not actual store shots.

Tests: `npm run test:sample-stores`, `npm run test:editorial`,
then `npm run build`.

## Landing-page category-first order
Category shortcuts now sit immediately under search, with the same photo-backed, half-height offers-only swiper immediately beneath them. The old promotional heading and generic footer tagline are removed. The stores grid follows the offer carousel. Checkout and individual store product-list screens remain unchanged.


## Neon photo edition — October 30, 2026

The half-height homepage offers-only carousel now uses blue/pink wet-glass
bokeh and magenta/violet glowing light-trail photography behind high-contrast
brutalist white headlines. This replaces the earlier grocery-shelf photographs
and avoids plain, flat-color banners. The app requests lightweight WebP source
images (900 × 250, quality 56); their licenses/attribution are available on
the source pages.

Photographic sources (free Unsplash pages):
- Rain droplets with neon pink/blue light — Dante Candal:
  https://unsplash.com/photos/SI2Vki55P7E
- Abstract magenta/violet light trails — Zoya Marinova:
  https://unsplash.com/photos/6uJbRVYrUMw
- Pink light streaks — Liana S:
  https://unsplash.com/photos/BYcm0lb-egA
- Rain/bokeh city lights — Aleksey Cherenkevich:
  https://unsplash.com/photos/0gTY-Qt00a4
- Neon light streaks — Liana S:
  https://unsplash.com/photos/Vm0qUzxRyvU
- Fallback neon wave — Logan Voss:
  https://unsplash.com/photos/G17GOEl0_P0

Unchanged by this iteration: shop-by-category shortcuts are immediately below
search and before the carousel; carousel width and 139px phone height are
unchanged; only actual checkout offers appear, not merchant names or sample
store banners; non-LocalFresh free delivery applies above ₹300, while LocalFresh
keeps its separate fee; discounts and milestone codes retain their exact
eligibility; individual store product lists remain banner-free. All decorative
neon imagery is background-only and has no product or merchant identity claim.
