import type { Site } from '@eidosmedia/neon-frontoffice-ts-sdk';
import { menuItemsToLinks, siteNodesToLinks, type MenuLink } from '../lib/menu';

/** Main navigation tree: the `MainMenu` when configured, otherwise the sitemap (all levels). */
export function getMainLinks(site: Site): MenuLink[] {
  const main = menuItemsToLinks(site.menus?.MainMenu?.items);
  return main.length > 0 ? main : siteNodesToLinks(site.root?.items);
}

/** Burger-menu tree: the `FullMenu` when configured, otherwise the main navigation tree. */
export function getFullLinks(site: Site): MenuLink[] {
  const full = menuItemsToLinks(site.menus?.FullMenu?.items);
  return full.length > 0 ? full : getMainLinks(site);
}
