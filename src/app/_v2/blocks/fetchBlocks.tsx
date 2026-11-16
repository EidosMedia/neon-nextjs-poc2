import { cacheLife, cacheTag } from 'next/cache';
import pino from 'pino';
import { normalizeViewStatus, ViewStatus } from '@eidosmedia/neon-frontoffice-ts-sdk';
import type { AuthContext, BaseModel, PageData } from '@eidosmedia/neon-frontoffice-ts-sdk';
import { getAuthOptions } from '@/utilities/security';
import { blockCacheTags, blockContentTags, isFetchable, extractBlockLinks, type BlockArea, type BlockLink } from '../lib/blocks';

const logger = pino({ name: 'neon-fo:page-cache' });

export type FetchedBlock = {
  link: BlockLink;
  /** undefined when the fetch failed. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: PageData<any>;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function loadBlock(link: BlockLink, auth: AuthContext): Promise<PageData<any>> {
  const response: Response = await connection.makePageRequest(link.url, auth, { cache: 'no-store' });
  if (!response.ok) throw new Error(`status ${response.status}`);
  return response.json();
}

/** LIVE only: cached and tagged so `/api/cache` evicting the block node (or the site) purges it. */
async function fetchBlockCached(link: BlockLink, siteName: string, auth: AuthContext) {
  'use cache';
  cacheLife('hours');
  for (const tag of blockCacheTags(siteName, [link])) cacheTag(tag);
  const data = await loadBlock(link, auth);
  for (const tag of blockContentTags(data?.model)) cacheTag(tag);
  logger.info({ event: 'block-cache-built', url: link.url, siteName, nodeId: link.id, area: link.area }, '[page-cache] built block');
  return data;
}

export async function fetchBlocks(data: PageData<BaseModel>, area: BlockArea): Promise<FetchedBlock[]> {
  const links = extractBlockLinks(data.model, area);
  if (links.length === 0) return [];
  const live = normalizeViewStatus(data.siteData?.viewStatus) === ViewStatus.LIVE;
  const siteName = data.siteData?.siteName || data.siteNode?.name || '';
  const auth = await getAuthOptions();
  return Promise.all(
    links.map(async (link): Promise<FetchedBlock> => {
      if (!isFetchable(link)) {
        logger.warn({ event: 'block-fetch-skipped', nodeId: link.id, area }, '[page-cache] block has no url');
        return { link };
      }
      try {
        return { link, data: live ? await fetchBlockCached(link, siteName, auth) : await loadBlock(link, auth) };
      } catch (error) {
        logger.warn({ event: 'block-fetch-failed', url: link.url, nodeId: link.id, area, error: String(error) }, '[page-cache] block fetch failed');
        return { link };
      }
    }),
  );
}
