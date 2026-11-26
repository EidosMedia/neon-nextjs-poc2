# Neon CMS Front-Office — Project Agent Instructions

This is a front-office web application powered by **Neon CMS**, using its TypeScript SDK to
fetch content, resolve sites, authenticate users, and render content types.

## Project Ownership

Keep this project's agent guidance self-contained. Its instructions and skills must not depend
on agent instructions or skills from an adjacent Neon workspace; the POC may be cloned and used
independently. Neon integration details in this file describe the product contracts consumed by
the frontend, while the Neon workspace owns guidance about Neon backend implementation.

## Neon Integration Capability Inventory

This inventory describes the integration areas represented by the POC and is not a claim that
every capability is complete or supported in every deployment. Keep it aligned with the
capability overview in the Neon technical documentation's `front-end-poc` section.

1. Neon security, Front Office APIs, and site-host APIs.
2. NeonWebApp editor authentication for preview and live administration.
3. Editor preview workflows, including version history and in-context editing of article content
  items used in article pages or teaser renderings. Persistence of page-specific teaser overrides
  has not been verified.
4. Contextual preview launched from the Neon webpage editor.
5. Live editor administration, including history, rollback, unpublish, and promotion.
6. Multi-site delivery and SaaS site discovery.
7. Multiple frontend themes.
8. Frontend navigation using Neon menus.
9. Site and editorial organization, including sites, sections, and content placements.
10. Neon-owned content URL patterns, canonical URLs, aliases, and redirects.
11. Neon push invalidation integration.
12. Site-level web-user authentication and access configured in Neon; web users remain separate
  from editorial users.
13. Accessory definitions and page/zone/link metadata integration (contract version 1.0). One shared
  `src/app/_v2/accessories.json` (`"version": "1.0"`, file `theme` `default`) is served for every
  key in `V2_THEMES` (`default`, `theglobe`, `sportsarena`, `nextfrontier`, defined in
  `src/app/themeKeys.ts`) by `/api/accessories`; `getAccessoryDefinitions(theme)` in
  `src/lib/accessories/definitions.ts` returns a frozen copy with `theme` stamped to the requested key,
  so Neon stores values per theme and the resolver's exact-theme rule still holds. A brand that needs
  its own accessories adds a complete document (same format, version `1.0`) at
  `src/app/_v2/brands/<key>/accessories.json` and registers it with a static import in
  `BRAND_ACCESSORIES` (`src/app/_v2/brands/accessories.ts`, empty by default). The override replaces
  the shared document for that theme (no merging); `src/test/accessories-registry.test.ts` checks that
  every override file on disk is registered and valid. Legacy themes (`adn`, `oldtown`, `wire`, `foghorn`, `financier`, `business-globe`),
  unknown themes and prototype names get 404 and no values (`INVALIDATE_NEXTJS_HEADER_VALUE` must be set
  or every call is 404). The document is compiled into the image.
  - Page accessories: `header` (`enabled`, `sectionsMenu`, `variant`), `footer` (`enabled`, `menu`,
    `variant`), `articleLeaf`, `liveblogLeaf`, `galleryLeaf`. Zone accessory `zone` (zones `main`,
    `context`, `insight1`, `insight2`, `insight3`): `showTitle`, `composition`, `titleStyle`, `zonetitle`,
    `zonesummary`, `moreLink`, `sponsorName`. Link accessories `articleItem`, `liveblogItem`,
    `galleryItem`. All of these are rendered by the v2 engine; the special routes (`search`, `about`,
    `login`, NotFound) have no page model and always render header and footer with defaults.
  - Newsletter page accessory `newsletter` controls the email header, title block, footer, links and
    optional forward text for `newsletter` and `newsletterstory`. `newsletterZone` controls heading,
    item layout and image/summary/label visibility in newsletter `main` and `context`; the generic
    `zone` accessory supplies zone title, summary and more link. Fully qualified stored types such as
    `webpage/newsletter` match the corresponding base type and subtype; version mismatches still do not.
  - Sports Arena keeps its hamburger visible on desktop and mobile when `header.sectionsMenu`
    is enabled (except the minimal header). Its icon-only button has a 44px hit target, centered
    vertically in the pill, with a visually hidden accessible label. Desktop uses `FullMenu` or the sitemap alongside
    inline `MainMenu`; mobile uses `FullMenu`, then `MainMenu`, then the sitemap.
    Its warm palette is defined in `brands/sportsarena/tokens.json` and mirrored in `tokens.css`;
    live match status is green, while form errors remain crimson.
  - The v2 header shows the site's `logoUrl` beside its name when the image loads; a brand-colored
    disc remains visible while loading or if the logo is missing or fails. Arena's disc uses initials.
    Legacy site-logo paths beginning `/neon/api/site/resources/` use the frontend `/resources/` proxy.
  - v2 liveblog teasers show entry images by default in basic section/site listings and webpage
    zones, including the `pinnedSummary` variant. An explicit link accessory `image: false` hides
    the image. Sharing defaults off; an explicit link accessory `share: true` enables it.
    `/ui` demonstrates both image-on and image-off variants.
  - Liveblog `compact` teasers reuse article compact sizing (120x80 thumbnail and h4 title),
    placing the red dot and Live label left of the overhead, with the article-style byline/date
    and no post timeline or summary. `auto` selects compact for compact slots; explicit variants
    remain unchanged. `/ui` includes all image/share combinations as LIV-13 through LIV-16.
  - All themes share `useLiveblogPosts` (`src/hooks/useLiveblogPosts.ts`) and a first-load skeleton
    for timelines and leaf feeds. Embedded initial posts render immediately; background polls
    retain visible posts. Empty and failed responses are distinct from loading, and failures
    without existing posts show a retry status. Skeleton animation respects reduced motion.
  - Exact-type exclusion (`resolveAccessories.ts`): when any definition at a level matches the exact
    `type` (page `types`, or `linkedTypes` at link level), definitions matching only through the
    `baseType` are dropped whatever their names. So `article/gallery` gets only `galleryLeaf`
    (not `articleLeaf`), gallery links get only `galleryItem`, and other article subtypes fall back to
    `articleLeaf`/`articleItem`. Stored values with a different definition `version` are ignored.
  - The zone summary is untrusted HTML: it is re-sanitized by `sanitizeZoneSummary` and rendered as React
    elements, never injected as raw HTML; `zonetitle` is plain text.
  - Do not apply v2 values in legacy themes. Neon resolves the nearest nonblank section/site-root theme
    and requests the `default` definition document when neither level declares a theme. The POC falls
    back to the default (v2) page components for a missing theme, but an explicit unknown theme must not
    consume accessory values.
  - Content blocks (`headers`, `includes`, `sidebars`, `footers`): `src/app/_v2/lib/blocks.ts` is the
    only module that knows the block model (assumed `model.data.links.pagelink.<area>`; the body
    contract is still undefined in Neon). `BlockSlot` renders a brand module (by block `sys.type`), or a
    webpage-like block through `ZoneRenderer`, or a dashed placeholder in PREVIEW; nothing in LIVE.

## Project Layout

| Path | Purpose |
|---|---|
| `src/neon-frontoffice-ts-sdk/` | Local Neon CMS TypeScript SDK (source of truth for types/services) |
| `src/app/[[...slug]]/page.tsx` | Catch-all route — resolves CMS `baseType` to a page component |
| `src/app/_v2/` | v2 rendering engine for `default`/`theglobe`/`sportsarena`/`nextfrontier` (barrel `index.ts` implements `PageComponents`), shared `accessories.json` |
| `src/app/_v2/lib/` | Pure modules: `layout`, `zoneItems`, `itemView`, `leafView`, `settings`, `share`, `blocks` |
| `src/app/_v2/brands/` | `registry.ts` (`getBrand`, `REQUIRED_TOKENS`), `moduleRegistry.ts`, per-brand `tokens.css` and block `modules/` |
| `src/app/_v2/{chrome,zones,items,leaves,blocks,pages,ui}/` | Header/footer, zone compositions, teaser items (`ItemFrame` editor contract), leaves, block slots, pages, `/ui` style guide and gate |
| `src/app/_v2/special/` | Shared login and search (`LoginForm`, `Search`, `special.css`); brands restyle via component tokens and `brands/<key>/chrome.css` |
| `src/app/themeKeys.ts` | Theme lists: `V2_THEMES`, `LEGACY_THEMES`, `THEME_KEYS`, `isLegacyTheme()`, `isV2Theme()`, `resolveRenderTheme()` |
| `src/app/_themeRouter.tsx` | `LEGACY_THEME_MAP` (legacy theme key to `PageComponents`) and `pagesFor()`: legacy themes use their `_pages/<theme>` barrel, every other theme uses the v2 barrel |
| `src/app/_pages/` | Legacy (v1) theme folders (`adn`, `oldtown`, `wire`, `foghorn`, `financier`, `business-globe`), `NewsletterWebpage`, `LiveblogPosts` |
| `src/app/api/` | API endpoints — thin wrappers over the SDK with auth context |
| `src/app/components/` | UI components (Navbar, Footer, shared layout) |
| `src/types/models/` | Extended CMS model types (`ArticleModel`, `WebpageModel`, `LiveblogModel`) |
| `src/utilities/security.tsx` | `getAuthOptions()` — reads httpOnly cookies for auth context |
| `src/services/utils.ts` | `handleServicesError()`, `getAPIHostnameConfig()` |
| `src/lib/features/` | Redux slices: `loggedUserSlice`, `webauthSlice`, `versionsSlice` |
| `src/hooks/` | Client hooks: `useAuth` (React Query), `useWebauth` (Redux + localStorage) |

## Neon CMS Core Concepts

- **`NeonConnection`** — main SDK facade, available globally as `connection` (set up in `instrumentation.ts`)
- **`PageData<Model>`** — generic wrapper returned by `makePageRequest()`; all page components receive this
- **`Site`** — top-level site object (used by static pages like login, search, about)
- **`baseType`** — CMS discriminator field at `pageData.model.data.sys.baseType`; drives page dispatch
- **`type`** — secondary discriminator at `pageData.model.data.sys.type`; used within a `baseType`

## Content Type Dispatch

`[[...slug]]/page.tsx` calls `connection.makePageRequest(url, auth)`, then switches on `baseType`:

| `baseType` | Page component |
|---|---|
| `webpage` | `WebpageColumnsLayout` |
| `sectionwebpage` | `SectionWebPage` |
| `homewebpage` | `HomeWebPage` |
| `section` | `DefaultSection` |
| `site` | `DefaultLanding` |
| `liveblog` | `Liveblog` |
| `article` (default) | `Article` |
| `article` + `type: gallery` | `ArticleGallery` (v2 only; other themes fall back to `Article`) |
| `article` + `type: longform` | `ArticleLongform` |

Single-slug specials (bypass CMS lookup): `search`, `about`, `login`, `ui`. `ui` is the v2 style guide:
it renders only with an `editorialauth` cookie or when `NODE_ENV !== 'production'`, otherwise 404.

An empty `section` or `sectionwebpage` with no children or linked objects shows an editorial empty state.
It collects up to four distinct articles from nearest ancestor section paths, then the site root,
using the same auth and LIVE/PREVIEW page-fetch policy as the current request. If none are available,
only the empty message appears. Authored section webpages with linked objects and empty site roots are unchanged.

Site theme: `siteThemeOf()` (`src/lib/accessories/defaultThemeAccessories.ts`) reads the theme set on the
site root (`root.attributes.theme`) first, then the site configuration's custom `theme` value
(`root.staticAttributes.theme`, next to settings such as `invalidateNextJsTimeoutMs`), else `default`. An
explicit root `theme: "default"` beats the configuration. Accessory values are matched with Neon's own theme
resolution instead (`getAccessoryTheme`): Neon reads only the root `theme` attribute (else `default`), not
the configuration, so a v2 site themed through its configuration stores and reads its values under
`default`; on a legacy or unknown site theme no values apply. Every theme read (pages, specials, 404, `/ui`,
newsletter, accessory context via `getActiveTheme`) goes through it. The site list refreshes every
`SITES_REFRESH_INTERVAL` ms (default 120000, `src/instrumentation.ts`). The page route overlays the current
site theme on the cached page JSON (`withSiteTheme`), and `BlockSlot` does the same for cached blocks, so a
theme change applies to every page within one refresh, without evicting the cache.

Engine selection: `data-theme` is the site's theme; `data-engine="v2"` is set on the `.root` wrapper when
the theme is a v2 theme (`isV2Theme()`: a known key that is not legacy). v2 is the default engine:
`_themeRouter.tsx` (`pagesFor()`) sends only the keys in `LEGACY_THEMES` (`adn`, `oldtown`, `wire`,
`foghorn`, `business-globe`, `financier`) to their own page folders through `LEGACY_THEME_MAP`, and every
other theme to the v2 barrel (`src/app/_v2/index.ts`). `src/app/themeKeys.ts` owns the lists. Use the
`neon-v2-brand` skill for v2 brands and `neon-new-theme` for legacy structural themes.
`data-theme`/`data-engine` use `resolveRenderTheme()` (`src/app/themeKeys.ts`): an unknown explicit theme
renders with the `default` page components and look, while accessory lookups keep the raw site theme so it
consumes no accessory values.

Unlayered legacy globals in `globals.css` are guarded with `:where(:not(.root[data-engine="v2"] *), .v2-legacy *)`
(zero specificity). Legacy islands rendered inside a v2 root, such as `LoggedUserBar`, are wrapped
in `<div className="v2-legacy">` so they keep the legacy globals.

The v2 newsletter webpage preview and `/api/newsletter/[id]` share the email-compatible
`renderNewsletterFragment`; Main and Context stay separate and existing Insight1 content is preserved.
The newsletter story uses the shared article-body renderer, reader gate and content-editing scope.
Free newsletter stories export through `renderNewsletterStoryHtml`; restricted stories return 403
because the API cannot enforce the browser's demo meter. Unsupported story export nodes return 422
instead of silently losing content. Keep email markup inline and aligned with v2 brand tokens.

### v2 reader access (demo only)

`pubInfo.paywallLevel` alone controls restriction: `FREE`, `FREEMIUM`, `METERED`, `PREMIUM`.
Missing levels mean FREE; unknown nonempty levels warn and are treated as PREMIUM. Accessory
variants are visual layouts only; the removed `paywalled` article variant falls back to `standard`.
Article, liveblog and gallery items/leaves use the same Lucide Crown icon for all non-FREE tiers.

On LIVE, all non-FREE leaves require a `webauth` cookie. FREEMIUM then opens; METERED allows
10 distinct canonical article paths per UTC day (revisits remain accessible after exhaustion).
PREMIUM assumes every signed-in reader is a subscriber **for this demo only**, pending real
subscription entitlements. Editorial authentication is not reader authentication.

The v2 PREVIEW admin bar has a **Reader view** selector: FREE simulates anonymous access,
REGISTERED opens FREEMIUM and metered content but blocks PREMIUM, and PREMIUM opens every tier
without consuming the meter. Its Redux selection survives client navigation, resets to PREMIUM on
reload, and is ignored in LIVE. The preview meter uses separate storage and never consumes LIVE
allowances. PREMIUM is the default to preserve full editorial access, including the embedded Neon
preview where the admin bar remains hidden.
While the selector is visible, v2 headers and mobile drawers mirror the selected reader: FREE shows
Subscribe and Login, REGISTERED shows Subscribe and a simulated account, and PREMIUM shows only a
simulated account. Simulated Logout is disabled and never changes the real web-user session. LIVE
and pages without the editorial bar continue to show the real reader session.

`lib/paywall.ts` owns policy and URL/date normalization; `LeafAccess` reads the httpOnly cookie
server-side and passes only its presence to `ReaderGate`. `useMeteredAccess` persists per-site,
per-browser daily URL history in localStorage (`neon:v2:meter:live:<site>` or
`neon:v2:meter:preview:<site>`), serializes updates with Web Locks when available, refreshes across
tabs and resets at 00:00 UTC. Storage errors block metered content with an explicit message rather
than silently resetting the allowance. Legacy themes are unchanged.

This is visual demo gating, **not access control**: the full model/body still reaches the client.
Local history can be cleared or altered; real enforcement requires backend authorization and metering.

Embedded preview: inside the Neon app preview frame (`window.name === 'neonapp-preview'`, `isNeonAppPreview()`),
`ReloadListener` installs `installPreviewGuard()` (`src/utilities/previewGuard.ts`): one capture listener on
`window` cancels link clicks that leave the page and every form submit, for all themes and for elements
rendered after mount. In-page `#` links and UI buttons (menus, tabs) keep working. Outside the frame
nothing changes.

The editorial admin bar offers a view-status menu, a version-history panel and a viewport menu.
Viewport previews use a same-origin iframe with the page rendered through a React portal, so CSS
media queries see a real 768 × 1024px tablet or 390 × 844px phone viewport, with portrait/landscape
rotation, while Redux/editor controls remain shared. Responsive is the default; the selection and
orientation are remembered in session storage and carried through
Preview/Live switches. The control is hidden below 720px and in embedded Neon preview. Page UI that
inspects its window or document must use the rendered element's `ownerDocument` when possible so it
works in the frame. The history panel's latest-published badge describes the latest history entry,
not proof that the object is currently published.

### v2 content-item editing

`PageShell` and `ZoneRenderer` supply `ContentEditingProvider` with the object's ID, view status and lock.
Shared `renderContent` wrappers inherit that status; do not let an omitted `ContentEditable.viewStatus`
silently turn a PREVIEW leaf into a LIVE editor. Parent LIVE status takes precedence, but locks are
scoped to the owning object's ID, never inherited across objects. Only an element with a content-item `id` and an owning object `id`
can be edited when **Edit Content Items** is on. `ItemFrame` uses the linked object's
`attributes.contentIds.teaserTitle`/`teaserSummary` and saves against that object's ID, not the host
webpage. This edits the target object's teaser; page-specific teaser override persistence is unverified.
In PREVIEW, editing temporarily reveals the body regardless of the reader simulation and never consumes
the meter; turning editing off restores the selected reader view. LIVE access is never bypassed.
For `webpage`, `homewebpage` and `sectionwebpage`, the admin-bar switch is independent of host-page
version history: PREVIEW edits linked targets' teasers, while LIVE offers read-only additional
information. History loading/refetching must not hide that switch or turn its active mode off.
Leaf editing remains restricted to the latest editable PREVIEW version.

Every Neon lock blocks that object's v2 inline editing (including `CollaborationEditor`). A locked
webpage or content block does not block unlocked linked objects' teasers: `ItemFrame` establishes each
target's own scope. Fresh lock metadata loaded by `ArticleOverlay` applies only to that target; an
explicit unlocked result clears its stale initial lock. Locking does not disable the block-level Info/Publish/Unpublish toolbar or the admin
bar's Open in Editor action. Inspect-mode teaser clicks must not navigate away from the editor.

## Authentication Model

Two-token system, both stored as **httpOnly cookies** (set server-side only):

| Cookie | Who uses it | Purpose |
|---|---|---|
| `webauth` | Readers | Web-level identity (login required content) |
| `editorialauth` | Editors | Editorial operations (publish, rollback, edit) |

**Server-side** (API routes and page fetching):
```ts
import { getAuthOptions } from '@/utilities/security';
// ...
auth: await getAuthOptions()          // reader context
auth: await getAuthOptions(contextId) // editorial context with trace ID
```

**Client-side**:
- `useAuth` — fetches current user from `/api/users` via React Query (5-min stale time, httpOnly cookie sent automatically)
- `useWebauth` — stores display name in Redux + `localStorage`

### Editorial Cookie Scope

`src/proxy.ts` owns `editorialauth` issuance for PreviewToken authorization and the
Preview/Live `switch-token` exchange. New cookies are **host-only**: do not set a
`Domain` attribute. The browser keeps one editorial cookie per concrete host, while the
switch-token redirect transfers authentication between sibling Preview and Live hosts.

Issuance responses must not add any other `editorialauth` `Set-Cookie` header. Do not expire
the cookie with `Domain=<current hostname>`: that is the same cookie identity as the new
host-only cookie, and browsers apply the later header, deleting the cookie just set. Legacy
domain-scoped cookies (4-hour max-age) are left to expire on their own. Do not scope the cookie
to a broad parent domain.

The focused regression suite is `src/test/proxy.test.ts`; run it with:
`npm test -- --runInBand src/test/proxy.test.ts`.

## API Endpoint Contract

Every API route follows this pattern:

```ts
import { getAuthOptions } from '@/utilities/security';
import { handleServicesError } from '@/services/utils';

export async function GET(request: Request) {
  try {
    const result = await connection.someMethod({ auth: await getAuthOptions() });
    return Response.json(result);
  } catch (error) {
    return handleServicesError(error);
  }
}
```

For endpoints that set cookies (login):
- Use `NextResponse.json(result)` and call `response.cookies.set('webauth', token, { httpOnly: true, sameSite: 'none', secure: true, path: '/' })`

For editorial operations:
- Pass a trace context ID: `getAuthOptions('Neon-poc:' + Math.random().toString(36).substring(2))`

## Redux State

| Slice | State | Actions |
|---|---|---|
| `loggedUserSlice` | `inspectItems`, `analytics`, `viewStatus` (`LIVE`/`PREVIEW`) | `setViewStatus`, `setInspectItems`, `setAnalytics` |
| `webauthSlice` | `userName` | `setUserName` |
| `versionsSlice` | `versionPanelOpen`, `edited`, version history per node | `setHistory`, `setVersionPanelOpen`, `setEdited` |

## Model Conventions

All custom models extend `BaseModel` from the SDK:

```ts
import { BaseModel } from '@eidosmedia/neon-frontoffice-ts-sdk';

export type MyModel = {
  // custom fields
} & BaseModel;
```

Export from `src/types/models/index.ts`.

## SDK Import

The local SDK is aliased as a package. Import types and the connection facade like this:

```ts
import { NeonConnection, PageData, Site } from '@eidosmedia/neon-frontoffice-ts-sdk';
// connection is a global — no import needed in API routes and server components
```

## SDK Dependency Boundary

`src/neon-frontoffice-ts-sdk/` is framework-independent and must never import source from
the Next.js application (`src/app`, `src/hooks`, `src/services`, `src/types`, or other parent
paths). Shared Neon CMS value types and helpers originate in the SDK and are exported through
`@eidosmedia/neon-frontoffice-ts-sdk`; the application consumes them only through that package alias.

The SDK owns the view-status contract:

`NeonConnection.refreshSites()` atomically refreshes LIVE and PREVIEW, shares concurrent refreshes,
and rejects on failure without replacing the previous list. Background callers must handle that
rejection. The single-view refresh methods preserve the other view's entries.

- `ViewStatus` is the uppercase editorial value: `LIVE` or `PREVIEW`.
- `SiteViewStatus` is the lowercase site API value: `live` or `preview`.
- Convert canonical values with `toSiteViewStatus()`. Normalize raw headers, query parameters,
  and backend values with `normalizeViewStatus()` or `parseViewStatus()` before treating them as
  typed values.

The SDK also owns the accessory value types. Webpage zone overrides are delivered through top-level
`WebpageModel.zoneAccessories`, keyed by zone name. `getDwxLinkedObjects()` preserves
each page link's metadata separately as `WebpageNodeModel.linkMetadata`; do not merge link metadata
into the linked node's `attributes`.

Site configuration values (custom attributes on the site in Neon) arrive as `staticAttributes` on the
site root and every page `siteNode`, and again as the page's `siteData.custom`. `redactSiteConfig()`
(`utilities/siteConfig.ts`) removes secret keys from those objects in place: by default
`DEFAULT_REDACTED_SITE_CONFIG_KEYS` (`invalidateNextJsHeaderName`, `invalidateNextJsHeaderValue`).
`NeonConnection` takes `siteConfigRedaction: { expose?, keys? }` (`keys` replaces the default; an entry
ending with `*` is a prefix; `expose: true` keeps everything, for debugging only). Sites are redacted
when loaded; call `connection.redactSiteConfig(json)` on page JSON parsed from `makePageRequest()`.
The app wires it from `NEON_EXPOSE_SITE_CONFIG_SECRETS` (`true` = keep secrets, debug only; logs a
warning) and `NEON_REDACTED_SITE_CONFIG_KEYS` (comma-separated) in `src/instrumentation.ts`, and applies
it in `src/utilities/pageCache.ts` and `src/app/_v2/blocks/fetchBlocks.tsx`. Never pass unredacted site
or page data to a client component.

When changing the SDK public contract, update its README, this section, and both mirrored
`.agents/skills/neon-sdk-boundary/SKILL.md` and `.claude/skills/neon-sdk-boundary/SKILL.md`
files. Run `npm run build --prefix src/neon-frontoffice-ts-sdk` and
`npm test --prefix src/neon-frontoffice-ts-sdk -- --runInBand` to verify the SDK independently.

## Cache Invalidation

Pages are cached server-side using Next.js 16 `'use cache'` with demand invalidation via
`revalidateTag`. The entry point for the Neon CMS backend is:

**`POST /api/cache`** → `src/app/api/cache/route.ts`

Security: the request must include a header whose name and value match env vars
`INVALIDATE_NEXTJS_HEADER_NAME` and `INVALIDATE_NEXTJS_HEADER_VALUE`. Missing or wrong
header returns **404**.

Request body shape:
```json
{
  "siteName": "<site root.name>",
  "evict":      { "ids": ["<nodeId>"], "paths": ["/news/slug/"] },
  "revalidate": { "ids": ["<nodeId>"], "paths": ["/"] }
}
```

- **`ids`** — raw CMS node IDs (no prefix). The route applies the `neon:node:` prefix
  internally before calling `revalidateTag`.
- **`paths`** — URL paths forwarded directly to `revalidatePath`.
- **`siteName`** is validated against `connection.getSitesList()` — unknown names return 400.

Cache tagging is applied in `src/utilities/pageCache.ts` (`fetchPageDataCached`):

| Tag                    | Covers                                                                         |
| ---------------------- | ------------------------------------------------------------------------------ |
| `neon:site:<siteName>` | All pages on the site                                                          |
| `neon:node:<nodeId>`   | The page's own CMS node (`data.model.data.id`) — applies to every content type |
| `neon:node:<targetId>` | Every article linked in a webpage zone (`data.model.data.links.pagelink.*`)    |
| `neon:node:<childId>`  | Every child node in a section/list page (`data.model.data.children`)           |
| `neon:site:<siteName>` + `neon:node:<blockId>` | Each content block (`headers`/`includes`/`sidebars`/`footers`) fetched by `src/app/_v2/blocks/fetchBlocks.tsx`, as its own LIVE `'use cache'` entry; plus `neon:node:<id>` for every pagelink target inside the block's own model (`lib/blocks.ts`) |

Zone tagging is generic over zone names, so `insight3` is covered like `main`, `context`, `insight1` and
`insight2`. Blocks are cached separately from the page (own cache entry, LIVE only; PREVIEW fetches
uncached), so evicting a block node id purges the block, not the host page entry.

This means evicting one article's `nodeId` purges both the article page **and** every
listing page that references it in a zone — the full invalidation loop is closed.

**viewStatus gating**: the page route selects `fetchPageDataCached` when the resolved
`viewStatus === ViewStatus.LIVE`; PREVIEW requests use `fetchPageDataDirect`. The cache
selection does not check whether `editorialauth` is present. Do not assume that every
editorial request bypasses the cache or that authenticated LIVE responses are isolated
without verifying the deployed cache-key behavior.

For LIVE requests, expected unavailable statuses (401/403/404/410) are retried outside the
cache boundary so the page can render its not-found UI and newly available content is not
masked by a cached failure. Next.js can return HTTP 200 when that UI is streamed.

The page and metadata entry points explicitly await Next.js `connection()` before SDK work to
exclude request-time clocks and logging from prerendering. Upstream page failures other than
401/403/404/410 propagate to the error boundary, rather than being rendered as missing content.
Periodic site refresh failures are logged and retain the last successful LIVE/PREVIEW snapshot.

**Logging**: Every cache build (`neon-fo:page-cache`) and every invalidation call
(`neon-fo:cache-api`) emit structured pino JSON logs with node IDs, zone contents, and paths.

For full details, debugging steps, and how to extend tag coverage to new content types,
see the **`frontend-cache-management`** skill.

### Cache Documentation Maintenance

When cache behavior changes, verify the implementation in `src/utilities/pageCache.ts` and
`src/app/api/cache/route.ts`, then update this Cache Invalidation section and both mirrored
skill files: `.agents/skills/frontend-cache-management/SKILL.md` and
`.claude/skills/frontend-cache-management/SKILL.md`. Keep the two skill files synchronized.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
