import React from 'react';
import { ArticleModel } from '@/types/models';
import { PageData } from '@eidosmedia/neon-frontoffice-ts-sdk';
import Navbar from './Navbar';
import Footer from './Footer';
import { renderContent, findElementsInContentJson, findCustomComponentNodes } from '@/utilities/content';
import { resolveServerComponent } from '@/services/uiComponentsServerLoader';
import { headers } from 'next/headers';
import { getAuthOptions } from '@/utilities/security';

type PageProps = {
  data: PageData<ArticleModel>;
};

function getCategoryBadgeClass(tag: string): string {
  const t = tag.toLowerCase();
  if (t.includes('tech') || t.includes('hardware') || t.includes('software')) return 'nf-badge--tech';
  if (t.includes('ai') || t.includes('ml') || t.includes('machine')) return 'nf-badge--ai';
  if (t.includes('sci') || t.includes('space') || t.includes('health')) return 'nf-badge--science';
  if (t.includes('review') || t.includes('test') || t.includes('rating')) return 'nf-badge--review';
  if (t.includes('polic') || t.includes('law') || t.includes('gov')) return 'nf-badge--policy';
  return '';
}

const Article = async ({ data }: PageProps) => {
  console.log('[NEON] render: nextfrontier/Article');

  const articleData = data.model.data;

  const tag = ((articleData as any)?.attributes?.overhead as string | undefined)
    || (articleData?.url?.split?.('/')?.[1] ?? '').toUpperCase();

  const teaserPic = articleData?.links?.system?.teaserPicture?.[0];
  const mainPic = articleData?.links?.system?.mainPicture?.[0];
  const articleImageUrl =
    teaserPic?.dynamicCropsResourceUrls?.['Landscape_large'] ??
    mainPic?.dynamicCropsResourceUrls?.['Landscape_large'];

  const title = (articleData as any)?.attributes?.teaser?.title ?? articleData?.title ?? '';
  const deck = (articleData as any)?.attributes?.teaser?.summary ?? '';

  const pubDate = articleData?.pubInfo?.publicationTime;
  const pubDateLabel = pubDate
    ? new Date(pubDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : '';

  const authorName = (articleData as any)?.authors?.[0]?.name ?? '';
  const authorDesc = (articleData as any)?.authors?.[0]?.description ?? '';

  const textContent = findElementsInContentJson(['text'], articleData.files.content.data)[0];

  const customComponents = new Map<string, React.ComponentType<Record<string, unknown>>>();
  const customNodes = findCustomComponentNodes(
    textContent ?? { nodeType: '', elements: [], attributes: {}, value: '' },
  );
  await Promise.all(
    [...new Set(customNodes.map(n => n.attributes?.componentname).filter(Boolean))].map(
      async name => {
        const Comp = (await resolveServerComponent('editor', name)) as React.ComponentType<Record<string, unknown>> | null;
        if (Comp) customComponents.set(name, Comp);
      },
    ),
  );

  const NEON_ID_RE = /(?:^|\/)([0-9a-f]{4}-[0-9a-f]{12}-[0-9a-f]{12}-\d+)(?:\/|$)/i;
  const nodeDataMap = new Map<string, unknown>();
  const currentHeaders = await headers();
  const apiHostname = currentHeaders.get('x-neon-backend-url') ?? '';
  const auth = await getAuthOptions();
  const neonNodes = customNodes.filter(n => NEON_ID_RE.test(n.attributes?.href ?? ''));
  await Promise.all(
    neonNodes.map(async n => {
      const neonId = n.attributes!.href.match(NEON_ID_RE)?.[1] ?? '';
      if (!neonId) return;
      try {
        const resp = await connection.makeApiRequest(`/api/nodes/${neonId}`, auth, {}, apiHostname);
        if (resp.ok) nodeDataMap.set(neonId, await resp.json());
      } catch (err) {
        console.error('[nextfrontier/Article] embed fetch error:', neonId, err);
      }
    }),
  );

  const contextItems = await connection.getDwxLinkedObjects(data as any, 'context');
  const relatedItems = contextItems.slice(0, 4) as any[];

  return (
    <div className="min-h-screen" style={{ background: 'var(--nf-bg, #fff)' }}>
      <Navbar data={data} />

      <div className="nf-article-wrap">

        {/* Left: article body */}
        <div>
          {tag && <span className={`nf-badge ${getCategoryBadgeClass(tag)}`}>{tag}</span>}
          <h1 className="nf-article-headline">{title}</h1>
          {deck && <p className="nf-article-deck">{deck}</p>}
          <div className="nf-article-byline">
            {authorName && <span>{authorName}</span>}
            {authorName && pubDateLabel && <span> · </span>}
            {pubDateLabel && <span>{pubDateLabel}</span>}
          </div>
          {articleImageUrl && (
            <img src={articleImageUrl} alt="" aria-hidden="true" className="nf-article-img" />
          )}
          <div className="nf-article-body">
            {renderContent(
              textContent,
              articleData,
              undefined,
              'flex flex-col gap-4',
              customComponents,
              nodeDataMap,
            )}
          </div>
        </div>

        {/* Right rail */}
        <aside className="nf-right-rail">
          {relatedItems.length > 0 && (
            <>
              <div className="nf-rail-header">Related</div>
              {relatedItems.map((item, i) => {
                const url = item.url || '#';
                const itemTitle = item.attributes?.teaser?.title ?? item.title ?? '';
                const itemTag = (item.attributes?.overhead as string | undefined)
                  || (url.split('/')[1] ?? '').toUpperCase();
                return (
                  <a key={item.id ?? i} href={url} className="nf-rail-stub">
                    {itemTag && <span className={`nf-badge ${getCategoryBadgeClass(itemTag)}`}>{itemTag}</span>}
                    <div className="nf-rail-stub-title">{itemTitle}</div>
                  </a>
                );
              })}
            </>
          )}

          {(authorName || authorDesc) && (
            <div className="nf-author-block">
              <div className="nf-rail-header">Author</div>
              {authorName && <div className="nf-author-name">{authorName}</div>}
              {authorDesc && <p className="nf-author-desc">{authorDesc}</p>}
            </div>
          )}
        </aside>

      </div>

      <Footer data={data} />
    </div>
  );
};

export default Article;
