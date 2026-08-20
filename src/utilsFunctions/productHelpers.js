/**
 * Returns the effective price after applying any offer discount.
 * If the product has no active offer, returns the original price.
 */
export function getEffectivePrice(product) {
  if (hasActiveOffer(product)) {
    return product.price * (1 - product.offer / 100);
  }
  return product.price;
}

/**
 * Returns true if the product has an active offer (> 0) and it hasn't expired yet.
 * If no offerEndsAt is set, the offer is permanent (never expires).
 */
export function hasActiveOffer(product) {
  if (!product?.offer || product.offer <= 0) return false;
  if (!product.offerEndsAt) return true; // no expiry = permanent offer
  return new Date() < product.offerEndsAt.toDate?.() || new Date() < new Date(product.offerEndsAt);
}
