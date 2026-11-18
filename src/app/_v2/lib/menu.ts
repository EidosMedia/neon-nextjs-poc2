/**
 * Pure menu-tree helpers for the v2 header: converts Neon menus (`site.menus.<name>.items`) and the
 * sitemap (`site.root.items`) into one link tree, and supports filtering and active-path lookup for
 * large trees. No React imports, so it is unit-testable under ts-jest.
 */

/** One node of a navigation tree. A node without `href` is a group label (it only holds children). */
export type MenuLink = { label: string; href?: string; items?: MenuLink[] };

/** Deeper levels are dropped; protects the renderers from cyclic or pathological trees. */
export const MAX_MENU_DEPTH = 8;

type RawMenuItem = { label?: unknown; url?: unknown; ref?: unknown; items?: unknown };
type RawSiteNode = { title?: unknown; name?: unknown; path?: unknown; url?: unknown; items?: unknown };

/** Relative paths and http(s) URLs only; anything else (javascript:, data:, //host) is dropped. */
export function menuHref(raw: unknown): string | undefined {
  if (typeof raw !== 'string') return undefined;
  const href = raw.trim();
  if (!href || /[\u0000-\u001f\u007f\s\\]/.test(href)) return undefined;
  if (href.startsWith('/')) return href.startsWith('//') ? undefined : href;
  return /^https?:\/\/[^/]/i.test(href) ? href : undefined;
}

const text = (v: unknown) => (typeof v === 'string' ? v.trim() : '');

function children<T>(items: unknown, depth: number, map: (raw: T, depth: number) => MenuLink | null) {
  // `depth` is the parent's level (-1 for the top call), so children land at depth + 1 (0-based).
  if (!Array.isArray(items) || depth + 1 >= MAX_MENU_DEPTH) return undefined;
  const out = (items as T[]).map(raw => map(raw, depth + 1)).filter((x): x is MenuLink => x !== null);
  return out.length > 0 ? out : undefined;
}

function fromMenuItem(raw: RawMenuItem, depth: number): MenuLink | null {
  if (!raw || typeof raw !== 'object') return null;
  const label = text(raw.label);
  if (!label) return null;
  const href = menuHref(raw.url) ?? menuHref(raw.ref);
  const items = children<RawMenuItem>(raw.items, depth, fromMenuItem);
  if (!href && !items) return null;
  return { label, ...(href ? { href } : {}), ...(items ? { items } : {}) };
}

function fromSiteNode(raw: RawSiteNode, depth: number): MenuLink | null {
  if (!raw || typeof raw !== 'object') return null;
  const label = text(raw.title) || text(raw.name);
  if (!label) return null;
  const href = menuHref(raw.path) ?? menuHref(raw.url);
  const items = children<RawSiteNode>(raw.items, depth, fromSiteNode);
  if (!href && !items) return null;
  return { label, ...(href ? { href } : {}), ...(items ? { items } : {}) };
}

/** Neon menu items (any depth) to links. Items with neither a usable link nor children are dropped. */
export function menuItemsToLinks(items: unknown): MenuLink[] {
  return children<RawMenuItem>(items, -1, fromMenuItem) ?? [];
}

/** Sitemap nodes (any depth) to links, using each node's `path`. */
export function siteNodesToLinks(nodes: unknown): MenuLink[] {
  return children<RawSiteNode>(nodes, -1, fromSiteNode) ?? [];
}

/** Total number of nodes in a tree. */
export function countLinks(links: MenuLink[]): number {
  return links.reduce((n, l) => n + 1 + countLinks(l.items ?? []), 0);
}

/** Stable key of a node: its index path, e.g. `0.3.2`. */
export const nodeKey = (parent: string, index: number) => (parent ? `${parent}.${index}` : String(index));

/**
 * Keeps nodes whose label matches `query` (case- and accent-insensitive), plus their ancestors.
 * A matching node keeps its whole subtree. An empty query returns the tree unchanged.
 */
export function filterLinks(links: MenuLink[], query: string): MenuLink[] {
  const q = fold(query);
  if (!q) return links;
  const walk = (list: MenuLink[]): MenuLink[] =>
    list.flatMap(link => {
      if (fold(link.label).includes(q)) return [link];
      const items = walk(link.items ?? []);
      return items.length > 0 ? [{ ...link, items }] : [];
    });
  return walk(links);
}

function fold(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

const normalizePath = (href: string) => href.replace(/[?#].*$/, '').replace(/\/(index\.html)?$/, '') || '/';

/**
 * Keys of the ancestors of the node whose href matches `pathname` (deepest match wins), so a menu
 * can open on the branch of the current page. Empty when nothing matches.
 */
export function activeAncestorKeys(links: MenuLink[], pathname: string | null | undefined): string[] {
  if (!pathname) return [];
  const target = normalizePath(pathname);
  let best: string[] = [];
  const walk = (list: MenuLink[], parent: string, trail: string[]) => {
    list.forEach((link, i) => {
      const key = nodeKey(parent, i);
      if (link.href && normalizePath(link.href) === target && trail.length >= best.length) best = trail;
      if (link.items) walk(link.items, key, [...trail, key]);
    });
  };
  walk(links, '', []);
  return best;
}

/** True when `href` points at `pathname` (trailing slash and index.html ignored). */
export function isActiveHref(href: string | undefined, pathname: string | null | undefined): boolean {
  if (!href || !pathname) return false;
  const h = normalizePath(href);
  return h !== '/' && h === normalizePath(pathname);
}

/**
 * How many leading nav items fit on one row of `available` px. When they do not all fit, room is
 * kept for the "More" entry (`moreWidth`). `gap` is the flex gap between entries. Never negative.
 */
export function fitCount(widths: number[], available: number, moreWidth: number, gap: number): number {
  const total = widths.reduce((sum, w) => sum + w, 0) + gap * Math.max(0, widths.length - 1);
  if (total <= available) return widths.length;
  const room = available - moreWidth - gap;
  let used = 0;
  let count = 0;
  for (const w of widths) {
    const next = used + (count > 0 ? gap : 0) + w;
    if (next > room) break;
    used = next;
    count++;
  }
  return count;
}

/**
 * Accordion toggle with one open branch per level: opening `key` closes its siblings (and everything
 * under them); closing `key` also closes its descendants. Returns a new set.
 */
export function toggleAccordion(expanded: ReadonlySet<string>, key: string): Set<string> {
  const isUnder = (k: string, root: string) => k === root || k.startsWith(`${root}.`);
  const next = new Set(expanded);
  if (next.has(key)) {
    for (const k of expanded) if (isUnder(k, key)) next.delete(k);
    return next;
  }
  const parent = key.includes('.') ? key.slice(0, key.lastIndexOf('.')) : '';
  const depth = key.split('.').length;
  for (const k of expanded) {
    const segs = k.split('.');
    if (segs.length < depth) continue;
    const sibling = segs.slice(0, depth).join('.');
    const siblingParent = depth > 1 ? segs.slice(0, depth - 1).join('.') : '';
    if (siblingParent === parent && sibling !== key) next.delete(k);
  }
  next.add(key);
  return next;
}

/** True when `link` or any descendant points at `pathname`. */
export function containsActive(link: MenuLink, pathname: string | null | undefined): boolean {
  return isActiveHref(link.href, pathname) || (link.items ?? []).some(child => containsActive(child, pathname));
}

export type MegaGroup = {
  link: MenuLink;
  /** First `cap` children; the rest are reachable through the group's own page ("All in …"). */
  shown: MenuLink[];
  /** Children not shown. */
  hidden: number;
  active: boolean;
};

/**
 * Desktop full menu: top-level entries with children become groups (level 1 heading + up to `cap`
 * level-2 links); top-level entries without children go to the bottom row (`loose`).
 */
export function megaGroups(
  links: MenuLink[],
  cap: number,
  pathname: string | null | undefined
): { groups: MegaGroup[]; loose: MenuLink[] } {
  const groups: MegaGroup[] = [];
  const loose: MenuLink[] = [];
  const limit = Math.max(0, Math.floor(cap));
  for (const link of links) {
    const items = link.items ?? [];
    if (items.length === 0) {
      if (link.href) loose.push(link);
      continue;
    }
    groups.push({
      link,
      shown: items.slice(0, limit),
      hidden: Math.max(0, items.length - limit),
      active: containsActive(link, pathname),
    });
  }
  return { groups, loose };
}
