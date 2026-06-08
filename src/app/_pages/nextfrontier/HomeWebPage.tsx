import { PageData } from '@eidosmedia/neon-frontoffice-ts-sdk';
import { WebpageModel, WebpageNodeModel } from '@eidosmedia/neon-frontoffice-ts-sdk';
import Link from 'next/link';
import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import ArticleOrganism from './components/ArticleOrganism';

type PageProps = {
  data: PageData<WebpageModel>;
};

function getTag(item: WebpageNodeModel): string {
  const overhead = (item as any)?.attributes?.overhead as string | undefined;
  if (overhead) return overhead;
  return ((item as any)?.url ?? '').split('/')[1]?.toUpperCase() ?? '';
}

function getTitle(item: WebpageNodeModel): string {
  return (item as any)?.attributes?.teaser?.title ?? (item as any)?.title ?? '';
}

function getImageUrl(item: WebpageNodeModel): string | undefined {
  const tp = (item as any)?.links?.system?.teaserPicture?.[0];
  const mp = (item as any)?.links?.system?.mainPicture?.[0];
  return (
    tp?.dynamicCropsResourceUrls?.['Landscape_large'] ??
    mp?.dynamicCropsResourceUrls?.['Landscape_large'] ??
    tp?.dynamicCropsResourceUrls?.['Square_large'] ??
    mp?.dynamicCropsResourceUrls?.['Square_large']
  );
}

function getPubDate(item: WebpageNodeModel): string | undefined {
  return (item as any)?.pubInfo?.pubDate;
}

function getCategoryBadgeClass(tag: string): string {
  const t = tag.toLowerCase();
  if (t.includes('tech') || t.includes('hardware') || t.includes('software')) return 'nf-badge--tech';
  if (t.includes('ai') || t.includes('ml') || t.includes('machine')) return 'nf-badge--ai';
  if (t.includes('sci') || t.includes('space') || t.includes('health')) return 'nf-badge--science';
  if (t.includes('review') || t.includes('test') || t.includes('rating')) return 'nf-badge--review';
  if (t.includes('polic') || t.includes('law') || t.includes('gov')) return 'nf-badge--policy';
  return '';
}

function getCategoryDotColor(tag: string): string {
  const t = tag.toLowerCase();
  if (t.includes('tech') || t.includes('hardware') || t.includes('software')) return '#0050FF';
  if (t.includes('ai') || t.includes('ml')) return '#6200EA';
  if (t.includes('sci') || t.includes('space')) return '#00838F';
  if (t.includes('review') || t.includes('test')) return '#0277BD';
  if (t.includes('polic') || t.includes('law')) return '#1565C0';
  return '#333333';
}

const HomeWebPage: React.FC<PageProps> = async ({ data }) => {
  console.log('[NEON] render: nextfrontier/HomeWebPage');

  const [mainItems, contextItems] = await Promise.all([
    connection.getDwxLinkedObjects(data, 'main'),
    connection.getDwxLinkedObjects(data, 'context'),
  ]);

  const hero = mainItems[0] as WebpageNodeModel | undefined;
  const secondary = mainItems.slice(1, 3) as WebpageNodeModel[];
  const sidebarItems = contextItems.slice(0, 5) as WebpageNodeModel[];

  // Group remaining items by category for section rows (max 3 groups)
  const feedItems = [...mainItems.slice(3), ...contextItems.slice(5)] as WebpageNodeModel[];
  const groupMap = new Map<string, WebpageNodeModel[]>();
  for (const item of feedItems) {
    const tag = getTag(item);
    if (!tag) continue;
    const key = tag.toLowerCase();
    if (!groupMap.has(key)) groupMap.set(key, []);
    groupMap.get(key)!.push(item);
  }
  const categoryRows = [...groupMap.entries()]
    .filter(([, items]) => items.length >= 2)
    .slice(0, 3) as [string, WebpageNodeModel[]][];

  const heroImageUrl = hero ? getImageUrl(hero) : undefined;

  return (
    <div className="min-h-screen" style={{ background: 'var(--nf-bg, #fff)' }}>
      <Navbar data={data} />

      <div className="nf-home-wrap">
        <div className="nf-home-layout">

          {/* ── Main area: hero + secondary + category rows ── */}
          <div>
            {/* Hero */}
            {hero && (
              <Link href={(hero as any).url || '#'} className="nf-hero">
                {heroImageUrl ? (
                  <img src={heroImageUrl} alt={getTitle(hero)} className="nf-hero-img" />
                ) : (
                  <div className="nf-hero-placeholder" />
                )}
                <div className="nf-hero-overlay" />
                <div className="nf-hero-content">
                  {getTag(hero) && (
                    <span className={`nf-badge ${getCategoryBadgeClass(getTag(hero))}`}>
                      {getTag(hero)}
                    </span>
                  )}
                  <div className="nf-hero-title">{getTitle(hero)}</div>
                  {getPubDate(hero) && (
                    <div className="nf-hero-byline">
                      {new Date(getPubDate(hero)!).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  )}
                </div>
              </Link>
            )}

            {/* 2-col secondary grid */}
            {secondary.length > 0 && (
              <div className="nf-secondary-grid">
                {secondary.map((item, i) => {
                  const imgUrl = getImageUrl(item);
                  const tag = getTag(item);
                  return (
                    <Link key={(item as any).id ?? i} href={(item as any).url || '#'} className="nf-secondary-card">
                      {imgUrl ? (
                        <img src={imgUrl} alt={getTitle(item)} className="nf-secondary-img" />
                      ) : (
                        <div className="nf-secondary-img" />
                      )}
                      {tag && <span className={`nf-badge ${getCategoryBadgeClass(tag)}`}>{tag}</span>}
                      <div className="nf-secondary-title">{getTitle(item)}</div>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Category rows */}
            {categoryRows.map(([key, items]) => {
              const label = key.toUpperCase();
              const dotColor = getCategoryDotColor(key);
              return (
                <div key={key} className="nf-category-section">
                  <div className="nf-category-header">
                    <span className="nf-category-header-dot" style={{ background: dotColor }} />
                    LATEST FROM {label}
                  </div>
                  <div className="nf-cat-grid">
                    {items.slice(0, 4).map((item, i) => (
                      <ArticleOrganism
                        key={(item as any).id ?? i}
                        data={data}
                        linkedObject={item}
                        linkedObjects={items}
                        index={i}
                        type="card"
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Sidebar: Most Read ── */}
          <aside className="nf-sidebar">
            <div className="nf-sidebar-header">Most Read</div>
            {sidebarItems.map((item, i) => (
              <ArticleOrganism
                key={(item as any).id ?? i}
                data={data}
                linkedObject={item}
                linkedObjects={sidebarItems}
                index={i}
                type="sidebar"
              />
            ))}
          </aside>

        </div>
      </div>

      <Footer data={data} />
    </div>
  );
};

export default HomeWebPage;
