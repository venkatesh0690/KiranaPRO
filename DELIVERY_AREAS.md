# KiranaPRO delivery zones and merchant onboarding

## Active customer areas
NAD Kotha Road, Dabagardens, Siripuram, MVP Colony, Gajuwaka.

Customer location is an explicit choice among these five values. Free-form location entries and geolocation are not used to select a delivery zone.

## Store listings
LocalFresh (ID `localfresh`) appears in every area. Each location displays four additional neighborhood listings; MVP Colony includes the preconfigured Sri Lakshmi Provisions store plus three sample listings.

All `(Sample)` stores are **demo placeholders**, not verified registered businesses. The placeholders show representative product categories for discovery and have checkout disabled. To enable orders from one of these areas, onboard four real merchants, verify their service zone, shop location, delivery fees, photos, hours, and catalog, then replace the sample records. Do not represent demo listings as real merchants.

## Delivery charges
- LocalFresh: its delivery charge is calculated for standard and scheduled delivery at **every cart value**, including above ₹300; pack weights come from explicit units and documented estimates for items sold by piece/bunch.
- Every other configured store: its own base fee below or at ₹300.
- For **every store except LocalFresh**, delivery is free when the item subtotal is **strictly greater than ₹300** (₹301+ for whole-rupee prices).
- Coupon codes do not waive delivery charges.
- Product subtotal is used for this threshold; taxes, handling fees, and coupon discounts are not part of the threshold.

The policy is centralized in `src/data/deliveryAreas.js` and checked by `npm run test:areas`. Cart checkout is disabled for sample stores and stores outside the chosen delivery area.

## Operational note
This is still frontend-side prototype logic and merchant data. Production checkout must validate delivery eligibility, store registration, discount eligibility, fees, and address coverage on a trusted backend before accepting actual payments or orders.

## Internal LocalFresh fee calculation
- Checkout uses the total product weight in kilograms across all lines, at ₹5/kg, rounded to paise.
- Catalog items labeled `per kg` use 1 kg per quantity; fixed gram packs use explicit weights; pieces/bunches use editable SKU estimates where listed.
- This rate calculation is **not exposed in customer UI**. Only the resulting delivery charge is shown.
- Until actual packing weights are recorded, fees for per-piece/bunch items are estimates; ensure the final merchant quote reconciles actual weights on the backend.
- The LocalFresh charge applies to both standard and scheduled delivery at every order value. Store pickup always has ₹0 delivery charge. Other stores are free above ₹300.
