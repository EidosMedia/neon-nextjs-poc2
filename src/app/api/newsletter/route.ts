import { NextRequest } from 'next/server';
import { getAPIHostnameConfig, handleServicesError } from '@/services/utils';
import { getAuthOptions } from '@/utilities/security';
import { renderNewsletterHtml } from '@/utilities/newsletter';

/**
 * GET /api/newsletter
 *
 * Resolves a page by `path`/`id` query params (mirroring how `page.tsx`
 * resolves a page) and returns its newsletter rendering as raw HTML, suitable
 * for export into a newsletter platform. Produces byte-identical markup to
 * the `NewsletterWebpage` preview component, since both call
 * `renderNewsletterHtml` with the same `pageDataJSON` shape.
 */
export async function GET(req: NextRequest) {
  try {
    const { apiHostname } = await getAPIHostnameConfig(req);
    const auth = await getAuthOptions();
    const path = req.nextUrl.searchParams.get('path') ?? '/';
    const id = req.nextUrl.searchParams.get('id');

    const baseUrl = `${apiHostname}${path}`;
    const url = id ? `${baseUrl.replace(/\/$/, '')}/${id}` : baseUrl;
    const pageData = await connection.makePageRequest(url, auth, { redirect: 'manual', cache: 'no-cache' });

    // handle redirection (matches page.tsx — `redirect: 'manual'` means the
    // CMS may answer with a 3xx that `makePageRequest` returns rather than
    // throws; forwarding it here avoids parsing a redirect response as page
    // JSON). `next/navigation`'s `redirect()` relies on the rendering
    // pipeline to catch its thrown digest error, which Route Handlers don't
    // provide, so we build the redirect Response directly instead.
    if (pageData.status > 300 && pageData.status < 400) {
      const location = pageData.headers.get('Location');
      if (location) {
        return Response.redirect(new URL(location, req.url), pageData.status);
      }
    }

    const pageDataJSON = await pageData.json();

    const html = await renderNewsletterHtml(pageDataJSON);
    return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  } catch (error) {
    return handleServicesError(error);
  }
}
