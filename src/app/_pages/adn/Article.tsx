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
import { ChevronRight, Share2, Bookmark } from 'lucide-react';
import Link from 'next/link';

type PageProps = {
  data: PageData<ArticleModel>;
};

const Article = async ({ data }: PageProps) => {
  console.log('[NEON] render: adn/Article');

  const articleData = data.model.data;
  const adsDensity = articleData?.attributes?.ads?.adsDensity || 0;
  const category = articleData?.sys?.type ?? articleData?.attributes?.section ?? '';

  const textContent = findElementsInContentJson(['text'], articleData.files.content.data)[0];

  // Insert ad elements every 3 paragraphs, considering existing adblocks.
  // Plain function — Server Components do not re-render so memoisation is unnecessary.
  const textContentWithAds = (() => {
    if (!textContent?.elements || adsDensity === 0) {
      return textContent;
    }

    const existingAdsCount = textContent.elements.filter(element => element.nodeType === 'adblock').length;
    if (existingAdsCount >= adsDensity) return textContent;

    const maxNewAds = adsDensity - existingAdsCount;
    const newElements: typeof textContent.elements = [];
    let paragraphsSinceLastAd = 0;
    let adsAdded = 0;

    textContent.elements.forEach((element, index) => {
      newElements.push(element);

      if (element.nodeType === 'p') {
        paragraphsSinceLastAd++;
      } else if (element.nodeType === 'adblock') {
        paragraphsSinceLastAd = 0;
      }

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
  const neonNodes = customNodes.filter(n => NEON_ID_RE.test(n.attributes?.href ?? ''));
  await Promise.all(
    neonNodes.map(async n => {
      const neonId = n.attributes!.href.match(NEON_ID_RE)?.[1] ?? '';
      if (!neonId) return;
      try {
        const resp = await connection.makeApiRequest(`/api/nodes/${neonId}`, auth, {}, apiHostname);
        if (resp.ok) nodeDataMap.set(neonId, await resp.json());
        else console.warn('[ADN/Article] embed fetch failed:', resp.status, 'for node', neonId);
      } catch (err) {
        console.error('[ADN/Article] embed fetch error for node', neonId, ':', err);
      }
    }),
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F4F4F4' }}>
      <Navbar data={data} />

      <div className="w-full max-w-[1280px] mx-auto px-3 py-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-xs mb-3" style={{ color: '#888888' }}>
          <Link href="/" className="hover:text-red-600 transition-colors">Home</Link>
          {category && (
            <>
              <ChevronRight className="w-3 h-3" />
              <span className="font-semibold uppercase" style={{ color: '#E30613' }}>{category}</span>
            </>
          )}
        </nav>

        <div className="flex flex-col lg:flex-row gap-5">
          {/* Article body (~70%) */}
          <article className="w-full lg:w-[68%] bg-white p-5 lg:p-8">
            {/* Share bar */}
            <div className="flex items-center gap-4 mb-5 pb-3 border-b border-gray-100">
              <button
                aria-label="Condividi"
                className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide transition-colors"
                style={{ color: '#888888' }}
              >
                <Share2 className="w-4 h-4" />
                Condividi
              </button>
              <button
                aria-label="Salva"
                className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide transition-colors"
                style={{ color: '#888888' }}
              >
                <Bookmark className="w-4 h-4" />
                Salva
              </button>
            </div>

            <Grouphead data={articleData} />
            <MainImage data={articleData} preferredImage="main" />

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

            {/* Ad slot */}
            <div className="adn-adslot w-full my-8 flex items-center justify-center" style={{ minHeight: 90 }}>
              <span className="text-xs" style={{ color: '#AAAAAA' }}>ADV</span>
            </div>
          </article>

          {/* Sidebar (~30%) */}
          <aside className="w-full lg:w-[32%]">
            <div className="sticky top-4 flex flex-col gap-4">
              <div className="adn-sidebar-box">
                <div className="adn-sidebar-box-title">Correlati</div>
                <p className="text-xs italic" style={{ color: '#AAAAAA' }}>Articoli correlati</p>
              </div>

              <div className="adn-adslot flex items-center justify-center" style={{ minHeight: 250 }}>
                <span className="text-xs" style={{ color: '#AAAAAA' }}>ADV</span>
              </div>

              <div className="adn-sidebar-box">
                <div className="adn-sidebar-box-title">Più letti</div>
                <p className="text-xs italic" style={{ color: '#AAAAAA' }}>Articoli più letti</p>
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
