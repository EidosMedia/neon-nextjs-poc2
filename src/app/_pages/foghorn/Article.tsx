import React from 'react';
import { ArticleModel } from '@/types/models';
import { PageData } from '@eidosmedia/neon-frontoffice-ts-sdk';
import Navbar from './Navbar';
import { renderContent, findElementsInContentJson, findCustomComponentNodes } from '@/utilities/content';
import Grouphead from '../../components/contentElements/Grouphead';
import MainImage from '../../components/contentElements/MainImage';
import Footer from './Footer';
import { resolveServerComponent } from '@/services/uiComponentsServerLoader';
import { headers } from 'next/headers';
import { getAuthOptions } from '@/utilities/security';
import { Share2 } from 'lucide-react';
import Link from 'next/link';

type PageProps = {
  data: PageData<ArticleModel>;
};

const Article = async ({ data }: PageProps) => {
  console.log('[NEON] render: foghorn/Article');

  const articleData = data.model.data;
  const adsDensity = articleData?.attributes?.ads?.adsDensity || 0;
  const section = articleData?.url?.split?.('/')?.[1] ?? '';
  const standfirst = (articleData?.attributes as Record<string, unknown>)?.standfirst as string | undefined;

  const textContent = findElementsInContentJson(['text'], articleData.files.content.data)[0];

  const textContentWithAds = (() => {
    if (!textContent?.elements || adsDensity === 0) return textContent;

    const existingAdsCount = textContent.elements.filter(el => el.nodeType === 'adblock').length;
    if (existingAdsCount >= adsDensity) return textContent;

    const maxNewAds = adsDensity - existingAdsCount;
    const newElements: typeof textContent.elements = [];
    let paragraphsSinceLastAd = 0;
    let adsAdded = 0;

    textContent.elements.forEach((element, index) => {
      newElements.push(element);
      if (element.nodeType === 'p') paragraphsSinceLastAd++;
      else if (element.nodeType === 'adblock') paragraphsSinceLastAd = 0;

      if (element.nodeType === 'p' && paragraphsSinceLastAd === 3 && adsAdded < maxNewAds) {
        const remaining = textContent.elements.slice(index + 1);
        const nextParas = remaining.filter(el => el.nodeType === 'p').length;
        const hasAdAhead = remaining.some(el => el.nodeType === 'adblock');
        if (nextParas >= 3 || hasAdAhead) {
          newElements.push({ nodeType: 'adblock', attributes: {}, elements: [], value: '' });
          paragraphsSinceLastAd = 0;
          adsAdded++;
        }
      }
    });

    return { ...textContent, elements: newElements };
  })();

  const customComponents = new Map<string, React.ComponentType<Record<string, unknown>>>();
  const customNodes = findCustomComponentNodes(
    textContentWithAds ?? { nodeType: '', elements: [], attributes: {}, value: '' },
  );
  await Promise.all(
    [...new Set(customNodes.map(n => n.attributes?.componentname).filter(Boolean))].map(async name => {
      const Comp = (await resolveServerComponent('editor', name)) as React.ComponentType<Record<string, unknown>> | null;
      if (Comp) customComponents.set(name, Comp);
    }),
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
        else console.warn('[Foghorn/Article] embed fetch failed:', resp.status, 'for node', neonId);
      } catch (err) {
        console.error('[Foghorn/Article] embed fetch error for node', neonId, ':', err);
      }
    }),
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#ffffff' }}>
      <Navbar data={data} />

      <div className="w-full max-w-[740px] mx-auto px-4 py-8">

        {/* Section label */}
        {section && (
          <div className="mb-3">
            <Link
              href={`/${section.toLowerCase()}`}
              className="foghorn-section-label"
              style={{ textDecoration: 'none' }}
            >
              {section}
            </Link>
          </div>
        )}

        <article>
          <Grouphead data={articleData} />

          {/* Standfirst — only render if field present */}
          {standfirst && (
            <div className="foghorn-standfirst">{standfirst}</div>
          )}

          {/* Byline / share row */}
          <div className="foghorn-byline-rule">
            <button
              aria-label="Share"
              className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide"
              style={{ fontFamily: 'var(--font-nav)', color: '#052962', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
          </div>

          {/* Hero image — full column width */}
          <MainImage data={articleData} preferredImage="main" />

          {/* Body text */}
          <div className="mt-8">
            {renderContent(
              textContentWithAds,
              articleData,
              undefined,
              'flex flex-col gap-5',
              customComponents,
              nodeDataMap,
            )}
          </div>
        </article>

      </div>

      <Footer data={data} />
    </div>
  );
};

export default Article;
