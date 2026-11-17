import { NextRequest } from 'next/server';
import { getAPIHostnameConfig, handleServicesError } from '@/services/utils';
import { getAuthOptions } from '@/utilities/security';
import { fetchPageDataDirect } from '@/utilities/pageCache';

/**
 * GET /api/content-block-model?url=/sport/<id>/index.json
 *
 * Serves the model json of a content block. The proxy rewrites every index.json request here.
 * Pages that are not content blocks answer 404. The backend host comes from getAPIHostnameConfig,
 * because /api routes do not receive the x-neon-* headers set by the proxy.
 */
export async function GET(req: NextRequest) {
  const path = req.nextUrl.searchParams.get('url');
  if (!path || !path.startsWith('/') || path.startsWith('//') || !path.endsWith('/index.json')) {
    return Response.json({ error: 'url must be a site index.json path' }, { status: 400 });
  }

  try {
    const { apiHostname } = await getAPIHostnameConfig(req);
    const auth = await getAuthOptions();
    const result = await fetchPageDataDirect(`${apiHostname.replace(/\/$/, '')}${path}`, auth);

    if (!result.data) {
      return Response.json({ error: 'not found' }, { status: 404 });
    }
    if (result.data?.data?.sys?.baseType !== 'contentblock') {
      return Response.json({ error: 'not a content block' }, { status: 404 });
    }
    return Response.json(result.data);
  } catch (error) {
    return handleServicesError(error);
  }
}
