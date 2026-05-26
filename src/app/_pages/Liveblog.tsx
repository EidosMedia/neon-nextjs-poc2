import React from 'react';
import { ArticleModel } from '@/types/models';
import { PageData } from '@eidosmedia/neon-frontoffice-ts-sdk';
import Navbar from '../components/Navbar';
import { renderContent, findElementsInContentJson, findCustomComponentNodes } from '@/utilities/content';
import Grouphead from '../components/contentElements/Grouphead';
import MainImage from '../components/contentElements/MainImage';
import LiveblogPosts from './LiveblogPosts';
import Footer from '../components/Footer';
import { CircleDot } from 'lucide-react';
import { resolveServerComponent } from '@/services/uiComponentsServerLoader';
import { headers } from 'next/headers';
import { getAuthOptions } from '@/utilities/security';

type PageProps = {
  data: PageData<ArticleModel>;
};

const Liveblog = async ({ data }: PageProps) => {
  console.log('[NEON] render: default/Liveblog');

  const articleData = data.model.data;

  const textContent = findElementsInContentJson(['text'], articleData.files.content.data)[0];

  // Pre-resolve custom components server-side so renderContent can render them
  // without any client-side JS.
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
            console.warn('[Liveblog] embed fetch failed:', resp.status, 'for node', neonId);
          }
        } catch (err) {
          console.error('[Liveblog] embed fetch error for node', neonId, ':', err);
        }
      }),
  );

  return (
    <article className="container mx-auto">
      <Navbar data={data} />
      <div className="xl:px-52 mt-10 mb-12">
        <div className="flex items-center gap-1 mb-4 w-fit max-h-[30px] p-2 rounded-xs bg-feedback-red text-neutral-lightest">
          <CircleDot className="w-4 h-4" />
          <span className="subhead1 pt-[3px]">Live</span>
        </div>
        <Grouphead data={articleData} />
        <MainImage data={articleData} preferredImage="main" />
        <div className="mb-8">
          {renderContent(textContent, articleData, undefined, 'flex flex-col gap-4', customComponents, nodeDataMap)}
        </div>
        <LiveblogPosts data={data} />
      </div>
      <div className="flex justify-center mb-24">
        {/* Placeholder for advertisement */}
        <img src="https://placehold.co/1200x259?text=Adv" alt="Advertisement" />
      </div>
      <Footer data={data} />
    </article>
  );
};

export default Liveblog;
