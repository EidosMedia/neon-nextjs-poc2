import type { WebpageNodeModel } from '@eidosmedia/neon-frontoffice-ts-sdk';
import { COMPOSITION_CAPACITY, type ConcreteComposition } from './layout';
import type { ItemSettings } from './settings';

/** Same kind rule as getItemSettings: gallery by type, liveblog by baseType, everything else is an article. */
export function itemKind(node: WebpageNodeModel): ItemSettings['kind'] {
  const sys = node.sys;
  return sys?.type === 'gallery' ? 'gallery' : sys?.baseType === 'liveblog' ? 'liveblog' : 'article';
}

/** Publication date used for date grouping: publicationTime, falling back to pubDate. */
export function nodePublicationDate(node: WebpageNodeModel): string | undefined {
  const info = node.pubInfo as { publicationTime?: unknown; pubDate?: unknown } | undefined;
  const pick = (v: unknown) => (typeof v === 'string' && v !== '' ? v : undefined);
  return pick(info?.publicationTime) ?? pick(info?.pubDate);
}

/** Keeps only as many items as the composition can show. */
export function limitToCapacity<T>(items: T[], composition: ConcreteComposition): T[] {
  const cap = COMPOSITION_CAPACITY[composition];
  return Number.isFinite(cap) ? items.slice(0, cap) : items;
}
