import defaultAccessories from '@/app/_pages/accessories.json';
import type { AccessoryDefinitions } from './resolveAccessories';

// Register every theme's accessories.json here, next to its pages; a test fails when a file is not registered.
const DEFINITIONS_BY_THEME: Record<string, AccessoryDefinitions> = {
  default: defaultAccessories as unknown as AccessoryDefinitions,
};

export const THEME_NAME_PATTERN = /^[a-z][a-z0-9-]*$/;

/** Definitions of exactly this theme; undefined when the theme has no file, so nothing is inherited from another theme. */
export function getAccessoryDefinitions(theme: string): AccessoryDefinitions | undefined {
  return Object.prototype.hasOwnProperty.call(DEFINITIONS_BY_THEME, theme) ? DEFINITIONS_BY_THEME[theme] : undefined;
}

export function listAccessoryThemes(): string[] {
  return Object.keys(DEFINITIONS_BY_THEME);
}
