import { NextRequest } from 'next/server';
import { NeonConnection } from '@eidosmedia/neon-frontoffice-ts-sdk';

declare global {
  // eslint-disable-next-line no-var
  var connection: NeonConnection;
}

type Site = {
  root: {
    hostname: string;
  };
  apiHostnames: {
    liveHostname: string;
    previewHostname: string;
  };
};

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

  const siteFound = sites.find((site: Site) =>
    site.root.hostname.match(request.headers.get('x-forwarded-host') || '')
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

  if (!globalThis.connection) globalThis.connection = new NeonConnection();

  return globalThis.connection;
};
