import { NextRequest } from 'next/server';
import { NeonConnection, SiteNode, ErrorObject } from '@eidosmedia/neon-frontoffice-ts-sdk';
declare global {
  var connection: NeonConnection;
  var cacheMap: Map<string, string>;
}

const resolveForcedLocalhostSiteConfig = async (
  forwardedHostname: string,
): Promise<{ apiHostname: string; viewStatus: string; root: SiteNode } | null> => {
  const hostWithoutProtocol = forwardedHostname.replace(/^https?:\/\//, '').toLowerCase();
  const isLocalhostRequest =
    hostWithoutProtocol === 'localhost' ||
    hostWithoutProtocol.startsWith('localhost:') ||
    hostWithoutProtocol === '127.0.0.1' ||
    hostWithoutProtocol.startsWith('127.0.0.1:') ||
    hostWithoutProtocol === '0.0.0.0' ||
    hostWithoutProtocol.startsWith('0.0.0.0:') ||
    hostWithoutProtocol === '[::1]' ||
    hostWithoutProtocol.startsWith('[::1]:');

  const forcedSite = process.env.DEV_FORCE_SITE?.trim();
  if (!isLocalhostRequest || !forcedSite) {
    return null;
  }

  const forcedSiteConfig =
    (await connection.findSite(forcedSite, 'live')) ||
    (await connection.findSite(forcedSite)) ||
    (await connection.getSitesList()).find(site => site.root.name.toLowerCase() === forcedSite.toLowerCase());

  if (!forcedSiteConfig) {
    throw new Error(`Could not resolve live site by name from DEV_FORCE_SITE: ${forcedSite}`);
  }

  return {
    apiHostname: forcedSiteConfig.apiHostnames.liveHostname.startsWith('https://')
      ? forcedSiteConfig.apiHostnames.liveHostname
      : `https://${forcedSiteConfig.apiHostnames.liveHostname}`,
    viewStatus: 'LIVE',
    root: forcedSiteConfig.root,
  };
};

export const getAPIHostnameConfig = async (
  request: NextRequest,
): Promise<{ apiHostname: string; viewStatus: string; root: SiteNode }> => {
  const protocol = request.headers.get('X-Forwarded-Proto') || 'http';

  const forwardedHostname = request.headers.get('x-forwarded-host');

  if (forwardedHostname === null) {
    throw new Error('x-forwarded-host header not found');
  }

  const forcedConfig = await resolveForcedLocalhostSiteConfig(forwardedHostname);
  if (forcedConfig) {
    return forcedConfig;
  }

  const url = forwardedHostname.startsWith('http') ? forwardedHostname : `${protocol}://${forwardedHostname}`;
  const apiHostnameConfig = await connection.resolveApiHostname(url);

  apiHostnameConfig.apiHostname = apiHostnameConfig.apiHostname.startsWith('https://')
    ? apiHostnameConfig.apiHostname
    : `https://${apiHostnameConfig.apiHostname}`;
  return apiHostnameConfig;
};

export const handleServicesError = (error: unknown) => {
  const responseError = error as ErrorObject;
  return Response.json(
    {
      ...responseError.cause,
    },
    {
      status: responseError.status,
    },
  );
};
