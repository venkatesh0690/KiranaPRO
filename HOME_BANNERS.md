# KiranaPRO consolidated homepage banners

## Placement
The homepage has **one promotional carousel**, immediately beneath search in
the original `01 / FEATURED` position. There is no second "Your savings"
banner block and no extra "Trending" banner block below the categories.
Shop by Category and Stores follow the first carousel.

The single rail contains, for the selected service area:
- LocalFresh vegetable and fruit store-special slides.
- Free delivery for **every** store on item subtotals strictly above ₹300.
- Three supported checkout promotions: TASTY12 (₹30 off), KIRANA50 (₹50 off),
  WELCOME (15% off, capped at ₹60). Each now requires a subtotal of at least ₹301.
- Store-specific banners for any registered merchant serving that delivery
  area (currently Sri Lakshmi Provisions in MVP Colony).
- Popular catalog product picks from available, non-sample local stores,
  explicitly **not** verified live neighborhood sales rankings.

There are no advertised discounts on baskets of ₹300 or less. Legacy
FREEDEL below-threshold free delivery was removed. All banner offers draw from
shared checkout rules in `src/data/checkoutOffers.js`.

The store specials highlight that merchant's real catalog and the common
free delivery policy: they **do not invent merchant-funded discounts**.

## Interaction
Automatically advances every six seconds while visible. Manual swipes,
arrow keys, arrows and pagination dots work; manual interaction pauses
autoplay temporarily. Reduced-motion devices do not auto-advance.

## Tests
`npm run build` runs both the five-area delivery suite and the consolidated
homepage promotions suite before producing the Vite bundle.

Financial and customer eligibility must also be enforced on the trusted
server before real orders or payments are accepted. Current checkout remains
a client-side prototype.
