import { cacheTag, cacheLife } from 'next/cache';
import type { AuthContext } from '@eidosmedia/neon-frontoffice-ts-sdk';
import pino from 'pino';

const logger = pino({ name: 'neon-fo:page-cache' });

export type CachedPageResult = {
  status: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;
  redirectLocation?: string;
};

/**
 * Non-cached fetch — used for preview / editorial (viewStatus !== 'live').
 * Never writes to the Next.js data cache.
 */
export async function fetchPageDataDirect(
  url: string,
  auth: AuthContext,
): Promise<CachedPageResult> {
  const response: Response = await connection.makePageRequest(url, auth, {
    redirect: 'manual',
    cache: 'no-store',
  });

  if (response.status > 300 && response.status < 400) {
    return {
      status: response.status,
      redirectLocation: response.headers.get('Location') ?? '/',
    };
  }

  return { status: response.status, data: await response.json() };
}

/**
 * Fetches and caches a CMS page response — LIVE content only.
 *
 * Cache tags applied:
 *  - `neon:site:<siteName>`        — all pages for the site (bulk site invalidation)
 *  - `neon:node:<nodeId>`          — the page's own CMS node (article / webpage / section)
 *  - `neon:node:<zoneArticleId>`   — every article node ID found in zones (webpage / section pages)
 *
 * This closes the invalidation loop: evicting a single article node ID purges both the
 * article page AND every listing page (webpage / section) that holds it in a zone.
 */
export async function fetchPageDataCached(
  url: string,
  siteName: string,
  auth: AuthContext,
): Promise<CachedPageResult> {
  'use cache';

  // Live content only — long-lived, demand-invalidated via revalidateTag
  cacheLife('hours');

  // Inner fetch bypasses the HTTP cache — the outer 'use cache' owns persistence
  const response: Response = await connection.makePageRequest(url, auth, {
    redirect: 'manual',
    cache: 'no-store',
  });

  // Redirects: return the location without caching page content
  if (response.status > 300 && response.status < 400) {
    return {
      status: response.status,
      redirectLocation: response.headers.get('Location') ?? '/',
    };
  }

  const data = await response.json();

  // ── Cache tags + collection for logging ──────────────────────────────────────

  cacheTag(`neon:site:${siteName}`);

  const nodeId: string | undefined = data?.model?.data?.id;
  if (nodeId) {
    cacheTag(`neon:node:${nodeId}`);
  }

  const taggedIds: string[] = nodeId ? [nodeId] : [];

  type ZoneItem = { id: string; title: string; zone: string };
  const zoneItems: ZoneItem[] = [];

  // Webpage zones: each linked article in any zone slot
  const pageLinks = data?.model?.data?.links?.pagelink;
  if (pageLinks && typeof pageLinks === 'object') {
    for (const [zoneName, zone] of Object.entries(pageLinks)) {
      if (Array.isArray(zone)) {
        for (const link of zone as Array<{ targetId?: string }>) {
          if (link?.targetId) {
            cacheTag(`neon:node:${link.targetId}`);
            taggedIds.push(link.targetId);
            zoneItems.push({
              id: link.targetId,
              title: data?.model?.nodes?.[link.targetId]?.title ?? '(no title)',
              zone: zoneName,
            });
          }
        }
      }
    }
  }

  // Section / list pages: children node IDs
  const children: unknown = data?.model?.data?.children;
  if (Array.isArray(children)) {
    for (const childId of children as string[]) {
      if (childId) {
        cacheTag(`neon:node:${childId}`);
        taggedIds.push(childId);
      }
    }
  }

  // ── Logging ──────────────────────────────────────────────────────────────────

  const baseType: string = data?.model?.data?.sys?.baseType ?? 'unknown';
  const pageTitle: string = data?.model?.data?.title ?? url;

  if (zoneItems.length > 0) {
    logger.info(
      {
        event: 'page-cache-built',
        url,
        siteName,
        nodeId,
        baseType,
        taggedIds,
        zoneContents: zoneItems,
      },
      `[page-cache] built ${baseType} "${pageTitle}" — ${taggedIds.length} tag(s), zone: ${
        zoneItems.map((z) => `${z.zone}/${z.id} "${z.title}"`).join(', ')
      }`,
    );
  } else {
    logger.info(
      { event: 'page-cache-built', url, siteName, nodeId, baseType, taggedIds },
      `[page-cache] built ${baseType} "${pageTitle}" — ${taggedIds.length} tag(s)`,
    );
  }

  return { status: response.status, data };
}
