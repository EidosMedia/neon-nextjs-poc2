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

  if (!process.env.BASE_NEON_FE_URL) {
    throw new Error('BASE_NEON_FE_URL not specified in any .env file');
  }

  if (!process.env.NEON_FRONTOFFICE_SERVICE_KEY) {
    console.warn('NEON_FRONTOFFICE_SERVICE_KEY not specified in any .env file');
  }

  const connection = new NeonConnection({
    neonFeUrl: process.env.BASE_NEON_FE_URL,
    frontOfficeServiceKey: process.env.NEON_FRONTOFFICE_SERVICE_KEY || '',
  });

  // try {
  //   await connection.getLiveSitesList();
  //   logger.info('Sites list fetched successfully');
  // } catch (err) {
  //   console.error('Failed to fetch sites list', err);
  //   throw err;
  // }

  Object.assign(globalThis, {
    connection,
  });
}

// if a site not found the cache should be invalidated
// keep the latest sites list in the globalThis object as fallback

// Those properties should be passed to the client

// cache-control:
// max-age=360000, s-maxage=360000
// etag:
// "Cobalt-1551134078"

// last-modified:
// Mon, 02 Sep 2024 09:58:37 GMT

// neon-frontoffice-ts
// develop
