import React from 'react';
import { PageData, WebpageModel } from '@eidosmedia/neon-frontoffice-ts-sdk';
import Link from 'next/link';
import Navbar from './Navbar';
import Footer from './Footer';
import ArticleOrganism from './components/ArticleOrganism';

type PageProps = {
  data: PageData<WebpageModel>;
};

type Zone = {
  label: string;
  items: any[];
};

const CategoryColumn: React.FC<{ data: PageData<WebpageModel>; zone: Zone; wide?: boolean }> = ({
  data,
  zone,
  wide = false,
}) => {
  if (zone.items.length === 0) return null;
  const [lead, ...rest] = zone.items;

  return (
    <div className={wide ? 'financier-category-col financier-category-col--wide' : 'financier-category-col'}>
      <div className="financier-category-col-header">{zone.label}</div>
      <ArticleOrganism
        data={data}
        linkedObject={lead}
        linkedObjects={zone.items}
        index={0}
        type={wide ? 'article-md' : 'article-sm'}
      />
      {rest.length > 0 && (
        <ul className={wide ? 'financier-category-list financier-category-list--wide' : 'financier-category-list'}>
          {rest.map((item: any, idx: number) => (
            <li key={item.id ?? idx}>
              <Link href={item.url}>{item.attributes?.teaser?.title ?? item.title}</Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const SectionWebPage: React.FC<PageProps> = async ({ data }) => {
  console.log('[NEON] render: financier/SectionWebPage');

  const sectionTitle = data?.model?.data?.title ?? data?.siteNode?.title ?? '';

  const [mainItems, contextItems, insight1Items, insight2Items] = await Promise.all([
    connection.getDwxLinkedObjects(data, 'main'),
    connection.getDwxLinkedObjects(data, 'context'),
    connection.getDwxLinkedObjects(data, 'insight1'),
    connection.getDwxLinkedObjects(data, 'insight2'),
  ]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-neutral-bg, #f6f6f6)' }}>
      <Navbar data={data} />

      {sectionTitle && (
        <div className="w-full" style={{ backgroundColor: 'var(--color-primary, #C8102E)' }}>
          <div className="w-full max-w-[1300px] mx-auto px-4 py-4">
            <h1 style={{
              fontFamily: 'var(--font-headline)',
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: '-0.01em',
              color: '#ffffff',
            }}>
              {sectionTitle}
            </h1>
          </div>
        </div>
      )}

      <div className="w-full max-w-[1300px] mx-auto px-4 py-6">

        {/* ── Row 1: 3-col category grid ─────────────────────────────── */}
        <div className="financier-category-grid">
          <CategoryColumn data={data} zone={{ label: 'Top Stories', items: mainItems }} />
          <CategoryColumn data={data} zone={{ label: 'Latest', items: contextItems }} />
          <CategoryColumn data={data} zone={{ label: 'Opinion', items: insight1Items }} />
        </div>

        {/* ── Row 2: full-width zone ─────────────────────────────────── */}
        <div className="financier-category-row-wide">
          <CategoryColumn data={data} zone={{ label: 'More', items: insight2Items }} wide />
        </div>

      </div>

      <Footer data={data} />
    </div>
  );
};

export default SectionWebPage;
