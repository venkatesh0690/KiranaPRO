/**
 * Cart-level KiranaPRO Pass quote preview.
 * A Pass waives DELIVERY charges ONLY. Handling, estimated tax, and
 * the existing activation fee remain payable.
 *
 * This helper is for the checkout preview; an actual subscription
 * entitlement must be verified and priced by the order API.
 */
export const KIRANAPRO_PASS_PREVIEW_FEE = 99;

export function applyKiranaPROPass(quote, passSelected = false) {
  const deliveryFee = passSelected ? 0 : quote.deliveryFee;
  const passFee = passSelected ? KIRANAPRO_PASS_PREVIEW_FEE : 0;
  return {
    ...quote,
    deliveryFee,
    handlingFee: quote.handlingFee,
    passFee,
    total: Math.round((quote.total - (passSelected ? quote.deliveryFee : 0) + passFee) * 100) / 100
  };
}
