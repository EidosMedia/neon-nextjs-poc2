import type { Site } from '@eidosmedia/neon-frontoffice-ts-sdk';
import { menuItemsToLinks, siteNodesToLinks, type MenuLink } from '../lib/menu';

const neonMenu = (site: Site, name: string) =>
  menuItemsToLinks((site.menus as Record<string, { items?: unknown }> | undefined)?.[name]?.items);
const sitemap = (site: Site) => siteNodesToLinks(site.root?.items);
const firstNonEmpty = (...trees: (() => MenuLink[])[]) => {
  for (const tree of trees) {
    const links = tree();
    if (links.length > 0) return links;
  }
  return [];
};

/** Inline section navigation: the Neon `MainMenu`, otherwise the sitemap (all levels). */
export function getMainLinks(site: Site): MenuLink[] {
  return firstNonEmpty(() => neonMenu(site, 'MainMenu'), () => sitemap(site));
}

/**
 * Full menu next to a visible inline navigation (desktop panel, "More"): the Neon `FullMenu`,
 * otherwise the sitemap. It never falls back to `MainMenu`, which the inline navigation already shows.
 */
export function getFullLinks(site: Site): MenuLink[] {
  return firstNonEmpty(() => neonMenu(site, 'FullMenu'), () => sitemap(site));
}

/**
 * Mobile drawer, where the inline navigation is hidden: the Neon `FullMenu`, otherwise `MainMenu`,
 * otherwise the sitemap.
 */
export function getDrawerLinks(site: Site): MenuLink[] {
  return firstNonEmpty(() => neonMenu(site, 'FullMenu'), () => neonMenu(site, 'MainMenu'), () => sitemap(site));
}
