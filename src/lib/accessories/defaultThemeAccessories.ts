import type { BaseModel, PageData, WebpageModel, WebpageNodeModel } from '@eidosmedia/neon-frontoffice-ts-sdk';
import { getAccessoryDefinitions, isV2Theme } from './definitions';
import {
  resolveAccessoryValues,
  type AccessoryContext,
  type AccessoryDefinition,
  type AccessoryDefinitions,
  type PropertyDefinition,
  type ResolvedAccessoryValues,
} from './resolveAccessories';
import { sanitizeZoneSummary } from './sanitizeZoneSummary';
import type { AccessoryShape, ZoneAccessoryShapes } from './shapeClasses';
import type { ZoneHeadContent } from './zoneHeadTypes';

export type PageDataLike = Partial<PageData<BaseModel>>;

export type PageChrome = {
  showHeader: boolean;
  showSectionsMenu: boolean;
  showFooter: boolean;
  showFooterMenu: boolean;
};

/** What the default theme renders when no accessory value applies. */
export const DEFAULT_PAGE_CHROME: PageChrome = {
  showHeader: true,
  showSectionsMenu: true,
  showFooter: true,
  showFooterMenu: true,
};

/** A missing or blank theme renders as the default theme. */
export function normalizeTheme(theme: unknown): string {
  return typeof theme === 'string' && theme.trim() !== '' ? theme.trim() : 'default';
}

type ThemeSource = { attributes?: Record<string, unknown>; staticAttributes?: Record<string, unknown> } | null | undefined;

/**
 * The site's theme key. A theme set on the site root (`attributes.theme`) wins; otherwise the site
 * configuration's custom `theme` value (`staticAttributes.theme`, delivered next to settings such as
 * `invalidateNextJsTimeoutMs`) applies; otherwise `default`.
 */
export function siteThemeOf(node: ThemeSource): string {
  const fromRoot = normalizeTheme(node?.attributes?.theme);
  return fromRoot !== 'default' || hasExplicitDefault(node?.attributes?.theme)
    ? fromRoot
    : normalizeTheme(node?.staticAttributes?.theme);
}

/** `theme: "default"` set on the root is an explicit choice and still beats the site configuration. */
function hasExplicitDefault(theme: unknown): boolean {
  return typeof theme === 'string' && theme.trim() === 'default';
}

/**
 * Page JSON is cached for hours (`fetchPageDataCached`), so its `siteNode` can carry a theme the site
 * no longer has. Returns `data` with the theme sources (`attributes.theme`, `staticAttributes.theme`)
 * taken from the current site root (the site list, refreshed every `SITES_REFRESH_INTERVAL`), so pages
 * and the special routes always agree on the theme. Never mutates `data`; returns it as-is when the site
 * is unknown.
 */
export function withSiteTheme<T extends { siteNode?: unknown }>(data: T, root: ThemeSource): T {
  if (!root) return data;
  const node = (data.siteNode ?? {}) as NonNullable<ThemeSource>;
  return {
    ...data,
    siteNode: {
      ...node,
      attributes: { ...node.attributes, theme: root.attributes?.theme },
      staticAttributes: { ...node.staticAttributes, theme: root.staticAttributes?.theme },
    },
  };
}

export function getActiveTheme(data: PageDataLike): string {
  return siteThemeOf(data.siteNode);
}

/**
 * The theme Neon resolves when it serves definitions and stores accessory values: the site root `theme`
 * attribute, else `default`. Neon does not read the site configuration theme (`staticAttributes.theme`),
 * so a site themed only through its configuration stores its values under `default`.
 */
export function accessoryThemeOf(node: ThemeSource): string {
  return normalizeTheme(node?.attributes?.theme);
}

/**
 * Theme key for accessory lookups. On a v2 site it is Neon's theme (`accessoryThemeOf`), so stored values
 * match whatever look the configuration picks; on a legacy or unknown site it is the site theme, which
 * has no definitions, so no values apply there.
 */
export function getAccessoryTheme(data: PageDataLike): string {
  const site = getActiveTheme(data);
  return isV2Theme(site) ? accessoryThemeOf(data.siteNode) : site;
}

function nodeContext(data: PageDataLike): Pick<AccessoryContext, 'theme' | 'type' | 'baseType'> {
  const sys = data.model?.data?.sys;
  return { theme: getAccessoryTheme(data), type: sys?.type ?? '', baseType: sys?.baseType };
}

function resolveForTheme(
  stored: Parameters<typeof resolveAccessoryValues>[1],
  context: AccessoryContext,
): ResolvedAccessoryValues | undefined {
  const definitions = getAccessoryDefinitions(context.theme);
  return definitions ? resolveAccessoryValues(definitions, stored, context) : undefined;
}

export function getPageChrome(data: PageDataLike): PageChrome {
  const stored = data.model?.data?.pubInfo?.attributes?.pageAccessories;
  const resolved = resolveForTheme(stored, { ...nodeContext(data), level: 'page' });
  const header = resolved?.header;
  const footer = resolved?.footer;
  return {
    showHeader: header?.enabled !== false,
    showSectionsMenu: header?.sectionsMenu !== false,
    showFooter: footer?.enabled !== false,
    showFooterMenu: footer?.menu !== false,
  };
}

function toShape(resolved: ResolvedAccessoryValues | undefined): AccessoryShape | undefined {
  const shape = resolved?.shape;
  if (!shape) {
    return undefined;
  }
  const bold = shape?.bold === true;
  const border = shape?.border === true;
  return { bold, border };
}

function zoneValues(data: PageDataLike, zone: string): ResolvedAccessoryValues | undefined {
  const stored = (data.model?.data as WebpageModel | undefined)?.zoneAccessories?.[zone];
  return resolveForTheme(stored, { ...nodeContext(data), level: 'zone', zone });
}

function zoneShapeProperty(definitions: AccessoryDefinitions | undefined, name: string): PropertyDefinition | undefined {
  const zoneDefinitions = definitions?.zoneAccessories;
  const list: AccessoryDefinition[] = Array.isArray(zoneDefinitions) ? zoneDefinitions : Object.values(zoneDefinitions ?? {});
  return list.find(definition => definition.name === 'shape')?.properties?.find(property => property.name === name);
}

/** Builds the zone head from stored title/summary: collapsed-whitespace title plus a re-sanitised summary. */
export function buildZoneHead(rawTitle: unknown, rawSummary: unknown, summarySize: number): ZoneHeadContent | undefined {
  const title = typeof rawTitle === 'string' ? rawTitle.replace(/\s+/g, ' ').trim() : '';
  const summary = typeof rawSummary === 'string' ? sanitizeZoneSummary(rawSummary, { maxVisible: summarySize }) : undefined;
  if (!title && !summary) {
    return undefined;
  }
  return { ...(title ? { title } : {}), ...(summary ? { summary } : {}) };
}

/** Title and summary of a zone; undefined when both are absent or empty, so no top area is rendered. */
function toHead(theme: string, resolved: ResolvedAccessoryValues | undefined): ZoneHeadContent | undefined {
  const shape = resolved?.shape;
  const summarySize = zoneShapeProperty(getAccessoryDefinitions(theme), 'zonesummary')?.size ?? 0;
  return buildZoneHead(shape?.zonetitle, shape?.zonesummary, summarySize);
}

export function getZoneShape(data: PageDataLike, zone: string): AccessoryShape | undefined {
  return toShape(zoneValues(data, zone));
}

export function getZoneHead(data: PageDataLike, zone: string): ZoneHeadContent | undefined {
  return toHead(getAccessoryTheme(data), zoneValues(data, zone));
}

export function getZoneAccessoryShapes(
  data: PageDataLike,
  zone: string,
  linkedObjects: WebpageNodeModel[],
): ZoneAccessoryShapes {
  const values = zoneValues(data, zone);
  return {
    zone: toShape(values),
    head: toHead(getAccessoryTheme(data), values),
    links: getLinkShapes(data, zone, linkedObjects),
  };
}

export function getLinkShapes(
  data: PageDataLike,
  zone: string,
  linkedObjects: WebpageNodeModel[],
): (AccessoryShape | undefined)[] {
  const context = nodeContext(data);
  return linkedObjects.map(linkedObject =>
    toShape(
      resolveForTheme(linkedObject.linkMetadata?.linkAccessories, {
        ...context,
        level: 'link',
        zone,
        linkedType: linkedObject.sys?.type ?? '',
        linkedBaseType: linkedObject.sys?.baseType,
      }),
    ),
  );
}
