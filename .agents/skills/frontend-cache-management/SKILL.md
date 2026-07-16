---
name: frontend-cache-management
description: "Manage the Next.js data cache for Neon CMS pages. Use when adding cache invalidation logic, extending cache tag coverage, debugging stale content, or understanding how the Neon backend should call /api/cache. Triggers: 'cache invalidation', 'revalidate cache', 'stale content', 'cache tags', 'purge cache', 'evict cache', 'cache management'."
argument-hint: "Describe what changed: 'article not updating', 'need to invalidate a new content type', 'add cache tags for X', etc."
---

# Frontend Cache Management

This project uses **Next.js 16 `'use cache'` + `cacheTag()`** to cache CMS page responses
server-side and purge them on demand when Neon publishes content.

---

## Architecture Overview

```
Neon CMS publishes article / page
        │
        ▼
POST /api/cache   ← guarded by INVALIDATE_NEXTJS_HEADER_NAME / INVALIDATE_NEXTJS_HEADER_VALUE
        │
        ▼
revalidateTag(`neon:node:<id>`, 'default')   ← for each id in evict.ids / revalidate.ids
revalidatePath(<path>)                        ← for each path in evict.paths / revalidate.paths
        │
        ▼
Next.js purges all 'use cache' entries that were tagged with neon:node:<id>
        │
        ├─▶ Article page (tagged neon:node:<ownId>)              → re-fetched on next request
        └─▶ Webpage / section that listed the article in a zone  → re-fetched on next request
```

---

## Key Files

| File | Role |
|---|---|
| `src/app/api/cache/route.ts` | POST endpoint — validates the secret, validates site name, calls `revalidateTag` / `revalidatePath`; logs every invalidation request |
| `src/utilities/pageCache.ts` | `fetchPageDataCached()` (LIVE) and `fetchPageDataDirect()` (preview) — cache server function applies tags after parsing |
| `src/app/[[...slug]]/page.tsx` | Calls `fetchPageDataCached` for `viewStatus === 'live'`; `fetchPageDataDirect` for all other view statuses |
| `src/lib/logger.ts` | Shared pino logger instance (`name: 'neon-fo'`); each module creates its own child logger |

---

## Cache Tag Convention

Tags are applied inside `fetchPageDataCached()` **after** the JSON is parsed, so they can
be derived from the actual response data:

| Tag | Applied to | Meaning |
|---|---|---|
| `neon:site:<siteName>` | Every live page | Bulk-invalidate the entire site |
| `neon:node:<nodeId>` | Every live page | The page's **own** CMS node ID — `data.model.data.id` (applies to articles, webpages, sections, liveblogs, etc.) |
| `neon:node:<targetId>` | Webpage pages | Every article node ID linked in any zone slot (`data.model.data.links.pagelink.*[].targetId`) |
| `neon:node:<childId>` | Section / list pages | Every child node ID (`data.model.data.children[]`) |

> **Verified**: a webpage cache entry carries the webpage's own `neon:node:<pageId>` tag
> **plus** one `neon:node:<articleId>` tag for every article that appears in its zones.
> Evicting a single article ID therefore purges both the article page and every webpage
> that holds that article in a zone — the full invalidation loop is closed in one call.

### viewStatus Gating

`fetchPageDataCached` is called **only when `viewStatus === 'live'`**. Editorial / preview
requests (any other `viewStatus`) go through `fetchPageDataDirect`, which always fetches
fresh from Neon with `cache: 'no-store'` and never writes to the Next.js data cache.
This ensures editors never see stale cached content.

### Logging

Every cache-build event is logged by the `neon-fo:page-cache` pino child logger:

```json
{
  "event": "page-cache-built",
  "url": "https://api.neon.example/v1/...",
  "siteName": "adn",
  "nodeId": "abc123",
  "baseType": "webpage",
  "taggedIds": ["abc123", "def456", "ghi789"],
  "zoneContents": [
    { "id": "def456", "title": "Article A", "zone": "main" },
    { "id": "ghi789", "title": "Article B", "zone": "context" }
  ]
}
```

For article / section pages without zones, `zoneContents` is omitted and only `taggedIds`
(containing just the page's own node ID) is logged.

Every invalidation call to `POST /api/cache` is logged by `neon-fo:cache-api`:
```json
{
  "event": "cache-invalidation-received",
  "siteName": "adn",
  "evictIds": ["abc123"],
  "evictPaths": ["/news/my-article/"],
  "revalidateIds": [],
  "revalidatePaths": []
}
```

---

## Invalidation Endpoint Contract

**`POST /api/cache`**

### Security

The endpoint returns **404** (not 401) for any auth failure to avoid revealing its existence.
Two env vars control the guard:

```
INVALIDATE_NEXTJS_HEADER_NAME=<header-name>      # default: invalidate-secret
INVALIDATE_NEXTJS_HEADER_VALUE=<secret-value>
```

The request must include a header matching exactly:
```
<INVALIDATE_NEXTJS_HEADER_NAME>: <INVALIDATE_NEXTJS_HEADER_VALUE>
```

### Request Body

```json
{
  "siteName": "my-site-slug",
  "evict": {
    "ids":   ["<nodeId1>", "<nodeId2>"],
    "paths": ["/news/my-article/"]
  },
  "revalidate": {
    "ids":   ["<nodeId3>"],
    "paths": ["/"]
  }
}
```

| Field | Type | Description |
|---|---|---|
| `siteName` | `string` | **Required.** Must match a known site's `root.name`. Returns 400 if unknown. |
| `evict.ids` | `string[]` | Raw CMS node IDs. The route prefixes each as `neon:node:<id>` before calling `revalidateTag`. |
| `evict.paths` | `string[]` | URL paths passed directly to `revalidatePath`. |
| `revalidate.ids` | `string[]` | Same as `evict.ids` — treated identically in the current implementation. |
| `revalidate.paths` | `string[]` | Same as `evict.paths`. |

> **Note on `ids`**: The caller (Neon CMS backend) sends plain node IDs (e.g. `"abc123"`).
> The `neon:node:` prefix is applied by the route, not by the caller.

### Response

**200 — success**
```json
{
  "success": true,
  "message": "Cache instructions processed successfully.",
  "summary": {
    "evictedTags": 2,
    "evictedPaths": 1,
    "revalidatedTags": 0,
    "revalidatedPaths": 0
  }
}
```

**400** — unknown `siteName` or unparseable body  
**404** — missing or wrong secret header  
**500** — site list lookup or processing error

---

## Cache Lifetime

Live content is cached with the `'hours'` profile (1-hour revalidation window).
Editorial / preview requests (`auth.editorialAuth` present) use a 5-second TTL so editors
always see fresh content.

These profiles are set inside `fetchPageDataCached()` via `cacheLife()`.

---

## How to Extend Cache Tag Coverage

If a new content type introduces a new relationship (e.g., an author node linked via
`links.author[0].targetId`), add its tagging inside `fetchPageDataCached()`:

```ts
// src/utilities/pageCache.ts  — inside fetchPageDataCached(), after the existing tag blocks

const authorId: string | undefined = data?.model?.data?.links?.author?.[0]?.targetId;
if (authorId) {
  cacheTag(`neon:node:${authorId}`);
}
```

Then the Neon backend can evict by that author's node ID whenever the author profile changes.

---

## How to Invalidate the Whole Site

Send an eviction for the site tag (currently only supported via `evict.ids` for node-level
purges, but can be extended). Alternatively, invalidate by path:

```json
{
  "siteName": "my-site-slug",
  "evict": { "paths": ["/"] }
}
```

Using `revalidatePath('/', 'layout')` in route code would purge all pages under `/`.

---

## Debugging Stale Content

1. Check that `INVALIDATE_NEXTJS_HEADER_NAME` and `INVALIDATE_NEXTJS_HEADER_VALUE` are set
   in the deployment environment.
2. Verify the Neon backend is sending the correct `siteName` (must match `site.root.name`).
3. Confirm the article's `model.data.id` is included in `evict.ids` — this is the CMS node ID,
   not the URL slug.
4. For webpages not updating after an article change: verify the article appears in
   `model.data.links.pagelink.*` in the webpage's response payload. If the relationship is
   managed differently (e.g., a separate aggregator call), add the appropriate `cacheTag()`
   in `fetchPageDataCached()`.
