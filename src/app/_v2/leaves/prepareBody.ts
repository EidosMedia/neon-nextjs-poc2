import type { ComponentType } from 'react';
import { headers } from 'next/headers';
import type { ContentElement } from '@eidosmedia/neon-frontoffice-ts-sdk';
import { findCustomComponentNodes } from '@/utilities/content';
import { resolveServerComponent } from '@/services/uiComponentsServerLoader';
import { getAuthOptions } from '@/utilities/security';

const NEON_ID_RE = /(?:^|\/)([0-9a-f]{4}-[0-9a-f]{12}-[0-9a-f]{12}-\d+)(?:\/|$)/i;

/**
 * Pre-resolves custom components server-side and pre-fetches embedded Neon nodes so renderContent
 * can render them without client JS (same behaviour as the legacy Article page).
 */
export async function prepareBody(
  text: ContentElement | undefined,
  pageNodes: Record<string, unknown> | undefined,
) {
  const customComponents = new Map<string, ComponentType<Record<string, unknown>>>();
  const nodeDataMap = new Map<string, unknown>();
  if (!text) return { customComponents, nodeDataMap };

  const customNodes = findCustomComponentNodes(text);
  await Promise.all(
    [...new Set(customNodes.map(n => n.attributes?.componentname).filter(Boolean))].map(async name => {
      const Comp = (await resolveServerComponent('editor', name)) as ComponentType<Record<string, unknown>> | null;
      if (Comp) customComponents.set(name, Comp);
    }),
  );

  const apiHostname = (await headers()).get('x-neon-backend-url') ?? '';
  const auth = await getAuthOptions();
  await Promise.all(
    customNodes
      .filter(n => NEON_ID_RE.test(n.attributes?.href ?? ''))
      .map(async n => {
        const neonId = n.attributes?.href.match(NEON_ID_RE)?.[1] ?? '';
        if (!neonId) return;
        let apiData: Record<string, unknown> = {};
        try {
          const resp = await connection.makeApiRequest(`/api/nodes/${neonId}`, auth, {}, apiHostname);
          if (resp.ok) apiData = connection.redactSiteConfig(await resp.json());
          else console.warn('[v2 leaf] embed fetch failed:', resp.status, 'for node', neonId);
        } catch (err) {
          console.error('[v2 leaf] embed fetch error for node', neonId, ':', err);
        }
        // The page model carries aggregated fields (posts, count, linkedNodes...) that /api/nodes lacks.
        const modelNodeData = (pageNodes?.[neonId] ?? {}) as Record<string, unknown>;
        const merged: Record<string, unknown> = { ...apiData };
        for (const key of ['posts', 'count', 'totalPosts', 'linkedNodes', 'proxyJsonContent']) {
          if (key in modelNodeData) merged[key] = modelNodeData[key];
        }
        nodeDataMap.set(neonId, merged);
      }),
  );
  return { customComponents, nodeDataMap };
}

