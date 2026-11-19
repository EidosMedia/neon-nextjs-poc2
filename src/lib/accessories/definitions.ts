import sharedAccessories from '@/app/_v2/accessories.json';
import { BRAND_ACCESSORIES } from '@/app/_v2/brands/accessories';
import { V2_THEMES, isV2Theme } from '@/app/themeKeys';
import type { AccessoryDefinitions } from './resolveAccessories';

// Each v2 theme gets its brand override (`_v2/brands/<key>/accessories.json`, registered in
// `_v2/brands/accessories.ts`) or else the shared document (`_v2/accessories.json`); `theme` is stamped
// per requested key either way. Legacy and unknown themes have no document.
export { V2_THEMES, isV2Theme };

export const THEME_NAME_PATTERN = /^[a-z][a-z0-9-]*$/;

const cache = new Map<string, AccessoryDefinitions>();

function sourceDocument(theme: string): AccessoryDefinitions {
  const override = (BRAND_ACCESSORIES as Record<string, unknown>)[theme];
  return (override ?? sharedAccessories) as unknown as AccessoryDefinitions;
}

/** The theme's document stamped with this theme; undefined for any theme that is not a v2 theme. */
export function getAccessoryDefinitions(theme: string): AccessoryDefinitions | undefined {
  if (!isV2Theme(theme)) {
    return undefined;
  }
  let definitions = cache.get(theme);
  if (!definitions) {
    definitions = Object.freeze({ ...sourceDocument(theme), theme });
    cache.set(theme, definitions);
  }
  return definitions;
}

export function listAccessoryThemes(): string[] {
  return [...V2_THEMES];
}
