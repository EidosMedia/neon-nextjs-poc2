import * as V2 from './_v2';
import * as Adn from './_pages/adn';
import * as Oldtown from './_pages/oldtown';
import * as Wire from './_pages/wire';
import * as Foghorn from './_pages/foghorn';
import * as BusinessGlobe from './_pages/business-globe';
import * as Financier from './_pages/financier';
import { type LegacyTheme, isLegacyTheme, resolveRenderTheme } from './themeKeys';

export { resolveRenderTheme };

// Each member is a page component whose props differ per content type, so the props stay untyped here.
/* eslint-disable @typescript-eslint/no-explicit-any */
export interface PageComponents {
  Article: React.ComponentType<any>;
  ArticleLongform: React.ComponentType<any>;
  NewsletterWebpage: React.ComponentType<any>;
  HomeWebPage: React.ComponentType<any>;
  SectionWebPage: React.ComponentType<any>;
  WebpageColumnsLayout: React.ComponentType<any>;
  AboutPage: React.ComponentType<any>;
  DefaultLanding: React.ComponentType<any>;
  DefaultSection: React.ComponentType<any>;
  LoginPage: React.ComponentType<any>;
  SearchPage: React.ComponentType<any>;
  Liveblog: React.ComponentType<any>;
  NotFound: React.ComponentType<any>;
  UIStyleGuide: React.ComponentType<any>;
  ArticleOrganism: React.ComponentType<any>;
  ArticleGallery?: React.ComponentType<any>;
}
type AnyComponent = React.ComponentType<any>;
/* eslint-enable @typescript-eslint/no-explicit-any */

// v2 renders every theme except the legacy ones, which keep their own page folders.
const LEGACY_THEME_MAP: Record<LegacyTheme, PageComponents> = {
  adn: Adn,
  oldtown: Oldtown,
  wire: Wire,
  foghorn: Foghorn,
  'business-globe': BusinessGlobe,
  financier: Financier,
};

function pagesFor(theme: string): PageComponents {
  const renderTheme = resolveRenderTheme(theme);
  return isLegacyTheme(renderTheme) ? LEGACY_THEME_MAP[renderTheme] : V2;
}

// componentKey must match a named export from the theme's index.ts barrel
export function resolvePageComponent(componentKey: string, theme: string): AnyComponent | undefined {
  return (pagesFor(theme) as unknown as Record<string, AnyComponent>)[componentKey];
}

// resolveComponent uses the same mapping for sub-page component overrides.
// Theme barrels export component overrides from their components/ subfolder.
export function resolveComponent(componentKey: string, theme: string): AnyComponent | undefined {
  return (pagesFor(theme) as unknown as Record<string, AnyComponent>)[componentKey];
}
