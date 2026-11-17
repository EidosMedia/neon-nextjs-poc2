import { NextRequest } from 'next/server';
import { getAPIHostnameConfig, handleServicesError } from '@/services/utils';
import { getAuthOptions } from '@/utilities/security';
import { fetchPageDataDirect } from '@/utilities/pageCache';
import type { PageData, WebpageModel } from '@eidosmedia/neon-frontoffice-ts-sdk';
import { getZoneAccessoryShapes, normalizeTheme } from '@/lib/accessories/defaultThemeAccessories';

/**
 * GET /api/content-blocks?url=/sport/<id>/index.html
 *
 * Returns a content block ready for the webpage renderers: its page data, with the site view status
 * attached as siteData, and its linked items resolved with getDwxLinkedObjects, as the zones do.
 * The backend host and view status come from getAPIHostnameConfig, because /api routes do not
 * receive the x-neon-* headers set by the proxy.
 */
export async function GET(req: NextRequest) {
  const path = req.nextUrl.searchParams.get('url');
  if (!path || !path.startsWith('/') || path.startsWith('//')) {
    return Response.json({ error: 'url must be a site path' }, { status: 400 });
  }

  try {
    const { apiHostname, viewStatus, root } = await getAPIHostnameConfig(req);
    const auth = await getAuthOptions();
    const result = await fetchPageDataDirect(`${apiHostname.replace(/\/$/, '')}${path}`, auth);

    if (!result.data) {
      return Response.json({ error: 'content block not found' }, { status: 404 });
    }

    const theme = normalizeTheme(root.attributes?.theme);
    const data = {
      ...result.data,
      siteData: { siteName: root.name, viewStatus },
      siteNode: { attributes: { theme } },
    } as PageData<WebpageModel>;
    const linkedObjects = await connection.getDwxLinkedObjects(data, 'main');
    // Accessory values apply to the default theme only, as the page does
    const accessories = theme === 'default' ? getZoneAccessoryShapes(data, 'main', linkedObjects) : undefined;

    return Response.json({ title: data.model.data.title, data, linkedObjects, accessories });
  } catch (error) {
    return handleServicesError(error);
  }
}
