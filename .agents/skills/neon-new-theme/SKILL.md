---
name: neon-new-theme
description: "Add a new visual theme to the front-office. Use when creating a new brand theme, site identity, or alternate rendering structure. Triggers: 'add theme', 'new theme', 'create theme', 'new brand', 'alternate rendering'."
argument-hint: "Theme name in lowercase-kebab (e.g. 'adn', 'my-brand')"
---

# Add a New Rendering Theme

This project supports per-site structural themes: when `siteNode.attributes.theme` matches a registered key, the entire page rendering (Navbar, Footer, page layouts, and optionally individual components) switches to a theme-specific set. Theming works at two levels:

- **Page level** — full page templates (HomeWebPage, Article, etc.) resolved via `resolvePageComponent`
- **Component level** — shared sub-page components (ArticleOrganism, etc.) resolved via `resolveComponent`

Both functions read from the same `THEME_MAP` in `_themeRouter.tsx`.

## Directory structure

```
src/app/
├── _pages/                        ← default theme templates (root = default)
│   ├── Article.tsx
│   ├── HomeWebPage.tsx
│   ├── … (all page types)
│   ├── index.ts                   ← barrel export — required
│   └── <theme-name>/              ← one subdirectory per additional theme
│       ├── Navbar.tsx
│       ├── Footer.tsx
│       ├── Article.tsx
│       ├── … (page overrides)
│       ├── components/            ← theme-specific component overrides
│       │   └── ArticleOrganism.tsx
│       └── index.ts               ← barrel: exports pages + component overrides
└── _themeRouter.tsx               ← maps (componentKey, theme) → component
```

Theme selection happens in `src/app/[[...slug]]/page.tsx`:
```
theme = pageDataJSON.siteNode.attributes.theme ?? 'default'
PageComponent = resolvePageComponent(componentKey, theme)
```

`resolvePageComponent` and `resolveComponent` both fall back to the default theme for unknown theme names or missing keys, so new themes only need to override what differs.

## Steps

### 1. Scaffold the new theme directory

```bash
npm run scaffold:theme -- <theme-name>
```

This copies all `_pages/*.tsx` files into `_pages/<theme-name>/`, rewrites their import paths from `../components/` to `../../components/`, and generates `index.ts`.

### 2. Register in `_themeRouter.tsx`

```ts
// src/app/_themeRouter.tsx
import * as Default  from './_pages';
import * as Adn      from './_pages/adn';
import * as MyTheme  from './_pages/<theme-name>';   // ← add this

const THEME_MAP: Record<string, typeof Default> = {
  default:        Default,
  adn:            Adn,
  '<theme-name>': MyTheme,                           // ← add this
};
```

`resolvePageComponent` and `resolveComponent` require no changes — they both read `THEME_MAP`.

### 3. Add required barrel entries

The scaffold generates `index.ts` with page exports. You must also add entries for any shared components that every barrel must declare to satisfy the TypeScript type shape. Currently required:

```ts
// src/app/_pages/<theme-name>/index.ts  (add these lines)
export { default as UIStyleGuide } from '../../components/baseComponents/UIStyleGuide';
export { default as ArticleOrganism } from '../../components/base/Organism/ArticleOrganism';
// ^ replace with './components/ArticleOrganism' if this theme overrides it
```

Check `src/app/_pages/index.ts` (the default barrel) for the full authoritative list of required keys — all theme barrels must export the same set.

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

### 8. (Optional) Add theme fonts

Add a Google Fonts `<link>` in `src/app/layout.tsx` and reference the font via `--font-headline` or a new CSS variable in your theme CSS file.

## Checklist

- [ ] `npm run scaffold:theme -- <theme-name>` ran successfully
- [ ] Theme registered in `src/app/_themeRouter.tsx` (`import` + `THEME_MAP` entry)
- [ ] `UIStyleGuide` and `ArticleOrganism` re-exports added to `index.ts` (match default barrel shape)
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
