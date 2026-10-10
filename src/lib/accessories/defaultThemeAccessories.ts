import type { BaseModel, PageData, WebpageModel, WebpageNodeModel } from '@eidosmedia/neon-frontoffice-ts-sdk';
import accessoryDefinitions from './accessory.json';
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

const DEFINITIONS = accessoryDefinitions as unknown as AccessoryDefinitions;

type PageDataLike = Partial<PageData<BaseModel>>;

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

export function getActiveTheme(data: PageDataLike): string {
  return normalizeTheme(data.siteNode?.attributes?.theme);
}

function nodeContext(data: PageDataLike): Pick<AccessoryContext, 'theme' | 'type' | 'baseType'> {
  const sys = data.model?.data?.sys;
  return { theme: getActiveTheme(data), type: sys?.type ?? '', baseType: sys?.baseType };
}

export function getPageChrome(data: PageDataLike): PageChrome {
  const stored = data.model?.data?.pubInfo?.attributes?.pageAccessories;
  const resolved = resolveAccessoryValues(DEFINITIONS, stored, { ...nodeContext(data), level: 'page' });
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
  return resolveAccessoryValues(DEFINITIONS, stored, { ...nodeContext(data), level: 'zone', zone });
}

function zoneShapeProperty(name: string): PropertyDefinition | undefined {
  const definitions = DEFINITIONS.zoneAccessories;
  const list: AccessoryDefinition[] = Array.isArray(definitions) ? definitions : Object.values(definitions ?? {});
  return list.find(definition => definition.name === 'shape')?.properties?.find(property => property.name === name);
}

/** Title and summary of a zone; undefined when both are absent or empty, so no top area is rendered. */
function toHead(resolved: ResolvedAccessoryValues | undefined): ZoneHeadContent | undefined {
  const shape = resolved?.shape;
  const title = typeof shape?.zonetitle === 'string' ? shape.zonetitle.replace(/\s+/g, ' ').trim() : '';
  const summary =
    typeof shape?.zonesummary === 'string'
      ? sanitizeZoneSummary(shape.zonesummary, { maxVisible: zoneShapeProperty('zonesummary')?.size ?? 0 })
      : undefined;
  if (!title && !summary) {
    return undefined;
  }
  return { ...(title ? { title } : {}), ...(summary ? { summary } : {}) };
}

export function getZoneShape(data: PageDataLike, zone: string): AccessoryShape | undefined {
  return toShape(zoneValues(data, zone));
}

export function getZoneHead(data: PageDataLike, zone: string): ZoneHeadContent | undefined {
  return toHead(zoneValues(data, zone));
}

export function getZoneAccessoryShapes(
  data: PageDataLike,
  zone: string,
  linkedObjects: WebpageNodeModel[],
): ZoneAccessoryShapes {
  const values = zoneValues(data, zone);
  return { zone: toShape(values), head: toHead(values), links: getLinkShapes(data, zone, linkedObjects) };
}

export function getLinkShapes(
  data: PageDataLike,
  zone: string,
  linkedObjects: WebpageNodeModel[],
): (AccessoryShape | undefined)[] {
  const context = nodeContext(data);
  return linkedObjects.map(linkedObject =>
    toShape(
      resolveAccessoryValues(DEFINITIONS, linkedObject.linkMetadata?.linkAccessories, {
        ...context,
        level: 'link',
        zone,
        linkedType: linkedObject.sys?.type ?? '',
        linkedBaseType: linkedObject.sys?.baseType,
      }),
    ),
  );
}
