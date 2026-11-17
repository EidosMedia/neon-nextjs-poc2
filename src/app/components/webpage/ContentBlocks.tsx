import React from 'react';
import { headers } from 'next/headers';
import type { PageData, WebpageModel } from '@eidosmedia/neon-frontoffice-ts-sdk';
import { normalizeViewStatus, ViewStatus } from '@eidosmedia/neon-frontoffice-ts-sdk';
import ArticleWebpage from '../ArticleWebpage';
import { getAuthOptions } from '@/utilities/security';
import { fetchPageDataCached, fetchPageDataDirect } from '@/utilities/pageCache';
import { getContentBlockLinks } from '@/lib/contentBlocks';

type ContentBlocksProps = {
  data: PageData<WebpageModel>;
};

/**
 * Renders the content blocks linked to the page, each with its linked items. A block is fetched
 * from its own url with the same LIVE (cached) or PREVIEW (direct) rule as the page itself.
 */
const ContentBlocks: React.FC<ContentBlocksProps> = async ({ data }) => {
  const links = getContentBlockLinks(data);
  if (links.length === 0) return null;

  const currentHeaders = await headers();
  const siteName = currentHeaders.get('x-neon-site-name') ?? '';
  const isLiveView = normalizeViewStatus(currentHeaders.get('x-neon-view-status') as string) === ViewStatus.LIVE;
  const auth = await getAuthOptions();

  const blocks = await Promise.all(
    links.map(async link => {
      try {
        const result = isLiveView
          ? await fetchPageDataCached(link.url, siteName, auth)
          : await fetchPageDataDirect(link.url, auth);
        if (!result.data) return null;

        const blockData = result.data as PageData<WebpageModel>;
        const linkedObjects = await connection.getDwxLinkedObjects(blockData, 'main');
        return { link, blockData, linkedObjects };
      } catch (error) {
        console.error('[NEON] content block not rendered', link.targetId, error);
        return null;
      }
    }),
  );

  return (
    <>
      {blocks.map(block =>
        block ? (
          <section key={block.link.targetId} data-testid="content-block" data-block-zone={block.link.zone}>
            <h2 className="text-xl font-bold mb-4">{block.blockData.model.data.title}</h2>
            <ArticleWebpage data={block.blockData} displayMainPicture={false} linkedObjects={block.linkedObjects} />
          </section>
        ) : null,
      )}
    </>
  );
};

export default ContentBlocks;
