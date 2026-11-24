import { NextRequest } from 'next/server';
import { getAPIHostnameConfig, handleServicesError } from '@/services/utils';
import { getAuthOptions } from '@/utilities/security';
import { renderNewsletterHtml } from '@/utilities/newsletter';
import { isLegacyTheme } from '@/app/themeKeys';
import { siteThemeOf, withSiteTheme } from '@/lib/accessories/defaultThemeAccessories';
import { resolvePaywallLevel } from '@/app/_v2/lib/paywall';
import { loadContent } from '@/app/_v2/leaves/loadContent';
import { NewsletterStoryExportError, renderNewsletterStoryHtml } from '@/app/_v2/lib/newsletterStoryHtml';
import type { PageData } from '@eidosmedia/neon-frontoffice-ts-sdk';
import type { ArticleModel } from '@/types/models';

/**
 * GET /api/newsletter/[id]
 *
 * Resolves a page by content `id` (mirroring how `page.tsx` resolves a page
 * via its `id` search param against the root path) and returns its newsletter
 * rendering as raw HTML, suitable for export into a newsletter platform.
 * Webpage previews and exports use the same newsletter fragment.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { apiHostname, root } = await getAPIHostnameConfig(req);
    const auth = await getAuthOptions();
    const { id } = await params;

    let url = new URL(`/${encodeURIComponent(id)}`, apiHostname);
    let pageData = await connection.makePageRequest(url.toString(), auth, { redirect: 'manual', cache: 'no-cache' });
    for (let redirects = 0; pageData.status >= 300 && pageData.status < 400; redirects++) {
      const location = pageData.headers.get('Location');
      if (!location || redirects >= 5) {
        return Response.json({ error: 'Could not resolve the newsletter URL.' }, { status: 502 });
      }
      const next = new URL(location, url);
      if (next.origin !== new URL(apiHostname).origin) {
        return Response.json({ error: 'Newsletter redirected outside the site API.' }, { status: 502 });
      }
      url = next;
      pageData = await connection.makePageRequest(url.toString(), auth, { redirect: 'manual', cache: 'no-cache' });
    }

    const pageDataJSON = withSiteTheme(await pageData.json(), root);

    if (pageDataJSON?.model?.data?.sys?.baseType === 'article'
      && pageDataJSON.model.data.sys.type === 'newsletterstory'
      && !isLegacyTheme(siteThemeOf(pageDataJSON.siteNode))) {
      const story: PageData<ArticleModel> = pageDataJSON;
      if (resolvePaywallLevel(story.model.data.pubInfo?.paywallLevel) !== 'FREE') {
        return Response.json({ error: 'Restricted newsletter stories cannot be exported.' }, { status: 403 });
      }
      const article = await loadContent(story.model.data);
      try {
        const origin = new URL(root.hostname.startsWith('http') ? root.hostname : `https://${root.hostname}`).origin;
        const html = renderNewsletterStoryHtml({ ...story, model: { ...story.model, data: article } }, origin);
        return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
      } catch (error) {
        if (error instanceof NewsletterStoryExportError) {
          return Response.json({ error: error.message }, { status: 422 });
        }
        throw error;
      }
    }

    const html = await renderNewsletterHtml(pageDataJSON);
    return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  } catch (error) {
    return handleServicesError(error);
  }
}
