import { NeonConnection } from '@eidosmedia/neon-frontoffice-ts-sdk';
// import { logger } from './lib/logger';

export async function register() {
  // get the version from Neon, check if the version is compatible. Check the beginning for version compatibility start with NEON-{YEAR}.{MONTH}.
  // Compatible versions should be put in the code
  // fetch the sites to populate fetch
  // if there is connection error or something about one of the above tasks throw an error and NextJS will not start.

  // if (process.env.NEXT_RUNTIME === 'nodejs') {
  //   await require('pino');
  //   // await require('next-logger');
  // }

  if (!process.env.BASE_NEON_FO_URL) {
    throw new Error('BASE_NEON_FO_URL not specified in any .env file');
  }

  if (!process.env.NEON_FRONTOFFICE_SERVICE_KEY) {
    console.warn('NEON_FRONTOFFICE_SERVICE_KEY not specified in any .env file');
  }

  // Site configuration secrets (staticAttributes such as invalidateNextJsHeaderValue) are removed from
  // site and page data unless NEON_EXPOSE_SITE_CONFIG_SECRETS=true (debugging only: they then reach
  // rendered pages). NEON_REDACTED_SITE_CONFIG_KEYS (comma-separated, `prefix*` allowed) replaces the
  // default key list.
  const exposeSiteConfig = process.env.NEON_EXPOSE_SITE_CONFIG_SECRETS === 'true';
  const redactedKeys = process.env.NEON_REDACTED_SITE_CONFIG_KEYS?.split(',')
    .map(key => key.trim())
    .filter(Boolean);
  if (exposeSiteConfig) {
    console.warn('NEON_EXPOSE_SITE_CONFIG_SECRETS=true: site configuration secrets are sent to browsers.');
  }

  const connection = new NeonConnection({
    neonFoUrl: process.env.BASE_NEON_FO_URL,
    frontOfficeServiceKey: process.env.NEON_FRONTOFFICE_SERVICE_KEY || '',
    siteConfigRedaction: {
      expose: exposeSiteConfig,
      ...(redactedKeys && redactedKeys.length > 0 ? { keys: redactedKeys } : {}),
    },
  });

  await connection.startup();

  const refreshSitesData = async () => {
    connection.refreshLiveSites();
    connection.refreshPreviewSites();
  };

  setInterval(() => {
    refreshSitesData();
  }, parseInt(process.env.SITES_REFRESH_INTERVAL || '') || 120000);

  Object.assign(globalThis, {
    connection,
  });
}
