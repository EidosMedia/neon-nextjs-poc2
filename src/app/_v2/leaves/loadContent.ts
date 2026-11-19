import { headers } from 'next/headers';
import { getAuthOptions } from '@/utilities/security';
import { hasContent, withContent } from '../lib/leafContent';

/**
 * The leaf's article with its content document. When the page response left it out
 * (`files.content.data: null`), it is fetched from `/api/nodes/<id>`; on failure the article is
 * returned as-is and the header falls back to the plain title and summary.
 */
export async function loadContent<T extends { id: string; files?: { content?: { data?: unknown } } }>(article: T): Promise<T> {
  if (hasContent(article)) return article;
  try {
    const apiHostname = (await headers()).get('x-neon-backend-url') ?? '';
    const resp = await connection.makeApiRequest(`/api/nodes/${article.id}`, await getAuthOptions(), {}, apiHostname);
    if (resp.ok) return withContent(article, await resp.json());
    console.warn('[v2 leaf] content fetch failed:', resp.status, 'for node', article.id);
  } catch (err) {
    console.error('[v2 leaf] content fetch error for node', article.id, ':', err);
  }
  return article;
}
