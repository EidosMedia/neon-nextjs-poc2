---
name: neon-new-theme
description: "Add a new visual theme to the front-office. Use when creating a new brand theme, site identity, or alternate rendering structure. Triggers: 'add theme', 'new theme', 'create theme', 'new brand', 'alternate rendering'."
argument-hint: "Theme name in lowercase-kebab (e.g. 'adn', 'my-brand')"
---

# Add a New Rendering Theme

> For the v2 engine use `neon-v2-brand`; this skill is the legacy (v1) path for structural themes.
> v2 is the default engine: `default`, `theglobe`, `sportsarena` and `nextfrontier` are in `V2_THEMES`
> (`src/app/themeKeys.ts`, rendered by `src/app/_v2/`). Legacy themes are listed in `LEGACY_THEMES`:
> `adn`, `oldtown`, `wire`, `foghorn`, `financier` and `business-globe`.

This project supports per-site structural themes: when `siteNode.attributes.theme` matches a registered key, the entire page rendering (Navbar, Footer, page layouts, and optionally individual components) switches to a theme-specific set. Theming works at two levels:

- **Page level** — full page templates (HomeWebPage, Article, etc.) resolved via `resolvePageComponent`
- **Component level** — shared sub-page components (ArticleOrganism, etc.) resolved via `resolveComponent`

Both functions go through `pagesFor()` in `_themeRouter.tsx`: a theme in `LEGACY_THEMES` uses its entry in `LEGACY_THEME_MAP`, every other theme uses the v2 barrel.

## Directory structure

```
src/app/
├── _v2/                           ← v2 engine: default, theglobe, sportsarena, nextfrontier (incl. shared accessories.json)
├── _pages/
│   ├── NewsletterWebpage.tsx      ← shared by legacy barrels (and re-exported by the v2 barrel)
│   ├── LiveblogPosts.tsx
│   └── <theme-name>/              ← one folder per legacy theme (adn, oldtown, wire, ...)
│       ├── Navbar.tsx
│       ├── Footer.tsx
│       ├── Article.tsx
│       ├── … (page overrides)
│       ├── components/            ← theme-specific component overrides
│       │   └── ArticleOrganism.tsx
│       └── index.ts               ← barrel: exports pages + component overrides
├── themeKeys.ts                   ← V2_THEMES, LEGACY_THEMES, isLegacyTheme, isV2Theme
└── _themeRouter.tsx               ← LEGACY_THEME_MAP: legacy theme key → PageComponents; v2 for the rest
```

Theme selection happens in `src/app/[[...slug]]/page.tsx`:
```
theme = pageDataJSON.siteNode.attributes.theme ?? 'default'
PageComponent = resolvePageComponent(componentKey, theme)
```

`resolvePageComponent` and `resolveComponent` fall back to the `default` entry (the v2 engine) for unknown theme names or missing keys. Scaffold copies reuse their source theme's imports, so check that pages import the new theme's own `./Navbar` and `./Footer` (see Step 1).

## Steps

### 1. Scaffold the new theme directory

```bash
npm run scaffold:theme -- <theme-name> [--from <legacyTheme>]
```

The scaffold copies an existing **legacy** theme, `wire` by default (`--from adn|oldtown|wire|foghorn|financier|business-globe`): all top-level `*.tsx`, the `components/` folder and `index.ts` (same keys, same relative imports; the copy sits at the same depth). It refuses when `<theme-name>` already exists, when `<theme-name>` or `--from` is a v2 key, and when the source theme is unknown. Pick the source closest to the target look.

**After scaffolding, check Navbar/Footer imports.** Any page in the source that still imports `../../components/Navbar` or `../../components/Footer` (e.g. `oldtown`, parts of `wire`) will keep using the shared ones:

```bash
grep -rn "from '../../components/Navbar'\|from '../../components/Footer'" src/app/_pages/<theme-name>/
```

Switch hits to `./Navbar` / `./Footer`:

```bash
sed -i '' "s|from '../../components/Navbar'|from './Navbar'|g" src/app/_pages/<theme-name>/*.tsx
sed -i '' "s|from '../../components/Footer'|from './Footer'|g" src/app/_pages/<theme-name>/*.tsx
```

### 2. Register the legacy theme

Add the key to `LEGACY_THEMES` in `src/app/themeKeys.ts` (this also makes it a known key and keeps it out of
`V2_THEMES`, so it gets no accessory values), then add the barrel to `LEGACY_THEME_MAP` in
`_themeRouter.tsx`:

```ts
// src/app/_themeRouter.tsx
import * as Wire     from './_pages/wire';
import * as MyTheme  from './_pages/<theme-name>';   // ← add this

const LEGACY_THEME_MAP: Record<LegacyTheme, PageComponents> = {
  wire:           Wire,
  '<theme-name>': MyTheme,                           // ← add this
  // …other legacy themes
};
```

`pagesFor`, `resolvePageComponent` and `resolveComponent` require no changes. Any theme not in
`LEGACY_THEMES` is rendered by the v2 barrel.

### 3. Barrel shape

The scaffolded `index.ts` already matches its source. The authoritative shape is the `PageComponents` interface in `src/app/_themeRouter.tsx` (`ArticleGallery` is optional; legacy themes fall back to `Article`). Keep `UIStyleGuide` and `ArticleOrganism` exports; point `ArticleOrganism` at `./components/ArticleOrganism` if the theme overrides it.

### 4. Customise page templates

Start with **Navbar** and **Footer** — they establish the visual identity. Then customise page layouts as needed.

**Import rules inside a theme subdirectory:**
- Shared primitives: `../../components/…` (Figure, Grouphead, MainImage, etc.)
- Sibling page templates: `./LiveblogPosts` (same directory)
- Theme component overrides: `./components/ArticleOrganism` (components/ subfolder)
- Types/utilities: `@/types/…`, `@/utilities/…` (unchanged)

**Reusable primitives (never copy — always import from `../../components/`):**

| Import | What it provides |
|---|---|
| `../../components/webpage/Main` | Fetches + renders 'main' linked objects via shared ArticleOrganism |
| `../../components/webpage/Context` | Fetches + renders 'context' linked objects |
| `../../components/webpage/Insight1/2` | Fetches + renders insight sections |
| `../../components/base/Organism/ArticleOrganism/` | Article card (xl/lg/md/sm/xs sizes) |
| `../../components/base/Organism/ArticleHero/` | Featured hero card |
| `../../components/contentElements/Grouphead` | Article metadata block |
| `../../components/contentElements/MainImage` | Article main image |
| `../../components/contentElements/Figure` | Image with softcrop |
| `../../components/contentElements/HeroCoverImage` | Full-bleed hero image |
| `../../components/contentElements/Summary` | Article summary |
| `@/utilities/content` → `renderContent()` | JSON → React content tree |

**When to bypass `Main`/`Context`:** If your theme needs a structurally different article card layout (not just CSS), skip `Main`/`Context` in your page and fetch linked objects directly, then render your themed organism. See `_pages/wire/HomeWebPage.tsx` for the reference pattern.

### 5. (Optional) Add theme-specific component overrides

For structural variation in a shared component (not just CSS), create the component under `_pages/<theme-name>/components/`:

```tsx
// src/app/_pages/<theme-name>/components/ArticleOrganism.tsx
'use client';
import ArticleOverlay from '../../../components/base/ArticleOverlay';
// ... theme-specific card layout
export default ArticleOrganism;
```

Export it from the theme barrel, replacing the shared re-export:

```ts
// src/app/_pages/<theme-name>/index.ts
export { default as ArticleOrganism } from './components/ArticleOrganism';
```

In any page that uses it, call `resolveComponent` or import directly:

```ts
import { resolveComponent } from '../../_themeRouter';
import ArticleOrganismDefault from '../../components/base/Organism/ArticleOrganism';
const ArticleOrganismComponent = resolveComponent('ArticleOrganism', theme) ?? ArticleOrganismDefault;
```

See `_pages/wire/` as the reference implementation for component overrides.

### 6. Set the theme in Neon CMS

On the site node's attributes, set:
```json
{ "theme": "<theme-name>" }
```

The front-office reads this from `pageDataJSON.siteNode.attributes.theme`.

### 7. (Optional) Add theme-specific CSS

Add a CSS file at `src/app/themes/<theme-name>.css` and import it in `src/app/globals.css`:
```css
@import './themes/<theme-name>.css';
```

Scope all rules with `.root[data-theme="<theme-name>"] { … }` to avoid leaking into other themes. Prefer CSS variable overrides for visual differences (color, font, spacing) — save structural component overrides for layout changes that CSS cannot express.

**Absolute-positioned overlay content** (e.g. title overlaid on hero image): always add `margin-left: auto; margin-right: auto;` alongside `max-width` so the block centres on wide viewports and aligns with the body column beneath it.

### 8. (Optional) Add theme fonts

Add a Google Fonts `<link>` in `src/app/layout.tsx` and reference the font via `--font-headline` or a new CSS variable in your theme CSS file.

## Checklist

- [ ] `npm run scaffold:theme -- <theme-name> [--from <legacyTheme>]` ran successfully
- [ ] **Navbar/Footer import paths checked** in all scaffold-copied pages (`../../components/Navbar` → `./Navbar`, same for Footer) — verify with `grep -rn "from '../../components/Navbar'" src/app/_pages/<theme-name>/`
- [ ] Theme registered in `src/app/_themeRouter.tsx` (key in `LEGACY_THEMES` in `src/app/themeKeys.ts`, `import` + `LEGACY_THEME_MAP` entry)
- [ ] `index.ts` satisfies `PageComponents` (`UIStyleGuide`, `ArticleOrganism` exported)
- [ ] `Navbar.tsx` customised for the new brand
- [ ] `Footer.tsx` customised for the new brand
- [ ] Key page layouts customised (`HomeWebPage.tsx`, `Article.tsx`, `SectionWebPage.tsx`)
- [ ] `npx tsc --noEmit` passes with zero errors
- [ ] Theme attribute set on the Neon site node
- [ ] (Optional) `src/app/themes/<theme-name>.css` created and imported in `globals.css`
- [ ] (Optional) Component overrides created under `_pages/<theme-name>/components/`

## Reference themes

| Theme | Key patterns |
|---|---|
| `adn` | Three-layer Navbar, 70/30 article body/sidebar, dark footer, ad slots |
| `oldtown` | Blackletter masthead, 720px serif column, Oldtown-rule `<hr>`, no sidebar |
| `wire` | Monospace IBM Plex, feed-row ArticleOrganism with priority badges, panel-header chrome |

`wire` is the reference for component-level overrides (`_pages/wire/components/ArticleOrganism.tsx`).
