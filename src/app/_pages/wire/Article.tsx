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
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

type PageProps = {
  data: PageData<ArticleModel>;
};

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="wire-meta-row">
      <span className="wire-meta-key">{label}</span>
      <span className="wire-meta-val">{value}</span>
    </div>
  );
}

const Article = async ({ data }: PageProps) => {
  const articleData = data.model.data;
  const adsDensity = articleData?.attributes?.ads?.adsDensity || 0;
  const category = articleData?.sys?.type ?? articleData?.attributes?.section ?? '';
  const wordCount = articleData?.attributes?.wordCount ?? '—';
  const priority = (articleData?.attributes as any)?.priority ?? 'NORMAL';
  const slug = articleData?.sys?.id ?? '—';

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
        else console.warn('[Wire/Article] embed fetch failed:', resp.status, neonId);
      } catch (err) {
        console.error('[Wire/Article] embed fetch error:', neonId, err);
      }
    }),
  );

  const priorityClass =
    priority === 'URGENT' ? 'wire-priority--urgent' :
    priority === 'FLASH'  ? 'wire-priority--flash'  :
                            'wire-priority--normal';

  const now = new Date();
  const utcString = now.toISOString().replace('T', ' ').slice(0, 19) + ' UTC';

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F5F5' }}>
      <Navbar data={data} />

      <div className="w-full max-w-[1440px] mx-auto px-4 py-4">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 mb-3" style={{ fontFamily: 'var(--font-meta)', fontSize: 10, color: '#6B6B6B', letterSpacing: '0.06em' }}>
          <Link href="/" className="hover:text-[#0050FF]">FEED</Link>
          {category && (
            <>
              <ChevronRight className="w-3 h-3" />
              <Link href={`/${category.toLowerCase()}`} className="uppercase hover:text-[#0050FF]">{category}</Link>
            </>
          )}
          <ChevronRight className="w-3 h-3" />
          <span className="uppercase">ITEM</span>
        </nav>

        <div className="flex gap-4">

          {/* ── Article panel ─────────────────────────────────────────── */}
          <div className="flex-1 min-w-0 wire-article-panel">

            {/* Toolbar: priority + metadata chips */}
            <div className="wire-article-toolbar flex-wrap gap-y-2">
              <span className={`wire-priority ${priorityClass}`}>{priority}</span>
              {category && (
                <span className="wire-article-toolbar-label">
                  SECTION:&nbsp;<span className="wire-article-toolbar-value uppercase">{category}</span>
                </span>
              )}
              <span className="wire-article-toolbar-label">
                WORDS:&nbsp;<span className="wire-article-toolbar-value">{String(wordCount)}</span>
              </span>
              <span className="wire-article-toolbar-label hidden md:inline">
                RETRIEVED:&nbsp;<span className="wire-article-toolbar-value">{utcString}</span>
              </span>
            </div>

            {/* Article content */}
            <article className="p-5 lg:p-8">
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
            </article>

          </div>

          {/* ── Metadata sidebar ──────────────────────────────────────── */}
          <div className="hidden lg:block" style={{ width: 240, flexShrink: 0 }}>
            <div className="wire-meta-panel sticky top-4">
              <div className="wire-meta-panel-title">Item Metadata</div>
              <MetaRow label="id" value={String(slug)} />
              <MetaRow label="priority" value={priority} />
              <MetaRow label="section" value={category || '—'} />
              <MetaRow label="words" value={String(wordCount)} />
              <MetaRow label="format" value="NITF / JSON" />
              <MetaRow label="language" value="en" />
              <MetaRow label="retrieved" value={utcString} />

              <div className="mt-4 wire-meta-panel-title">API Access</div>
              <div className="mt-2 flex flex-col gap-2">
                <a
                  href={`/api/v2/items/${slug}`}
                  className="block text-center text-xs font-bold py-1.5 border border-[#0050FF] hover:bg-[#EEF2FF] transition-colors"
                  style={{ fontFamily: 'var(--font-meta)', color: '#0050FF', letterSpacing: '0.08em' }}
                >
                  GET /api/v2/items/{String(slug).slice(0, 8)}…
                </a>
                <a
                  href={`/api/v2/items/${slug}.nitf`}
                  className="block text-center text-xs py-1.5 border border-[#D4D4D4] hover:bg-[#F5F5F5] transition-colors"
                  style={{ fontFamily: 'var(--font-meta)', color: '#6B6B6B', letterSpacing: '0.08em' }}
                >
                  Download NITF
                </a>
              </div>
            </div>
          </div>

        </div>
      </div>

      <Footer data={data} />
    </div>
  );
};

export default Article;
