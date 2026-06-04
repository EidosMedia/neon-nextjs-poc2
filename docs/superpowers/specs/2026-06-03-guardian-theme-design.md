# Guardian Theme Design

**Date:** 2026-06-03  
**Theme key:** `guardian`  
**Approach:** NYT-derivative — copy NYT as base, adapt structure and CSS for Guardian visual identity

---

## 1. Overview

New rendering theme `guardian` that approximates The Guardian newspaper's visual identity:

- Dark navy (`#052962`) masthead and footer
- Guardian red (`#c70000`) accent — section labels, standfirst border, pill badges
- Yellow (`#ffbb00`) Subscribe/Support CTA
- Georgia serif as headline/body font (Guardian Egyptian approximation)
- system-ui sans-serif for navigation (Guardian Sans approximation)
- Zero border-radius on cards
- No article sidebar — centred 740px reading column
- Full-width hero image on article pages
- Homepage: hero 2/3 + stack 1/3 grid, then 4-col second row

---

## 2. Directory Structure

```
src/app/_pages/guardian/
├── Navbar.tsx               ← new — two-row navy header
├── Footer.tsx               ← adapted from nyt — dark navy bg, Guardian columns
├── HomeWebPage.tsx          ← new — 2/3+1/3 hero grid + 4-col row
├── Article.tsx              ← adapted from nyt — standfirst, red section label
├── ArticleLongform.tsx      ← re-export from nyt
├── AboutPage.tsx            ← re-export from nyt
├── DefaultLanding.tsx       ← re-export from nyt
├── DefaultSection.tsx       ← re-export from nyt
├── Liveblog.tsx             ← re-export from nyt
├── LiveblogPosts.tsx        ← re-export from nyt
├── LoginPage.tsx            ← re-export from nyt
├── NotFound.tsx             ← re-export from nyt
├── SearchPage.tsx           ← re-export from nyt
├── SectionWebPage.tsx       ← re-export from nyt
├── WebpageColumnsLayout.tsx ← re-export from nyt
└── index.ts                 ← barrel: own files + nyt re-exports + UIStyleGuide + ArticleOrganism

src/app/themes/guardian.css  ← new CSS file
src/app/globals.css          ← add @import for guardian.css
src/app/_themeRouter.tsx     ← add Guardian import + THEME_MAP entry
```

---

## 3. Theme Registration

```ts
// src/app/_themeRouter.tsx
import * as Guardian from './_pages/guardian';

const THEME_MAP = {
  default:  Default,
  adn:      Adn,
  nyt:      Nyt,
  wire:     Wire,
  guardian: Guardian,   // ← add
};
```

---

## 4. CSS Variables (`src/app/themes/guardian.css`)

Scoped under `.root[data-theme="guardian"]`.

### Colour palette

| Variable | Value | Usage |
|---|---|---|
| `--color-primary` | `#052962` | Navy — masthead, footer, link colour |
| `--color-primary-dark` | `#041f4a` | Darker navy — hover states |
| `--color-primary-light` | `#005689` | Mid blue — Sport section label |
| `--color-primary-lightest` | `#e3f0f9` | Light blue tint — hover bg |
| `--color-accent` | `#c70000` | Red — section labels, standfirst border |
| `--color-accent-yellow` | `#ffbb00` | Yellow — Subscribe/Support CTA |
| `--color-neutral-primary` | `#121212` | Body text |
| `--color-neutral-secondary` | `#333333` | Secondary text |
| `--color-neutral-light` | `#dcdcdc` | Borders, dividers |
| `--color-neutral-lightest` | `#ffffff` | White backgrounds |
| `--color-neutral-bg` | `#f6f6f6` | Page background |
| `--color-nav-bg` | `#052962` | Navbar background |
| `--color-footer-bg` | `#052962` | Footer background |

### Typography

| Variable | Value |
|---|---|
| `--font-headline` | `'Georgia', 'Times New Roman', serif` |
| `--font-body` | `'Georgia', 'Times New Roman', serif` |
| `--font-nav` | `system-ui, -apple-system, 'Helvetica Neue', sans-serif` |

### Card shape

| Variable | Value |
|---|---|
| `--radius-card` | `0px` |
| `--border-card` | `none` |

### Layout helpers (guardian-specific, not CSS vars)

```css
.root[data-theme="guardian"] .guardian-hero-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1px;           /* 1px gap = Guardian's thin rule between columns */
  background: #dcdcdc; /* gap shows as line */
  align-items: start; /* stack column doesn't stretch to hero height */
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
  color: #333;
  border-left: 3px solid #c70000;
  padding-left: 12px;
  margin: 12px 0;
}

.root[data-theme="guardian"] .guardian-byline-rule {
  border-bottom: 1px dotted #dcdcdc;
  padding-bottom: 8px;
  margin-bottom: 16px;
}
```

---

## 5. Navbar (`_pages/guardian/Navbar.tsx`)

Two-row sticky header, full navy background.

**Row 1 — Pillars bar (36px, `#052962`)**
- Left: hardcoded pillars array `['News', 'Opinion', Sport', 'Culture', 'Lifestyle']` — each a `<Link>` separated by `border-right: 1px solid rgba(255,255,255,.2)`
- Right: `Subscribe` in yellow text, `Support us` as red pill button
- Font: `--font-nav`, 11px, 700, uppercase, letter-spacing 0.04em, white

**Row 2 — Masthead row (60px, `#052962`, `border-top: 1px solid rgba(255,255,255,.15)`)**
- Left: `The Guardian` in Georgia serif, 26px, white, font-weight 700
- Right: Search icon (`<Search>` from lucide-react) + `LoginButton`

No CMS menu (`MenuPrincipale1`) in Navbar — Guardian pillar nav is structural, not CMS-driven. `MenuPrincipale1` reserved for section page sub-navs if needed later.

Date line: small text below masthead row on desktop (`hidden sm:block`), format `"Tue 3 Jun 2026"`.

---

## 6. Footer (`_pages/guardian/Footer.tsx`)

Dark navy background (`#052962`), white text throughout.

**Five columns:**

| Column | Links |
|---|---|
| News | Home, UK, World, Climate crisis, Ukraine, Environment |
| Opinion | Columnists, Letters, Editorials, Sport opinion |
| Sport | Football, Cricket, Rugby union, Tennis, Cycling |
| Culture | Film, Music, TV & radio, Books, Art & design |
| About | About us, Contact us, Complaints, Advertise, Work for us |

**Bottom strip:**
- Guardian logotype centred (Georgia serif, white, 1.4rem)
- Social icons: Facebook, Twitter/X, Instagram, YouTube (white, lucide-react)
- Legal line: `© 2026 Guardian News & Media Limited` + Privacy / Terms / Cookie policy

Top of footer: `border-top: 1px solid rgba(255,255,255,.15)`.

---

## 7. HomeWebPage (`_pages/guardian/HomeWebPage.tsx`)

```
<Navbar data={data} />
<div class="w-full max-w-[1300px] mx-auto px-4 py-4">

  {/* Hero zone */}
  <div class="guardian-hero-grid">
    <div class="guardian-hero-main">   {/* 2fr */}
      <Main data={data} />
    </div>
    <div class="guardian-hero-stack">  {/* 1fr */}
      <Context data={data} />
    </div>
  </div>

  {/* Section divider */}
  <div class="guardian-section-header">More stories</div>

  {/* 4-col second row */}
  <div class="guardian-4col-grid">
    <Insight1 data={data} />
    <Insight2 data={data} />
  </div>

</div>
<Footer data={data} />
```

Max width 1300px (slightly wider than NYT's 1280px to match Guardian's wider grid).

---

## 8. Article (`_pages/guardian/Article.tsx`)

Adapted from `nyt/Article.tsx`. Key differences:

1. **Section label** — red `<span class="guardian-section-label">` above `<Grouphead>`, derived from `articleData?.url?.split?.('/')?.[1]`
2. **Standfirst** — `<div class="guardian-standfirst">` rendered from `articleData?.attributes?.standfirst` (if present) between Grouphead and byline
3. **Byline rule** — `<div class="guardian-byline-rule">` wrapping the share/date row
4. **Share bar** — Share icon only (no Gift button)
5. **Reading column** — `max-w-[740px] mx-auto px-4 py-8` (same as NYT)
6. **Hero image** — `<MainImage>` full column width, above body text (same as NYT)
7. **Class names** — all `nyt-*` → `guardian-*`
8. **Ad injection** — same logic as NYT Article (copied verbatim)

---

## 9. `index.ts` Barrel

```ts
// Own files
export { default as Navbar }       from './Navbar';
export { default as Footer }       from './Footer';
export { default as HomeWebPage }  from './HomeWebPage';
export { default as Article }      from './Article';

// NYT re-exports (no Guardian override needed)
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

// Required barrel shape
export { default as UIStyleGuide }    from '../../components/baseComponents/UIStyleGuide';
export { default as ArticleOrganism } from '../../components/base/Organism/ArticleOrganism';
```

---

## 10. Fonts

No Google Fonts addition required. Guardian Egyptian → Georgia (already available). If fidelity upgrade wanted later, add `GFS Didot` via Google Fonts `<link>` in `layout.tsx`.

---

## 11. Neon CMS Setup

On the target site node's attributes, set:
```json
{ "theme": "guardian" }
```

---

## 12. Checklist

- [ ] `npm run scaffold:theme -- guardian` (or manual copy from nyt) — creates file stubs
- [ ] `src/app/_themeRouter.tsx` — add import + THEME_MAP entry
- [ ] `src/app/themes/guardian.css` — create with all variables and layout helpers
- [ ] `src/app/globals.css` — add `@import './themes/guardian.css'`
- [ ] `_pages/guardian/Navbar.tsx` — two-row navy header
- [ ] `_pages/guardian/Footer.tsx` — dark navy, five columns
- [ ] `_pages/guardian/HomeWebPage.tsx` — 2/3+1/3 hero grid + 4-col row
- [ ] `_pages/guardian/Article.tsx` — standfirst, red section label, guardian-* classes
- [ ] `_pages/guardian/index.ts` — barrel with correct shape
- [ ] `npx tsc --noEmit` passes with zero errors
- [ ] Neon site node `theme` attribute set to `guardian`
