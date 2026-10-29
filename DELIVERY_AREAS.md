# KiranaPRO delivery zones and merchant onboarding

## Active customer areas
NAD Kotha Road, Dabagardens, Siripuram, MVP Colony, Gajuwaka.

Customer location is an explicit choice among these five values. Free-form location entries and geolocation are not used to select a delivery zone.

## Store listings
LocalFresh (ID `localfresh`) appears in every area. Each location displays four additional neighborhood listings; MVP Colony includes the preconfigured Sri Lakshmi Provisions store plus three sample listings.

All `(Sample)` stores are **demo placeholders**, not verified registered businesses. The placeholders show representative product categories for discovery and have checkout disabled. To enable orders from one of these areas, onboard four real merchants, verify their service zone, shop location, delivery fees, photos, hours, and catalog, then replace the sample records. Do not represent demo listings as real merchants.

## Delivery charges
- LocalFresh: calculates its fee from the combined weights and quantities of cart lines below or at ₹300 item subtotal; pack weights are read from unit/name and unspecified piece/bunch weights currently use documented internal estimates.
- Every other configured store: its own base fee below or at ₹300.
- For **every store**, delivery is free when item subtotal is **strictly greater than ₹300** (₹301+ for whole-rupee prices).
- Discount coupons may also waive delivery (FREEDEL).
- Product subtotal is used for this threshold; taxes, handling fees, and coupon discounts are not part of the threshold.

The policy is centralized in `src/data/deliveryAreas.js` and checked by `npm run test:areas`. Cart checkout is disabled for sample stores and stores outside the chosen delivery area.

## Operational note
This is still frontend-side prototype logic and merchant data. Production checkout must validate delivery eligibility, store registration, discount eligibility, fees, and address coverage on a trusted backend before accepting actual payments or orders.

## Internal LocalFresh fee calculation
- Checkout uses the total product weight in kilograms across all lines, at ₹5/kg, rounded to paise.
- Catalog items labeled `per kg` use 1 kg per quantity; fixed gram packs use explicit weights; pieces/bunches use editable SKU estimates where listed.
- This rate calculation is **not exposed in customer UI**. Only the resulting delivery charge is shown.
- Until actual packing weights are recorded, fees for per-piece/bunch items are estimates; ensure the final merchant quote reconciles actual weights on the backend.
- Same rule applies to standard and scheduled delivery. Store pickup always has no delivery charge, and delivery is free above ₹300.
