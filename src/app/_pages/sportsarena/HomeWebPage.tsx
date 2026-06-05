import { PageData } from '@eidosmedia/neon-frontoffice-ts-sdk';
import { WebpageModel, WebpageNodeModel } from '@eidosmedia/neon-frontoffice-ts-sdk';
import Link from 'next/link';
import Navbar from './Navbar';
import Footer from './Footer';
import ArticleOrganism from './components/ArticleOrganism';

type PageProps = {
  data: PageData<WebpageModel>;
};

const HomeWebPage: React.FC<PageProps> = async ({ data }) => {
  console.log('[NEON] render: sportsarena/HomeWebPage');

  const [mainItems, contextItems] = await Promise.all([
    connection.getDwxLinkedObjects(data, 'main'),
    connection.getDwxLinkedObjects(data, 'context'),
  ]);

  const heroItem = mainItems[0] as WebpageNodeModel | undefined;
  const feedItems = [...mainItems.slice(1), ...contextItems] as WebpageNodeModel[];

  const heroUrl = heroItem?.url || '#';
  const heroTitle =
    (heroItem as any)?.attributes?.teaser?.title ?? (heroItem as any)?.title ?? '';
  const heroSport =
    ((heroItem as any)?.attributes?.overhead as string | undefined) ||
    (heroUrl.split('/')[1] ?? '').toUpperCase();
  const heroMeta = (heroItem as any)?.pubInfo?.pubDate
    ? new Date((heroItem as any).pubInfo.pubDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    : '';

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-sa-bg, #0d0d0d)' }}>
      <Navbar data={data} />

      <div className="w-full max-w-[860px] mx-auto px-4 py-5">

        {/* ── Hero card ─────────────────────────────────────────────── */}
        {heroItem && (
          <Link href={heroUrl} className="sa-hero block">
            <div className="sa-hero-content">
              {heroSport && <div className="sa-hero-sport">{heroSport}</div>}
              <h1 className="sa-hero-title">{heroTitle}</h1>
              {heroMeta && <div className="sa-hero-meta">{heroMeta}</div>}
            </div>
          </Link>
        )}

        {/* ── Feed list ─────────────────────────────────────────────── */}
        <div className="flex flex-col gap-2">
          {feedItems.map((item, i) => (
            <ArticleOrganism
              key={(item as any).id ?? i}
              data={data}
              linkedObject={item}
              linkedObjects={feedItems}
              index={i}
              type="article-md"
            />
          ))}
        </div>

      </div>

      <Footer data={data} />
    </div>
  );
};

export default HomeWebPage;
