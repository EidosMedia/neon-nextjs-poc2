import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getAPIHostname } from './services/utils';

const getViewStatus = (searchParam: string | null) => {
  switch (searchParam) {
    case 'p':
      return 'PREVIEW';
    default:
      return null;
  }
};

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  const viewStatus = request.nextUrl.searchParams.get('v');

  const apiHostname = await getAPIHostname(request, getViewStatus(viewStatus));

  // Passing the apiHostname resolved as header to the app router
  const headers = new Headers(request.headers);
  headers.set('x-neon-backend-url', apiHostname);

  return NextResponse.next({ headers });
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$|.*\\.jpg$).*)'],
};
