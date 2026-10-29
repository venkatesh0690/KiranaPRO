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
