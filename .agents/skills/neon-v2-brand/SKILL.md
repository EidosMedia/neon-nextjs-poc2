---
name: neon-v2-brand
description: "Add a brand to the v2 rendering engine (src/app/_v2). Use when adding a new v2 brand, a new site look built from a design system, or turning a design-system tokens.json into a theme. Triggers: 'add brand', 'new v2 brand', 'new site look', 'design system to theme'."
argument-hint: "Brand key in lowercase (e.g. 'sportsarena') plus the DS tokens.json and brand boards"
---

# Add a v2 Brand

The v2 engine (`src/app/_v2/`) renders every page type for the keys in `V2_THEMES`
(`default`, `theglobe`, `sportsarena`, `nextfrontier`). `default` and `theglobe` are The Globe; unknown
or empty theme values also fall back to The Globe in `getBrand`. A brand changes tokens, fonts, chrome
and brand modules only; page structure is shared.

## When to use this vs `neon-new-theme`

- `neon-v2-brand` (this skill): a new look on the shared v2 engine. Same zones, items, leaves and
  accessories contract; per-brand tokens, chrome and modules.
- `neon-new-theme`: legacy structural themes (`adn`, `oldtown`, `wire`, `foghorn`, `financier`,
  `business-globe`) that fork page templates under `src/app/_pages/<theme>/`. Only for a rendering
  that the v2 engine cannot express.

## Inputs

- A design-system `tokens.json` (colours, fonts, radii, spacing, type scale).
- Brand boards: header, footer, item/leaf looks and any brand modules (breaking banner, ticker...).

## Steps

1. **Register the key.** Add it to `V2_THEMES` in `src/lib/accessories/definitions.ts` (so
   `/api/accessories?theme=<key>` serves the shared document stamped with it and `data-engine="v2"`
   is set) and map it to `V2` in `THEME_MAP` in `src/app/_themeRouter.tsx`. In
   `src/app/_v2/brands/registry.ts` add the key to `BrandKey` and `THEME_TO_BRAND`
   (`getBrand` falls back to The Globe otherwise). Also add it to `V2_KEYS` in
   `scripts/scaffold-theme.mjs`.
2. **Tokens.** Create `src/app/_v2/brands/<key>/tokens.css` as `@layer v2 { .root[data-theme="<key>"] { ... } }`
   defining every name in `REQUIRED_TOKENS` (`registry.ts`: colours, `--v2-font-*`, radii, `--v2-space-*`,
   `--v2-fs-*`) and `color-scheme`. `src/test/v2-brands.test.ts` fails when one is missing. Import it
   from `src/app/globals.css` next to the other brand tokens, before `./_v2/styles/v2.css`.
3. **Brand entry.** Add a `BRANDS` entry in `registry.ts`: `name`, `scheme`, `fontsHref` (Google Fonts
   URL), `header`/`footer` style keys, `leafRail`, `leafWidths` (`main`/`body`/`rail`),
   `compositionDefaults` per zone (used by `composition: auto`), and `moduleKeys`.
4. **Chrome.** Add header and footer styles to `src/app/_v2/chrome/frame.css` (inside `@layer v2`),
   scoped to `.root[data-theme="<key>"]`, and extend the `header`/`footer` union types and the
   `Header.tsx`/`Footer.tsx` switches if the brand needs a new style key.
5. **Brand modules.** A module is a server component taking `BrandModuleProps` (`{ block }`) in
   `src/app/_v2/brands/<key>/modules/`, with `keys.ts` exporting `MODULE_KEYS` (block `sys.type`
   values), a `modules.css` imported from `_v2/styles/v2.css`, and an entry in `BRAND_MODULES` in
   `src/app/_v2/brands/moduleRegistry.ts`. Keep `registry.ts` React-free: it only imports
   `MODULE_KEYS` (`Brand.moduleKeys`); components live in `moduleRegistry.ts`. Read block data only via
   the helpers in `brands/moduleData.ts` and route every link through `safeHref` (rejects unsafe
   schemes). Modules must not touch the Neon block model directly; `lib/blocks.ts` is the only
   module that knows it.
6. **`/ui` fixtures.** Add the brand's module fixtures to `src/app/_v2/ui/fixtures.ts`
   (`MODULE_FIXTURES`) so the style guide shows them. No fixtures outside `/ui`.

## CSS conventions

- `src/app/globals.css` declares the layer order `@layer theme, base, components, v2, utilities;`.
  All v2 CSS lives in `@layer v2`, so it beats legacy `components` rules and loses to utilities.
- Unlayered legacy globals in `globals.css` would otherwise beat any layered v2 rule. They are
  excluded from v2 pages with `:where(:not(.root[data-engine="v2"] *))` appended to the selector
  (zero specificity). Any new unlayered global element rule must use the same exclusion.
- Scope brand rules with `.root[data-theme="<key>"]`; never leak across themes.

## Editor DOM contract (checklist, `src/app/_v2/items/ItemFrame.tsx`)

Every teaser item goes through `ItemFrame`; do not bypass it.

- [ ] Wrapped in `ArticleOverlay` (inspect, publish/unpublish, info) with the real `node`.
- [ ] The link carries `id={node.id.replaceAll('-', '_')}` and its `href` is `''` while
      `inspectItems` is on (navigation neutralised for editors).
- [ ] Title is `<h2|h3 id={titleId} data-type="title"><p>text</p></h2|h3>`; the id and the inner `<p>`
      are what in-context edit targets. Wrapped in `ContentEditable` (`minimal`) only when `titleId` exists.
- [ ] Summary is `<div id={summaryId} data-type="summary"><p>text</p></div>`, wrapped in
      `ContentEditable` only when `summaryId` exists; an empty summary renders only in inspect mode.
- [ ] Missing image, standfirst or byline leaves no gap.
- [ ] Teaser fields come from `resolveTeaserFields` (`lib/itemView.ts`); no raw HTML injection
      (`zonesummary` is sanitized by `sanitizeZoneSummary` and rendered as React elements).

## `/ui` gate

`/ui` renders the style guide with fixtures for the site's brand. `canShowStyleGuide`
(`src/app/_v2/ui/gate.ts`) allows it with an `editorialauth` cookie or when `NODE_ENV !== 'production'`;
otherwise 404. Never serve fixtures to anonymous LIVE readers.

## Verification checklist

- [ ] `npm run type-check`, `npm run lint` (no new warnings over the baseline), `npm test -- --runInBand`
      (`src/test/v2-*.test.ts`, `accessories-registry.test.ts`; `v2-brands.test.ts` enforces
      `REQUIRED_TOKENS`).
- [ ] `/ui` on a site with the new theme: every item variant x toggles, composition, leaf variant and
      the brand modules look like the boards.
- [ ] Manual pass in both PREVIEW and LIVE for Home, Section, Article (each leaf variant), Liveblog
      and Gallery: inspect highlight; in-context title/summary edit and save; publish/unpublish from
      the card; version panel and rollback; promotion; Preview/Live switch; sticky header under the bar.
- [ ] Regression: one page each of `business-globe`, `wire` and `adn` renders unchanged.

## Gotchas

- Theme comes from the site node (`attributes.theme`) and LIVE pages are cached with `'use cache'`.
  After changing a site's theme, or deploying brand changes that affect cached markup, invalidate the
  cache (`POST /api/cache` for the site or paths) or restart the dev server; otherwise stale
  pages keep the old brand. See `frontend-cache-management`.
- Block modules are only reachable once Neon delivers block bodies; until then they show with fixtures
  in `/ui` only.

## Never

- Fork page templates per brand (that is a legacy theme; use `neon-new-theme`).
- Inject raw HTML, or add `dangerouslySetInnerHTML` for CMS text.
- Show fake data in LIVE (fixtures belong to `/ui` only; PREVIEW placeholders only for blocks).
- Edit `src/app/components/**` for v2 styling (that is the legacy component set).
