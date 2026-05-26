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
import { Share2, Gift } from 'lucide-react';
import Link from 'next/link';

type PageProps = {
  data: PageData<ArticleModel>;
};

const Article = async ({ data }: PageProps) => {
  console.log('[NEON] render: nyt/Article');

  const articleData = data.model.data;
  const adsDensity = articleData?.attributes?.ads?.adsDensity || 0;
  const category = articleData?.sys?.type ?? articleData?.attributes?.section ?? '';

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
        else console.warn('[NYT/Article] embed fetch failed:', resp.status, 'for node', neonId);
      } catch (err) {
        console.error('[NYT/Article] embed fetch error for node', neonId, ':', err);
      }
    }),
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFFFFF' }}>
      <Navbar data={data} />

      {/* Narrow reading column — NYT style */}
      <div className="w-full max-w-[720px] mx-auto px-4 py-8">

        {/* Section breadcrumb */}
        {category && (
          <div className="mb-4">
            <Link
              href={`/${category.toLowerCase()}`}
              className="text-xs font-bold uppercase tracking-widest"
              style={{ fontFamily: 'var(--font-nav)', color: '#121212', textDecoration: 'none' }}
            >
              {category}
            </Link>
          </div>
        )}

        {/* Article metadata */}
        <article>
          <Grouphead data={articleData} />

          {/* Byline / share rule */}
          <div className="nyt-byline-rule flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                aria-label="Share"
                className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide"
                style={{ fontFamily: 'var(--font-nav)', color: '#121212', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
              <button
                aria-label="Gift Article"
                className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide"
                style={{ fontFamily: 'var(--font-nav)', color: '#121212', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <Gift className="w-4 h-4" />
                Gift
              </button>
            </div>
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
