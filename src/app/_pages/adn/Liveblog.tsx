import React from 'react';
import { ArticleModel } from '@/types/models';
import { PageData } from '@eidosmedia/neon-frontoffice-ts-sdk';
import Navbar from './Navbar';
import { renderContent, findElementsInContentJson, findCustomComponentNodes } from '@/utilities/content';
import Grouphead from '../../components/contentElements/Grouphead';
import MainImage from '../../components/contentElements/MainImage';
import LiveblogPosts from './LiveblogPosts';
import Footer from './Footer';
import { CircleDot } from 'lucide-react';
import { resolveServerComponent } from '@/services/uiComponentsServerLoader';
import { headers } from 'next/headers';
import { getAuthOptions } from '@/utilities/security';

type PageProps = {
  data: PageData<ArticleModel>;
};

const Liveblog = async ({ data }: PageProps) => {
  const articleData = data.model.data;

  const textContent = findElementsInContentJson(['text'], articleData.files.content.data)[0];

  const customComponents = new Map<string, React.ComponentType<Record<string, unknown>>>();
  const customNodes = findCustomComponentNodes(
    textContent ?? { nodeType: '', elements: [], attributes: {}, value: '' },
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
          else console.warn('[ADN/Liveblog] embed fetch failed:', resp.status, 'for node', neonId);
        } catch (err) {
          console.error('[ADN/Liveblog] embed fetch error for node', neonId, ':', err);
        }
      }),
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F4F4F4' }}>
      <Navbar data={data} />
      <div className="w-full max-w-[1280px] mx-auto px-3 py-5">
        <div className="bg-white p-5 lg:p-8">
          {/* Live badge */}
          <div className="flex items-center gap-2 mb-4">
            <span className="adn-live-badge">
              <CircleDot className="w-3.5 h-3.5 animate-pulse" />
              Live
            </span>
          </div>

          <Grouphead data={articleData} />
          <MainImage data={articleData} preferredImage="main" />

          <div className="mb-8">
            {renderContent(textContent, articleData, undefined, 'flex flex-col gap-4', customComponents, nodeDataMap)}
          </div>

          {/* Ad slot */}
          <div className="adn-adslot w-full my-6 flex items-center justify-center" style={{ minHeight: 90 }}>
            <span className="text-xs" style={{ color: '#AAAAAA' }}>ADV</span>
          </div>

          <LiveblogPosts data={data} />
        </div>
      </div>
      <Footer data={data} />
    </div>
  );
};

export default Liveblog;
