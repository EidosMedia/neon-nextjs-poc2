import React from 'react';
import { ArticleModel } from '@/types/models';
import { PageData } from '@eidosmedia/neon-frontoffice-ts-sdk';
import Navbar from './Navbar';
import { renderContent, findElementsInContentJson, findCustomComponentNodes } from '@/utilities/content';
import Grouphead from '../../components/contentElements/Grouphead';
import MainImage from '../../components/contentElements/MainImage';
import LiveblogPosts from './LiveblogPosts';
import Footer from './Footer';
import { resolveServerComponent } from '@/services/uiComponentsServerLoader';
import { headers } from 'next/headers';
import { getAuthOptions } from '@/utilities/security';

type PageProps = {
  data: PageData<ArticleModel>;
};

const Liveblog = async ({ data }: PageProps) => {
  console.log('[NEON] render: financier/Liveblog');

  const articleData = data.model.data;

  const textContent = findElementsInContentJson(['text'], articleData.files.content.data)[0];

  const customComponents = new Map<string, React.ComponentType<Record<string, unknown>>>();
  const customNodes = findCustomComponentNodes(
    textContent ?? { nodeType: '', elements: [], attributes: {}, value: '' },
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
  await Promise.all(
    customNodes
      .filter(n => NEON_ID_RE.test(n.attributes?.href ?? ''))
      .map(async n => {
        const neonId = n.attributes!.href.match(NEON_ID_RE)?.[1] ?? '';
        if (!neonId) return;
        try {
          const resp = await connection.makeApiRequest(`/api/nodes/${neonId}`, auth, {}, apiHostname);
          if (resp.ok) nodeDataMap.set(neonId, await resp.json());
          else console.warn('[Financier/Liveblog] embed fetch failed:', resp.status, neonId);
        } catch (err) {
          console.error('[Financier/Liveblog] embed fetch error:', neonId, err);
        }
      }),
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#ffffff' }}>
      <Navbar data={data} />

      <div className="w-full max-w-[740px] mx-auto px-4 py-8">

        {/* LIVE badge */}
        <div className="mb-4 flex items-center gap-2">
          <span style={{
            fontFamily: 'var(--font-nav)',
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--color-primary)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
          }}>
            <span style={{
              display: 'inline-block',
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: 'var(--color-primary)',
            }} />
            Live Updates
          </span>
        </div>

        <article>
          <Grouphead data={articleData} />
          <MainImage data={articleData} preferredImage="main" />
          <div className="mt-6 mb-8">
            {renderContent(textContent, articleData, undefined, 'flex flex-col gap-5', customComponents, nodeDataMap)}
          </div>
          <div style={{ borderTop: '3px solid var(--color-neutral-primary)', marginBottom: 24 }} />
          <LiveblogPosts data={data} />
        </article>

      </div>

      <Footer data={data} />
    </div>
  );
};

export default Liveblog;
