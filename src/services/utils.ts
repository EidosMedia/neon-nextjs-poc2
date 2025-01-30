import { NextRequest } from 'next/server';
import { NeonConnection } from '@eidosmedia/neon-frontoffice-ts-sdk';

declare global {
  // eslint-disable-next-line no-var
  var connection: NeonConnection;
}

export const getAPIHostnameConfig = async (request: NextRequest) => {
  const protocol = request.headers.get('x-forwarded-protocol') || 'http';

  const forwardedHostname = request.headers.get('x-forwarded-host');

  if (forwardedHostname === null) {
    throw new Error('x-forwarded-host header not found');
  }

  const apiHostnameConfig = await connection.resolveApiHostname(
    `${protocol}://${forwardedHostname}`
  );

  apiHostnameConfig.apiHostname = `${protocol}://${apiHostnameConfig.apiHostname}`;
  return apiHostnameConfig;
};
