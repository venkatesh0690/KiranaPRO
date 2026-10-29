# KiranaPRO coupon scheme — October 2026

## Delivery and discount rules

- Delivery is FREE only when the item subtotal is strictly greater than ₹300; fees apply at ₹300 or less, including LocalFresh.
- Above ₹500 item subtotal, an **automatic 5% discount capped at ₹30** is available. For example ₹501 -> ₹25 discount; ₹600 -> ₹30 discount.
- `WELCOME` — ₹30 discount on the customer's **1st** order, cart above ₹300.
- `REPEAT` — ₹20 discount on exactly the customer's **3rd, 5th or 7th** order, cart above ₹300.
- `ADDICTED` — ₹50 discount on exactly the customer's **10th** order, cart above ₹300.
- Only **one** discount applies per order. The auto basket discount and an account coupon are not stackable. A user-selected eligible coupon replaces the automatic discount.

Order numbering is **1-based**: a customer with two stored placed orders is placing their 3rd order and can redeem REPEAT.

## Account-specific ledger

The previous hard-coded demo orders have been replaced in the customer-facing Orders page. Demo orders are now recorded in browser `localStorage` under a key scoped to the signed-in customer's phone number; reward eligibility uses that account's order count, not the fake StoreContext seller/admin dataset.

**This is a frontend prototype, not a secure promotion system.** A user can reset or modify local storage, an unverified PIN login isn't real identity verification, and browser data does not synchronize across devices. Before accepting real payments or honoring these promotions financially, implement genuine authenticated accounts, database-backed order history, server-side totals and eligibility checks, atomically redeemed coupons, and fraud prevention. Existing prior real-world orders are not imported into this new ledger.

## Front page

The single swipeable carousel immediately below search contains general discount rules, LocalFresh and other available shop highlights, and catalog-based grocery picks. Conditional coupon slides explain the correct order number and distinguish upcoming rewards from eligible offers.

The supplied Cosmos reference was inaccessible during development; existing Version B's layout was retained instead of claiming an exact reproduction.

## Checks

- `npm run test:highlights`
- `npm run test:areas`
- `npm run build`
