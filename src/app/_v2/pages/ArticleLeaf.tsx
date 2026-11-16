import type { PageData } from '@eidosmedia/neon-frontoffice-ts-sdk';
import type { ArticleModel } from '@/types/models';
import { findElementsInContentJson } from '@/utilities/content';
import { getActiveTheme } from '@/lib/accessories/defaultThemeAccessories';
import { getBrand } from '../brands/registry';
import PageShell from '../chrome/PageShell';
import { normalizeViewStatus } from '@eidosmedia/neon-frontoffice-ts-sdk';
import { paywallMode, planAdSlots, resolveArticleLeafView, withoutAdblocks } from '../lib/leafView';
import { getPageSettings, V2_DEFAULTS } from '../lib/settings';
import AdSlot from '../leaves/AdSlot';
import Correlates from '../leaves/Correlates';
import LeafBody from '../leaves/LeafBody';
import LeafHeader from '../leaves/LeafHeader';
import LeafLayout from '../leaves/LeafLayout';
import Paywall from '../leaves/Paywall';

type Crops = { dynamicCropsResourceUrls?: Record<string, string> };

/** Editor-chosen crop first (teaser then main), same as the legacy MainImage/HeroCoverImage. */
function heroImage(article: ArticleModel, format: string): string | undefined {
  const sys = article.links?.system as { teaserPicture?: Crops[]; mainPicture?: Crops[] } | undefined;
  return sys?.mainPicture?.[0]?.dynamicCropsResourceUrls?.[format] ?? sys?.teaserPicture?.[0]?.dynamicCropsResourceUrls?.[format];
}

type PageProps = { data: PageData<ArticleModel> };

const ArticleLeaf = async ({ data }: PageProps) => {
  const article = data.model.data;
  const leaf = getPageSettings(data).leaf;
  const settings = leaf?.kind === 'article' ? leaf : V2_DEFAULTS.articleLeaf;
  const brand = getBrand(getActiveTheme(data));

  const imageUrl = heroImage(article, settings.variant === 'fullBleedHero' ? 'Ultrawide_large' : 'Wide_large');
  const view = resolveArticleLeafView(settings, Boolean(imageUrl));
  const slots = planAdSlots(settings.adDensity, brand.leafRail);
  const [rawText] = findElementsInContentJson(['text'], article.files.content.data);
  const text = rawText ? withoutAdblocks(rawText) : undefined;
  const mode = paywallMode(view.paywall, normalizeViewStatus(data.siteData?.viewStatus));

  const midBody = slots.includes('midBody') && !view.paywall;
  const insertAfter = mode !== 'off' ? <Paywall marker={mode === 'marker'} /> : midBody ? <AdSlot placement="midBody" /> : undefined;
  const railAds = slots.includes('rail') ? 1 : 0;
  const afterHero = slots.includes('afterHero') && <AdSlot placement="afterHero" />;
  const behind = view.hero === 'behind';
  const header = <LeafHeader article={article} hero={view.hero} titleSize={view.titleSize} imageUrl={imageUrl} />;

  return (
    <PageShell data={data}>
      <article className={`v2-leaf-article v2-leaf-article--${view.variant}`} data-leaf="article">
        {behind && header}
        <LeafLayout
          brand={brand}
          railAds={railAds}
          header={behind ? undefined : header}
          rail={slots.includes('rail') ? <AdSlot placement="rail" /> : undefined}
        >
          {afterHero}
          <LeafBody
            article={article}
            pageNodes={data.model.nodes}
            text={text}
            insertAfter={insertAfter}
            insertWhenShort={mode !== 'off'}
            hideTail={mode === 'truncate'}
          />
          {slots.includes('end') && <AdSlot placement="end" />}
          <Correlates data={data} count={view.correlates} />
        </LeafLayout>
      </article>
    </PageShell>
  );
};

export default ArticleLeaf;
