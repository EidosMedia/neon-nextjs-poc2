import type { BrandKey } from './registry';

/**
 * Brand accessory overrides. A brand that needs its own accessories puts a complete document in
 * `brands/<key>/accessories.json` (same format and version as `_v2/accessories.json`) and registers it here:
 *
 *   import sportsarena from './sportsarena/accessories.json';
 *   export const BRAND_ACCESSORIES = { sportsarena };
 *
 * The override replaces the shared document for that theme; nothing is merged. Brands not listed use the
 * shared document. Static imports keep the documents compiled into the image.
 */
export const BRAND_ACCESSORIES: Partial<Record<BrandKey, unknown>> = {};
