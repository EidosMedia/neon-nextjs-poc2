import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getAPIHostnameConfig } from './services/utils';
import { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies';
import { SiteNode } from './neon-frontoffice-ts-sdk/src/types/site';
import { parseViewStatus, toSiteViewStatus, ViewStatus } from '@eidosmedia/neon-frontoffice-ts-sdk';
import { normalizeLiveSwitchPathname } from './utilities/urlVersion';

const toComparableHostname = (value: string): string => {
  const withProtocol = value.startsWith('http') ? value : `https://${value}`;
  return new URL(withProtocol).hostname.toLowerCase();
};

const getEditorialAuthCookieOptions = (value: string): ResponseCookie => ({
  path: '/',
  maxAge: 14400,
  httpOnly: true,
  name: 'editorialauth',
  value,
  sameSite: process.env.DEV_MODE === 'false' ? 'none' : false,
  secure: process.env.DEV_MODE === 'false',
});

const expireLegacyDomainScopedEditorialAuthCookie = (response: NextResponse, request: NextRequest): void => {
  const requestHost = request.headers.get('x-forwarded-host') || request.nextUrl.host;
  const legacyDomain = toComparableHostname(requestHost);
  const attributes = [
    'editorialauth=',
    'Path=/',
    `Domain=${legacyDomain}`,
    'Max-Age=0',
    'Expires=Thu, 01 Jan 1970 00:00:00 GMT',
    'HttpOnly',
    process.env.DEV_MODE === 'false' ? 'SameSite=None' : undefined,
    process.env.DEV_MODE === 'false' ? 'Secure' : undefined,
  ].filter(Boolean);

  response.headers.append('Set-Cookie', attributes.join('; '));
};

const deriveSwitchHostFromCurrent = (currentHost: string, targetView: ViewStatus): string | undefined => {
  const parsedCurrent = new URL(`https://${currentHost}`);
  const currentHostname = parsedCurrent.hostname;

  if (targetView === ViewStatus.LIVE && currentHostname.startsWith('preview-')) {
    const liveHostname = currentHostname.substring('preview-'.length);
    return parsedCurrent.port ? `${liveHostname}:${parsedCurrent.port}` : liveHostname;
  }

  if (targetView === ViewStatus.PREVIEW && !currentHostname.startsWith('preview-')) {
    const previewHostname = `preview-${currentHostname}`;
    return parsedCurrent.port ? `${previewHostname}:${parsedCurrent.port}` : previewHostname;
  }

  return undefined;
};

// This function can be marked `async` if using `await` inside
export async function proxy(request: NextRequest) {
  const foundsite: { apiHostname: string; viewStatus: string; root: SiteNode } = await getAPIHostnameConfig(request);

  // Passing the apiHostname resolved as header to the app router
  const headers = new Headers(request.headers);

  headers.set('x-neon-backend-url', foundsite.apiHostname);
  headers.set('x-neon-pathname', request.nextUrl.pathname);
  headers.set('x-neon-site-name', foundsite.root?.name);
  headers.set('x-neon-view-status', foundsite.viewStatus);

  const urlObject = request.nextUrl;
  const urlParams = new URLSearchParams(urlObject.search);
  const switchToken = urlParams.get('switch-token');
  const viewParam = parseViewStatus(urlParams.get('switch-view'));

  if (viewParam) {
    if (switchToken) {
      const cookieOptions = getEditorialAuthCookieOptions(switchToken);

      // Create a clean URL without the preview query parameters
      const cleanUrl = request.nextUrl.clone();
      cleanUrl.searchParams.delete('switch-token');
      cleanUrl.searchParams.delete('switch-view');

      if (process.env.NODE_ENV === 'development') {
        console.info('neon-fo:switch-token-exchanged', {
          requestHost: request.nextUrl.host,
          forwardedHost: request.headers.get('x-forwarded-host'),
          sourceViewStatus: foundsite.viewStatus,
          targetViewStatus: viewParam,
        });
      }

      // Rewrite to the clean URL (no redirect, URL stays the same in browser)
      const response = NextResponse.redirect(cleanUrl, { headers });
      response.cookies.set(cookieOptions);
      expireLegacyDomainScopedEditorialAuthCookie(response, request);

      return response;
    }

    const cookie = request.cookies.get('editorialauth')?.value || '';

    const foundSiteToRedirect = await connection.findSite(foundsite.root.name, toSiteViewStatus(viewParam));
    const currentHost = request.headers.get('x-forwarded-host') || request.nextUrl.host;
    const currentHostname = toComparableHostname(currentHost);

    // 1) For the local Neon host convention, derive the opposite view directly
    // from the current hostname before consulting potentially stale site metadata.
    let targetHostname = deriveSwitchHostFromCurrent(currentHost, viewParam);

    // 2) Prefer a sibling host declared on the current site payload.
    const rootHostCandidates = [foundsite.root.hostname, foundsite.root.previewHostname]
      .filter(Boolean)
      .map(host => host.trim());

    if (!targetHostname) {
      targetHostname = rootHostCandidates.find(host => toComparableHostname(host) !== currentHostname);
    }

    // 3) Use explicit view lookup if it points to a different hostname.
    const explicitTargetHostname = foundSiteToRedirect?.root?.hostname?.trim();
    if (!targetHostname && explicitTargetHostname && toComparableHostname(explicitTargetHostname) !== currentHostname) {
      targetHostname = explicitTargetHostname;
    }

    // 4) Final fallback: use explicit result even if same host (avoids hard failure when config is partial).
    if (!targetHostname && explicitTargetHostname) {
      targetHostname = explicitTargetHostname;
    }

    // 5) Last fallback for preview target where counterpart may be optional.
    if (!targetHostname && viewParam === ViewStatus.PREVIEW) {
      targetHostname = foundsite.root.previewHostname;
    }

    if (!targetHostname) {
      return NextResponse.json(
        {
          error: `Unable to resolve target hostname for switch-view=${viewParam}`,
          siteName: foundsite.root.name,
        },
        { status: 500 },
      );
    }

    const targetBase = targetHostname.startsWith('http') ? targetHostname : `${request.nextUrl.protocol}//${targetHostname}`;
    const targetPathname =
      foundsite.viewStatus === ViewStatus.PREVIEW && viewParam === ViewStatus.LIVE
        ? normalizeLiveSwitchPathname(request.nextUrl.pathname)
        : request.nextUrl.pathname;
    const targetUrl = new URL(`${targetPathname}${request.nextUrl.search}`, targetBase);

    if (cookie) {
      targetUrl.searchParams.set('switch-view', viewParam);
      targetUrl.searchParams.set('switch-token', cookie);
    } else {
      targetUrl.searchParams.delete('switch-view');
    }

    const response = NextResponse.redirect(targetUrl);

    return response;
  }

  if (urlParams.get('PreviewToken')) {
    const previewToken = urlParams.get('PreviewToken');
    const contentId = urlParams.get('id');
    const siteName = urlParams.get('siteName');
    const viewStatus = ViewStatus.PREVIEW;

    if (previewToken && contentId && siteName) {
      const authorizationResponse = await connection.previewAuthorization(
        contentId,
        siteName,
        viewStatus,
        previewToken,
      );

      if (authorizationResponse.status !== 204) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: authorizationResponse.status });
      }

      const cookie = authorizationResponse.headers.getSetCookie()[0];
      const cookieObject = parseCookie(cookie);

      const cookieValue = cookieObject.empreviewtoken;
      const cookieOptions = getEditorialAuthCookieOptions(cookieValue);

      const response = NextResponse.next({ headers });
      response.cookies.set(cookieOptions);
      expireLegacyDomainScopedEditorialAuthCookie(response, request);

      return response;
    }
  }

  if (urlParams.get('neon.outputMode')?.toLowerCase() === 'raw' && request.cookies.get('editorialauth')) {
    const url = request.nextUrl.clone();
    url.pathname = `/api/proxy${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  if (request.nextUrl.pathname.startsWith('/resources')) {
    // calling internal api proxy
    const url = request.nextUrl.clone();
    url.pathname = `/api/proxy${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  if (request.nextUrl.pathname.startsWith('/nodes')) {
    // calling internal api proxy
    const url = request.nextUrl.clone();
    url.pathname = `/api/nodes${url.pathname}`;
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

  cookieArray.forEach(cookie => {
    const cookiePair = cookie.split('=');
    cookieObject[cookiePair[0]] = cookiePair[1];
  });

  return cookieObject;
};
