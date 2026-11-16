import { ViewStatus } from '@eidosmedia/neon-frontoffice-ts-sdk';

/**
 * The ONLY module that knows the Neon Content Block model. The body contract is still undefined
 * in Neon, so every assumption (link location, node shape, which baseTypes are page-like) lives here.
 */
export type BlockArea = 'headers' | 'includes' | 'sidebars' | 'footers';

export const BLOCK_LIMITS: Record<BlockArea, number> = { headers: 2, includes: 10, sidebars: 2, footers: 2 };

export type BlockLink = { area: BlockArea; id: string; url: string; blockType?: string };

const asRecord = (v: unknown): Record<string, unknown> | undefined =>
  v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : undefined;

/** Assumed shape: `model.data.links.pagelink[area]`, same as zone links. Unknown shapes yield []. */
export function extractBlockLinks(model: unknown, area: BlockArea): BlockLink[] {
  const m = asRecord(model);
  const links = asRecord(asRecord(asRecord(m?.data)?.links)?.pagelink)?.[area];
  if (!Array.isArray(links)) return [];
  const nodes = asRecord(m?.nodes);
  const out: BlockLink[] = [];
  for (const l of links) {
    const id = asRecord(l)?.targetId;
    if (typeof id !== 'string' || !id) continue;
    const node = asRecord(nodes?.[id]);
    const type = asRecord(node?.sys)?.type;
    out.push({
      area,
      id,
      url: typeof node?.url === 'string' ? node.url : '',
      blockType: typeof type === 'string' ? type : undefined,
    });
  }
  return out.slice(0, BLOCK_LIMITS[area]);
}

export function blockCacheTags(siteName: string, links: BlockLink[]): string[] {
  return [`neon:site:${siteName}`, ...links.map((l) => `neon:node:${l.id}`)];
}

export const isFetchable = (link: BlockLink): boolean => link.url.trim().length > 0;

/** `neon:node:<id>` for every pagelink target (all zones) in a block's own model. */
export function blockContentTags(blockModel: unknown): string[] {
  const pagelink = asRecord(asRecord(asRecord(blockModel)?.data)?.links)?.pagelink;
  const zones = asRecord(pagelink);
  if (!zones) return [];
  const ids = new Set<string>();
  for (const zone of Object.values(zones)) {
    if (!Array.isArray(zone)) continue;
    for (const l of zone) {
      const id = asRecord(l)?.targetId;
      if (typeof id === 'string' && id) ids.add(id);
    }
  }
  return [...ids].map((id) => `neon:node:${id}`);
}

export type BlockRenderDecision =
  | { kind: 'module'; key: string }
  | { kind: 'webpage' }
  | { kind: 'placeholder' }
  | { kind: 'none' };

const WEBPAGE_LIKE = ['webpage', 'contentblock', 'homewebpage', 'sectionwebpage'];

export function decideBlockRender(
  blockType: string | undefined,
  baseType: string | undefined,
  moduleKeys: string[],
  viewStatus: ViewStatus,
): BlockRenderDecision {
  if (blockType && moduleKeys.includes(blockType)) return { kind: 'module', key: blockType };
  if (baseType && WEBPAGE_LIKE.includes(baseType)) return { kind: 'webpage' };
  return viewStatus === ViewStatus.PREVIEW ? { kind: 'placeholder' } : { kind: 'none' };
}

/** Stub: Task 16 replaces this with the brand modules registry lookup (`brand.modules`). */
export function getModuleKeys(theme: string): string[] {
  void theme;
  return [];
}
