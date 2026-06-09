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

type PageProps = {
  data: PageData<ArticleModel>;
};

const Article = async ({ data }: PageProps) => {
  console.log('[NEON] render: sportsarena/ArticleLongform');

  const articleData = data.model.data;
  const adsDensity = articleData?.attributes?.ads?.adsDensity || 0;

  const textContent = findElementsInContentJson(['text'], articleData.files.content.data)[0];

  // Insert ad elements every 3 paragraphs, considering existing adblocks
  const textContentWithAds = (() => {
    if (!textContent?.elements || adsDensity === 0) {
      console.log('[AdBlock] No elements or adsDensity is 0');
      return textContent;
    }

    console.log('[AdBlock] Total elements:', textContent.elements.length);
    console.log('[AdBlock] adsDensity:', adsDensity);

    // Count existing adblocks
    const existingAdsCount = textContent.elements.filter(element => element.nodeType === 'adblock').length;

    console.log('[AdBlock] Existing adblocks:', existingAdsCount);

    // If we already have enough ads, return as is
    if (existingAdsCount >= adsDensity) {
      console.log('[AdBlock] Already have enough ads, returning as is');
      return textContent;
    }

    const maxNewAds = adsDensity - existingAdsCount;
    console.log('[AdBlock] Max new ads to add:', maxNewAds);

    const newElements: typeof textContent.elements = [];
    let paragraphsSinceLastAd = 0;
    let adsAdded = 0;

    textContent.elements.forEach((element, index) => {
      newElements.push(element);

      if (element.nodeType === 'p') {
        paragraphsSinceLastAd++;
        console.log(`[AdBlock] Paragraph at index ${index}, count since last ad: ${paragraphsSinceLastAd}`);
      } else if (element.nodeType === 'adblock') {
        // Reset counter when we encounter an existing adblock
        console.log(`[AdBlock] Found existing adblock at index ${index}, resetting counter`);
        paragraphsSinceLastAd = 0;
      }

      // Insert ad after every 3 paragraphs
      if (element.nodeType === 'p' && paragraphsSinceLastAd === 3 && adsAdded < maxNewAds) {
        console.log(`[AdBlock] Reached 3 paragraphs at index ${index}, checking if we can add ad...`);

        // Check if we have at least 3 more paragraphs ahead or an existing adblock
        const remainingElements = textContent.elements.slice(index + 1);
        const nextParagraphsCount = remainingElements.filter(el => el.nodeType === 'p').length;
        const hasAdblockAhead = remainingElements.some(el => el.nodeType === 'adblock');

        console.log(`[AdBlock] Paragraphs ahead: ${nextParagraphsCount}, has adblock ahead: ${hasAdblockAhead}`);

        // Only add if we can maintain 3 paragraphs distance to the end or next adblock
        if (nextParagraphsCount >= 3 || hasAdblockAhead) {
          console.log(`[AdBlock] ✓ Adding new adblock after index ${index}`);
          newElements.push({
            nodeType: 'adblock',
            attributes: {},
            elements: [],
            value: '',
          });
          paragraphsSinceLastAd = 0;
          adsAdded++;
        } else {
          console.log(`[AdBlock] ✗ Cannot add adblock - not enough paragraphs ahead`);
        }
      }
    });

    console.log('[AdBlock] Total ads added:', adsAdded);
    console.log('[AdBlock] Final elements count:', newElements.length);

    return {
      ...textContent,
      elements: newElements,
    };
  })();

  // Pre-resolve custom components server-side so renderContent can render them
  // without any client-side JS.
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

  // Pre-fetch embed node data for any custom component nodes that reference a CMS node via href.
  // Neon node IDs follow the pattern: {hex4}-{hex12}-{hex12}-{digits} appearing as a path segment.
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
          if (resp.ok) {
            nodeDataMap.set(neonId, await resp.json());
          } else {
            console.warn('[ArticleLongform] embed fetch failed:', resp.status, 'for node', neonId);
          }
        } catch (err) {
          console.error('[ArticleLongform] embed fetch error for node', neonId, ':', err);
        }
      }),
  );

  return (
    <article>
      <Navbar data={data} />
      <HeroCoverImage data={articleData} format="Ultrawide_large" preferredImage="main" />
      <div className="container mx-auto px-5 xl:px-52 mt-10 mb-12">
        <Summary data={articleData} />
        <div>
          {renderContent(
            textContentWithAds,
            articleData,
            undefined,
            'flex flex-col gap-4',
            customComponents,
            nodeDataMap,
          )}
        </div>
      </div>
      <div className="flex justify-center mb-24">
        {/* Placeholder for advertisement */}
        <img src="https://placehold.co/1200x259?text=Adv" alt="Advertisement" />
      </div>
      <Footer data={data} />
    </article>
  );
};

export default Article;
