import { NextRequest } from 'next/server';
import { getAPIHostnameConfig, handleServicesError } from '@/services/utils';
import { getAuthOptions } from '@/utilities/security';
import { fetchPageDataCached, fetchPageDataDirect } from '@/utilities/pageCache';
import { isContentBlockModel, type BlockModel } from '@/lib/contentBlocks';
import { ViewStatus } from '@eidosmedia/neon-frontoffice-ts-sdk';

/**
 * GET /api/content-block-model/<site path>/index.json
 *
 * Serves the model json of a content block. The proxy rewrites every index.json request here,
 * keeping the site path in the route segments. Pages that are not content blocks answer 404.
 * The backend host comes from getAPIHostnameConfig, because /api routes do not receive the
 * x-neon-* headers set by the proxy.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const segments = (await params).path ?? [];
  const path = `/${segments.join('/')}`;
  if (!path.endsWith('/index.json') || segments.some(segment => segment === '' || segment === '..')) {
    return Response.json({ error: 'url must be a site index.json path' }, { status: 400 });
  }

  try {
    const { apiHostname, viewStatus, root } = await getAPIHostnameConfig(req);
    const auth = await getAuthOptions();
    // The backend serves the model json on the html url; LIVE is cached as the page is
    const backendUrl = `${apiHostname.replace(/\/$/, '')}${path.replace(/index\.json$/, 'index.html')}`;
    const result =
      viewStatus === ViewStatus.LIVE
        ? await fetchPageDataCached(backendUrl, root.name, auth)
        : await fetchPageDataDirect(backendUrl, auth);

    if (!result.data) {
      return Response.json({ error: 'not found' }, { status: 404 });
    }
    const model = (result.data as { model?: BlockModel } | undefined)?.model;
    if (!model || !isContentBlockModel(model)) {
      console.warn('[NEON][content-block-model] not a content block', model?.data?.sys);
      return Response.json({ error: 'not a content block' }, { status: 404 });
    }
    return Response.json(result.data);
  } catch (error) {
    return handleServicesError(error);
  }
}
