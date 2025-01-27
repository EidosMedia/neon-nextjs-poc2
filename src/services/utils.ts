import { NextRequest } from 'next/server';
import { NeonConnection } from '@/NeonConnection/NeonConnection';

export const getAPIHostname = async (
  request: NextRequest,
  viewStatus?: string | null
) => {
  const protocol = request.headers.get('x-forwarded-protocol') || 'http';

  // calling its own host to use caching mechanism
  const builtUrl = `${protocol}://${request.headers.get(
    'x-forwarded-host'
  )}/api/sites`;

  const sitesResp = await fetch(builtUrl, {
    // cache: 'no-cache',
    next: { tags: ['sites'] },
  });

  const sites = await sitesResp.json();

  const siteFound = sites.find((site: any) =>
    site.root.hostname.match(request.headers.get('x-forwarded-host'))
  );

  if (viewStatus === 'PREVIEW') {
    return `${protocol}://${siteFound?.apiHostnames.previewHostname}`;
  }

  return `${protocol}://${siteFound?.apiHostnames.liveHostname}`;
};

export const getConnection = () => {
  if (!process.env.BASE_NEON_FE_URL) {
    throw new Error('BASE_NEON_FE_URL not specified in any .env file');
  }

  if (!globalThis.connection)
    globalThis.connection = new NeonConnection(
      process.env.BASE_NEON_FE_URL,
      ''
    );

  return globalThis.connection;
};
