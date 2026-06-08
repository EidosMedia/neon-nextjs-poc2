import { PageData } from '@eidosmedia/neon-frontoffice-ts-sdk';
import { WebpageModel, WebpageNodeModel } from '@eidosmedia/neon-frontoffice-ts-sdk';
import Link from 'next/link';
import Navbar from './Navbar';
import Footer from './Footer';
import ArticleOrganism from './components/ArticleOrganism';

type PageProps = {
  data: PageData<WebpageModel>;
};

function getTag(item: WebpageNodeModel): string {
  const overhead = (item as any)?.attributes?.overhead as string | undefined;
  if (overhead) return overhead;
  const url = (item as any)?.url ?? '';
  return (url.split('/')[1] ?? '').toUpperCase();
}

function getTitle(item: WebpageNodeModel): string {
  return (item as any)?.attributes?.teaser?.title ?? (item as any)?.title ?? '';
}

function getDeck(item: WebpageNodeModel): string {
  return (item as any)?.attributes?.teaser?.summary ?? '';
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

function isRecent(item: WebpageNodeModel): boolean {
  const pubDate = (item as any)?.pubInfo?.pubDate;
  if (!pubDate) return false;
  return Date.now() - new Date(pubDate).getTime() < 3 * 60 * 60 * 1000;
}

const HomeWebPage: React.FC<PageProps> = async ({ data }) => {
  console.log('[NEON] render: business-globe/HomeWebPage');

  const [mainItems, contextItems, insight1Items] = await Promise.all([
    connection.getDwxLinkedObjects(data, 'main'),
    connection.getDwxLinkedObjects(data, 'context'),
    connection.getDwxLinkedObjects(data, 'insight1'),
  ]);

  const contextLead = contextItems[0] as WebpageNodeModel | undefined;
  const feature = mainItems[0] as WebpageNodeModel | undefined;
  const mains = mainItems.slice(1) as WebpageNodeModel[];
  const stubs = contextItems.slice(2) as WebpageNodeModel[];
  const picks = insight1Items as WebpageNodeModel[];

  const featureImageUrl = feature ? getImageUrl(feature) : undefined;

  return (
    <div className="min-h-screen" style={{ background: 'var(--bgl-cream, #FFF1E5)' }}>
      <Navbar data={data} />

      <div className="bgl-home-wrap">
        <div className="bgl-home-grid">

          {/* ── Left: text-only lead ─────────────────────────────── */}
          <div className="bgl-left-lead">
            {contextLead && (
              <>
                <div className="bgl-tag">{getTag(contextLead)}</div>
                <Link href={(contextLead as any).url || '#'} className="bgl-lead-title">
                  {getTitle(contextLead)}
                </Link>
                {getDeck(contextLead) && (
                  <p className="bgl-lead-deck">{getDeck(contextLead)}</p>
                )}
                {isRecent(contextLead) && <div className="bgl-updated">Updated</div>}
              </>
            )}

            {stubs.length > 0 && (
              <div style={{ marginTop: '0.75rem' }}>
                {stubs.map((item, i) => (
                  <div key={(item as any).id ?? i}>
                    <hr className="bgl-divider" />
                    <div className="bgl-tag" style={{ marginBottom: '0.15rem' }}>{getTag(item)}</div>
                    <Link href={(item as any).url || '#'} className="bgl-stub-title">
                      {getTitle(item)}
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Centre: image feature + secondary grid ───────────── */}
          <div>
            {feature && (
              <>
                {featureImageUrl ? (
                  <img
                    src={featureImageUrl}
                    alt={getTitle(feature)}
                    className="bgl-centre-img"
                  />
                ) : (
                  <div className="bgl-centre-img" style={{ background: 'var(--bgl-border)', minHeight: '200px' }} />
                )}
                <div className="bgl-caption-card">
                  <div className="bgl-caption-tag">{getTag(feature)}</div>
                  <Link href={(feature as any).url || '#'} className="bgl-caption-title">
                    {getTitle(feature)}
                  </Link>
                </div>
              </>
            )}

            {mains.length > 0 && (
              <div className="bgl-secondary-grid">
                {mains.map((item, i) => {
                  const imgUrl = getImageUrl(item);
                  return (
                    <div key={(item as any).id ?? i}>
                      {imgUrl ? (
                        <img src={imgUrl} alt={getTitle(item)} className="bgl-secondary-img" />
                      ) : (
                        <div className="bgl-secondary-img" />
                      )}
                      <div className="bgl-tag" style={{ marginTop: '0.25rem' }}>{getTag(item)}</div>
                      <Link href={(item as any).url || '#'} className="bgl-secondary-title">
                        {getTitle(item)}
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Right: Editor's picks ────────────────────────────── */}
          <div className="bgl-picks-rail">
            <div className="bgl-picks-header">Editor's picks</div>
            {picks.map((item, i) => (
              <div key={(item as any).id ?? i}>
                <ArticleOrganism
                  data={data}
                  linkedObject={item}
                  linkedObjects={picks}
                  index={i}
                  type="article-sm"
                />
                {i < picks.length - 1 && <hr className="bgl-divider" />}
              </div>
            ))}
          </div>

        </div>
      </div>

      <Footer data={data} />
    </div>
  );
};

export default HomeWebPage;
