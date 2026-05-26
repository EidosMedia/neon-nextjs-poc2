import React from 'react';
import { ArticleModel } from '@/types/models';
import { PageData } from '@eidosmedia/neon-frontoffice-ts-sdk';
import Navbar from './Navbar';
import { renderContent, findElementsInContentJson, findCustomComponentNodes } from '@/utilities/content';
import HeroCoverImage from '../../components/contentElements/HeroCoverImage';
import Summary from '../../components/contentElements/Summary';
import Footer from './Footer';
import { resolveServerComponent } from '@/services/uiComponentsServerLoader';
import { headers } from 'next/headers';
import { getAuthOptions } from '@/utilities/security';
import { Share2, Bookmark } from 'lucide-react';

type PageProps = {
  data: PageData<ArticleModel>;
};

const Article = async ({ data }: PageProps) => {
  const articleData = data.model.data;
  const adsDensity = articleData?.attributes?.ads?.adsDensity || 0;

  const textContent = findElementsInContentJson(['text'], articleData.files.content.data)[0];

  const textContentWithAds = (() => {
    if (!textContent?.elements || adsDensity === 0) return textContent;

    const existingAdsCount = textContent.elements.filter(element => element.nodeType === 'adblock').length;
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
        const remainingElements = textContent.elements.slice(index + 1);
        const nextParagraphsCount = remainingElements.filter(el => el.nodeType === 'p').length;
        const hasAdblockAhead = remainingElements.some(el => el.nodeType === 'adblock');

        if (nextParagraphsCount >= 3 || hasAdblockAhead) {
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
      const Comp = (await resolveServerComponent('editor', name)) as React.ComponentType<
        Record<string, unknown>
      > | null;
      if (Comp) customComponents.set(name, Comp);
    }),
  );

  const NEON_ID_RE = /(?:^|\/)([0-9a-f]{4}-[0-9a-f]{12}-[0-9a-f]{12}-\d+)(?:\/|$)/i;
  const nodeDataMap = new Map<string, unknown>();
  const currentHeaders = await headers();
  const apiHostname = currentHeaders.get('x-neon-backend-url') ?? '';
  const auth = await getAuthOptions();
  await Promise.all(
    customNodes
      .filter(n => NEON_ID_RE.test(n.attributes?.href ?? ''))
      .map(async n => {
        const neonId = n.attributes!.href.match(NEON_ID_RE)?.[1] ?? '';
        if (!neonId) return;
        try {
          const resp = await connection.makeApiRequest(`/api/nodes/${neonId}`, auth, {}, apiHostname);
          if (resp.ok) nodeDataMap.set(neonId, await resp.json());
          else console.warn('[ADN/ArticleLongform] embed fetch failed:', resp.status, 'for node', neonId);
        } catch (err) {
          console.error('[ADN/ArticleLongform] embed fetch error for node', neonId, ':', err);
        }
      }),
  );

  return (
    <div className="min-h-screen bg-white">
      <Navbar data={data} />
      <HeroCoverImage data={articleData} format="Ultrawide_large" preferredImage="main" />

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Article (70%) */}
          <article className="w-full lg:w-[70%]">
            <div className="flex items-center gap-3 mb-4 text-gray-500">
              <button aria-label="Share" className="hover:text-red-600 transition-colors flex items-center gap-1 text-xs">
                <Share2 className="w-4 h-4" />
                Condividi
              </button>
              <button aria-label="Save" className="hover:text-red-600 transition-colors flex items-center gap-1 text-xs">
                <Bookmark className="w-4 h-4" />
                Salva
              </button>
            </div>
            <Summary data={articleData} />
            <div className="mt-6">
              {renderContent(
                textContentWithAds,
                articleData,
                undefined,
                'flex flex-col gap-4',
                customComponents,
                nodeDataMap,
              )}
            </div>
            <div className="flex justify-center my-8">
              <img src="https://placehold.co/728x90?text=Adv" alt="Advertisement" />
            </div>
          </article>

          {/* Sidebar (30%) */}
          <aside className="w-full lg:w-[30%]">
            <div className="sticky top-4 flex flex-col gap-4">
              <div className="border border-gray-200 rounded p-4">
                <h3 className="text-sm font-bold uppercase tracking-wide text-gray-700 mb-3 border-b border-gray-200 pb-2">
                  Correlati
                </h3>
                <p className="text-xs text-gray-400 italic">Articoli correlati</p>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <Footer data={data} />
    </div>
  );
};

export default Article;
