---
name: neon-api-route
description: "Add a new API endpoint to the Neon CMS front-office. Use when creating a backend route that wraps an SDK call, proxies CMS data, or handles auth operations. Triggers: 'add API route', 'new endpoint', 'create route', 'new API'."
argument-hint: "Purpose of the route (e.g. 'fetch featured articles', 'update content item')"
---

# Add a New API Endpoint

Use this skill to create a new server-side API route that follows the project's auth and error handling contract.

## Standard Pattern (read / data fetch)

Create `src/app/api/<name>/route.ts`:

```ts
import { NextRequest } from 'next/server';
import { getAuthOptions } from '@/utilities/security';
import { handleServicesError } from '@/services/utils';

export async function GET(request: NextRequest) {
  try {
    const result = await connection.someMethod({
      auth: await getAuthOptions(),
      // pass other params from request.nextUrl.searchParams as needed
    });
    return Response.json(result);
  } catch (error) {
    return handleServicesError(error);
  }
}
```

Key rules:
- `connection` is a global — no import needed.
- Always pass `auth: await getAuthOptions()` to every SDK call that supports it.
- Always wrap in try/catch and return `handleServicesError(error)` on failure.

## Pattern: Dynamic segment

For routes with a path param (e.g. `/api/items/[id]`), create `src/app/api/<name>/[id]/route.ts`:

```ts
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const result = await connection.someMethod({ id, auth: await getAuthOptions() });
    return Response.json(result);
  } catch (error) {
    return handleServicesError(error);
  }
}
```

## Pattern: Login / set auth cookie

Use `NextResponse` so you can attach the httpOnly cookie:

```ts
import { NextRequest, NextResponse } from 'next/server';
import { getAuthOptions } from '@/utilities/security';
import { handleServicesError } from '@/services/utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await connection.login({ ...body });

    const response = NextResponse.json(result);
    if (result.webauthToken) {
      response.cookies.set('webauth', result.webauthToken, {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
        path: '/',
      });
    }
    return response;
  } catch (error) {
    return handleServicesError(error);
  }
}
```

## Pattern: Editorial operation (publish, edit, rollback)

Pass a unique `contextId` for audit traceability:

```ts
auth: await getAuthOptions('Neon-poc:' + Math.random().toString(36).substring(2))
```

## Checklist

- [ ] Route file created at `src/app/api/<name>/route.ts`
- [ ] `getAuthOptions()` passed to every SDK call
- [ ] Wrapped in try/catch with `handleServicesError(error)` in catch
- [ ] For login routes: cookie set as `httpOnly: true, sameSite: 'none', secure: true`
- [ ] For editorial routes: `contextId` passed to `getAuthOptions()`
