import type { WebpageModel, WebpageNodeModel } from '@eidosmedia/neon-frontoffice-ts-sdk';
import {
  buildZoneHead,
  getAccessoryTheme,
  type PageDataLike,
} from '@/lib/accessories/defaultThemeAccessories';
import { getAccessoryDefinitions } from '@/lib/accessories/definitions';
import {
  resolveAccessoryValues,
  type AccessoryContext,
  type ResolvedAccessoryValues,
} from '@/lib/accessories/resolveAccessories';
import { isSafeHref } from '@/lib/accessories/sanitizeZoneSummary';
import type { ZoneHeadContent } from '@/lib/accessories/zoneHeadTypes';

export type HeaderSettings = { enabled: boolean; sectionsMenu: boolean; variant: 'regular' | 'compact' | 'minimal' };
export type FooterSettings = { enabled: boolean; menu: boolean; variant: 'regular' | 'lite' };
export type AdDensity = 'low' | 'medium' | 'high';
export type ArticleLeafVariant = 'standard' | 'fullBleedHero' | 'textLed' | 'opinion';
export type LiveblogLeafVariant = 'livePage' | 'resultsPanel' | 'endedArchive';
export type GalleryLeafVariant = 'heroGallery' | 'storyGallery' | 'photoEssay';
export type LeafSettings =
  | { kind: 'article'; variant: ArticleLeafVariant; correlates: 0 | 1 | 2 | 3; adDensity: AdDensity }
  | { kind: 'liveblog'; variant: LiveblogLeafVariant; liveTag: boolean; pinnedSummary: boolean; adDensity: AdDensity }
  | { kind: 'gallery'; variant: GalleryLeafVariant; captions: boolean; thumbnails: boolean; adDensity: AdDensity };
export type Composition =
  | 'auto' | 'leadList' | 'threeUp' | 'fourUp' | 'split' | 'grid2x2' | 'overlayPair' | 'datedListing' | 'sponsored';
export type ZoneSettings = {
  showTitle: boolean;
  composition: Composition;
  titleStyle: 'bar' | 'column';
  head?: ZoneHeadContent;
  moreLink?: string;
  sponsorName?: string;
};
export type ArticleItemVariant =
  | 'standard' | 'lead' | 'compact' | 'textOnly' | 'overlay' | 'opinion' | 'highlight' | 'sponsored';
export type ItemSettings =
  | { kind: 'article'; variant: ArticleItemVariant | 'auto'; image: boolean; standfirst: boolean }
  | { kind: 'liveblog'; variant: 'panel' | 'feed' | 'pinnedSummary' | 'compact' | 'auto'; image: boolean; share: boolean }
  | { kind: 'gallery'; variant: 'fullBleed' | 'panelWithThumbs' | 'grid' | 'auto'; captions: boolean; thumbnails: boolean };

type ArticleLeaf = Extract<LeafSettings, { kind: 'article' }>;
type LiveblogLeaf = Extract<LeafSettings, { kind: 'liveblog' }>;
type GalleryLeaf = Extract<LeafSettings, { kind: 'gallery' }>;

export const V2_DEFAULTS = {
  header: { enabled: true, sectionsMenu: true, variant: 'regular' } as HeaderSettings,
  footer: { enabled: true, menu: true, variant: 'regular' } as FooterSettings,
  zone: { showTitle: true, composition: 'auto', titleStyle: 'bar' } as ZoneSettings,
  articleLeaf: { kind: 'article', variant: 'standard', correlates: 3, adDensity: 'medium' } as ArticleLeaf,
  liveblogLeaf: {
    kind: 'liveblog', variant: 'livePage', liveTag: true, pinnedSummary: true, adDensity: 'medium',
  } as LiveblogLeaf,
  galleryLeaf: {
    kind: 'gallery', variant: 'heroGallery', captions: true, thumbnails: true, adDensity: 'medium',
  } as GalleryLeaf,
  articleItem: { kind: 'article', variant: 'auto', image: true, standfirst: false } as Extract<ItemSettings, { kind: 'article' }>,
  liveblogItem: { kind: 'liveblog', variant: 'auto', image: true, share: false } as Extract<ItemSettings, { kind: 'liveblog' }>,
  galleryItem: { kind: 'gallery', variant: 'auto', captions: true, thumbnails: true } as Extract<ItemSettings, { kind: 'gallery' }>,
};

type Values = Record<string, boolean | string> | undefined;

function bool(values: Values, name: string, fallback: boolean): boolean {
  const value = values?.[name];
  return typeof value === 'boolean' ? value : fallback;
}

function pick<T extends string>(values: Values, name: string, allowed: readonly T[], fallback: T): T {
  const value = values?.[name];
  return typeof value === 'string' && (allowed as readonly string[]).includes(value) ? (value as T) : fallback;
}

function text(values: Values, name: string): string | undefined {
  const value = values?.[name];
  return typeof value === 'string' && value.trim() !== '' ? value.trim() : undefined;
}

const AD_DENSITY = ['low', 'medium', 'high'] as const;
const CORRELATES = ['0', '1', '2', '3'] as const;

function resolve(
  stored: Parameters<typeof resolveAccessoryValues>[1],
  context: AccessoryContext,
): ResolvedAccessoryValues | undefined {
  const definitions = getAccessoryDefinitions(context.theme);
  return definitions ? resolveAccessoryValues(definitions, stored, context) : undefined;
}

function nodeContext(data: PageDataLike): Pick<AccessoryContext, 'theme' | 'type' | 'baseType'> {
  const sys = data.model?.data?.sys;
  return { theme: getAccessoryTheme(data), type: sys?.type ?? '', baseType: sys?.baseType };
}

function readLeaf(resolved: ResolvedAccessoryValues | undefined, data: PageDataLike): LeafSettings | undefined {
  const sys = data.model?.data?.sys;
  const isLongform = sys?.type === 'longform';
  const forceHero = <T extends LeafSettings>(leaf: T): T =>
    isLongform && leaf.kind === 'article' ? { ...leaf, variant: 'fullBleedHero' } : leaf;

  let kind: LeafSettings['kind'] | undefined;
  if (resolved) {
    kind = resolved.galleryLeaf ? 'gallery' : resolved.liveblogLeaf ? 'liveblog' : resolved.articleLeaf ? 'article' : undefined;
  } else if (sys?.type === 'gallery') {
    kind = 'gallery';
  } else if (sys?.baseType === 'liveblog') {
    kind = 'liveblog';
  } else if (sys?.baseType === 'article') {
    kind = 'article';
  }

  if (kind === 'gallery') {
    const v = resolved?.galleryLeaf;
    const d = V2_DEFAULTS.galleryLeaf;
    return {
      kind,
      variant: pick(v, 'variant', ['heroGallery', 'storyGallery', 'photoEssay'], d.variant),
      captions: bool(v, 'captions', d.captions),
      thumbnails: bool(v, 'thumbnails', d.thumbnails),
      adDensity: pick(v, 'adDensity', AD_DENSITY, d.adDensity),
    };
  }
  if (kind === 'liveblog') {
    const v = resolved?.liveblogLeaf;
    const d = V2_DEFAULTS.liveblogLeaf;
    return {
      kind,
      variant: pick(v, 'variant', ['livePage', 'resultsPanel', 'endedArchive'], d.variant),
      liveTag: bool(v, 'liveTag', d.liveTag),
      pinnedSummary: bool(v, 'pinnedSummary', d.pinnedSummary),
      adDensity: pick(v, 'adDensity', AD_DENSITY, d.adDensity),
    };
  }
  if (kind === 'article') {
    const v = resolved?.articleLeaf;
    const d = V2_DEFAULTS.articleLeaf;
    return forceHero({
      kind,
      variant: pick(v, 'variant', ['standard', 'fullBleedHero', 'textLed', 'opinion'], d.variant),
      correlates: Number(pick(v, 'correlates', CORRELATES, '3')) as 0 | 1 | 2 | 3,
      adDensity: pick(v, 'adDensity', AD_DENSITY, d.adDensity),
    });
  }
  return undefined;
}

export function getPageSettings(data: PageDataLike): { header: HeaderSettings; footer: FooterSettings; leaf?: LeafSettings } {
  const stored = data.model?.data?.pubInfo?.attributes?.pageAccessories;
  const resolved = resolve(stored, { ...nodeContext(data), level: 'page' });
  const h = resolved?.header;
  const f = resolved?.footer;
  const leaf = readLeaf(resolved, data);
  return {
    header: {
      enabled: bool(h, 'enabled', V2_DEFAULTS.header.enabled),
      sectionsMenu: bool(h, 'sectionsMenu', V2_DEFAULTS.header.sectionsMenu),
      variant: pick(h, 'variant', ['regular', 'compact', 'minimal'], V2_DEFAULTS.header.variant),
    },
    footer: {
      enabled: bool(f, 'enabled', V2_DEFAULTS.footer.enabled),
      menu: bool(f, 'menu', V2_DEFAULTS.footer.menu),
      variant: pick(f, 'variant', ['regular', 'lite'], V2_DEFAULTS.footer.variant),
    },
    ...(leaf ? { leaf } : {}),
  };
}

const COMPOSITIONS = [
  'auto', 'leadList', 'threeUp', 'fourUp', 'split', 'grid2x2', 'overlayPair', 'datedListing', 'sponsored',
] as const;

export function getZoneSettings(data: PageDataLike, zone: string): ZoneSettings {
  const stored = (data.model?.data as WebpageModel | undefined)?.zoneAccessories?.[zone];
  const v = resolve(stored, { ...nodeContext(data), level: 'zone', zone })?.zone;
  const summarySize = 2000;
  const head = buildZoneHead(v?.zonetitle, v?.zonesummary, summarySize);
  const moreLink = text(v, 'moreLink');
  const sponsorName = text(v, 'sponsorName');
  return {
    showTitle: bool(v, 'showTitle', V2_DEFAULTS.zone.showTitle),
    composition: pick(v, 'composition', COMPOSITIONS, V2_DEFAULTS.zone.composition),
    titleStyle: pick(v, 'titleStyle', ['bar', 'column'], V2_DEFAULTS.zone.titleStyle),
    ...(head ? { head } : {}),
    ...(moreLink && isSafeHref(moreLink) ? { moreLink } : {}),
    ...(sponsorName ? { sponsorName } : {}),
  };
}

export function getItemSettings(data: PageDataLike, zone: string, node: WebpageNodeModel): ItemSettings {
  const sys = node.sys;
  const kind: ItemSettings['kind'] = sys?.type === 'gallery' ? 'gallery' : sys?.baseType === 'liveblog' ? 'liveblog' : 'article';
  const resolved = resolve(node.linkMetadata?.linkAccessories, {
    ...nodeContext(data),
    level: 'link',
    zone,
    linkedType: sys?.type ?? '',
    linkedBaseType: sys?.baseType,
  });
  if (kind === 'gallery') {
    const v = resolved?.galleryItem;
    const d = V2_DEFAULTS.galleryItem;
    return {
      kind,
      variant: pick(v, 'variant', ['fullBleed', 'panelWithThumbs', 'grid', 'auto'], d.variant),
      captions: bool(v, 'captions', d.captions),
      thumbnails: bool(v, 'thumbnails', d.thumbnails),
    };
  }
  if (kind === 'liveblog') {
    const v = resolved?.liveblogItem;
    const d = V2_DEFAULTS.liveblogItem;
    return {
      kind,
      variant: pick(v, 'variant', ['panel', 'feed', 'pinnedSummary', 'compact', 'auto'], d.variant),
      image: bool(v, 'image', d.image),
      share: bool(v, 'share', d.share),
    };
  }
  const v = resolved?.articleItem;
  const d = V2_DEFAULTS.articleItem;
  return {
    kind,
    variant: pick(
      v, 'variant',
      ['standard', 'lead', 'compact', 'textOnly', 'overlay', 'opinion', 'highlight', 'sponsored', 'auto'], d.variant,
    ),
    image: bool(v, 'image', d.image),
    standfirst: bool(v, 'standfirst', d.standfirst),
  };
}
