import type { PageData, WebpageModel } from '@eidosmedia/neon-frontoffice-ts-sdk';

export type ContentBlockLink = {
  zone: string;
  targetId: string;
  url: string;
  key?: number | string;
};

type BlockLinkEntry = {
  targetId?: string;
  url?: string;
  key?: number | string;
};

/**
 * Content blocks linked to a page, from `links.blocklink`. Each zone key lists the blocks in
 * that zone; entries without a target or a url cannot be rendered and are skipped.
 */
export const getContentBlockLinks = (data: PageData<WebpageModel>): ContentBlockLink[] => {
  const blockLinks = (data?.model?.data?.links as { blocklink?: Record<string, BlockLinkEntry[]> } | undefined)
    ?.blocklink;
  if (!blockLinks) return [];

  return Object.entries(blockLinks).flatMap(([zone, entries]) =>
    (Array.isArray(entries) ? entries : [])
      .filter(entry => !!entry?.targetId && !!entry?.url)
      .map(entry => ({ zone, targetId: entry.targetId as string, url: entry.url as string, key: entry.key })),
  );
};
