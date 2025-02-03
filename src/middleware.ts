import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getAPIHostnameConfig } from './services/utils';

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  const { apiHostname } = await getAPIHostnameConfig(request);

  // Passing the apiHostname resolved as header to the app router
  const headers = new Headers(request.headers);

  headers.set('x-neon-backend-url', apiHostname);
  headers.set('x-neon-pathname', request.nextUrl.pathname);

  if (request.nextUrl.pathname.startsWith('/resources')) {
    // need to reconstruct the full path after the domain
    return NextResponse.rewrite(
      `${apiHostname}${request.nextUrl.pathname}?${request.nextUrl.searchParams}`
    );
  }

  return NextResponse.next({ headers });
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image).*)'],
};
