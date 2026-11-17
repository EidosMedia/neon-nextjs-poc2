'use client';

import React, { useEffect, useState } from 'react';
import { normalizeViewStatus, PageData, WebpageModel, WebpageNodeModel } from '@eidosmedia/neon-frontoffice-ts-sdk';
import {
  getBlockLinkedObjects,
  toBlockJsonPath,
  type BlockModel,
  type ContentBlockLink,
} from '@/lib/contentBlocks';
import { getZoneAccessoryShapes } from '@/lib/accessories/defaultThemeAccessories';
import type { ZoneAccessoryShapes } from '@/lib/accessories/shapeClasses';
import ArticleWebpage from '../ArticleWebpage';

type ContentBlocksProps = {
  links: ContentBlockLink[];
  theme: string;
  viewStatus?: string;
};

type BlockState =
  | { status: 'loading' }
  | {
      status: 'ready';
      title: string;
      data: PageData<WebpageModel>;
      linkedObjects: WebpageNodeModel[];
      accessories?: ZoneAccessoryShapes;
    }
  | { status: 'failed'; reason: string };

const LOG_PREFIX = '[NEON][content-block]';

/**
 * Renders each content block linked to the page with the webpage article renderers. The block is
 * loaded from its index.json url, and its items and accessories are resolved in the browser.
 * Every step is logged to the browser console.
 */
const ContentBlocks: React.FC<ContentBlocksProps> = ({ links, theme, viewStatus }) => {
  const [blocks, setBlocks] = useState<Record<string, BlockState>>({});

  useEffect(() => {
    console.log(`${LOG_PREFIX} page has ${links.length} content block(s)`, links);
    if (links.length === 0) return undefined;

    let cancelled = false;
    const update = (id: string, state: BlockState) => {
      if (!cancelled) setBlocks(prev => ({ ...prev, [id]: state }));
    };

    links.forEach(async link => {
      const id = `${link.zone}:${link.targetId}`;
      const jsonPath = toBlockJsonPath(link.url);
      console.log(`${LOG_PREFIX} fetching block`, { zone: link.zone, targetId: link.targetId, jsonPath, key: link.key });
      update(id, { status: 'loading' });

      try {
        const response = await fetch(jsonPath, { headers: { Accept: 'application/json' }, credentials: 'include' });
        console.log(`${LOG_PREFIX} response`, { targetId: link.targetId, status: response.status });

        if (!response.ok) {
          console.warn(`${LOG_PREFIX} block not rendered: HTTP ${response.status}`, jsonPath);
          update(id, { status: 'failed', reason: `HTTP ${response.status}` });
          return;
        }

        const model = (await response.json()) as BlockModel;
        const linkedObjects = getBlockLinkedObjects(model);
        const accessories =
          theme === 'default'
            ? getZoneAccessoryShapes({ model, siteNode: { attributes: { theme } } } as never, 'main', linkedObjects)
            : undefined;
        const title = model.data?.title ?? link.targetId;
        const data = {
          model,
          siteData: { viewStatus: normalizeViewStatus(viewStatus ?? '') },
        } as unknown as PageData<WebpageModel>;

        console.log(`${LOG_PREFIX} rendered block "${title}" with ${linkedObjects.length} item(s)`);
        update(id, { status: 'ready', title, data, linkedObjects, accessories });
      } catch (error) {
        console.error(`${LOG_PREFIX} block fetch failed`, { jsonPath, error });
        update(id, { status: 'failed', reason: String(error) });
      }
    });

    return () => {
      cancelled = true;
    };
  }, [links, theme, viewStatus]);

  return (
    <>
      {links.map(link => {
        const id = `${link.zone}:${link.targetId}`;
        const block = blocks[id];
        return (
          <section key={id} data-testid="content-block" data-block-zone={link.zone}>
            {block?.status === 'ready' && (
              <>
                <h2 className="text-xl font-bold mb-4">{block.title}</h2>
                <ArticleWebpage
                  data={block.data}
                  displayMainPicture={false}
                  linkedObjects={block.linkedObjects}
                  accessories={block.accessories}
                />
              </>
            )}
            {block?.status === 'failed' && (
              <p className="text-sm text-gray-500">Content block not available ({block.reason})</p>
            )}
            {(!block || block.status === 'loading') && (
              <p className="text-sm text-gray-500">Loading content block…</p>
            )}
          </section>
        );
      })}
    </>
  );
};

export default ContentBlocks;
