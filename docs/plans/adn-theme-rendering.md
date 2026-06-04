# ADN Theme — Alternate Rendering Structure

## Overview

The POC site supports structurally different HTML rendering based on the `theme` attribute set on the Neon CMS **site node**. When `siteNode.attributes.theme === "adn"`, the routing layer selects ADN-specific page templates instead of the default "globe" ones. All data fetching, SDK usage, and content-rendering primitives remain unchanged.

## Architecture

```
src/app/
├── _pages/
│   ├── default/        ← Default ("The Globe") theme templates
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── Article.tsx
│   │   ├── ArticleLongform.tsx
│   │   ├── HomeWebPage.tsx
│   │   ├── SectionWebPage.tsx
│   │   ├── WebpageColumnsLayout.tsx
│   │   ├── AboutPage.tsx
│   │   ├── DefaultLanding.tsx
│   │   ├── DefaultSection.tsx
│   │   ├── LoginPage.tsx
│   │   ├── SearchPage.tsx
│   │   ├── Liveblog.tsx
│   │   ├── LiveblogPosts.tsx
│   │   └── index.ts        ← barrel export
│   └── adn/            ← ADN (adnkronos.com-style) theme templates
│       ├── Navbar.tsx       (utility bar + dark primary nav + breaking news strip)
│       ├── Footer.tsx       (multi-column + social icons + legal bar)
│       ├── Article.tsx      (breadcrumb + share bar + sidebar)
│       ├── HomeWebPage.tsx  (70/30 layout + sidebar boxes)
│       ├── SectionWebPage.tsx (section header + 70/30 layout)
│       └── … (same set as default)
├── _themeRouter.tsx    ← maps (componentKey, theme) → React component
└── [[...slug]]/page.tsx ← calls resolvePageComponent() instead of a switch
```

## How Routing Works

```
Request → middleware (proxy.ts)
  → resolves site via hostname
  → sets x-neon-site-name, x-neon-backend-url headers

[[...slug]]/page.tsx
  → fetches pageDataJSON from Neon backend
  → reads theme = pageDataJSON.siteNode.attributes.theme ?? 'default'
  → resolves componentKey from baseType (e.g. 'homewebpage' → 'HomeWebPage')
  → calls resolvePageComponent(componentKey, theme)
  → renders <PageComponent data={pageDataJSON} />
```

`_themeRouter.tsx` holds the `THEME_MAP`:

```ts
const THEME_MAP = {
  default: Default,  // imports from _pages/default/index.ts
  adn:     Adn,      // imports from _pages/adn/index.ts
};
```

## Adding a New Theme

1. Run the scaffold command:

   ```bash
   npm run scaffold:theme -- my-theme
   ```

   This copies `_pages/default/` → `_pages/my-theme/` with a ready-to-use barrel export.

2. Register it in `_themeRouter.tsx`:

   ```ts
   import * as MyTheme from './_pages/my-theme';

   const THEME_MAP = {
     default: Default,
     adn:     Adn,
     'my-theme': MyTheme,
   };
   ```

3. Customise the templates in `_pages/my-theme/`.

4. Set `theme: "my-theme"` on the Neon site node attributes.

## Component Reuse Policy

The following primitives are theme-agnostic and should be reused across all themes:

| Component | Location | Purpose |
|---|---|---|
| `renderContent()` | `src/utilities/content.tsx` | JSON → React content tree |
| `ArticleOrganism` | `src/app/components/base/Organism/ArticleOrganism/` | Article card (5 size variants) |
| `ArticleHero` | `src/app/components/base/Organism/ArticleHero/` | Featured hero card |
| `Grouphead` | `src/app/components/contentElements/Grouphead.tsx` | Article metadata block |
| `Figure` | `src/app/components/contentElements/Figure.tsx` | Image with softcrop |
| `MainImage` | `src/app/components/contentElements/MainImage.tsx` | Article main image |
| `HeroCoverImage` | `src/app/components/contentElements/HeroCoverImage.tsx` | Full-bleed hero image |
| `Summary` | `src/app/components/contentElements/Summary.tsx` | Article summary |
| `Main`, `Context`, `Insight1/2` | `src/app/components/webpage/` | Linked-object section fetchers |

Theme-specific components (Navbar, Footer, page templates) live inside their `_pages/<theme>/` directory.

## ADN Theme Design Reference

Source: adnkronos.com (fetched 2026-05-25)

**Palette:**
- Page background: white (`#ffffff`)
- Primary nav background: dark gray/black (`#111827` — Tailwind `gray-900`)
- Primary accent: red (`#E30613`)
- Body text: dark gray (`#374151`)
- Borders: light gray (`#e5e7eb`)

**Typography:**
- Headlines: `Barlow Condensed` (loaded in `layout.tsx`)
- Body: inherited from base (Source Sans 3)
- Nav labels: uppercase, `text-sm font-semibold tracking-wide`

**Key structural features:**
- `Navbar`: three-layer — utility bar (white) + primary nav (dark) + breaking-news strip (white+red pill)
- `HomeWebPage`: 70/30 split (content + sidebar with social/focus/in-evidenza boxes)
- `Article`: breadcrumb + share bar + 70/30 split (body + sticky sidebar)
- `SectionWebPage`: section label with red left border + 70/30 split
- `Footer`: multi-column category grid + bottom bar with logo, social icons, legal links

## Verification Checklist

- [ ] `npm run scaffold:theme -- test-theme` creates `src/app/_pages/test-theme/` with all templates
- [ ] `npm run type-check` passes with no errors
- [ ] Default theme (no `theme` attribute or `theme: "default"`) renders identical to the previous behaviour
- [ ] `theme: "adn"` on the site node renders ADN Navbar (dark primary nav + breaking news strip)
- [ ] `theme: "adn"` Article page shows breadcrumb, share bar, and right sidebar
- [ ] `theme: "adn"` HomeWebPage shows 70/30 layout with sidebar boxes
- [ ] `npm run build` completes successfully
