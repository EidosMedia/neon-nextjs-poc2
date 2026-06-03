# Guardian Theme Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `guardian` rendering theme that approximates The Guardian newspaper's visual identity — dark navy masthead, red accents, two-row pillar navbar, 2/3+1/3 homepage hero grid, and a centred 740px article column.

**Architecture:** NYT-derivative — `_pages/guardian/` adapts `_pages/nyt/` for the four files that differ structurally (Navbar, Footer, HomeWebPage, Article); all other pages re-export directly from `nyt`. Card styling is CSS-only via `guardian.css` — no component overrides needed.

**Tech Stack:** Next.js 14 App Router, TypeScript, Tailwind CSS v4, lucide-react, `@eidosmedia/neon-frontoffice-ts-sdk`

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `src/app/_pages/guardian/Navbar.tsx` | Two-row sticky navy header: pillars row + masthead row |
| Create | `src/app/_pages/guardian/Footer.tsx` | Dark navy footer, 5 columns, Guardian links |
| Create | `src/app/_pages/guardian/HomeWebPage.tsx` | 2/3+1/3 hero grid + 4-col second row |
| Create | `src/app/_pages/guardian/Article.tsx` | Centred 740px column, standfirst, red section label |
| Create | `src/app/_pages/guardian/index.ts` | Barrel: own 4 files + nyt re-exports + required shape entries |
| Create | `src/app/themes/guardian.css` | CSS vars + layout helpers scoped to `[data-theme="guardian"]` |
| Modify | `src/app/globals.css` | Add `@import "./themes/guardian.css"` |
| Modify | `src/app/_themeRouter.tsx` | Import Guardian barrel + add `guardian` key to `THEME_MAP` |

---

## Task 1: CSS foundation

**Files:**
- Create: `src/app/themes/guardian.css`
- Modify: `src/app/globals.css` (line 10 — after wire import)

- [ ] **Step 1: Create `guardian.css`**

```css
/* Guardian Theme — data-theme="guardian" */
/* Guardian Egyptian → Georgia; Guardian Sans → system-ui */

/* ─── CSS Variable Overrides ─────────────────────────────────────────────── */
.root[data-theme="guardian"] {
  --font-headline: 'Georgia', 'Times New Roman', serif;
  --font-body:     'Georgia', 'Times New Roman', serif;
  --font-nav:      system-ui, -apple-system, 'Helvetica Neue', sans-serif;

  --color-primary:          #052962;
  --color-primary-dark:     #041f4a;
  --color-primary-light:    #005689;
  --color-primary-lightest: #e3f0f9;

  --color-neutral-primary:  #121212;
  --color-neutral-secondary:#333333;
  --color-neutral-light-2:  #666666;
  --color-neutral-light:    #dcdcdc;
  --color-neutral-lightest: #ffffff;
  --color-neutral-bg:       #f6f6f6;

  --color-nav-bg:           #052962;
  --color-footer-bg:        #052962;

  --border-card:            none;
  --radius-card:            0px;
}

/* ─── Global ──────────────────────────────────────────────────────────────── */
.root[data-theme="guardian"] {
  background-color: #f6f6f6;
  color: #121212;
  font-family: var(--font-body);
}

/* ─── Layout Helpers ──────────────────────────────────────────────────────── */
.root[data-theme="guardian"] .guardian-hero-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1px;
  background: #dcdcdc;
  align-items: start;
}

.root[data-theme="guardian"] .guardian-hero-main,
.root[data-theme="guardian"] .guardian-hero-stack > * {
  background: #f6f6f6;
}

.root[data-theme="guardian"] .guardian-hero-stack {
  display: flex;
  flex-direction: column;
  gap: 1px;
  background: #dcdcdc;
}

.root[data-theme="guardian"] .guardian-4col-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1px;
  background: #dcdcdc;
}

.root[data-theme="guardian"] .guardian-4col-grid > * {
  background: #f6f6f6;
}

.root[data-theme="guardian"] .guardian-section-header {
  border-top: 3px solid #052962;
  padding-top: 6px;
  margin: 16px 0 8px;
  font-family: var(--font-nav);
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #052962;
}

/* ─── Section Labels & Standfirst ────────────────────────────────────────── */
.root[data-theme="guardian"] .guardian-section-label {
  display: inline-block;
  font-family: var(--font-nav);
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #c70000;
  margin-bottom: 4px;
}

.root[data-theme="guardian"] .guardian-standfirst {
  font-family: var(--font-body);
  font-style: italic;
  font-size: 1.1rem;
  line-height: 1.5;
  color: #333333;
  border-left: 3px solid #c70000;
  padding-left: 12px;
  margin: 12px 0;
}

.root[data-theme="guardian"] .guardian-byline-rule {
  border-bottom: 1px dotted #dcdcdc;
  padding-bottom: 8px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
}

/* ─── Navbar ──────────────────────────────────────────────────────────────── */
.root[data-theme="guardian"] .guardian-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: #052962;
}

.root[data-theme="guardian"] .guardian-pillar-link {
  font-family: var(--font-nav);
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #ffffff;
  text-decoration: none;
  padding: 0 10px;
  border-right: 1px solid rgba(255, 255, 255, 0.2);
  white-space: nowrap;
}
.root[data-theme="guardian"] .guardian-pillar-link:first-child {
  padding-left: 0;
}
.root[data-theme="guardian"] .guardian-pillar-link:last-of-type {
  border-right: none;
}
.root[data-theme="guardian"] .guardian-pillar-link:hover {
  color: #ffbb00;
}

.root[data-theme="guardian"] .guardian-masthead {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: clamp(1.2rem, 3vw, 1.7rem);
  font-weight: 700;
  color: #ffffff;
  text-decoration: none;
  letter-spacing: -0.01em;
  line-height: 1;
}

.root[data-theme="guardian"] .guardian-support-btn {
  background: #c70000;
  color: #ffffff;
  font-family: var(--font-nav);
  font-size: 11px;
  font-weight: 700;
  padding: 4px 12px;
  border: none;
  cursor: pointer;
  text-decoration: none;
  white-space: nowrap;
}
.root[data-theme="guardian"] .guardian-support-btn:hover {
  background: #a30000;
}

.root[data-theme="guardian"] .guardian-subscribe-link {
  font-family: var(--font-nav);
  font-size: 11px;
  font-weight: 700;
  color: #ffbb00;
  text-decoration: none;
  white-space: nowrap;
}
.root[data-theme="guardian"] .guardian-subscribe-link:hover {
  text-decoration: underline;
}

.root[data-theme="guardian"] .guardian-date-line {
  font-family: var(--font-nav);
  font-size: 10px;
  color: rgba(255, 255, 255, 0.6);
  padding: 3px 12px;
  background: #052962;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

/* ─── Footer ──────────────────────────────────────────────────────────────── */
.root[data-theme="guardian"] .guardian-footer {
  background: #052962;
  color: #ffffff;
  margin-top: 40px;
}

.root[data-theme="guardian"] .guardian-footer-col-title {
  font-family: var(--font-nav);
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 8px;
  padding-bottom: 4px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
}

.root[data-theme="guardian"] .guardian-footer a {
  color: rgba(255, 255, 255, 0.85);
  text-decoration: none;
  font-size: 0.75rem;
}
.root[data-theme="guardian"] .guardian-footer a:hover {
  color: #ffffff;
  text-decoration: underline;
}

.root[data-theme="guardian"] .guardian-footer-legal {
  font-size: 0.65rem;
  color: rgba(255, 255, 255, 0.5);
}
.root[data-theme="guardian"] .guardian-footer-legal a {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.65rem;
}
```

- [ ] **Step 2: Add import to `globals.css`**

In `src/app/globals.css`, after the `wire.css` import line, add:

```css
@import "./themes/guardian.css";
```

The import block should now read:
```css
@import 'tailwindcss';
...
@import "./themes/wire.css";
@import "./themes/guardian.css";
```

- [ ] **Step 3: Verify TypeScript still passes**

```bash
npx tsc --noEmit
```

Expected: zero errors.

- [ ] **Step 4: Commit**

```bash
git add src/app/themes/guardian.css src/app/globals.css
git commit -m "feat(guardian): add guardian theme CSS foundation"
```

---

## Task 2: Register theme in router

**Files:**
- Modify: `src/app/_themeRouter.tsx`

- [ ] **Step 1: Add import**

Open `src/app/_themeRouter.tsx`. After the `Wire` import line add:

```ts
import * as Guardian from './_pages/guardian';
```

- [ ] **Step 2: Add to THEME_MAP**

In the `THEME_MAP` object, after `wire: Wire,` add:

```ts
  guardian: Guardian,
```

The full THEME_MAP should now be:
```ts
const THEME_MAP: Record<string, PageComponents> = {
  default:  Default,
  adn:      Adn,
  nyt:      Nyt,
  wire:     Wire,
  guardian: Guardian,
};
```

Note: this will cause a TypeScript error until Task 3 (index.ts barrel) is complete — that's expected. Don't run `tsc` yet.

- [ ] **Step 3: Commit (deferred — commit after Task 3 when tsc passes)**

---

## Task 3: `index.ts` barrel

**Files:**
- Create: `src/app/_pages/guardian/index.ts`

- [ ] **Step 1: Create the barrel**

```ts
// Own Guardian implementations
export { default as Navbar }      from './Navbar';
export { default as Footer }      from './Footer';
export { default as HomeWebPage } from './HomeWebPage';
export { default as Article }     from './Article';

// NYT re-exports — no Guardian override needed for these
export { default as ArticleLongform }      from '../nyt/ArticleLongform';
export { default as AboutPage }            from '../nyt/AboutPage';
export { default as DefaultLanding }       from '../nyt/DefaultLanding';
export { default as DefaultSection }       from '../nyt/DefaultSection';
export { default as Liveblog }             from '../nyt/Liveblog';
export { default as LiveblogPosts }        from '../nyt/LiveblogPosts';
export { default as LoginPage }            from '../nyt/LoginPage';
export { default as NotFound }             from '../nyt/NotFound';
export { default as SearchPage }           from '../nyt/SearchPage';
export { default as SectionWebPage }       from '../nyt/SectionWebPage';
export { default as WebpageColumnsLayout } from '../nyt/WebpageColumnsLayout';

// Required by PageComponents type shape
export { default as UIStyleGuide }    from '../../components/baseComponents/UIStyleGuide';
export { default as ArticleOrganism } from '../../components/base/Organism/ArticleOrganism';
```

Note: this will trigger TypeScript errors for the four own files until Tasks 4–7 create them. Proceed to next tasks immediately.

---

## Task 4: Navbar

**Files:**
- Create: `src/app/_pages/guardian/Navbar.tsx`

- [ ] **Step 1: Create Navbar**

```tsx
import Link from 'next/link';
import { BaseModel, PageData } from '@eidosmedia/neon-frontoffice-ts-sdk';
import { Search } from 'lucide-react';
import { cookies } from 'next/headers';
import LoginButton from '../../components/LoginButton';

const PILLARS = [
  { label: 'News',      href: '/news' },
  { label: 'Opinion',   href: '/opinion' },
  { label: 'Sport',     href: '/sport' },
  { label: 'Culture',   href: '/culture' },
  { label: 'Lifestyle', href: '/lifestyle' },
];

export default async function Navbar({ data }: { data: Partial<PageData<BaseModel>> }) {
  console.log('[NEON] render: guardian/Navbar');

  const cookieStore = await cookies();
  const webauth = cookieStore.get('webauth')?.value;

  const now = new Date();
  const dateLabel = now.toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <header className="guardian-header w-full">

      {/* ── Row 1: Pillars bar ────────────────────────────────────────────── */}
      <div className="w-full" style={{ height: 36 }}>
        <div className="w-full max-w-[1300px] mx-auto px-4 flex items-center justify-between h-full">
          <nav className="flex items-center h-full">
            {PILLARS.map(({ label, href }) => (
              <Link key={href} href={href} className="guardian-pillar-link flex items-center h-full">
                {label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/subscribe" className="guardian-subscribe-link">Subscribe</Link>
            <a href="/support" className="guardian-support-btn">Support us</a>
          </div>
        </div>
      </div>

      {/* ── Row 2: Masthead row ───────────────────────────────────────────── */}
      <div className="w-full" style={{ borderTop: '1px solid rgba(255,255,255,.15)', minHeight: 60 }}>
        <div className="w-full max-w-[1300px] mx-auto px-4 flex items-center justify-between" style={{ minHeight: 60 }}>
          <Link href="/" className="guardian-masthead">
            The Guardian
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/search" aria-label="Search" style={{ color: 'rgba(255,255,255,.85)' }}>
              <Search className="w-5 h-5" />
            </Link>
            <LoginButton webauth={webauth} />
          </div>
        </div>
      </div>

      {/* ── Date line ─────────────────────────────────────────────────────── */}
      <div className="guardian-date-line hidden sm:block">
        {dateLabel}
      </div>

    </header>
  );
}
```

---

## Task 5: Footer

**Files:**
- Create: `src/app/_pages/guardian/Footer.tsx`

- [ ] **Step 1: Create Footer**

```tsx
import React from 'react';
import { BaseModel, PageData } from '@eidosmedia/neon-frontoffice-ts-sdk';
import { FacebookIcon, TwitterIcon, InstagramIcon, YoutubeIcon } from 'lucide-react';

const FOOTER_COLUMNS = [
  {
    title: 'News',
    links: ['Home', 'UK', 'World', 'Climate crisis', 'Ukraine', 'Environment', 'Science', 'Global development'],
  },
  {
    title: 'Opinion',
    links: ['Columnists', 'Letters', 'Editorials', 'Sport opinion', 'Tech opinion'],
  },
  {
    title: 'Sport',
    links: ['Football', 'Cricket', 'Rugby union', 'Tennis', 'Cycling', 'Golf', 'Athletics'],
  },
  {
    title: 'Culture',
    links: ['Film', 'Music', 'TV & radio', 'Books', 'Art & design', 'Stage', 'Games'],
  },
  {
    title: 'About',
    links: ['About us', 'Contact us', 'Complaints & corrections', 'Advertise with us', 'Work for us', 'Privacy settings'],
  },
];

export default async function Footer({ data }: { data: Partial<PageData<BaseModel>> }) {
  console.log('[NEON] render: guardian/Footer');
  return (
    <footer data-section="footer" className="guardian-footer w-full">

      {/* Columns */}
      <div className="w-full max-w-[1300px] mx-auto px-4 pt-8 pb-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
          {FOOTER_COLUMNS.map(col => (
            <div key={col.title}>
              <div className="guardian-footer-col-title">{col.title}</div>
              <ul className="flex flex-col gap-1.5">
                {col.links.map(label => (
                  <li key={label}>
                    <a href="#">{label}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,.15)' }} />

      {/* Logotype + social + legal */}
      <div className="w-full max-w-[1300px] mx-auto px-4 py-6 flex flex-col items-center gap-4">
        <a
          href="/"
          style={{
            fontFamily: "'Georgia', 'Times New Roman', serif",
            fontSize: '1.4rem',
            fontWeight: 700,
            color: '#ffffff',
            textDecoration: 'none',
          }}
        >
          The Guardian
        </a>

        <div className="flex items-center gap-5">
          <a href="#" aria-label="Facebook" style={{ color: 'rgba(255,255,255,.7)' }}><FacebookIcon size={16} /></a>
          <a href="#" aria-label="Twitter/X" style={{ color: 'rgba(255,255,255,.7)' }}><TwitterIcon size={16} /></a>
          <a href="#" aria-label="Instagram" style={{ color: 'rgba(255,255,255,.7)' }}><InstagramIcon size={16} /></a>
          <a href="#" aria-label="YouTube" style={{ color: 'rgba(255,255,255,.7)' }}><YoutubeIcon size={16} /></a>
        </div>

        <div className="guardian-footer-legal flex flex-wrap justify-center gap-x-3 gap-y-1 text-center">
          <a href="#">© {new Date().getFullYear()} Guardian News &amp; Media Limited</a>
          <span>·</span>
          <a href="#">Privacy policy</a>
          <span>·</span>
          <a href="#">Cookie policy</a>
          <span>·</span>
          <a href="#">Terms &amp; conditions</a>
          <span>·</span>
          <a href="#">Help</a>
          <span>·</span>
          <a href="#">Accessibility</a>
        </div>
      </div>

    </footer>
  );
}
```

---

## Task 6: HomeWebPage

**Files:**
- Create: `src/app/_pages/guardian/HomeWebPage.tsx`

- [ ] **Step 1: Create HomeWebPage**

```tsx
import { PageData } from '@eidosmedia/neon-frontoffice-ts-sdk';
import { WebpageModel } from '@eidosmedia/neon-frontoffice-ts-sdk';
import Navbar from './Navbar';
import Footer from './Footer';
import Main from '../../components/webpage/Main';
import Context from '../../components/webpage/Context';
import Insight1 from '../../components/webpage/Insight1';
import Insight2 from '../../components/webpage/Insight2';

type PageProps = {
  data: PageData<WebpageModel>;
};

const HomeWebPage: React.FC<PageProps> = async ({ data }) => {
  console.log('[NEON] render: guardian/HomeWebPage');

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f6f6f6' }}>
      <Navbar data={data} />

      <div className="w-full max-w-[1300px] mx-auto px-4 py-4">

        {/* ── Hero zone: 2/3 + 1/3 ─────────────────────────────────────── */}
        <div className="guardian-hero-grid">
          <div className="guardian-hero-main">
            <Main data={data} />
          </div>
          <div className="guardian-hero-stack">
            <Context data={data} />
          </div>
        </div>

        {/* ── Section divider ───────────────────────────────────────────── */}
        <div className="guardian-section-header">More stories</div>

        {/* ── 4-col second row ──────────────────────────────────────────── */}
        <div className="guardian-4col-grid">
          <Insight1 data={data} />
          <Insight2 data={data} />
        </div>

      </div>

      <Footer data={data} />
    </div>
  );
};

export default HomeWebPage;
```

---

## Task 7: Article

**Files:**
- Create: `src/app/_pages/guardian/Article.tsx`

- [ ] **Step 1: Create Article (adapted from `nyt/Article.tsx`)**

```tsx
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
import { Share2 } from 'lucide-react';
import Link from 'next/link';

type PageProps = {
  data: PageData<ArticleModel>;
};

const Article = async ({ data }: PageProps) => {
  console.log('[NEON] render: guardian/Article');

  const articleData = data.model.data;
  const adsDensity = articleData?.attributes?.ads?.adsDensity || 0;
  const section = articleData?.url?.split?.('/')?.[1] ?? '';
  const standfirst = (articleData?.attributes as Record<string, unknown>)?.standfirst as string | undefined;

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
        else console.warn('[Guardian/Article] embed fetch failed:', resp.status, 'for node', neonId);
      } catch (err) {
        console.error('[Guardian/Article] embed fetch error for node', neonId, ':', err);
      }
    }),
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#ffffff' }}>
      <Navbar data={data} />

      <div className="w-full max-w-[740px] mx-auto px-4 py-8">

        {/* Section label */}
        {section && (
          <div className="mb-3">
            <Link
              href={`/${section.toLowerCase()}`}
              className="guardian-section-label"
              style={{ textDecoration: 'none' }}
            >
              {section}
            </Link>
          </div>
        )}

        <article>
          <Grouphead data={articleData} />

          {/* Standfirst — only render if field present */}
          {standfirst && (
            <div className="guardian-standfirst">{standfirst}</div>
          )}

          {/* Byline / share row */}
          <div className="guardian-byline-rule">
            <button
              aria-label="Share"
              className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide"
              style={{ fontFamily: 'var(--font-nav)', color: '#052962', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
          </div>

          {/* Hero image — full column width */}
          <MainImage data={articleData} preferredImage="main" />

          {/* Body text */}
          <div className="mt-8">
            {renderContent(
              textContentWithAds,
              articleData,
              undefined,
              'flex flex-col gap-5',
              customComponents,
              nodeDataMap,
            )}
          </div>
        </article>

      </div>

      <Footer data={data} />
    </div>
  );
};

export default Article;
```

---

## Task 8: Verify and commit all files

**Files:** all files created/modified in Tasks 1–7

- [ ] **Step 1: Run TypeScript check**

```bash
npx tsc --noEmit
```

Expected: zero errors. If errors appear, they will be in import paths — check that `../../components/LoginButton`, `../../components/webpage/Main`, `../../components/webpage/Context`, `../../components/webpage/Insight1`, `../../components/webpage/Insight2` all resolve. These paths are relative to `src/app/_pages/guardian/` and match the pattern used in `nyt/HomeWebPage.tsx`.

- [ ] **Step 2: Commit everything**

```bash
git add \
  src/app/_pages/guardian/Navbar.tsx \
  src/app/_pages/guardian/Footer.tsx \
  src/app/_pages/guardian/HomeWebPage.tsx \
  src/app/_pages/guardian/Article.tsx \
  src/app/_pages/guardian/index.ts \
  src/app/themes/guardian.css \
  src/app/globals.css \
  src/app/_themeRouter.tsx
git commit -m "feat(guardian): add Guardian newspaper theme

- Two-row navy navbar with hardcoded pillar links
- Dark navy footer with five Guardian content columns
- Homepage: 2/3+1/3 hero grid + 4-col second row
- Article: centred 740px column, standfirst block, red section label
- guardian.css: full CSS variable overrides and layout helpers
- Registered as 'guardian' key in THEME_MAP"
```

- [ ] **Step 3: Set theme on Neon site node**

In Neon CMS, on the target site node's attributes panel, set:
```json
{ "theme": "guardian" }
```

- [ ] **Step 4: Smoke test in browser**

Start the dev server (`npm run dev`) and navigate to a site configured with `theme: guardian`. Verify:
- Navy two-row navbar renders
- Homepage shows 2/3+1/3 hero grid
- Article page shows centred column with red section label
- Footer shows dark navy background with white text
- `npx tsc --noEmit` still passes

---

## Self-Review Checklist

**Spec coverage:**
- [x] CSS variables + layout helpers — Task 1
- [x] Theme registration — Task 2
- [x] index.ts barrel with correct shape — Task 3
- [x] Navbar two-row navy — Task 4
- [x] Footer dark navy five columns — Task 5
- [x] HomeWebPage 2/3+1/3 grid — Task 6
- [x] Article standfirst / section label / centred column — Task 7
- [x] globals.css import — Task 1 Step 2
- [x] tsc verify — Task 8

**Gaps identified and resolved:**
- `guardian-hero-main` background set explicitly in CSS so grid gap background (#dcdcdc) doesn't bleed through
- `guardian-4col-grid > *` background set so cells have white bg inside 1px gap grid
- Article `standfirst` cast via `(articleData?.attributes as Record<string, unknown>)?.standfirst` — safe, mirrors pattern used in other themes for optional attributes

**No placeholders found.**

**Type consistency:** `Navbar`, `Footer`, `HomeWebPage`, `Article` — all default exports, all referenced identically in `index.ts` barrel. Import paths consistent throughout.
