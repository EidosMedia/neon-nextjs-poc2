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

const Article = async ({ data }: PageProps) => {
  console.log('[NEON] render: sportsarena/Article');

  const articleData = data.model.data;

  const section = (articleData?.url?.split?.('/')?.[1] ?? '').toUpperCase();

  // Resolve hero image URL from teaserPicture or mainPicture
  const teaserPic = articleData?.links?.system?.teaserPicture?.[0];
  const mainPic = articleData?.links?.system?.mainPicture?.[0];
  const heroImageUrl =
    teaserPic?.dynamicCropsResourceUrls?.['Ultrawide_large'] ??
    mainPic?.dynamicCropsResourceUrls?.['Ultrawide_large'] ??
    teaserPic?.dynamicCropsResourceUrls?.['Landscape_large'] ??
    mainPic?.dynamicCropsResourceUrls?.['Landscape_large'];

  // Resolve title and subtitle from grouphead
  const title =
    (articleData as any)?.attributes?.teaser?.title ?? articleData?.title ?? '';
  const subtitle =
    (articleData as any)?.attributes?.teaser?.summary ?? '';

  // Byline
  const pubDate = articleData?.pubInfo?.publicationTime;
  const pubDateLabel = pubDate
    ? new Date(pubDate).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  // Article body content
  const textContent = findElementsInContentJson(
    ['text'],
    articleData.files.content.data,
  )[0];

  // Resolve custom embedded components (same pattern as wire/adn Article)
  const customComponents = new Map<string, React.ComponentType<Record<string, unknown>>>();
  const customNodes = findCustomComponentNodes(
    textContent ?? { nodeType: '', elements: [], attributes: {}, value: '' },
  );
  await Promise.all(
    [...new Set(customNodes.map(n => n.attributes?.componentname).filter(Boolean))].map(
      async name => {
        const Comp = (await resolveServerComponent(
          'editor',
          name,
        )) as React.ComponentType<Record<string, unknown>> | null;
        if (Comp) customComponents.set(name, Comp);
      },
    ),
  );

  // Resolve embedded Neon node data
  const NEON_ID_RE =
    /(?:^|\/)([0-9a-f]{4}-[0-9a-f]{12}-[0-9a-f]{12}-\d+)(?:\/|$)/i;
  const nodeDataMap = new Map<string, unknown>();
  const currentHeaders = await headers();
  const apiHostname = currentHeaders.get('x-neon-backend-url') ?? '';
  const auth = await getAuthOptions();
  const neonNodes = customNodes.filter(n =>
    NEON_ID_RE.test(n.attributes?.href ?? ''),
  );
  await Promise.all(
    neonNodes.map(async n => {
      const neonId = n.attributes!.href.match(NEON_ID_RE)?.[1] ?? '';
      if (!neonId) return;
      try {
        const resp = await connection.makeApiRequest(
          `/api/nodes/${neonId}`,
          auth,
          {},
          apiHostname,
        );
        if (resp.ok) nodeDataMap.set(neonId, await resp.json());
        else
          console.warn(
            '[sportsarena/Article] embed fetch failed:',
            resp.status,
            'for node',
            neonId,
          );
      } catch (err) {
        console.error(
          '[sportsarena/Article] embed fetch error for node',
          neonId,
          ':',
          err,
        );
      }
    }),
  );

  return (
    <div className="min-h-screen" style={{ background: '#fff' }}>
      <Navbar data={data} />

      {/* ── Immersive hero ──────────────────────────────────────────── */}
      <div className="sa-article-hero-wrap">
        {heroImageUrl && (
          <img src={heroImageUrl} alt="" aria-hidden="true" />
        )}
        <div className="sa-article-hero-scrim" />
        <div className="sa-article-hero-content">
          {section && (
            <div>
              <span className="sa-article-sport-badge">{section}</span>
            </div>
          )}
          <h1 className="sa-article-title">{title}</h1>
          {subtitle && (
            <p className="sa-article-subtitle">{subtitle}</p>
          )}
        </div>
      </div>

      {/* ── Article body ────────────────────────────────────────────── */}
      <article className="sa-article-body">
        {pubDateLabel && (
          <div className="sa-article-byline">{pubDateLabel}</div>
        )}
        <div className="flex flex-col gap-4">
          {renderContent(
            textContent,
            articleData,
            undefined,
            'flex flex-col gap-4',
            customComponents,
            nodeDataMap,
          )}
        </div>
      </article>

      <Footer data={data} />
    </div>
  );
};

export default Article;
