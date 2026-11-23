import type { ReactNode } from 'react';
import type { ContentElement, PageData, Site, WebpageModel, WebpageNodeModel } from '@eidosmedia/neon-frontoffice-ts-sdk';
import type { ArticleModel } from '@/types/models';
import { ViewStatus } from '@eidosmedia/neon-frontoffice-ts-sdk';
import PageShell from '../chrome/PageShell';
import ArticleItem from '../items/ArticleItem';
import GalleryItem from '../items/GalleryItem';
import LiveblogItem from '../items/LiveblogItem';
import { resolveArticleItemView, resolveGalleryItemView, resolveLiveblogItemView } from '../lib/itemView';
import type { ConcreteComposition } from '../lib/layout';
import type { ArticleItemVariant } from '../lib/settings';
import ZoneRenderer from '../zones/ZoneRenderer';
import { siteThemeOf } from '@/lib/accessories/defaultThemeAccessories';
import { getBrand } from '../brands/registry';
import { getBrandModules } from '../brands/moduleRegistry';
import { MENU_FIXTURE, MODULE_FIXTURES, makeFixtureBlock, makeFixtureNode, makeFixtureNodes } from './fixtures';
import Link from 'next/link';
import Nav from '../chrome/Nav';
import MenuToggle from '../chrome/MenuToggle';
import LoginForm from '../special/LoginForm';
import { PAYWALL_LEVELS } from '../lib/paywall';
import PreviewReaderSelect from '../chrome/PreviewReaderSelect';
import ReaderGate from '../leaves/ReaderGate';
import NewsletterWebpage from '../pages/NewsletterWebpage';
import NewsletterStory from '../pages/NewsletterStory';

const ARTICLE_VARIANTS: ArticleItemVariant[] = [
  'standard', 'lead', 'compact', 'textOnly', 'overlay', 'opinion', 'highlight', 'sponsored',
];
const LIVEBLOG_VARIANTS = ['panel', 'feed', 'pinnedSummary', 'compact'] as const;
const GALLERY_VARIANTS = ['fullBleed', 'panelWithThumbs', 'grid'] as const;
const COMPOSITIONS: ConcreteComposition[] = [
  'leadList', 'threeUp', 'fourUp', 'split', 'grid2x2', 'overlayPair', 'datedListing', 'sponsored',
];

const yn = (b: boolean) => (b ? 'yes' : 'no');
const id = (prefix: string, n: number) => `${prefix}-${String(n).padStart(2, '0')}`;

// Fixtures render as LIVE so the inspect overlay stays inert; they carry no contentIds so nothing is editable.
const FAKE_PAGE = makeFixtureBlock({ type: 'style-guide', title: 'Style guide' });

function Cell({ specId, props, children }: { specId: string; props: string; children: ReactNode }) {
  return (
    <figure className="v2-ui__cell">
      <figcaption className="v2-ui__label">
        <strong>{specId}</strong> <span>{props}</span>
      </figcaption>
      {children}
    </figure>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="v2-ui__section">
      <h2 className="v2-ui__heading">{title}</h2>
      <div className="v2-ui__grid">{children}</div>
    </section>
  );
}

function articleCells() {
  const cells: ReactNode[] = [];
  let n = 0;
  for (const variant of ARTICLE_VARIANTS) {
    for (const [image, standfirst] of [[true, true], [true, false], [false, true], [false, false]] as const) {
      n += 1;
      const node = makeFixtureNode('article', n);
      const view = resolveArticleItemView({ kind: 'article', variant, image, standfirst }, variant, true, true);
      cells.push(
        <Cell key={n} specId={id('ART', n)} props={`${variant} · image ${yn(image)} · standfirst ${yn(standfirst)}`}>
          <ArticleItem node={node} view={view} viewStatus={ViewStatus.LIVE} headingLevel={3} />
        </Cell>,
      );
    }
  }
  return cells;
}

function liveblogCells() {
  const cells: ReactNode[] = [];
  let n = 0;
  for (const variant of LIVEBLOG_VARIANTS) {
    for (const [image, share] of [[true, true], [true, false], [false, true], [false, false]] as const) {
      n += 1;
      const node = makeFixtureNode('liveblog', n);
      const view = resolveLiveblogItemView({ kind: 'liveblog', variant, image, share }, 'standard');
      cells.push(
        <Cell key={n} specId={id('LIV', n)} props={`${variant} · image ${yn(image)} · share ${share ? 'on' : 'off'}`}>
          <LiveblogItem node={node} view={view} viewStatus={ViewStatus.LIVE} headingLevel={3} posts={false} />
        </Cell>,
      );
    }
  }
  return cells;
}

function galleryCells() {
  const cells: ReactNode[] = [];
  let n = 0;
  for (const variant of GALLERY_VARIANTS) {
    for (const [captions, thumbnails] of [[true, true], [true, false], [false, true], [false, false]] as const) {
      n += 1;
      const node = makeFixtureNode('gallery', n);
      const view = resolveGalleryItemView({ kind: 'gallery', variant, captions, thumbnails }, 'standard');
      cells.push(
        <Cell key={n} specId={id('GAL', n)} props={`${variant} · captions ${yn(captions)} · thumbnails ${yn(thumbnails)}`}>
          <GalleryItem node={node} view={view} viewStatus={ViewStatus.LIVE} headingLevel={3} />
        </Cell>,
      );
    }
  }
  return cells;
}

async function compositions() {
  const items: WebpageNodeModel[] = makeFixtureNodes(6);
  return Promise.all(
    COMPOSITIONS.map(async (composition) => (
      <div key={composition} className="v2-ui__composition">
        <p className="v2-ui__label">
          <strong>{composition}</strong> <span>6 fixtures</span>
        </p>
        <ZoneRenderer data={FAKE_PAGE} items={items} composition={composition} title={composition} />
      </div>
    )),
  );
}

/** Each module of the current brand with a fixture block (never rendered on reader pages). */
function moduleCells(theme: string) {
  const brand = getBrand(theme);
  const modules = getBrandModules(brand.key);
  return brand.moduleKeys.map((key) => {
    const Module = modules[key];
    const block = MODULE_FIXTURES[brand.key]?.[key];
    if (!Module || !block) return null;
    return (
      <div key={key} className="v2-ui__composition">
        <p className="v2-ui__label">
          <strong>{key}</strong> <span>{brand.name} module</span>
        </p>
        <Module block={block} />
      </div>
    );
  });
}

export default async function StyleGuide({ site }: { site?: Site }) {
  const theme = siteThemeOf(site?.root);
  const newsletter = makeFixtureBlock({
    type: 'newsletter',
    title: 'The morning digest',
    items: [
      { title: 'The stories shaping today' },
      { title: 'A new perspective on the week' },
      { title: 'What to watch next' },
      { title: 'More from the newsroom' },
    ],
  }) as PageData<WebpageModel>;
  newsletter.model.data.sys = { baseType: 'webpage', type: 'newsletter' };
  newsletter.model.data.links.pagelink.context = newsletter.model.data.links.pagelink.main.splice(3);
  const story = makeFixtureBlock({ type: 'newsletterstory', title: 'A story from the newsroom' }) as PageData<ArticleModel>;
  const element = (nodeType: string, elements: ContentElement[] = [], value = ''): ContentElement =>
    ({ nodeType, elements, value, attributes: {} });
  story.model.data.sys = { baseType: 'article', type: 'newsletterstory' };
  story.model.data.pubInfo = { publicationTime: '2026-11-23T12:00:00Z', publishedBy: { userName: '' }, visible: true };
  story.model.data.files = { content: { data: element('doc', [
    element('story', [
      element('grouphead', [element('headline', [element('p', [element('plainText', [], 'A story from the newsroom')])])]),
      element('text', [
        element('p', [element('plainText', [], 'A long-form newsletter opens with the writer’s perspective.')]),
        element('p', [element('plainText', [], 'More reporting, related links and notes follow in the story body.')]),
      ]),
    ]),
  ]) } };
  if (site) {
    newsletter.siteNode = site.root;
    newsletter.siteData = site;
    story.siteNode = site.root;
    story.siteData = site;
  }
  const body = (
    <div className="v2-container v2-ui">
      <h1 className="v2-ui__title">Style guide</h1>
      <p className="v2-ui__note">Fixture content only. Original spec IDs match the SpecArticle and SpecLiveGallery boards; LIV-13 to LIV-16 add compact liveblogs.</p>
      <Section title="Article items (ART-01 to ART-32)">{articleCells()}</Section>
      <Section title="Live blog items (LIV-01 to LIV-16)">{liveblogCells()}</Section>
      <Section title="Gallery items (GAL-01 to GAL-12)">{galleryCells()}</Section>
      <Section title="Paywall tiers (PAY-01 to PAY-04)">
        {PAYWALL_LEVELS.map((level, index) => {
          const node = makeFixtureNode('article', index + 1);
          node.pubInfo = { ...node.pubInfo, paywallLevel: level };
          return (
            <Cell key={level} specId={id('PAY', index + 1)} props={level}>
              <ArticleItem
                node={node}
                view={resolveArticleItemView({ kind: 'article', variant: 'compact', image: true, standfirst: false }, 'compact', true, true)}
                viewStatus={ViewStatus.LIVE} headingLevel={3}
              />
            </Cell>
          );
        })}
      </Section>
      <section className="v2-ui__section">
        <h2 className="v2-ui__heading">Preview reader access</h2>
        <p>Demo only. This fixture has its own preview meter, separate from site allowances.</p>
        <div className="bg-gray-800 w-fit rounded py-2"><PreviewReaderSelect /></div>
        {PAYWALL_LEVELS.map(level => (
          <div key={level}>
            <h3>{level}</h3>
            <ReaderGate level={level} registered={false} siteName="v2-styleguide" url={`/ui/${level.toLowerCase()}`} preview>
              <p>{level} article body.</p>
            </ReaderGate>
          </div>
        ))}
      </section>
      <section className="v2-ui__section">
        <h2 className="v2-ui__heading">Compositions</h2>
        {await compositions()}
      </section>
      <section className="v2-ui__section">
        <h2 className="v2-ui__heading">Brand modules</h2>
        {moduleCells(theme)}
      </section>
      <section className="v2-ui__section">
        <h2 className="v2-ui__heading">Newsletter webpage</h2>
        <p className="v2-ui__note">Email preview for this brand, using the same markup as the HTML export.</p>
        <NewsletterWebpage data={newsletter} />
      </section>
      <section className="v2-ui__section">
        <h2 className="v2-ui__heading">Newsletter story</h2>
        <p className="v2-ui__note">Editorial newsletter using the article body.</p>
        <NewsletterStory data={story} />
      </section>
      <section className="v2-ui__section">
        <h2 className="v2-ui__heading">Chrome and common pages</h2>
        <p className="v2-ui__note">
          Large fixture menu (10 sections, one over the 8-link cap, one three levels deep). Hover a section for its
          dropdown; &quot;Full menu&quot; opens the desktop panel (the mobile drawer below 768px). Search:{' '}
          <Link href="/search">/search</Link>.
        </p>
        <div className="v2-header v2-ui__chrome">
          <div className="v2-header__navrow">
            <Nav links={MENU_FIXTURE} moreLinks={MENU_FIXTURE} pathname="/ui-fixture/economy/markets/" />
          </div>
          <MenuToggle items={MENU_FIXTURE} pathname="/ui-fixture/economy/markets/" label="Full menu" />
        </div>
        <div className="v2-special--login">
          <LoginForm />
        </div>
      </section>
    </div>
  );
  return site ? <PageShell site={site}>{body}</PageShell> : body;
}
