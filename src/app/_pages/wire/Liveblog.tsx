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
  const articleData = data.model.data;
  const category = articleData?.sys?.type ?? articleData?.attributes?.section ?? '';
  const slug = articleData?.sys?.id ?? '—';

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
          else console.warn('[Wire/Liveblog] embed fetch failed:', resp.status, neonId);
        } catch (err) {
          console.error('[Wire/Liveblog] embed fetch error:', neonId, err);
        }
      }),
  );

  const now = new Date();
  const utcString = now.toISOString().replace('T', ' ').slice(0, 19) + ' UTC';

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F5F5' }}>
      <Navbar data={data} />

      <div className="w-full max-w-[1440px] mx-auto px-4 py-4">
        <div className="flex gap-4">

          {/* ── Liveblog panel ────────────────────────────────────────── */}
          <div className="flex-1 min-w-0">

            {/* Toolbar */}
            <div className="wire-article-toolbar flex-wrap gap-y-2">
              <span className="wire-priority wire-priority--urgent" style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#CC0000', display: 'inline-block', animation: 'wire-blink 1.2s step-end infinite' }} />
                LIVE
              </span>
              {category && (
                <span className="wire-article-toolbar-label">
                  SECTION:&nbsp;<span className="wire-article-toolbar-value uppercase">{category}</span>
                </span>
              )}
              <span className="wire-article-toolbar-label hidden md:inline">
                UPDATED:&nbsp;<span className="wire-article-toolbar-value">{utcString}</span>
              </span>
            </div>

            {/* Article header */}
            <div className="wire-article-panel">
              <article className="p-5 lg:p-8">
                <Grouphead data={articleData} />
                <MainImage data={articleData} preferredImage="main" />
                <div className="mt-6 mb-8">
                  {renderContent(textContent, articleData, undefined, 'flex flex-col gap-4', customComponents, nodeDataMap)}
                </div>

                {/* Posts feed */}
                <div className="wire-panel-header mb-0">LIVE UPDATES</div>
                <div className="border border-t-0 border-[#D4D4D4]">
                  <LiveblogPosts data={data} />
                </div>
              </article>
            </div>

          </div>

          {/* ── Metadata sidebar ──────────────────────────────────────── */}
          <div className="hidden lg:block" style={{ width: 240, flexShrink: 0 }}>
            <div className="wire-meta-panel sticky top-4">
              <div className="wire-meta-panel-title">Item Metadata</div>
              <div className="wire-meta-row">
                <span className="wire-meta-key">type</span>
                <span className="wire-meta-val">LIVEBLOG</span>
              </div>
              <div className="wire-meta-row">
                <span className="wire-meta-key">id</span>
                <span className="wire-meta-val">{String(slug).slice(0, 12)}…</span>
              </div>
              <div className="wire-meta-row">
                <span className="wire-meta-key">section</span>
                <span className="wire-meta-val uppercase">{category || '—'}</span>
              </div>
              <div className="wire-meta-row">
                <span className="wire-meta-key">status</span>
                <span className="wire-meta-val" style={{ color: '#CC0000' }}>ACTIVE</span>
              </div>
              <div className="wire-meta-row">
                <span className="wire-meta-key">updated</span>
                <span className="wire-meta-val">{utcString}</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      <Footer data={data} />
    </div>
  );
};

export default Liveblog;
