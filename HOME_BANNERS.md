# Area-aware homepage banners

KiranaPRO Version B shows additional swipeable banners **after sign-in and the selected delivery area**.

## Checkout offers
Four offer banners reflect actual coupon rules from `src/data/checkoutOffers.js`. That module is imported by both the homepage and checkout so codes, discounts, and minimum order values don't drift:
- Free delivery above ₹300 (item subtotal).
- TASTY12 — ₹30 off above ₹99.
- KIRANA50 — ₹50 off above ₹199.
- WELCOME — 15% off up to ₹60 above ₹120.

Offers don't invent expiry times, discount percentages, or unimplemented shop promotions.

## Grocery picks
Products in the second swipeable rail are selected from **in-stock products listed by non-sample stores serving the selected delivery area**. Picks are ordered by catalog review metadata and diversified across categories. They are not genuine order-volume trends.

Until verified area-level sales data is available, label them as catalog-based suggestions and do not display fabricated order counts, trending percentages or consumer behavior claims. Clicking an item opens its eligible store and the item's detail modal.

## UI
Offer slides move automatically every 5.7 seconds when visible. Hovering, keyboard focus or touching pauses automatic motion; reduced-motion preferences disable auto-advance. Both offer and product rails support touch swipes, next/previous arrows, keyboard arrows, and pagination dots.

Test with `npm run test:highlights` and build with `npm run build`.
