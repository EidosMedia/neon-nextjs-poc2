import { NextRequest } from 'next/server';
import { NeonConnection, SiteNode, ErrorObject } from '@eidosmedia/neon-frontoffice-ts-sdk';
declare global {
  // eslint-disable-next-line no-var
  var connection: NeonConnection;
}

export const getAPIHostnameConfig = async (
  request: NextRequest
): Promise<{ apiHostname: string; viewStatus: string; root: SiteNode }> => {
  const protocol = request.headers.get('X-Forwarded-Proto') || 'http';

  const forwardedHostname = request.headers.get('x-forwarded-host');

  if (forwardedHostname === null) {
    throw new Error('x-forwarded-host header not found');
  }

  const apiHostnameConfig = await connection.resolveApiHostname(`${protocol}://${forwardedHostname}`);

  apiHostnameConfig.apiHostname = `https://${apiHostnameConfig.apiHostname}`;
  return apiHostnameConfig;
};

export const handleServicesError = (error: unknown) => {
  const responseError = error as ErrorObject;
  return Response.json(
    {
      error: responseError.cause,
    },
    {
      status: responseError.status,
    }
  );
};
