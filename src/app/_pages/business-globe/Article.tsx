import React from 'react';
import { ArticleModel } from '@/types/models';
import { PageData } from '@eidosmedia/neon-frontoffice-ts-sdk';
import Navbar from './Navbar';
import Footer from './Footer';
import { renderContent, findElementsInContentJson, findCustomComponentNodes } from '@/utilities/content';
import { resolveServerComponent } from '@/services/uiComponentsServerLoader';
import { headers } from 'next/headers';
import { getAuthOptions } from '@/utilities/security';
import { getTeaserOrMainImageUrl } from '../../components/contentElements/MainImage';

type PageProps = {
  data: PageData<ArticleModel>;
};

const Article = async ({ data }: PageProps) => {
  console.log('[NEON] render: business-globe/Article');

  const articleData = data.model.data;

  const tag = ((articleData as any)?.attributes?.overhead as string | undefined)
    || (articleData?.url?.split?.('/')?.[1] ?? '').toUpperCase();

  const articleImageUrl = getTeaserOrMainImageUrl(articleData, 'Wide_large', 'main');

  const title = (articleData as any)?.attributes?.teaser?.title ?? articleData?.title ?? '';
  const deck = (articleData as any)?.attributes?.teaser?.summary ?? '';

  const pubDate = articleData?.pubInfo?.publicationTime;
  const pubDateLabel = pubDate
    ? new Date(pubDate).toLocaleDateString('en-GB', {
        day: 'numeric', month: 'long', year: 'numeric',
      })
    : '';

  const authorName = (articleData as any)?.authors?.[0]?.name ?? '';
  const authorDesc = (articleData as any)?.authors?.[0]?.description ?? '';

  const textContent = findElementsInContentJson(
    ['text'],
    articleData.files.content.data,
  )[0];

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
        console.error('[business-globe/Article] embed fetch error:', neonId, err);
      }
    }),
  );

  const contextItems = await connection.getDwxLinkedObjects(data as any, 'context');
  const relatedItems = contextItems.slice(0, 4) as any[];

  return (
    <div className="min-h-screen" style={{ background: 'var(--bgl-cream, #FFF1E5)' }}>
      <Navbar data={data} />

      <div className="bgl-article-wrap">

        {/* ── Left: article body ───────────────────────────────── */}
        <div>
          {tag && <div className="bgl-tag">{tag}</div>}
          <h1 className="bgl-article-headline">{title}</h1>
          {deck && <p className="bgl-article-deck">{deck}</p>}
          <div className="bgl-byline">
            {authorName && <span>{authorName}</span>}
            {authorName && pubDateLabel && <span> · </span>}
            {pubDateLabel && <span>{pubDateLabel}</span>}
          </div>
          {articleImageUrl && (
            <img src={articleImageUrl} alt="" aria-hidden="true" className="bgl-article-img" />
          )}
          <div className="bgl-article-body">
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

        {/* ── Right: rail ─────────────────────────────────────── */}
        <aside className="bgl-right-rail">
          {relatedItems.length > 0 && (
            <>
              <div className="bgl-rail-header">More on this</div>
              {relatedItems.map((item, i) => {
                const url = item.url || '#';
                const itemTitle = item.attributes?.teaser?.title ?? item.title ?? '';
                const itemTag = (item.attributes?.overhead as string | undefined)
                  || (url.split('/')[1] ?? '').toUpperCase();
                return (
                  <div key={item.id ?? i}>
                    <a href={url} className="bgl-rail-stub">
                      {itemTag && <div className="bgl-tag" style={{ marginBottom: '0.15rem' }}>{itemTag}</div>}
                      <div className="bgl-rail-stub-title">{itemTitle}</div>
                    </a>
                    {i < relatedItems.length - 1 && <hr className="bgl-divider" />}
                  </div>
                );
              })}
            </>
          )}

          {(authorName || authorDesc) && (
            <div className="bgl-author-bio">
              <div className="bgl-rail-header">Author</div>
              {authorName && <div className="bgl-author-name">{authorName}</div>}
              {authorDesc && <p className="bgl-author-desc">{authorDesc}</p>}
            </div>
          )}
        </aside>

      </div>

      <Footer data={data} />
    </div>
  );
};

export default Article;
