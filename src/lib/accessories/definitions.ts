import sharedAccessories from '@/app/_pages/accessories.json';
import type { AccessoryDefinitions } from './resolveAccessories';

// The v2 themes share one document (`_pages/accessories.json`); `theme` is stamped per requested key.
// Legacy themes have no document, so nothing is inherited from another theme.
export const V2_THEMES = ['default', 'theglobe', 'sportsarena', 'nextfrontier'] as const;

export const THEME_NAME_PATTERN = /^[a-z][a-z0-9-]*$/;

const V2_THEME_SET: ReadonlySet<string> = new Set(V2_THEMES);
const cache = new Map<string, AccessoryDefinitions>();

export function isV2Theme(theme: string): boolean {
  return V2_THEME_SET.has(theme);
}

/** Shared v2 document stamped with this theme; undefined for any theme that is not a v2 theme. */
export function getAccessoryDefinitions(theme: string): AccessoryDefinitions | undefined {
  if (!isV2Theme(theme)) {
    return undefined;
  }
  let definitions = cache.get(theme);
  if (!definitions) {
    definitions = Object.freeze({ ...(sharedAccessories as unknown as AccessoryDefinitions), theme });
    cache.set(theme, definitions);
  }
  return definitions;
}

export function listAccessoryThemes(): string[] {
  return [...V2_THEMES];
}
