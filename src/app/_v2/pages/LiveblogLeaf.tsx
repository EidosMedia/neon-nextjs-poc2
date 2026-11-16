import type { PageData } from '@eidosmedia/neon-frontoffice-ts-sdk';
import type { ArticleModel } from '@/types/models';
import { findElementsInContentJson, renderContent } from '@/utilities/content';
import { getActiveTheme } from '@/lib/accessories/defaultThemeAccessories';
import { getBrand } from '../brands/registry';
import PageShell from '../chrome/PageShell';
import { planAdSlots, resolveLiveblogLeafView, withoutAdblocks } from '../lib/leafView';
import { getPageSettings, V2_DEFAULTS } from '../lib/settings';
import AdSlot from '../leaves/AdSlot';
import LeafBody from '../leaves/LeafBody';
import LeafHeader from '../leaves/LeafHeader';
import LeafLayout from '../leaves/LeafLayout';
import LiveblogPosts from '../../_pages/LiveblogPosts';
import { heroImage } from './ArticleLeaf';

type PageProps = { data: PageData<ArticleModel> };

const LiveTag = ({ label }: { label: string }) => (
  <span className="v2-live-tag">
    <span className="v2-live-tag__dot" aria-hidden="true" />
    {label}
  </span>
);

const LiveblogLeaf = async ({ data }: PageProps) => {
  const article = data.model.data;
  const leaf = getPageSettings(data).leaf;
  const settings = leaf?.kind === 'liveblog' ? leaf : V2_DEFAULTS.liveblogLeaf;
  const brand = getBrand(getActiveTheme(data));
  const view = resolveLiveblogLeafView(settings);
  const slots = planAdSlots(settings.adDensity, brand.leafRail);

  const content = article.files.content.data;
  const [rawText] = findElementsInContentJson(['text'], content);
  const text = rawText ? withoutAdblocks(rawText) : undefined;
  const [headline] = findElementsInContentJson(['headline'], content);
  const [summary] = findElementsInContentJson(['summary'], content);
  const showPinned = view.showPinned && Boolean(summary);

  const imageUrl = view.showHero ? heroImage(article, 'Wide_large') : undefined;
  const header =
    view.variant === 'resultsPanel' ? (
      <header className="v2-liveblog__panel">
        {view.showLiveTag && <LiveTag label="Live" />}
        {headline && <div className="v2-liveblog__panel-title">{renderContent(headline, article)}</div>}
      </header>
    ) : (
      <div className="v2-liveblog__head">
        {view.variant === 'endedArchive' && <span className="v2-liveblog__kicker">Archive</span>}
        {view.showLiveTag && <LiveTag label="Live" />}
        <LeafHeader
          article={article}
          hero={imageUrl ? 'above' : 'none'}
          titleSize="standard"
          imageUrl={imageUrl}
          hideSummary={showPinned}
        />
      </div>
    );

  const rail = slots.includes('rail') ? <AdSlot placement="rail" /> : undefined;

  return (
    <PageShell data={data}>
      <article className={`v2-leaf-liveblog v2-leaf-liveblog--${view.variant}`} data-leaf="liveblog">
        <LeafLayout brand={brand} railAds={rail ? 1 : 0} header={header} rail={rail}>
          {showPinned && (
            <section className="v2-liveblog__pinned">
              <span className="v2-liveblog__pinned-kicker">Pinned summary</span>
              <div className="v2-liveblog__pinned-text">{renderContent(summary, article)}</div>
            </section>
          )}
          {slots.includes('afterHero') && <AdSlot placement="afterHero" />}
          <LeafBody
            article={article}
            pageNodes={data.model.nodes}
            text={text}
            insertAfter={slots.includes('midBody') ? <AdSlot placement="midBody" /> : undefined}
          />
          <div className="v2-liveblog__posts">
            <LiveblogPosts data={data} />
          </div>
          {slots.includes('end') && <AdSlot placement="end" />}
        </LeafLayout>
      </article>
    </PageShell>
  );
};

export default LiveblogLeaf;
