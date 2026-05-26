---
name: neon-new-theme
description: "Add a new visual theme to the front-office. Use when creating a new brand theme, site identity, or alternate rendering structure. Triggers: 'add theme', 'new theme', 'create theme', 'new brand', 'alternate rendering'."
argument-hint: "Theme name in lowercase-kebab (e.g. 'adn', 'my-brand')"
---

# Add a New Rendering Theme

This project supports per-site structural themes: when `siteNode.attributes.theme` matches a registered key, the entire page rendering (Navbar, Footer, page layouts) switches to a theme-specific set of components — not just CSS.

## Architecture overview

```
src/app/
├── _pages/                  ← Default theme templates (root = default)
│   ├── Navbar.tsx            ← shared by default theme
│   ├── Footer.tsx
│   ├── Article.tsx
│   ├── HomeWebPage.tsx
│   ├── … (all page types)
│   ├── index.ts              ← barrel export — required
│   └── <theme-name>/         ← one subdirectory per additional theme
│       ├── Navbar.tsx
│       ├── Footer.tsx
│       ├── Article.tsx
│       ├── … (same set as root)
│       └── index.ts
└── _themeRouter.tsx          ← maps (componentKey, theme) → component
```

Theme selection happens in `src/app/[[...slug]]/page.tsx`:
```
theme = pageDataJSON.siteNode.attributes.theme ?? 'default'
PageComponent = resolvePageComponent(componentKey, theme)
```

`resolvePageComponent` falls back to the default theme for unknown theme names, so every new theme only needs to override what differs.

## Steps

### 1. Scaffold the new theme directory

```bash
npm run scaffold:theme -- <theme-name>
```

This copies all `_pages/*.tsx` files into `_pages/<theme-name>/`, rewrites their import paths from `../components/` to `../../components/`, and generates `index.ts`.

### 2. Register in `_themeRouter.tsx`

```ts
// src/app/_themeRouter.tsx
import * as Default from './_pages';
import * as Adn     from './_pages/adn';
import * as MyTheme from './_pages/<theme-name>';   // ← add this

const THEME_MAP: Record<string, typeof Default> = {
  default:      Default,
  adn:          Adn,
  '<theme-name>': MyTheme,                           // ← add this
};
```

### 3. Customise the templates

Start with **Navbar** and **Footer** — they establish the visual identity. Then customise page layouts as needed.

**Import rules inside a theme subdirectory:**
- Shared primitives: `../../components/…` (ArticleOrganism, Figure, Grouphead, etc.)
- Sibling templates: `./LiveblogPosts` (same directory)
- Types/utilities: `@/types/…`, `@/utilities/…` (unchanged)

**Reusable primitives (never copy these — always import):**

| Import | What it provides |
|---|---|
| `../../components/webpage/Main` | Fetches + renders 'main' linked objects |
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

### 4. Set the theme in Neon CMS

On the site node's attributes, set:
```json
{ "theme": "<theme-name>" }
```

The front-office reads this from `pageDataJSON.siteNode.attributes.theme`.

### 5. (Optional) Add theme-specific CSS

Add a CSS file at `src/app/themes/<theme-name>.css` and import it in `src/app/globals.css`:
```css
@import './themes/<theme-name>.css';
```

Scope all rules with `.root[data-theme="<theme-name>"] { … }` to avoid leaking into other themes.

### 6. (Optional) Add theme fonts

Add a Google Fonts `<link>` in `src/app/layout.tsx` and reference the font via `--font-headline` or a new CSS variable in your theme CSS file.

## Checklist

- [ ] `npm run scaffold:theme -- <theme-name>` ran successfully
- [ ] Theme registered in `src/app/_themeRouter.tsx`
- [ ] `Navbar.tsx` customised for the new brand
- [ ] `Footer.tsx` customised for the new brand
- [ ] Key page layouts customised (`HomeWebPage.tsx`, `Article.tsx`, `SectionWebPage.tsx`)
- [ ] `npm run type-check` passes
- [ ] Theme attribute set on the Neon site node
- [ ] (Optional) `src/app/themes/<theme-name>.css` created and imported in `globals.css`

## Reference: ADN theme (adnkronos.com)

The `adn` theme is the first non-default theme in this project and serves as a reference implementation. Key patterns it demonstrates:

- **Navbar**: three-layer (utility bar → dark primary nav → breaking-news strip)
- **Article**: breadcrumb + share bar + 70/30 body/sidebar split
- **HomeWebPage**: full-width article feed with ad slots, no persistent sidebar
- **Footer**: dark background, multi-column category grid, social icons, legal bar
- CSS variables overridden in `src/app/themes/adn.css` under `.root[data-theme="adn"]`
