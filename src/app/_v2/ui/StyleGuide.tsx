import type { ReactNode } from 'react';
import type { BaseModel, PageData, Site, WebpageNodeModel } from '@eidosmedia/neon-frontoffice-ts-sdk';
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
import { MENU_FIXTURE, MODULE_FIXTURES, makeFixtureNode, makeFixtureNodes } from './fixtures';
import Link from 'next/link';
import Nav from '../chrome/Nav';
import MenuToggle from '../chrome/MenuToggle';
import LoginForm from '../special/LoginForm';

const ARTICLE_VARIANTS: ArticleItemVariant[] = [
  'standard', 'lead', 'compact', 'textOnly', 'overlay', 'opinion', 'highlight', 'sponsored',
];
const LIVEBLOG_VARIANTS = ['panel', 'feed', 'pinnedSummary'] as const;
const GALLERY_VARIANTS = ['fullBleed', 'panelWithThumbs', 'grid'] as const;
const COMPOSITIONS: ConcreteComposition[] = [
  'leadList', 'threeUp', 'fourUp', 'split', 'grid2x2', 'overlayPair', 'datedListing', 'sponsored',
];

const yn = (b: boolean) => (b ? 'yes' : 'no');
const id = (prefix: string, n: number) => `${prefix}-${String(n).padStart(2, '0')}`;

// Fixtures render as LIVE so the inspect overlay stays inert; they carry no contentIds so nothing is editable.
const FAKE_PAGE = { siteData: { viewStatus: 'live' } } as unknown as PageData<BaseModel>;

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
  const body = (
    <div className="v2-container v2-ui">
      <h1 className="v2-ui__title">Style guide</h1>
      <p className="v2-ui__note">Fixture content only. Spec IDs match the SpecArticle and SpecLiveGallery boards.</p>
      <Section title="Article items (ART-01 to ART-32)">{articleCells()}</Section>
      <Section title="Live blog items (LIV-01 to LIV-12)">{liveblogCells()}</Section>
      <Section title="Gallery items (GAL-01 to GAL-12)">{galleryCells()}</Section>
      <section className="v2-ui__section">
        <h2 className="v2-ui__heading">Compositions</h2>
        {await compositions()}
      </section>
      <section className="v2-ui__section">
        <h2 className="v2-ui__heading">Brand modules</h2>
        {moduleCells(theme)}
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
