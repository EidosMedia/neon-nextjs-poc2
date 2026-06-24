import * as Default from './_pages';
import * as Adn from './_pages/adn';
import * as Oldtown from './_pages/oldtown';
import * as Wire from './_pages/wire';
import * as Foghorn from './_pages/foghorn';
import * as Sportsarena from './_pages/sportsarena';
import * as BusinessGlobe from './_pages/business-globe';
import * as Nextfrontier from './_pages/nextfrontier';
import * as Financier from './_pages/financier';

type PageComponents = typeof Default;

const THEME_MAP: Record<string, PageComponents> = {
  default: Default,
  adn: Adn,
  oldtown: Oldtown,
  wire: Wire,
  foghorn:      Foghorn,
  sportsarena:  Sportsarena,
  'business-globe': BusinessGlobe,
  'nextfrontier': Nextfrontier,
  'financier': Financier,
};

// componentKey must match a named export from the theme's index.ts barrel
export function resolvePageComponent(componentKey: string, theme: string): React.ComponentType<any> | undefined {
  const pages = THEME_MAP[theme] ?? THEME_MAP.default;
  return (pages as Record<string, React.ComponentType<any>>)[componentKey];
}

// resolveComponent uses the same THEME_MAP for sub-page component overrides.
// Theme barrels export component overrides from their components/ subfolder.
export function resolveComponent(componentKey: string, theme: string): React.ComponentType<any> | undefined {
  const pages = THEME_MAP[theme] ?? THEME_MAP.default;
  return (pages as Record<string, React.ComponentType<any>>)[componentKey];
}
