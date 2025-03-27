import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getAPIHostnameConfig } from './services/utils';
import { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies';

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  const { apiHostname } = await getAPIHostnameConfig(request);

  // Passing the apiHostname resolved as header to the app router
  const headers = new Headers(request.headers);

  headers.set('x-neon-backend-url', apiHostname);
  headers.set('x-neon-pathname', request.nextUrl.pathname);

  const urlObject = request.nextUrl;
  const urlParams = new URLSearchParams(urlObject.search);

  if (urlParams.get('PreviewToken')) {
    const previewToken = urlParams.get('PreviewToken');
    const contentId = urlParams.get('id');
    const siteName = urlParams.get('siteName');
    const viewStatus = 'PREVIEW';

    if (previewToken && contentId && siteName) {
      const authorizationResponse = await connection.previewAuthorization(
        contentId,
        siteName,
        viewStatus,
        previewToken
      );

      if (authorizationResponse.status !== 204) {
        return NextResponse.json(
          { error: 'Internal Server Error' },
          { status: authorizationResponse.status }
        );
      }

      const cookie = authorizationResponse.headers.getSetCookie()[0];

      const cookieObject = parseCookie(cookie);

      const domainValue = (headers.get('x-forwarded-host') || '/').replace(
        ':3000',
        ''
      );

      const cookieValue = cookieObject.empreviewtoken;
      const cookieOptions: ResponseCookie = {
        path: '/',
        maxAge: 1200,
        httpOnly: true,
        name: 'previewtoken',
        value: cookieValue,
        sameSite: process.env.DEV_MODE === 'false' ? 'none' : false,
        secure: process.env.DEV_MODE === 'false',
        domain: domainValue,
      };

      const response = NextResponse.next({ headers });
      response.cookies.set('previewtoken', '', cookieOptions);

      return response;
    }
  }

  if (request.nextUrl.pathname.startsWith('/resources')) {
    // need to reconstruct the full path after the domain
    if (process.env.NODE_ENV === 'production' && process.env.DEPLOYMENT !== 'sandbox') {
      return NextResponse.rewrite(
        `${apiHostname}${request.nextUrl.pathname}?${request.nextUrl.searchParams}`
      );
    }
    // calling internal api proxy due to self signed certificates issue
    const url = request.nextUrl.clone();
    url.pathname = `/api/proxy${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next({ headers });
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image).*)'],
};

const parseCookie = (cookieString: string): Record<string, string> => {
  const cookieArray = cookieString.split(';');
  const cookieObject: Record<string, string> = {};

  cookieArray.forEach((cookie) => {
    const cookiePair = cookie.split('=');
    cookieObject[cookiePair[0]] = cookiePair[1];
  });

  return cookieObject;
};
