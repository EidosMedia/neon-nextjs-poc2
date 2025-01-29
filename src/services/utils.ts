import { NextRequest } from 'next/server';
import { NeonConnection } from '@eidosmedia/neon-frontoffice-ts-sdk';

declare global {
  // eslint-disable-next-line no-var
  var connection: NeonConnection;
}

export const getAPIHostname = async (
  request: NextRequest,
  viewStatus?: string | null
) => {
  const protocol = request.headers.get('x-forwarded-protocol') || 'http';

  const forwardedHostname = request.headers.get('x-forwarded-host');

  if (forwardedHostname === null) {
    throw new Error('x-forwarded-host header not found');
  }

  const siteFound = await connection.getSiteByHostname(
    `${protocol}://${forwardedHostname}`
  );

  if (!siteFound) {
    throw new Error('Site not found');
  }

  if (viewStatus === 'PREVIEW') {
    return `${protocol}://${siteFound.apiHostnames.previewHostname}`;
  }

  return `${protocol}://${siteFound.apiHostnames.liveHostname}`;
};

export const getConnection = () => {
  if (!process.env.BASE_NEON_FE_URL) {
    throw new Error('BASE_NEON_FE_URL not specified in any .env file');
  }

  if (!globalThis.connection)
    globalThis.connection = new NeonConnection({
      neonFeUrl: process.env.BASE_NEON_FE_URL,
      frontOfficeServiceKey: process.env.NEON_FRONTOFFICE_SERVICE_KEY || '',
    });

  return globalThis.connection;
};
