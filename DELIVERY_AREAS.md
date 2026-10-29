# KiranaPRO delivery zones and merchant onboarding

## Active customer areas
NAD Kotha Road, Dabagardens, Siripuram, MVP Colony, Gajuwaka.

Customer location is an explicit choice among these five values. Free-form location entries and geolocation are not used to select a delivery zone.

## Store listings
LocalFresh (ID `localfresh`) appears in every area. Each location displays four additional neighborhood listings; MVP Colony includes the preconfigured Sri Lakshmi Provisions store plus three sample listings.

All `(Sample)` stores are **demo placeholders**, not verified registered businesses. The placeholders show representative product categories for discovery and have checkout disabled. To enable orders from one of these areas, onboard four real merchants, verify their service zone, shop location, delivery fees, photos, hours, and catalog, then replace the sample records. Do not represent demo listings as real merchants.

## Delivery charges
- LocalFresh: ₹20 below or at ₹300 item subtotal.
- Every other configured store: its own base fee below or at ₹300.
- For **every store**, delivery is free when item subtotal is **strictly greater than ₹300** (₹301+ for whole-rupee prices).
- Discount coupons may also waive delivery (FREEDEL).
- Product subtotal is used for this threshold; taxes, handling fees, and coupon discounts are not part of the threshold.

The policy is centralized in `src/data/deliveryAreas.js` and checked by `npm run test:areas`. Cart checkout is disabled for sample stores and stores outside the chosen delivery area.

## Operational note
This is still frontend-side prototype logic and merchant data. Production checkout must validate delivery eligibility, store registration, discount eligibility, fees, and address coverage on a trusted backend before accepting actual payments or orders.
