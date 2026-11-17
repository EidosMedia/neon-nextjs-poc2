import type { PageData, WebpageModel, WebpageNodeModel } from '@eidosmedia/neon-frontoffice-ts-sdk';

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

export type BlockNode = {
  title?: string;
  resourceUrl?: string;
  links?: { system?: { mainPicture?: Array<{ targetId?: string }> } };
  [key: string]: unknown;
};

/** The model object of a page as served by index.json: its data and its nodes. */
export type BlockModel = {
  data?: {
    id?: string;
    title?: string;
    sys?: { baseType?: string; type?: string };
    links?: { pagelink?: Record<string, Array<{ targetId?: string; metadata?: unknown }>> };
  };
  nodes?: Record<string, BlockNode>;
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

/** The json url of a content block page: its html url with index.json in place of index.html. */
export const toBlockJsonPath = (htmlPath: string): string => htmlPath.replace(/index\.html$/, 'index.json');

/**
 * Items of a block's main zone, resolved the way getDwxLinkedObjects resolves them for a zone:
 * node fields, the main picture resource url and the link metadata.
 */
export const getBlockLinkedObjects = (model: BlockModel): WebpageNodeModel[] =>
  (model?.data?.links?.pagelink?.main ?? [])
    .filter(link => !!link?.targetId)
    .map(link => {
      const node = model.nodes?.[link.targetId as string];
      const mainPictureId = node?.links?.system?.mainPicture?.[0]?.targetId;
      const mainPicture = mainPictureId ? model.nodes?.[mainPictureId] : undefined;
      return {
        ...node,
        mainPicture: mainPicture?.resourceUrl,
        linkMetadata: link.metadata,
      } as WebpageNodeModel;
    });
