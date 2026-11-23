import { headers } from 'next/headers';
import {
  normalizeViewStatus, ViewStatus,
  type AuthContext, type BaseModel, type PageData, type WebpageModel, type WebpageNodeModel,
} from '@eidosmedia/neon-frontoffice-ts-sdk';
import { getAuthOptions } from './security';
import { fetchPageDataCached, fetchPageDataDirect, type CachedPageResult } from './pageCache';
import { getContentBlockLinks } from '@/lib/contentBlocks';
import { extractBlockLinks } from '@/app/_v2/lib/blocks';

const LIMIT = 4;

export function sectionHasObjects(data: PageData<BaseModel>): boolean {
  if (data.model.data.children?.length) return true;
  if (getContentBlockLinks(data).length || (['headers', 'includes', 'sidebars', 'footers'] as const)
    .some(area => extractBlockLinks(data.model, area).length > 0)) return true;
  const links = data.model.data.links;
  if (!links || !('pagelink' in links) || !links.pagelink || typeof links.pagelink !== 'object') return false;
  return Object.values(links.pagelink).some(zone => Array.isArray(zone) && zone.some(link =>
    link && typeof link === 'object' && 'targetId' in link && Boolean(link.targetId)));
}

export function ancestorPaths(pathname: string): string[] {
  const parts = pathname.split('/').filter(Boolean);
  const paths: string[] = [];
  while (parts.length > 1) {
    parts.pop();
    paths.push(`/${parts.join('/')}/`);
  }
  if (parts.length) paths.push('/');
  return paths;
}

async function articlesFromPage(data: PageData<WebpageModel>): Promise<WebpageNodeModel[]> {
  const model = data.model;
  const children = (model.data.children ?? []).map(id => {
    const node: WebpageNodeModel | undefined = model.nodes[id];
    if (!node) return undefined;
    const pictureId = node.links?.system?.mainPicture?.[0]?.targetId;
    return { ...node, mainPicture: (pictureId ? model.nodes[pictureId]?.resourceUrl : undefined) ?? node.mainPicture };
  });
  const zones = Object.keys(model.data.links?.pagelink ?? {});
  const linked = await Promise.all(zones.map(zone => connection.getDwxLinkedObjects(data, zone)));
  return [...children, ...linked.flat()].filter((node): node is WebpageNodeModel =>
    Boolean(node?.id && node.url && node.sys?.baseType === 'article'));
}

export async function collectSectionRecommendations(
  pathname: string,
  fetchPage: (path: string) => Promise<CachedPageResult>,
): Promise<WebpageNodeModel[]> {
  const articles: WebpageNodeModel[] = [];
  const seen = new Set<string>();
  for (const path of ancestorPaths(pathname)) {
    let result: CachedPageResult;
    try {
      result = await fetchPage(path);
    } catch (error) {
      if (error && typeof error === 'object' && 'status' in error
        && [404, 410].includes(Number(error.status))) continue;
      throw error;
    }
    if (result.redirectLocation) {
      console.warn('Skipping redirected section recirculation source:', path);
      continue;
    }
    if (!result.data?.model?.data || !result.data.model.nodes) {
      throw new Error(`Invalid section recirculation source: ${path}`);
    }
    for (const article of await articlesFromPage(result.data)) {
      if (seen.has(article.id)) continue;
      seen.add(article.id);
      articles.push(article);
      if (articles.length === LIMIT) return articles;
    }
  }
  return articles;
}

export async function getSectionRecommendations(): Promise<WebpageNodeModel[]> {
  const requestHeaders = await headers();
  const hostname = requestHeaders.get('x-neon-backend-url');
  const pathname = requestHeaders.get('x-neon-pathname');
  const siteName = requestHeaders.get('x-neon-site-name');
  if (!hostname || !pathname || !siteName) {
    throw new Error('Missing request context for section recirculation');
  }
  const auth: AuthContext = await getAuthOptions();
  const live = normalizeViewStatus(requestHeaders.get('x-neon-view-status')) === ViewStatus.LIVE;
  return collectSectionRecommendations(pathname, async path => {
    let url = new URL(`${hostname.replace(/\/$/, '')}${path}`);
    const origin = url.origin;
    const visited = new Set<string>();
    while (true) {
      if (visited.has(url.href) || visited.size >= 5) {
        throw new Error(`Section recirculation redirect loop: ${path}`);
      }
      visited.add(url.href);
      const result = live
        ? await fetchPageDataCached(url.href, siteName, auth)
        : await fetchPageDataDirect(url.href, auth);
      if (!result.redirectLocation) return result;
      const next = new URL(result.redirectLocation, url);
      if (next.origin !== origin) return result;
      url = next;
    }
  });
}
