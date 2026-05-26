import * as Default from './_pages';
import * as Adn from './_pages/adn';
import * as Nyt from './_pages/nyt';
import * as Wire from './_pages/wire';

type PageComponents = typeof Default;

const THEME_MAP: Record<string, PageComponents> = {
  default: Default,
  adn: Adn,
  nyt: Nyt,
  wire: Wire,
};

// componentKey must match a named export from the theme's index.ts barrel
export function resolvePageComponent(componentKey: string, theme: string): React.ComponentType<any> | undefined {
  const pages = THEME_MAP[theme] ?? THEME_MAP.default;
  return (pages as Record<string, React.ComponentType<any>>)[componentKey];
}
