// Theme keys known to the renderer. Kept in a plain .ts module so pure logic can be unit tested.
// v2 is the engine: every known theme renders with it except the legacy themes listed below.

/** Themes rendered by the v2 engine (`src/app/_v2`). */
export const V2_THEMES = ['default', 'theglobe', 'sportsarena', 'nextfrontier'] as const;

/** Legacy (v1) themes, each with its own page folder under `src/app/_pages`. */
export const LEGACY_THEMES = ['adn', 'oldtown', 'wire', 'foghorn', 'business-globe', 'financier'] as const;

export const THEME_KEYS = [...V2_THEMES, ...LEGACY_THEMES] as const;

export type V2Theme = (typeof V2_THEMES)[number];
export type LegacyTheme = (typeof LEGACY_THEMES)[number];

const THEME_KEY_SET: ReadonlySet<string> = new Set(THEME_KEYS);
const LEGACY_THEME_SET: ReadonlySet<string> = new Set(LEGACY_THEMES);

export function isLegacyTheme(theme: string): theme is LegacyTheme {
  return LEGACY_THEME_SET.has(theme);
}

/** A known theme that is not legacy. Unknown themes are not v2 themes (they get no accessory values). */
export function isV2Theme(theme: string): theme is V2Theme {
  return THEME_KEY_SET.has(theme) && !isLegacyTheme(theme);
}

/**
 * Theme used for rendering (data-theme / data-engine). A theme that is not a known key renders with the
 * default page components, so it must also take the default look. Accessory lookups keep the raw site theme.
 */
export function resolveRenderTheme(theme: string): string {
  return THEME_KEY_SET.has(theme) ? theme : 'default';
}
