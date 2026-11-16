// Keys of the theme map in _themeRouter.tsx. Kept in a plain .ts module so pure logic can be unit tested.
export const THEME_KEYS = [
  'default',
  'adn',
  'oldtown',
  'wire',
  'foghorn',
  'theglobe',
  'sportsarena',
  'business-globe',
  'nextfrontier',
  'financier',
] as const;

const THEME_KEY_SET: ReadonlySet<string> = new Set(THEME_KEYS);

/**
 * Theme used for rendering (data-theme / data-engine). A theme that is not a known key renders with the
 * default page components, so it must also take the default look. Accessory lookups keep the raw site theme.
 */
export function resolveRenderTheme(theme: string): string {
  return THEME_KEY_SET.has(theme) ? theme : 'default';
}
