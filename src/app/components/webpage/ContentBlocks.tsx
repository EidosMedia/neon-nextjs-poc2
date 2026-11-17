'use client';

import React, { useEffect, useState } from 'react';
import type { PageData, WebpageModel, WebpageNodeModel } from '@eidosmedia/neon-frontoffice-ts-sdk';
import type { ContentBlockLink } from '@/lib/contentBlocks';
import ArticleWebpage from '../ArticleWebpage';
import type { ZoneAccessoryShapes } from '@/lib/accessories/shapeClasses';

type ContentBlocksProps = {
  links: ContentBlockLink[];
};

type BlockState =
  | { status: 'loading' }
  | { status: 'ready'; title: string; data: PageData<WebpageModel>; linkedObjects: WebpageNodeModel[]; accessories?: ZoneAccessoryShapes }
  | { status: 'failed'; reason: string };

type BlockResponse = {
  title: string;
  data: PageData<WebpageModel>;
  linkedObjects: WebpageNodeModel[];
  accessories?: ZoneAccessoryShapes;
};

const LOG_PREFIX = '[NEON][content-block]';

/**
 * Renders each content block linked to the page with the webpage article renderers. The block is
 * loaded from /api/content-blocks, which resolves its items on the server. Every step is logged to
 * the browser console.
 */
const ContentBlocks: React.FC<ContentBlocksProps> = ({ links }) => {
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
      const endpoint = `/api/content-blocks?url=${encodeURIComponent(link.url)}`;
      console.log(`${LOG_PREFIX} fetching block`, { zone: link.zone, targetId: link.targetId, endpoint, key: link.key });
      update(id, { status: 'loading' });

      try {
        const response = await fetch(endpoint, { headers: { Accept: 'application/json' }, credentials: 'include' });
        console.log(`${LOG_PREFIX} response`, { targetId: link.targetId, status: response.status });

        if (!response.ok) {
          console.warn(`${LOG_PREFIX} block not rendered: HTTP ${response.status}`, endpoint);
          update(id, { status: 'failed', reason: `HTTP ${response.status}` });
          return;
        }

        const block = (await response.json()) as BlockResponse;
        console.log(`${LOG_PREFIX} rendered block "${block.title}" with ${block.linkedObjects.length} item(s)`);
        update(id, {
          status: 'ready',
          title: block.title,
          data: block.data,
          linkedObjects: block.linkedObjects,
          accessories: block.accessories,
        });
      } catch (error) {
        console.error(`${LOG_PREFIX} block fetch failed`, { endpoint, error });
        update(id, { status: 'failed', reason: String(error) });
      }
    });

    return () => {
      cancelled = true;
    };
  }, [links]);

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
