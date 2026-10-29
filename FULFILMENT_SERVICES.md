# Order service experiment: delivery windows and store pickup

Checkout is now two steps: **review basket** and **choose order service**. The design uses Version B's quiet green/cream palette, segmented service cards and a clear fee summary. The supplied Cosmos item (https://www.cosmos.so/e/1107014005) could not be retrieved, so this is not a pixel-exact reproduction.

## Services
- **Standard delivery**: existing delivery fee. Free when item subtotal is strictly over ₹300.
- **Scheduled delivery**: choose a date within 7 IST calendar days and an indicative two-hour delivery window, including 2 PM–4 PM and 3 PM–5 PM. Same delivery fee policy as standard.
- **Store pickup**: choose a date and exact 30-minute-interval pickup time. No delivery fee regardless of subtotal. Pay the item subtotal less any eligible discounts, plus the existing ₹5 handling fee and estimated GST calculated by the prototype.

Scheduled requests use a minimum 60-minute lead time, pickup requests a minimum 45-minute lead time, and selection is revalidated on submission. Illustrative operating window is 10 AM to 8 PM IST. These times are *unconfirmed requests*: no merchant calendar, capacity, driver assignment, actual store opening-hour verification, pickup packing acknowledgment, payment processing, or notification system is connected. Actual fulfillment is not booked.

## Data
Demo customer order records now include `fulfilment` with mode, date, slot, label, time zone and requested timestamp, when applicable. The Orders page displays the request and clearly states no real booking has been made.

## Verification
Run `npm run test:fulfilment` or `npm run build`, which runs other app tests as well. Before taking paid orders, enforce service eligibility, store capacity/operating hours, rates and applicable product-specific GST on the server. Browser-stored demo orders are not secure production state.
