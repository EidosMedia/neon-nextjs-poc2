# Vercel Deployment Readiness — Neon CMS Front-Office

## 1. Project Stack Detected

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | ^16.2.6 |
| Runtime | React | ^19.0.0 |
| Language | TypeScript | ^5 |
| Styling | Tailwind CSS | ^4.0.11 |
| State | Redux Toolkit + React Query | RTK ^2.6.1 / RQ ^5.80.7 |
| Caching | Next.js `'use cache'` + `revalidateTag` | demand ISR |
| Auth | httpOnly cookies (`webauth`, `editorialauth`) | server-side only |
| CMS | Neon CMS via local SDK (`src/neon-frontoffice-ts-sdk`) | local path alias |

ISR is implemented via the `'use cache'` directive in `src/utilities/pageCache.ts`
(`cacheLife('hours')` + demand invalidation through `POST /api/cache`).
On Vercel this maps directly to the **Vercel Data Cache**, which is exactly the right
mechanism for this pattern.

---

## 2. Findings

### 🔴 BLOCKER — `src/proxy.ts` is not wired as Next.js middleware

**File:** `src/proxy.ts`

The file contains all the critical request-routing logic:
- resolving the Neon site from the incoming host via `x-forwarded-host`
- injecting `x-neon-backend-url`, `x-neon-site-name`, `x-neon-view-status`,
  `x-neon-pathname` headers that every page component depends on
- handling the `?PreviewToken=…` flow (calls `connection.previewAuthorization()`,
  sets the `editorialauth` httpOnly cookie)
- handling the `?switch-view=preview|live` flow
- rewriting `/resources/…` and `/nodes/…` to internal API routes

**The problem:** Next.js only picks up a file named `middleware.ts` (or `middleware.js`)
placed at `src/middleware.ts`. The exported function must be named `middleware` (not
`proxy`). Currently, `src/proxy.ts` exports `proxy` — it is **never executed** by
Next.js. The `export const config = { matcher: … }` inside `proxy.ts` is also dead code.

**Impact without fix:** Site resolution fails entirely. All pages receive `null` headers,
making `viewStatus`, `siteName`, `hostname`, and `path` undefined. Authentication
preview and switch-view flows never run.

**Fix (Step 1 below):** Rename the file to `src/middleware.ts` and rename the exported
function from `proxy` to `middleware`.

---

### 🔴 BLOCKER — `output: 'standalone'` must be removed for Vercel

**File:** `next.config.ts`

```ts
output: 'standalone',   // ← REMOVE THIS
```

`standalone` mode bundles the Node.js server and all dependencies into a
`.next/standalone` directory, designed for Docker / self-hosted deployments. Vercel
builds its own output format and ignores this field, which can cause silent build
failures or unexpected artefacts. Remove it entirely; Vercel will build correctly
without it.

---

### 🔴 BLOCKER — `setInterval` for sites refresh will not survive Vercel serverless

**File:** `src/instrumentation.ts`

```ts
setInterval(() => {
  connection.refreshLiveSites();
  connection.refreshPreviewSites();
}, parseInt(process.env.SITES_REFRESH_INTERVAL || '') || 120000);
```

Vercel functions are stateless: each function instance is spun up on demand and
torn down after a period of inactivity. A `setInterval` registered on cold start
will fire while the instance is warm, but it will never fire across cold starts.
If a cold start happens after a long idle period, `connection` holds stale sites
data until the next interval tick, which might never come before the function
is torn down again.

**Fix (Step 2 below):** Replace the interval with a lightweight TTL guard called
from the middleware on each request. This ensures sites are refreshed at most
once every `SITES_REFRESH_INTERVAL` ms regardless of function lifecycle.

---

### 🟠 IMPORTANT — `NODE_TLS_REJECT_UNAUTHORIZED=0` must not reach Vercel

**File:** `.env` (local only)

The local `.env` file contains:

```
NODE_TLS_REJECT_UNAUTHORIZED=0
```

This disables TLS certificate validation entirely. It is needed locally only
because the dev Neon backend (`*.neon.test`) uses a self-signed certificate.
On Vercel, the Neon CMS production backend must have a valid TLS certificate,
and this variable must **not** be set in the Vercel project environment.

`.env` is typically committed; confirm `.gitignore` excludes it or rotate
secrets if this file is tracked. **Do not add this variable to the Vercel
dashboard.**

---

### 🟠 IMPORTANT — `DEV_MODE` must be set to `false` on Vercel

**File:** `src/proxy.ts` (future `src/middleware.ts`)

Cookie security attributes for the `editorialauth` cookie are gated on:

```ts
sameSite: process.env.DEV_MODE === 'false' ? 'none' : false,
secure: process.env.DEV_MODE === 'false',
```

On Vercel (HTTPS), `DEV_MODE=false` must be set so that the `editorialauth`
cookie is issued with `Secure; SameSite=None`. Without it the cookie is set
without the `Secure` flag, which is required for cross-site editorial flows when
the CMS editor (on a different domain) triggers preview navigation.

---

### 🟠 IMPORTANT — All required environment variables must be declared in Vercel

The project reads the following environment variables at runtime. All must be
configured in the Vercel project settings under **Settings → Environment Variables**:

| Variable | Required | Purpose |
|---|---|---|
| `BASE_NEON_FO_URL` | ✅ yes | Neon front-office backend base URL |
| `NEON_FRONTOFFICE_SERVICE_KEY` | ✅ yes | Service key sent to Neon CMS for authenticated SDK calls |
| `NEON_APP_URL` | ✅ yes | URL of the Neon editorial app (used for "Edit" deep-link in `LoggedUserBar`) |
| `INVALIDATE_NEXTJS_HEADER_NAME` | ✅ yes | Name of the secret header that guards `POST /api/cache` |
| `INVALIDATE_NEXTJS_HEADER_VALUE` | ✅ yes | Value of the secret header — treat as a strong random token |
| `DEV_MODE` | ✅ yes | Set to `false` in all Vercel environments (Production, Preview, Development) |
| `DEV_FORCE_SITE` | ❌ no | **Leave unset on Vercel.** Used only to override site resolution on localhost |
| `SITES_REFRESH_INTERVAL` | optional | Override the 120 000 ms sites refresh TTL. Defaults to 120 000 if absent |
| `NODE_TLS_REJECT_UNAUTHORIZED` | ❌ never | **Never set on Vercel.** Local dev only |

---

### 🟡 MEDIUM — Verify `'use cache'` is active without `experimental.dynamicIO`

**File:** `src/utilities/pageCache.ts`, `next.config.ts`

The project uses the `'use cache'` directive with `cacheTag` and `cacheLife`
(both imported from `next/cache`). In Next.js 15.0–15.1 this required
`experimental: { dynamicIO: true }`. As of Next.js 15.2 it became stable.
The project is on `^16.2.6`, so no experimental flag is needed.

**Action:** Run `next build` locally once and confirm there are no warnings about
`'use cache'` requiring an experimental flag. If warnings appear, add:

```ts
// next.config.ts
experimental: {
  dynamicIO: true,
},
```

On Vercel, `'use cache'` with `revalidateTag` maps to the Vercel Data Cache.
The `/api/cache` invalidation endpoint (`revalidateTag` + `revalidatePath`) will
work exactly as in local builds — this is the fully supported ISR path on Vercel.

---

### 🟡 MEDIUM — Neon CMS backend must allow requests from Vercel's IP ranges

The middleware resolves the site by calling `connection.resolveApiHostname(url)`
with the incoming `x-forwarded-host`. In production on Vercel, the origin IP of
each serverless invocation comes from Vercel's AWS Lambda pool.

If the Neon back-office has an IP allowlist for the front-office service key,
Vercel's dynamic IPs will not match. Solution: either remove the IP restriction
for the service key, or configure the allowlist to accept the Vercel CIDR ranges
(documented at `https://vercel.com/docs/security/deployment-protection/methods-to-protect-deployments/vercel-firewall`).

---

### 🟡 MEDIUM — `require('../../../../package.json')` in `/api/health`

**File:** `src/app/api/health/route.ts`

```ts
const packageJson = require('../../../../package.json');
```

This CommonJS `require` works in Next.js Node.js runtime routes. It will NOT
work if the route is ever switched to the Edge Runtime. Keep the route as
Node.js (no `export const runtime = 'edge'`). No action needed unless you
want to move it to Edge.

---

### 🟢 LOW — `allowedDevOrigins` is dev-only, no action needed

`allowedDevOrigins: ['*.neon.test']` in `next.config.ts` only applies to the
dev server (CORS for WebSocket HMR). Safe to leave in — Vercel ignores it.

---

### 🟢 LOW — `trailingSlash: true` works on Vercel with no changes

Vercel honours `trailingSlash: true` natively. No action required.

---

### 🟢 LOW — Local SDK install step is not needed on Vercel

`package.json` has a helper script:
```
"ci-frontoffice": "npm ci --prefix ./src/neon-frontoffice-ts-sdk"
```

The local SDK (`src/neon-frontoffice-ts-sdk`) has **only** dev dependencies
(jest, typescript, eslint). The Next.js build compiles the SDK source directly
via the TypeScript path alias `@eidosmedia/neon-frontoffice-ts-sdk →
./src/neon-frontoffice-ts-sdk/src`. No separate install is needed on Vercel;
the root `npm install` is sufficient.

---

### 🟢 LOW — `certificates/` directory is for local HTTPS dev only

The `certificates/` directory contains self-signed certificates used by
`next dev --experimental-https`. Vercel manages TLS automatically; this
directory has no effect on the Vercel build or runtime.

---

## 3. Implementation Plan

### Step 1 — Fix the middleware (BLOCKER)

Rename `src/proxy.ts` → `src/middleware.ts` and rename the exported function.
No logic changes are needed — only the filename and function name matter to Next.js.

**`src/middleware.ts`** (was `src/proxy.ts`):

```diff
- export async function proxy(request: NextRequest) {
+ export async function middleware(request: NextRequest) {
```

All other code in the file stays identical. Verify the bottom of the file still
exports the matcher:

```ts
export const config = {
  matcher: ['/((?!api|_next/static|_next/image).*)'],
};
```

> After this rename, delete `src/proxy.ts`.

---

### Step 2 — Replace `setInterval` with a per-request TTL refresh (BLOCKER)

In `src/instrumentation.ts`, replace the `setInterval` block with a module-level
TTL variable and a callable function that the middleware will invoke:

```ts
// src/instrumentation.ts  (replace only the interval section)

let _lastSitesRefresh = 0;

export function maybeRefreshSites(): void {
  const interval = parseInt(process.env.SITES_REFRESH_INTERVAL || '') || 120_000;
  const now = Date.now();
  if (now - _lastSitesRefresh >= interval) {
    _lastSitesRefresh = now;
    connection.refreshLiveSites();
    connection.refreshPreviewSites();
  }
}

// Remove the setInterval block entirely.
```

In `src/middleware.ts` (after Step 1), call it at the top of `middleware()`:

```ts
import { maybeRefreshSites } from './instrumentation';

export async function middleware(request: NextRequest) {
  maybeRefreshSites();   // ← add this line
  // ... rest of function unchanged
```

This keeps the refresh frequency identical to the current behaviour, but works
correctly in both serverless (each warm request checks the TTL) and long-running
(interval-equivalent) environments.

---

### Step 3 — Remove `output: 'standalone'` from `next.config.ts` (BLOCKER)

```diff
 const nextConfig: NextConfig = {
-  output: 'standalone',
   trailingSlash: true,
   allowedDevOrigins: ['*.neon.test'],
 };
```

---

### Step 4 — Add `vercel.json` with Neon CMS cache-invalidation passthrough

Create a `vercel.json` at the project root. The main purpose is to ensure the
`POST /api/cache` webhook from Neon CMS is never rate-limited and to configure
the function timeout to allow cache operations to complete:

```json
{
  "functions": {
    "src/app/api/cache/route.ts": {
      "maxDuration": 30
    }
  }
}
```

If you want to use Vercel Cron Jobs as an additional safety net for sites refresh
(so cold starts after long idle periods also pick up new sites), add:

```json
{
  "crons": [
    {
      "path": "/api/health",
      "schedule": "*/5 * * * *"
    }
  ],
  "functions": {
    "src/app/api/cache/route.ts": {
      "maxDuration": 30
    }
  }
}
```

This pings `/api/health` every 5 minutes; the warm request running `maybeRefreshSites()`
in the middleware keeps sites data current. The health endpoint also calls
`connection.getBackendInfo()`, which validates the CMS connection is alive.

> Note: Vercel Cron Jobs are only available on Pro and above plans.

---

### Step 5 — Set environment variables in Vercel

Go to **Vercel Dashboard → Project → Settings → Environment Variables** and add:

| Variable | Production | Preview | Development |
|---|---|---|---|
| `BASE_NEON_FO_URL` | Neon prod FO URL | Neon staging FO URL | (use `.env.local`) |
| `NEON_FRONTOFFICE_SERVICE_KEY` | prod key | staging key | (use `.env.local`) |
| `NEON_APP_URL` | Neon prod app URL | Neon staging app URL | (use `.env.local`) |
| `INVALIDATE_NEXTJS_HEADER_NAME` | strong header name | same | same |
| `INVALIDATE_NEXTJS_HEADER_VALUE` | strong random token | different token | (use `.env.local`) |
| `DEV_MODE` | `false` | `false` | `false` |
| `NODE_TLS_REJECT_UNAUTHORIZED` | **DO NOT SET** | **DO NOT SET** | **DO NOT SET** |

Keep `DEV_FORCE_SITE` out of Vercel entirely — leave it only in your local `.env`.

---

### Step 6 — Verify `'use cache'` and build locally before pushing

```bash
npm run build
```

Confirm:
- No warnings about `'use cache'` or `dynamicIO`
- The `src/middleware.ts` file is detected (Next.js prints `✓ Middleware`)
- All routes compile without error

If `'use cache'` warnings appear, add to `next.config.ts`:

```ts
experimental: {
  dynamicIO: true,
},
```

---

### Step 7 — Configure Vercel project settings

In **Vercel Dashboard → Project → Settings → General**:

| Setting | Value |
|---|---|
| Framework Preset | Next.js (auto-detected) |
| Build Command | `npm run build` (default) |
| Install Command | `npm install` (default — do NOT add `ci-frontoffice`) |
| Output Directory | (leave as default — `.next`) |
| Node.js Version | 20.x or 22.x (match your local Node) |

---

### Step 8 — Configure Neon CMS to call the Vercel cache endpoint

In Neon CMS back-office, configure the front-office cache invalidation webhook to
call:

```
POST https://<your-vercel-domain>/api/cache
<INVALIDATE_NEXTJS_HEADER_NAME>: <INVALIDATE_NEXTJS_HEADER_VALUE>
Content-Type: application/json
```

Body format (unchanged from the current spec in `AGENTS.md`):
```json
{
  "siteName": "<site root.name>",
  "evict":      { "ids": ["<nodeId>"], "paths": ["/news/slug/"] },
  "revalidate": { "ids": ["<nodeId>"], "paths": ["/"] }
}
```

---

## 4. ISR Architecture on Vercel (no changes needed to logic)

```
Neon CMS backend
  └─ publishes article
      └─ POST /api/cache  (Vercel deployment)
          ├─ revalidateTag('neon:node:<articleId>')
          │     purges: article page + all listing pages that zone it
          └─ revalidatePath('/news/slug/')

Visitor request
  └─ middleware.ts  (Edge Network)
      ├─ maybeRefreshSites()         ← new: replaces setInterval
      ├─ resolves site from x-forwarded-host
      └─ injects x-neon-* headers
          └─ [[...slug]]/page.tsx    (Node.js Lambda)
              ├─ viewStatus === 'live'  → fetchPageDataCached()
              │     'use cache' → Vercel Data Cache (ISR)
              │     cacheLife('hours') + cacheTag('neon:node:...')
              └─ viewStatus !== 'live' → fetchPageDataDirect()  (no cache)
```

---

## 5. Preview & Auth flows — no changes needed to logic, middleware fix unlocks them

### Preview token flow (Neon CMS editor → front-office)
1. Editor clicks "Preview" in Neon App
2. Browser navigates to `https://<site>/<path>?PreviewToken=…&id=…&siteName=…`
3. **`middleware.ts`** (after fix) calls `connection.previewAuthorization()`
4. Sets `editorialauth` httpOnly cookie with `Secure; SameSite=None` (when `DEV_MODE=false`)
5. Rewrites to clean URL → page renders via `fetchPageDataDirect` (no ISR)

### Switch-view flow
1. Editorial toolbar sends `?switch-view=preview&switch-token=<cookie-value>`
2. **`middleware.ts`** sets `editorialauth` cookie and redirects to clean URL
3. All subsequent requests carry the cookie; `viewStatus` is resolved as `PREVIEW`

### Reader auth flow
1. Reader logs in via `/login` → `POST /api/users/login`
2. Server sets `webauth` httpOnly cookie
3. `getAuthOptions()` reads both cookies on every page render and API call
4. `useAuth` hook (`/api/users` via React Query) keeps the client state in sync

All three flows depend on the middleware being active. **Step 1 unblocks all of them.**

---

## 6. Summary Checklist

| # | Action | Priority | File(s) |
|---|---|---|---|
| 1 | Rename `proxy.ts` → `middleware.ts`, rename `proxy` fn → `middleware` | 🔴 BLOCKER | `src/proxy.ts` → `src/middleware.ts` |
| 2 | Replace `setInterval` with `maybeRefreshSites()` + call from middleware | 🔴 BLOCKER | `src/instrumentation.ts`, `src/middleware.ts` |
| 3 | Remove `output: 'standalone'` from `next.config.ts` | 🔴 BLOCKER | `next.config.ts` |
| 4 | Add `vercel.json` with `maxDuration` for `/api/cache` | 🟠 IMPORTANT | `vercel.json` (new) |
| 5 | Set env vars in Vercel dashboard (especially `DEV_MODE=false`) | 🟠 IMPORTANT | Vercel dashboard |
| 6 | Ensure `NODE_TLS_REJECT_UNAUTHORIZED=0` is NOT set on Vercel | 🟠 IMPORTANT | Vercel dashboard |
| 7 | Configure Neon CMS webhook to POST to `/api/cache` on Vercel URL | 🟠 IMPORTANT | Neon CMS config |
| 8 | Run `npm run build` locally and verify no `'use cache'` warnings | 🟡 MEDIUM | — |
| 9 | Confirm Neon backend TLS cert is valid (no self-signed in prod) | 🟡 MEDIUM | Neon CMS infra |
| 10 | Verify Neon backend does not IP-allowlist the front-office service key | 🟡 MEDIUM | Neon CMS config |
