---
name: neon-sdk-boundary
description: "Maintain the Neon TypeScript SDK dependency boundary and public contracts. Use when moving shared types into the SDK, changing SDK exports, fixing an SDK import of application source, or updating ViewStatus and SiteViewStatus. Triggers: 'SDK boundary', 'SDK dependency', 'SDK import', 'shared SDK type', 'ViewStatus', 'SiteViewStatus', 'SDK public contract'."
argument-hint: "Describe the shared SDK contract or dependency-boundary change."
---

# Neon SDK Dependency Boundary

`src/neon-frontoffice-ts-sdk/` is a framework-independent package. It may depend only on its
own source and external packages; it must not import from the Next.js application, including
`src/app`, `src/hooks`, `src/services`, `src/types`, or parent-relative paths that escape the SDK.

## Shared Contracts

`NeonConnection.refreshSites()` atomically refreshes both views, shares concurrent refreshes, and
rejects on failure while retaining the last successful list. Background callers must handle
rejections. Single-view refresh methods preserve the other view's entries.

`NeonConnection.refreshSites()` atomically refreshes both views, shares concurrent refreshes, and
rejects on failure while retaining the last successful list. Background callers must handle
rejections. Single-view refresh methods preserve the other view's entries.

Define Neon CMS types, enums, mappings, and helpers in the SDK when both the SDK and front office
need them. Export them from `src/neon-frontoffice-ts-sdk/src/index.ts`; application code imports
them through `@eidosmedia/neon-frontoffice-ts-sdk`.

The SDK owns view status:

| Type | Values | Use |
|---|---|---|
| `ViewStatus` | `LIVE`, `PREVIEW` | Editorial and application state |
| `SiteViewStatus` | `live`, `preview` | Neon site API paths |

Use `toSiteViewStatus()` to convert canonical values. At external boundaries, normalize raw
headers, query parameters, and backend payloads with `normalizeViewStatus()` or `parseViewStatus()`
before using typed values.

Accessory values are shared SDK contracts: `AccessorySet`, `AccessoryValues`, and `LinkMetadata`.
Zone accessory sets are delivered in top-level `WebpageModel.zoneAccessories`. The
`getDwxLinkedObjects()` adapter exposes a page link's metadata as `WebpageNodeModel.linkMetadata`,
separate from the linked node's attributes.

Site configuration values (custom attributes on the site in Neon) arrive as `staticAttributes` on the
site root and every page `siteNode`, and again as the page's `siteData.custom`. `redactSiteConfig()`
(`utilities/siteConfig.ts`) removes secret keys from those objects in place: by default
`DEFAULT_REDACTED_SITE_CONFIG_KEYS` (`invalidateNextJsHeaderName`, `invalidateNextJsHeaderValue`).
`NeonConnection` takes `siteConfigRedaction: { expose?, keys? }` (`keys` replaces the default; an entry
ending with `*` is a prefix; `expose: true` keeps everything, for debugging only). Sites are redacted
when loaded; call `connection.redactSiteConfig(json)` on page JSON parsed from `makePageRequest()`.

## Change Checklist

1. Add or update the contract under `src/neon-frontoffice-ts-sdk/src/`.
2. Export public symbols through `src/neon-frontoffice-ts-sdk/src/index.ts`.
3. Replace application imports with `@eidosmedia/neon-frontoffice-ts-sdk` imports.
4. Remove duplicate application definitions after all consumers migrate.
5. Add SDK-level unit tests for the public behavior.
6. Run `npm run build --prefix src/neon-frontoffice-ts-sdk` and
   `npm test --prefix src/neon-frontoffice-ts-sdk -- --runInBand`.
7. Update `AGENTS.md`, `src/neon-frontoffice-ts-sdk/README.md`, and both mirrored copies of this
   skill in the same change.

Keep `.agents/skills/neon-sdk-boundary/SKILL.md` and
`.claude/skills/neon-sdk-boundary/SKILL.md` synchronized.