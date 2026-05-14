# Neon CMS Front-Office — Project Agent Instructions

This is a front-office web application powered by **Neon CMS**, using its TypeScript SDK to
fetch content, resolve sites, authenticate users, and render content types.

## Project Layout

| Path | Purpose |
|---|---|
| `src/neon-frontoffice-ts-sdk/` | Local Neon CMS TypeScript SDK (source of truth for types/services) |
| `src/app/[[...slug]]/page.tsx` | Catch-all route — resolves CMS `baseType` to a page component |
| `src/app/_pages/` | Page components, one per CMS content type |
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
| `article` + `type: longform` | `ArticleLongform` |

Single-slug specials (bypass CMS lookup): `search`, `about`, `login`.

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
